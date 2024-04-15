const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/roles.controller");
const {
	CAN_EDIT_SETTINGS,
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid role format";

router.get("/", roleCheckMiddleware([CAN_EDIT_SETTINGS]), controller.get);
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
router.delete("/:id", roleCheckMiddleware([CAN_EDIT_SETTINGS]), controller.remove);

module.exports = router;

export { };
