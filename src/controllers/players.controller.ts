const { check } = require("express-validator");
const service = require("../services/players.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const nameCheck = check("name")
	.isLength({ min: 3, max: 20 }).withMessage("Player name should be between 3 and 20 characters long")
	.isString().withMessage("Player name should be a string")
	.isAlpha().withMessage("Player name should only contain alphabetic letters");
const descriptionCheck = check("description")
	.isLength({ min: 0, max: 1000 }).withMessage("Player description should be between 0 and 1000 characters long")
	.isString().withMessage("Player description should be a string")
	.isAlpha().withMessage("Player description should only contain alphabetic letters");
const urlCheck = check("url")
	.isLength({ min: 0, max: 1000 }).withMessage("Player url should be between 0 and 1000 characters long")
	.isURL().isString().withMessage("Player url should be a string")
	.isAlpha().withMessage("Player url should only contain alphabetic letters");
const imgUrlCheck = check("img")
	.isLength({ min: 1, max: 400 }).withMessage("Image url should be between 1 and 400 characters")
	.isURL().withMessage("Image url should have a valid URL format");
const tournamentIdCheck = check("tournamentId")
	.isNumeric().withMessage("tournamentId should be a number")
const teamIdCheck = check("teamId")
	.isNumeric().withMessage("teamId should be a number")

const createValidators = [
	nameCheck,
	descriptionCheck.optional(),
	urlCheck.optional(),
	imgUrlCheck.optional(),
	tournamentIdCheck,
	teamIdCheck,
];

const editValidators = [
	nameCheck.optional(),
	descriptionCheck.optional(),
	urlCheck.optional(),
	imgUrlCheck.optional(),
	tournamentIdCheck.optional(),
	teamIdCheck.optional(),
];

const getOne = async (req, res, next) => {
	try {
		const tournament = await service.getOne(getControllerToServiceFilter(req.query));

		res.json(tournament);
	} catch (err) {
		console.log("Error while getting players", err);
		next(err);
	}
};

const get = async (req, res, next) => {
	try {
		res.json(await service.get(getControllerToServiceFilter(req.query)));
	} catch (err) {
		console.log("Error while getting a player", err);
		next(err);
	}
};

const create = async (req, res, next) => {
	try {
		res.json(await service.create(req.body));
	} catch (err) {
		console.log("Error while creating a player", err);
		next(err);
	}
};

const update = async (req, res, next) => {
	try {
		res.json(await service.update(req.params.id, req.body));
	} catch (err) {
		console.log("Error while updating a player", err);
		next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a player", err);
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
