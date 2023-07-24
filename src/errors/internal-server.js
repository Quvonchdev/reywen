const ReturnResult = require('../helpers/return-result');

module.exports = (app) => {
	app.use((error, req, res, next) => {
		if (error.code === 11000) {
			const duplicatedKey = Object.keys(err.keyValue)[0];
			const duplicatedValue = err.keyValue[duplicatedKey];
			return res
				.status(400)
				.json({ error: `Duplicate key: ${duplicatedKey} with value '${duplicatedValue}'` });
		}

		res.status(error.status || 500);
		res.json(ReturnResult.error(error, error.message || 'Internal Server Error'));
	});
};
