import { BodyPayload, GetManyParams, SystemDateTypes, SystemIdType } from "./commonTypes.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
	removeById,
} = require("../utils/service.util");

export interface TeamsServiceType extends SystemDateTypes, SystemIdType {
	name: string,
	description: string,
	score: number,
}

const tableName = "teams";

const getOne = async (queryParams: GetManyParams): Promise<TeamsServiceType> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: TeamsServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows?.[0];
};

const getMany = async (queryParams: GetManyParams): Promise<TeamsServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: TeamsServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows;
};

const create = async (body: BodyPayload) => {
	const { query, values } = getInsertInto({
		tableName,
		data: body,
	});
	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error creating a team";

	if (result.rowCount) {
		message = "Team created successfully";
	}

	return { message };
};

const update = async (id: number, body: BodyPayload) => {
	const { query, values } = getUpdate({
		tableName,
		id,
		data: body,
	});

	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error updating a team";

	if (result.rowCount) {
		message = "Team updated successfully";
	}

	return { message };
};

const remove = async (id: number) => {
	const result: { rowCount: number } = await removeById(id, tableName);

	let message = "Error deleting a team";

	if (result.rowCount) {
		message = "Team deleted successfully";
	}

	return { message };
};

module.exports = {
	getOne,
	getMany,
	create,
	update,
	remove,
};
