const ReturnResult = require('../helpers/return-result');
const removeUploadedFile = require('../helpers/remove-uploaded-file');

module.exports = (app) => {
	app.use((error, req, res) => {
		// Remove uploaded files When error occurred in the middle of uploading
		if (req.file) {
			removeUploadedFile(req.file.path);
		} else if (req.files) {
			for (const file of req.files) {
				removeUploadedFile(file.path);
			}
		}

		res.status(error.status || 500);
		res.json(ReturnResult.error(error, error.message || 'Internal Server Error'));
	});
};
