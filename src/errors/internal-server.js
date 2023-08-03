const ReturnResult = require('../helpers/return-result');

module.exports = (app) => {
	app.use((error, req, res) => {
		res.status(error.status || 500);
		res.json(ReturnResult.error(error, error.message || 'Internal Server Error'));
	});
};
