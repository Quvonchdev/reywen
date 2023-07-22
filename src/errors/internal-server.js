const ReturnResult = require('../helpers/return.result');

module.exports = (app) => {
	app.use((error, req, res) => {
		switch (error.code) {
			case 'ETIMEDOUT':
				return res.status(504).json(ReturnResult.error(error, 'Request Timeout'));
			case 'ECONNREFUSED':
				return res.status(503).json(ReturnResult.error(error, 'Service Unavailable'));
			case 'ENOTFOUND':
				return res.status(404).json(ReturnResult.error(error, 'Not Found'));
			default:
				return res
					.status(error.status || 500)
					.json(ReturnResult.error(error, error.message || 'Internal Server Error'));
		}
	});
};
