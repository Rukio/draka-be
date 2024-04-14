const exp = require("express");
const router = exp.Router();
const controller = require("../controllers/raceSockets.controller");
const authAssignMiddleware = require("../middleware/authAssign.middleware");
const authWebsocketAssignMiddleware = require("../middleware/authAssignWebsocket.middleware");

module.exports = (WS) => {
	router.get("/race/find", controller.findSocketRace);
	router.use("/race/:uuid", authWebsocketAssignMiddleware);
	router.ws("/race/:uuid", controller.joinSocketRace(WS));
	return router;
};

export {};
