import {
	MessageResponse,
} from "../services/commonTypes.service";
import { RacesServiceType, RacesWithParagraphsServiceType } from "../services/races.service";
import { ParagraphsServiceType } from "../services/paragraphs.service";


const { v4: uuidv4 } = require("uuid");
const { serverError } = require("../utils/errors.util");

const paragraphsService = require("../services/paragraphs.service");
const raceService = require("../services/races.service");
const scoreService = require("../services/scores.service");
const { randomInteger } = require("../utils/common.util");
const {
	rooms,
	join: joinRoom,
	leave: leaveRoom,
} = require("../socketRooms");

enum SocketAction {
	STATUS = "status",
	COUNTDOWN = "countdown",
}

interface MessageStatus {
	userId: number | string,
	speed: number,
	position: number,
	timings: number,
	done: boolean,
}

interface Message {
	roomId: string,
	action: SocketAction,
	message: MessageStatus,
}

const getRandomParagraph = async (next): Promise<ParagraphsServiceType> => {
	// Ищем случайный параграф для гонки
	const paragraphs = await paragraphsService.getMany();
	if (!paragraphs) {
		return next(serverError("Error creating a race"));
	}
	const randomParagraph = paragraphs[randomInteger(0, paragraphs.length - 1)];

	return randomParagraph;
};

const findSocketRace = async (req, res, next): MessageResponse => {
	console.log(req.query.personal);
	const isPersonal: boolean = req.query.personal === "true";
	console.log(isPersonal);
	let races: RacesServiceType[] = [];
	let race: RacesServiceType | null = null;

	/*
	 Ищем существующую race только, если не personal.
	 race не найдена - создаём новую - отправляем её id, uuid
	 race найдена и не personal - отправляем её id, uuid
	 race personal - создаём новую - отправляем её id, uuid
	*/

	if (!isPersonal) {
		races = await raceService.getManyWithParagraphs({
			filter: {
				queueable: "true",
				personal: "false",
			},
			order: {
				direction: "desc",
				field: "created_at",
			},
		});

		race = races?.[0];
	}

	if (!race) {
		const randomParagraph = await getRandomParagraph(next);

		const raceNew = await raceService.create({
			paragraph_id: randomParagraph.id,
			active: false,
			queueable: true,
			personal: !!isPersonal,
		});

		if (!raceNew) {
			return next(serverError("Error creating a new race"));
		}
		const raceNewData = await raceService.getMany({
			filter: { id: String(raceNew.data.id) },
		});

		const raceNewResult: RacesWithParagraphsServiceType = {
			...raceNewData[0],
			paragraph: randomParagraph,
		};

		return res.json({
			message: "A new race created",
			data: raceNewResult,
		});
	} else {
		return res.json({
			message: "Race found",
			data: race,
		});
	}
};

const heartbeat = (ws) => {
	ws.isAlive = true;
};

const kick = (roomUuid, ws) => {
	leaveRoom(roomUuid, ws.clientId);
	ws.terminate();
};

const runCountdown = (secondsFrom: number, roomId: string, clients, closeQueueCb) => {
	return new Promise((resolve, reject) => {
		let timeLeft = secondsFrom * 1000;

		/*
			Tick every second
			3 seconds CD for personal mode and 10 seconds for a normal queue
		*/

		const sendCountdownTick = () => {
			console.log(`Launched countdown (${timeLeft})`);
			// Send every tick to all users withing a room (race)
			clients.forEach((client) => {
				client.send(JSON.stringify({
					roomId,
					action: SocketAction.COUNTDOWN,
					message: {
						timeLeft,
					},
				}));
			});

			console.log(timeLeft);
			if (secondsFrom >= 5000 ? timeLeft === 5000 : timeLeft === 3000) {
				// Run unqueue callback to set queueable to false
				console.log("callback calling");
				closeQueueCb();
			}

			if (timeLeft === 0) {
				// Cooldown ended
				console.log("ended!!!!");
				clearInterval(countdownInterval);
				resolve(null);
			}

			timeLeft -= 1000;
		};

		sendCountdownTick();
		const countdownInterval = setInterval(sendCountdownTick, 1000);
	});
};

