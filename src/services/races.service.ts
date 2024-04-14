import {
	BodyPayload,
	GetManyParams,
	SystemDateTypes,
	SystemIdType,
	MessageResponse,
} from "./commonTypes.service";
import {ParagraphsServiceType} from "./paragraphs.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
} = require("../utils/service.util");
const { getMany: getManyParagraphs } = require("./paragraphs.service");

export interface RacesServiceType extends SystemDateTypes, SystemIdType {
	uuid: string;
  paragraph_id: number,
	active: boolean,
	queueable: boolean,
	personal: boolean,
}

export type RacesWithParagraphsServiceType =
	RacesServiceType &
	{ paragraph: ParagraphsServiceType };

const tableName = "races";

const getMany = async (queryParams: GetManyParams): Promise<RacesServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: RacesServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows;
};

const getManyWithParagraphs = async (
	queryParams: GetManyParams,
): Promise<RacesWithParagraphsServiceType[]> => {
	const paragraphsMap = {};
	const races = await getMany(queryParams);

	await Promise.all(
		races.map(
			(race) => getManyParagraphs({filter: {id: String(race.paragraph_id)}}),
		),
	).then((res) => res.forEach(p => paragraphsMap[p[0].id] = p[0]));

	return races.map((race) =>
		({...race, paragraph: paragraphsMap[race.paragraph_id]}));
};

const create = async (body: BodyPayload): MessageResponse => {
	const { query, values } = getInsertInto({
		tableName,
		returnId: true,
		returnUuid: true,
		data: body,
	});
	const result: { rowCount: number, rows: { id: string, uuid: string }[] } = await db.query(query, values);

	let message = "Error creating a race";

	if (result.rowCount) {
		message = "Race created successfully";
	}

	const resultRows = result.rows;

	return {
		message,
		data: {
			id: resultRows?.[0]?.id,
			uuid: resultRows?.[0]?.uuid,
		},
	};
};

const update = async (id: number, body: BodyPayload): MessageResponse => {
	const { query, values } = getUpdate({
		tableName,
		id,
		data: body,
	});

	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error updating a race";

	if (result.rowCount) {
		message = "Race updated successfully";
	}

	return { message };
};

const remove = async (id: number): MessageResponse => {
	const result: { rowCount: number } = await db.query(
		`DELETE FROM ${tableName} WHERE id=$1`,
		[id],
	);

	let message = "Error deleting a race";

	if (result.rowCount) {
		message = "Race deleted successfully";
	}

	return { message };
};

module.exports = {
	getMany,
	getManyWithParagraphs,
	create,
	update,
	remove,
};
