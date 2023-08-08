const ReturnResult = require('../helpers/return-result');
const multer = require('multer');

module.exports = (app) => {
	app.use((err, req, res, next) => {
		if (err instanceof multer.MulterError) {
			res
				.status(400)
				.json(
					ReturnResult.error(
						err,
						`File upload error: Please check your file size and file type. Error message: ${err.message}`
					)
				);
		} else {
			next(err);
		}
	});
};
