const { check } = require("express-validator");
const service = require("../services/tournaments.service");
const phaseService = require("../services/phases.service");
const stageService = require("../services/stages.service");
const tourService = require("../services/tours.service");
const gameService = require("../services/games.service");
const teamServcie = require("../services/teams.service");
const teamStageService = require("../services/teamsStages.service");
const teamGamesService = require("../services/teamsGames.service");
const playersServcie = require("../services/players.service");
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
		const body = req.body;
		const existingTrounament = await service.getOne(getControllerToServiceFilter({ name: body.name }));

		if (existingTrounament) {
			return next(error.badRequest("Tournament with this name already exists"))
		}

		const players = body.players;
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

			const stage = await stageService.create({
				name: "Верхняя сетка",
				tournament_id: tournamentId,
				phase_id: phase.data.id,
			});


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
