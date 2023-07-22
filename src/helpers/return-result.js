class ReturnResult {
	static success(data, success_message, fromCache = false) {
		return {
			error: false,
			data: data,
			message: success_message,
			details: null,
			fromCache: fromCache,
		};
	}

	static error(error, error_message) {
		return {
			error: true,
			message: error_message,
			data: null,
			details: error.message || error,
			fromCache: false,
		};
	}

	static successMessage(success_message, fromCache = false) {
		return {
			error: false,
			message: success_message,
			data: null,
			details: null,
			fromCache: fromCache,
		};
	}
	static errorMessage(error_message) {
		return {
			error: true,
			message: error_message,
			data: null,
			details: null,
			fromCache: false,
		};
	}
}

module.exports = ReturnResult;
