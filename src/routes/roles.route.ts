const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/roles.controller");
const {
	CAN_VIEW_ROLES,
	CAN_EDIT_ROLES,
	CAN_DELETE_ROLES,
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid role format";

router.get("/", roleCheckMiddleware([CAN_VIEW_ROLES]), controller.get);
router.post("/",
	roleCheckMiddleware([CAN_EDIT_ROLES]),
	controller.createValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.create,
);
router.put("/:id",
	roleCheckMiddleware([CAN_EDIT_ROLES]),
	controller.editValidators,
	formErrorHandlerMiddleware(formErrorMessage),
	controller.update,
);
router.delete("/:id", roleCheckMiddleware([CAN_DELETE_ROLES]), controller.remove);

module.exports = router;

export {};
