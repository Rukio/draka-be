const exp = require("express");
const router = exp.Router();

const controller = require("../controllers/tournaments.controller");
const {
	CAN_EDIT_SETTINGS
} = require("../configs/roleRights.config");

const roleCheckMiddleware = require("../middleware/roleCheck.middleware");
const formErrorHandlerMiddleware = require("../middleware/formErrorHandler.middleware");

const formErrorMessage = "Invalid language format";

router.get("/:id", controller.getOne);
// router.get("/", controller.get);
// router.post("/",
// 	roleCheckMiddleware([CAN_EDIT_LANGS]),
// 	controller.createValidators,
// 	formErrorHandlerMiddleware(formErrorMessage),
// 	controller.create,
// );
// router.put("/:id",
// 	roleCheckMiddleware([CAN_EDIT_LANGS]),
// 	controller.editValidators,
// 	formErrorHandlerMiddleware(formErrorMessage),
// 	controller.update,
// );
router.delete("/:id", roleCheckMiddleware([CAN_EDIT_SETTINGS]), controller.remove);

module.exports = router;

export { };
