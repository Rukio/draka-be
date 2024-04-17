const { check } = require("express-validator");
const service = require("../services/stages.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const nameCheck = check("name")
	.isLength({ min: 3, max: 20 }).withMessage("Stage name should be between 3 and 20 characters long")
	.isString().withMessage("Stage name should be a string")
	.isAlpha().withMessage("Stage name should only contain alphabetic letters");
const tournamentIdCheck = check("tournamentId")
	.isNumeric().withMessage("tournamentId should be a number")
const phaseIdCheck = check("phaseId")
	.isNumeric().withMessage("phaseId should be a number")
// const imgUrlCheck = check("img")
// 	.isLength({ min: 1, max: 400 }).withMessage("Image url should be between 1 and 400 characters")
// 	.isURL().withMessage("Image url should have a valid URL format");

const createValidators = [
	nameCheck,
	tournamentIdCheck,
	phaseIdCheck,
];

const editValidators = [
	nameCheck.optional(),
	tournamentIdCheck.optional(),
	phaseIdCheck.optional(),
];

const getOne = async (req, res, next) => {
	try {
		const tournament = await service.getOne(getControllerToServiceFilter(req.query));

		res.json(tournament);
	} catch (err) {
		console.log("Error while getting stages", err);
		next(err);
	}
};

const get = async (req, res, next) => {
	try {
		res.json(await service.get(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting a stage", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a stage", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a stage", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a stage", err);
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
