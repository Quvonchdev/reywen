const ReturnResult = require('../helpers/return-result');

module.exports = (app) => {
	app.use((req, res, next) => {
		res.status(404);
		res.json(
			ReturnResult.errorMessage(
				"Invalid Routes. Please check your URL. That route doesn't exist in this server."
			)
		);
	});
};
