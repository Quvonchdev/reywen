const multer = require('multer');
const path = require('path');

const PATH_IMAGES = '../../public/images';
const PATH_VIDEOS = '../../public/videos';
const PATH_AUDIOS = '../../public/audios';
const PATH_ASSETS = '../../public/assets';

// add here file extensions that you want to accept
const supportedFileExtensions = ['.mp4', '.pdf', '.mp3', '.jpeg', '.jpg', '.gif', '.webp', '.png'];

const MAX_MB = 1; // MAX File size
const MAX_SIZE = 1024 * 1024 * MAX_MB; // 5 MB
const MAX_FILES = 30;
const MAX_FIELD_NAME = 100;

module.exports = multer({
	storage: multer.diskStorage({
		destination: destination,
		filename: filename,
	}),
	fileFilter: fileFilter,
	limits: {
		fileSize: MAX_SIZE, // 5 MB,
		files: MAX_FILES, // 20 files
		fieldNameSize: MAX_FIELD_NAME, // 100 characters
	},
});

function destination(req, file, cb) {
	if (file.mimetype.startsWith('image')) {
		cb(null, path.join(__dirname, PATH_IMAGES));
	} else if (file.mimetype.startsWith('video')) {
		cb(null, path.join(__dirname, PATH_VIDEOS));
	} else if (file.mimetype.startsWith('audio')) {
		cb(null, path.join(__dirname, PATH_AUDIOS));
	} else {
		cb(null, path.join(__dirname, PATH_ASSETS));
	}
}

function filename(req, file, cb) {
	let ext = path.extname(file.originalname);
	let name = path.basename(file.originalname, ext);
	name = name.replace(/\s/g, '_');
	let uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
	cb(null, `${name}-${uniqueSuffix}${ext}`);
}

function fileFilter(req, file, cb) {
	let ext = path.extname(file.originalname);

	if (!supportedFileExtensions.includes(ext)) {
		const error = new Error(
			`File type is not supported. Please upload a file with extension ${supportedFileExtensions.join(
				', '
			)}`
		);
		error.status = 400;
		cb(error);
	} else {
		cb(null, true);
	}
}
