const { check } = require("express-validator");
const service = require("../services/tournaments.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const nameCheck = check("name")
	.isLength({ min: 3, max: 20 }).withMessage("Phase name should be between 3 and 20 characters long")
	.isString().withMessage("Phase name should be a string")
	.isAlpha().withMessage("Phase name should only contain alphabetic letters");
const typeCheck = check("type")
	.isNumeric().withMessage("Phase type should be a number")
const tournamentIdCheck = check("tournamentId")
	.isNumeric().withMessage("tournamentId should be a number")
// const imgUrlCheck = check("img")
// 	.isLength({ min: 1, max: 400 }).withMessage("Image url should be between 1 and 400 characters")
// 	.isURL().withMessage("Image url should have a valid URL format");

const createValidators = [
	nameCheck,
	typeCheck,
	tournamentIdCheck,
];

const editValidators = [
	nameCheck.optional(),
	typeCheck.optional(),
	tournamentIdCheck.optional(),
];

const getOne = async (req, res, next) => {
	try {
		const tournament = await service.getOne(getControllerToServiceFilter(req.query));

		res.json(tournament);
	} catch (err) {
		console.log("Error while getting phases", err);
		next(err);
	}
};

const get = async (req, res, next) => {
	try {
		res.json(await service.get(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting a phase", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a phase", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a phase", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a phase", err);
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
