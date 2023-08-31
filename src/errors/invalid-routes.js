const ReturnResult = require('../helpers/return-result');
const removeUploadedFile = require('../helpers/remove-uploaded-file');

module.exports = (app) => {
	app.use((req, res, next) => {
		if (req.file) {
			removeUploadedFile(req.file.path);
		} else if (req.files) {
			for (const file of req.files) {
				removeUploadedFile(file.path);
			}
		}
		res.status(404);
		res.json(
			ReturnResult.errorMessage(
				"Invalid Routes. Please check your URL. That route doesn't exist in this server."
			)
		);
	});
};
