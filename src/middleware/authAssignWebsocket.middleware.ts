const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../configs/db.config");

// For routes that have access to guests
module.exports = async (req, res, next) => {
	if (req.method === "OPTIONS") {
		return next();
	}

	try {
		const token = req.headers.cookie
			.split("token=")[1]
			?.split(";")[0];

		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

		if (decoded?.id) {
			req.user = decoded;
		}

		next();
	} catch (err) {
		next();
	}
};

export {};
