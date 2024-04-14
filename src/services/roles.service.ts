import {BodyPayload, GetManyParams, SystemDateTypes, SystemIdType} from "./commonTypes.service";

const db = require("./db.service");
const {
	getSelectQuery,
	getInsertInto,
	getUpdate,
} = require("../utils/service.util");

const tableName = "roles";

export interface RolesServiceType extends SystemDateTypes, SystemIdType {
  name: string,
  can_edit_paragraphs: boolean,
  can_delete_paragraphs: boolean,
  can_edit_scores: boolean,
  can_delete_scores: boolean,
  can_edit_sources: boolean,
  can_delete_sources: boolean,
  can_edit_roles: boolean,
  can_delete_roles: boolean,
  can_edit_users: boolean,
  can_delete_users: boolean,
  can_edit_races: boolean,
  can_delete_races: boolean,
}

const getOneById = async (id: number): Promise<RolesServiceType | null> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		filter: {
			id: String(id),
		},
	});
	const data: { rows?: RolesServiceType[] } = await db.query(selectQuery,
		selectQueryValues,
	);

	return data.rows?.[0] || null;
};

const getMany = async (queryParams: GetManyParams): Promise<RolesServiceType[]> => {
	const { query: selectQuery, values: selectQueryValues } = getSelectQuery({
		tableName,
		...queryParams,
	});
	const data: { rows?: RolesServiceType[] } = await db.query(    selectQuery,
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

	let message = `Error creating in ${tableName}`;

	if (result.rowCount) {
		message = "Role created successfully";
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

	let message = `Error creating in ${tableName}`;

	if (result.rowCount) {
		message = "Role updated successfully";
	}

	return { message };
};

const remove = async (id: number) => {
	const result: { rowCount: number } = await db.query(
		`DELETE FROM ${tableName} WHERE id=$1`,
		[id],
	);

	let message = `Error deleting ${tableName}`;

	if (result.rowCount) {
		message = "Role deleted successfully";
	}

	return { message };
};

module.exports = {
	getOneById,
	getMany,
	create,
	update,
	remove,
};
