import { BodyPayload, GetManyParams, SystemDateTypes, SystemIdType } from "./commonTypes.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
	removeById,
} = require("../utils/service.util");

export interface TournamentsServiceType extends SystemDateTypes, SystemIdType {
	name: string,
	description: string,
}

const tableName = "tournaments";

const getOne = async (queryParams: GetManyParams): Promise<TournamentsServiceType> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: TournamentsServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows?.[0];
};

const getMany = async (queryParams: GetManyParams): Promise<TournamentsServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: TournamentsServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows;
};

const create = async (body: BodyPayload) => {
	const { query, values } = getInsertInto({
		tableName,
		data: body,
	});
	const result: { rowCount: number, rows: { id: string }[] } = await db.query(query, values);

	let message = "Error creating a tournament";

	if (result.rowCount) {
		message = "Tournament created successfully";
	}

	const resultRows = result.rows;

	return {
		message,
		data: {
			id: resultRows?.[0]?.id,
		},
	};
};

const update = async (id: number, body: BodyPayload) => {
	const { query, values } = getUpdate({
		tableName,
		id,
		data: body,
	});

	const result: { rowCount: number } = await db.query(query, values);

	let message = "Error updating a tournament";

	if (result.rowCount) {
		message = "Tournament updated successfully";
	}

	return { message };
};

const remove = async (id: number) => {
	const result: { rowCount: number } = await removeById(id, tableName);

	let message = "Error deleting a tournament";

	if (result.rowCount) {
		message = "Tournament deleted successfully";
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
