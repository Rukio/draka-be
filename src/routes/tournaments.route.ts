const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/tournaments.controller");
const {
	CAN_EDIT_SETTINGS
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid tournament format";

router.get("/:id", controller.getOne);
router.delete("/:id", roleCheckMiddleware([CAN_EDIT_SETTINGS]), controller.remove);
router.get("/", controller.get);
router.post("/",
	roleCheckMiddleware([CAN_EDIT_SETTINGS]),
	controller.createValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.create,
);
router.put("/:id",
	roleCheckMiddleware([CAN_EDIT_SETTINGS]),
	controller.editValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.update,
);

module.exports = router;

export { };
