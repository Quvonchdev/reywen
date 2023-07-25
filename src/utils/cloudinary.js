const cloudinary = require('../connections/cloudinary-connection');
const ReturnResult = require('../helpers/return-result');

const SUCCESS_MESSAGES = {
	FILE_UPLOADED: 'File uploaded successfully',
	FILE_DELETED: 'File deleted successfully',
	FILES_DELETED: 'Files deleted successfully',
	FILES_UPLOADED: 'Files uploaded successfully',
	FILE_RETRIEVED: 'Files retrieved successfully',
};

const ERROR_MESSAGES = {
	FILE_NOT_FOUND: 'File not found',
	FILE_NOT_DELETED: 'File not deleted',
	FILES_NOT_DELETED: 'Files not deleted',
	FILE_NOT_UPLOADED: 'File not uploaded',
	FILES_NOT_UPLOADED: 'Files not uploaded',
	PUBLIC_IDS_EMPTY: 'Public ids empty',
	FILE_NOT_RETRIEVED: 'Files not retrieved',
};

class Cloudinary {
	static async uploadFile(file) {
		try {
			if (!file) {
				return ReturnResult.errorMessage(ERROR_MESSAGES.FILE_NOT_FOUND);
			}

			let uploadedFile = await cloudinary.v2.uploader.upload(file.path);

			return ReturnResult.success(uploadedFile, SUCCESS_MESSAGES.FILE_UPLOADED);
		} catch (err) {
			return ReturnResult.returnErrorResult(err, ERROR_MESSAGES.FILE_NOT_UPLOADED);
		}
	}

	static async deleteFile(publicId) {
		try {
			if (!publicId) {
				return ReturnResult.error(ERROR_MESSAGES.FILE_NOT_FOUND);
			}
			let deletedFile = await cloudinary.v2.uploader.destroy(publicId);
			return ReturnResult.success(deletedFile, SUCCESS_MESSAGES.FILE_DELETED);
		} catch (err) {
			return ReturnResult.error(err, ERROR_MESSAGES.FILE_NOT_DELETED);
		}
	}

	static async batchDeleteFiles(publicIds) {
		try {
			if (!publicIds || publicIds.length === 0) {
				return ReturnResult.errorMessage(ERROR_MESSAGES.PUBLIC_IDS_EMPTY);
			}

			let multipleFilePromises = publicIds.map(async (id) => await cloudinary.uploader.destroy(id));
			return await Promise.all(multipleFilePromises);
		} catch (err) {
			return ReturnResult.error(err, ERROR_MESSAGES.FILES_NOT_DELETED);
		}
	}

	static async uploadFiles(files) {
		try {
			if (!files || files.length === 0) {
				return ReturnResult.errorMessage(ERROR_MESSAGES.FILE_NOT_FOUND);
			}

			let multipleFilePromises = files.map(
				async (file) => await cloudinary.v2.uploader.upload(file.path)
			);

			let fileResponse = await Promise.all(multipleFilePromises);

			return fileResponse;
		} catch (err) {
			return ReturnResult.err(err, ERROR_MESSAGES.FILES_NOT_UPLOADED);
		}
	}

	static async getFiles() {
		try {
			let files = await cloudinary.v2.api.resources({
				type: 'upload',
			});

			return ReturnResult.success(files, SUCCESS_MESSAGES.FILE_RETRIEVED);
		} catch (err) {
			return ReturnResult.err(err, ERROR_MESSAGES.FILE_NOT_RETRIEVED);
		}
	}
}

module.exports = Cloudinary;
