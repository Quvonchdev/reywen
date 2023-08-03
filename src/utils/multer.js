const multer = require('multer');
const path = require('path');

// add here file extensions that you want to accept
const supportedFileExtensions = ['.mp4', '.pdf', '.mp3', '.jpg', '.jpeg', '.gif', '.webp', '.png'];

module.exports = multer({
	storage: multer.diskStorage({}),
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname);
		if (!supportedFileExtensions.includes(ext)) {
			const error = new Error('File type is not supported');
			error.status = 400;
			cb(error);
		} else {
			cb(null, true);
		}
	},
});