const closeRaceQueue = (
	{
		raceId,
		raceUuid,
		ws,
	}: {
		raceId: number;
		raceUuid: string;
		ws: unknown;
	},
) => {
	return async () => {
		try {
			await raceService.update(raceId, {
				queueable: false,
				active: true,
			});
		} catch (err) {
			console.log("Error updating a race status");
			return kick(raceUuid, ws);
		}
	};
};

const manageCountdown = async ({
	race,
	roomUuid,
	ws,
}: {
	race: Pick<RacesWithParagraphsServiceType, "id" | "paragraph_id" | "personal">;
	roomUuid: string;
	ws: unknown;
}) => {
	await runCountdown(
		race.personal ? 3 : 10,
		roomUuid,
		Object.values(rooms[roomUuid]),
		/*
			We need to block the queue for a race earlier so that people
			don't get in when there's 1 second left
		*/
		closeRaceQueue({
			raceId: race.id,
			raceUuid: roomUuid,
			ws,
		}),
	);

	try {
		const paragraphs = await paragraphsService.getMany({
			filter: {
				id: String(race.paragraph_id),
			},
		});

		if (!paragraphs?.[0]) {
			throw new Error("Paragraph does not exist");
		}

		// Timing after which the race will be closed
		// Detecting based on how many symbols a paragraph contains
		// TODO: Calculate based on user's average typing speed
		const ms = paragraphs[0].text.length * 1000;

		console.log("setting timeout");
		setTimeout(() => {
			// Close the race after the delay
			raceService.update(race.id, {
				active: false,
				queueable: false,
			});
			console.log("updated race to active: false, queueable: false");
		}, ms);
	} catch (err) {
		console.log("Error closing a race", err);
	}
};

const handleStatus = ({
	roomId,
	message,
	ws,
}: {
	roomId: string;
	message: Omit<Message["message"], "userId">;
	ws: any;
}) => {
	const statusOutput: Message = {
		roomId,
		action: SocketAction.STATUS,
		message: {
			speed: message.speed,
			position: message.position,
			done: message.done,
			timings: message.timings,
			userId: ws.clientId,
		},
	};

	Object.values(rooms[roomId]).forEach((client: typeof ws) => {
		if (ws.clientId !== client.clientId) {
			client.send(JSON.stringify(statusOutput));
		}
	});

	if (!ws.isGuest && message.done) {
		raceService.getMany({
			filter: {
				uuid: roomId,
			},
			returning: ["id", "paragraph_id"],
		}).then((races) => {
			console.log(races[0]);
			const race = races[0];
			scoreService.create({
				race_id: race.id,
				paragraph_id: race.paragraph_id,
				user_id: ws.clientId,
				speed: message.speed,
				timings: message.timings,
			});
		});
	}
};

const handleMessage = ({
	roomUuid,
	ws,
}: {
	roomUuid: string;
	ws: any;
}) => (msg: string) => {
	try {
		const { roomId, action, message }: Message = JSON.parse(msg);

		if (action === SocketAction.STATUS) {
			handleStatus({ roomId, message, ws });
		}
	} catch (err) {
		console.log("Error during a socket message exchange");
		kick(roomUuid, ws);
	}
};

const joinSocketRace = (WS) => (ws, req) => {
	const { uuid: roomUuid } = req.params;
	const namedUserId = req.user?.id;
	const userId = namedUserId as number || uuidv4() as string;

	ws.clientId = userId;
	ws.isGuest = !namedUserId;

	joinRoom(roomUuid, userId, ws); // roomId === race uuid

	// Get the data needed for the race that we just joined
	raceService.getMany({
		filter: {
			uuid: roomUuid,
		},
		returning: ["id", "personal", "paragraph_id"],
	})
		.then(async ([race]) => {
			console.log("found race");
			const usersCountInRace = Object.keys(rooms[roomUuid]).length;

			console.log("users in room", usersCountInRace);
			if (race.personal || usersCountInRace > 1) {
				await manageCountdown({ race, roomUuid, ws });
			}
		});

	ws.on("open", () => {
		console.log("open?");
	});
	ws.on("pong", () => heartbeat(ws));
	ws.on("close", () => {
		leaveRoom(roomUuid, userId);
		console.log("Disconnected");
	});
	ws.on("message", handleMessage({ roomUuid, ws }));
};

module.exports = {
	findSocketRace,
	joinSocketRace,
};

export { };
