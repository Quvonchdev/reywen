const ReturnResult = require('../helpers/return-result');
const multer = require('multer');
const removeUploadedFile = require('../helpers/remove-uploaded-file');

module.exports = (app) => {
	app.use((err, req, res, next) => {
		if (req.file) {
			removeUploadedFile(req.file.path);
		} else if (req.files && req.files.length > 0) {
			for (const file of req.files) {
				removeUploadedFile(file.path);
			}
		}
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
