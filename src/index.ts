const express = require("express");
const app = express();
const cors = require("cors");
const { PORT } = require("./configs/general.config");
const tournamentsRouter = require("./routes/tournaments.route");
const phasesRouter = require("./routes/phases.route");
const stagesRouter = require("./routes/stages.route");
const gamesRouter = require("./routes/games.route");
const teamsRouter = require("./routes/teams.route");
const playersRouter = require("./routes/players.route");
const errorHandlerMiddleware = require("./middleware/errorHandler.middleware");
const commonFieldGuard = require("./middleware/commonFieldGuard.middleware");

app.use(cors());

const v = "/v1";

app.use(express.json());
app.use(commonFieldGuard);
app.use(`${v}/tournaments`, tournamentsRouter);
app.use(`${v}/phases`, phasesRouter);
app.use(`${v}/stages`, stagesRouter);
app.use(`${v}/games`, gamesRouter);
app.use(`${v}/teams`, teamsRouter);
app.use(`${v}/players`, playersRouter);
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
	console.log(`Running on ${PORT}`);
});
