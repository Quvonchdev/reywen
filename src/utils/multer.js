const multer = require('multer');
const path = require('path');

// add here file extensions that you want to accept
const supportedFileExtensions = ['.mp4', '.pdf', '.mp3', '.jpg', '.jpeg', '.gif', '.webp', '.png'];

const MAX_MB = 5;
const MAX_SIZE = 1024 * 1024 * MAX_MB; // 5 MB
const MAX_FILES = 20;

module.exports = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			if(file.mimetype.startsWith('image')){
				cb(null, path.join(__dirname, '../../public/images'));
			} else if(file.mimetype.startsWith('video')){
				cb(null, path.join(__dirname, '../../public/videos'));
			} else if(file.mimetype.startsWith('audio')){
				cb(null, path.join(__dirname, '../../public/audios'));
			} else {
				cb(null, path.join(__dirname, '../../public/assets'));
			}
		},
		filename: (req, file, cb) => {
			let ext = path.extname(file.originalname);
			cb(null, `${file.fieldname}-${Date.now()}${ext}`);
		}
	}),
	fileFilter: (req, file, cb) => {
		let ext = path.extname(file.originalname);

		if(file.size > MAX_SIZE) {
			const error = new Error(`File size is too large. Please upload a file less than ${MAX_MB} MB`);
			error.status = 400;
			cb(error);
		}

		if (!supportedFileExtensions.includes(ext)) {
			const error = new Error('File type is not supported');
			error.status = 400;
			cb(error);
		} else {
			cb(null, true);
		}
	},
	limits: {
		fileSize: MAX_SIZE, // 5 MB,
		files: MAX_FILES, // 20 files
		fieldNameSize: 100,
	}
});
