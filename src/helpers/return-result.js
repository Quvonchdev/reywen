class ReturnResult {
	static success(data, success_message, fromCache = false) {
		return {
			error: false,
			message: success_message,
			details: null,
			fromCache: fromCache,
			data: data,
		};
	}

	static error(error, error_message) {
		return {
			error: true,
			message: error_message,
			details: error.message || error,
			fromCache: false,
			data: null,
		};
	}

	static successMessage(success_message, fromCache = false) {
		return {
			error: false,
			message: success_message,
			details: null,
			fromCache: fromCache,
			data: null,
		};
	}
	static errorMessage(error_message) {
		return {
			error: true,
			message: error_message,
			details: null,
			fromCache: false,
			data: null,
		};
	}
}

module.exports = ReturnResult;
