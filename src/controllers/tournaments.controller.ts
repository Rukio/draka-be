const { check } = require("express-validator");
const service = require("../services/tournaments.service");
const phaseService = require("../services/phases.service");
const stageService = require("../services/stages.service");
const tourService = require("../services/tours.service");
const gameService = require("../services/games.service");
const teamService = require("../services/teams.service");
const teamStageService = require("../services/teamsStages.service");
const teamGamesService = require("../services/teamsGames.service");
const playerServcie = require("../services/players.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");
const error = require("../utils/errors.util");

const nameCheck = check("name")
	.isLength({ min: 3, max: 20 }).withMessage("Tournament name should be between 3 and 20 characters long")
	.isString().withMessage("Tournament name should be a string")
	.isAlpha().withMessage("Tournament name should only contain alphabetic letters");
const descriptionCheck = check("description")
	.isLength({ min: 0, max: 1000 }).withMessage("Tournament description should be between 0 and 1000 characters long")
	.isString().withMessage("Tournament description should be a string")

const createValidators = [
	nameCheck,
	descriptionCheck,
];

const editValidators = [
	nameCheck.optional(),
	descriptionCheck.optional(),
];

const getOne = async (req, res, next) => {
	try {
		const tournament = await service.getOne(getControllerToServiceFilter(req.query));

		res.json(tournament);
	} catch (err) {
		console.log("Error while getting tournaments", err);
		next(err);
	}
};

const get = async (req, res, next) => {
	try {
		res.json(await service.get(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting tournaments", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		// const body = req.body;
		// const existingTrounament = await service.getOne(getControllerToServiceFilter({ name: body.name }));

		// if (existingTrounament) {
		// 	return next(error.badRequest("Tournament with this name already exists"))
		// }

		// const tournament = {
		// 	name: body.name,
		// 	description: body.description,
		// };
		// const phases = [
		// 	{
		// 		name: 'Элиминейшен',
		// 		type: 1,
		// 		stages: [
		// 			{
		// 				name: 'Верхняя сетка',
		// 				tours: [],
		// 			}
		// 		],
		// 	}
		// ];

		// const upperStageTours = [];
		// const teams = body.teams;
		// const games = [];
		// let gameIndex = 0;

		// teams.forEach((team, i) => {
		// 	if (i !== 0 && !(i % 2)) {
		// 		gameIndex++;
		// 	}

		// 	if (!games[gameIndex]) {
		// 		games[gameIndex] = {
		// 			description: '',
		// 			teams: [],
		// 		};
		// 	}

		// 	games[gameIndex].teams.push(team);
		// });

		// --------------

		const playersLocal = [];
		const teamsLocal = body.teams;
		const type = body.type;
		const tournament = await service.create({
			name: body.name,
			description: body.description
		})
		const tournamentId = tournament.data.id;

		if (type === 1) {
			const phase = await phaseService.create({
				name: "Double Elimination",
				description: "",
				tournament_id: tournamentId,
			});

			const phaseId = phase.data.id;

			const stageUpper = await stageService.create({
				name: "Верхняя сетка",
				tournament_id: tournamentId,
				phase_id: phaseId,
			});

			const stageBottom = await stageService.create({
				name: "Нижняя сетка",
				tournament_id: tournamentId,
				phase_id: phaseId,
			});

			const teams = await Promise.all(
				teamsLocal.map(teamLocal => teamService.create({
					score: null,
					name: teamLocal.name,
					tournament_id: tournament.id,
					img: teamLocal.img,
				}))
			);

			teamsLocal.forEach(teamLocal => {
				teamLocal.players.forEach(playerLocal => playersLocal.push({
					name: playerLocal.name,
					description: playerLocal.description,
					url: playerLocal.url,
					img: playerLocal.img,
					team_id: teams.find(team => team.name === teamLocal.name)?.id,
					tournament_id: tournament.id,
				}))
			});

			const players = await Promise.all(
				playersLocal.map(playerLocal => playerServcie.create(playerLocal))
			);

			const games = [];
			let gameIndex = 0;

			teams.forEach((team, i) => {
				if (i !== 0 && !(i % 2)) {
					gameIndex++;
				}

				if (!games[gameIndex]) {
					games[gameIndex] = {
						tournament_id: tournamentId,
						phase_id: phaseId,
						stage_id: stageUpper.id,
						description: '',
						teams: [],
					};
				}

				games[gameIndex].teams.push(team);
			});

			const tour = await tourService.create({
				name: "",
			});

			const game = await 

		const teams = await Promise.all([
				{

				}
			]);
		}

		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a tournament", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a tournament", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a tournament", err);
		next(err);
	}
};

module.exports = {
	getOne,
	get,
	create,
	update,
	remove,
	createValidators,
	editValidators,
};

export { };
