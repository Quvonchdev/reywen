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

	static paginate(data, totalItems, page, limit) {
		return {
			totalItems: totalItems,
			totalPages: Math.ceil(totalItems / limit),
			isNextPageAvailable: limit * page < totalItems ? true : false,
			isPreviousPageAvailable: limit * (page - 1) > 0 ? true : false,
			currentPage: page,
			currentItems: data.length,
			data: data,
		};
	}

	static custom(data) {
		return data;
	}
}

module.exports = ReturnResult;
