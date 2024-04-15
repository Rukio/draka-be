const { check } = require("express-validator");
const service = require("../services/tournaments.service");
const { getControllerToServiceFilter } = require("../utils/controller.util");

const nameCheck = check("name")
	.isLength({ min: 3, max: 20 }).withMessage("Tournament name should be between 3 and 20 characters long")
	.isString().withMessage("Tournament name should be a string")
	.isAlpha().withMessage("Tournament name should only contain alphabetic letters");
const descriptionCheck = check("description")
	.isLength({ min: 0, max: 1000 }).withMessage("Tournament description should be between 0 and 1000 characters long")
	.isString().withMessage("Tournament description should be a string")
// const imgUrlCheck = check("img")
// 	.isLength({ min: 1, max: 400 }).withMessage("Image url should be between 1 and 400 characters")
// 	.isURL().withMessage("Image url should have a valid URL format");

const createValidators = [
	nameCheck,
	descriptionCheck,
	// imgUrlCheck.optional(),
];

// const editValidators = [
// 	nameCheck.optional(),
// 	imgUrlCheck.optional({ checkFalsy: true }),
// ];

const getOne = async (req, res, next) => {
	try {
		const tournament = await service.getOne(getControllerToServiceFilter(req.query));

		res.json(tournament);
	} catch (err) {
		console.log("Error while getting tournaments", err);
		next(err);
	}
};

// const get = async (req, res, next) => {
// 	try {
// 		res.json(await service.get(getControllerToServiceFilter(req.query)));
// 	} catch (err) {
// 		console.log("Error while getting langs", err);
// 		next(err);
// 	}
// };

// const create = async (req, res, next) => {
// 	try {
// 		res.json(await service.create(req.body));
// 	} catch (err) {
// 		console.log("Error while creating a lang", err);
// 		next(err);
// 	}
// };

// const update = async (req, res, next) => {
// 	try {
// 		res.json(await service.update(req.params.id, req.body));
// 	} catch (err) {
// 		console.log("Error while updating a lang", err);
// 		next(err);
// 	}
// };

const remove = async (req, res, next) => {
	try {
		res.json(await service.remove(req.params.id));
	} catch (err) {
		console.log("Error while deleting a lang", err);
		next(err);
	}
};

module.exports = {
	getOne,
	// get,
	// create,
	// update,
	remove,
	createValidators,
	// editValidators,
};

export { };
