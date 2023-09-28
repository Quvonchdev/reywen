class ReturnResult {
	static success(data, success_message) {
		return {
			error: false,
			message: success_message,
			details: null,
			data: data,
		};
	}

	static error(error, error_message) {
		return {
			error: true,
			message: error_message,
			details: error.message || error,
			data: null,
		};
	}

	static successMessage(success_message) {
		return {
			error: false,
			message: success_message,
			details: null,
			data: null,
		};
	}
	static errorMessage(error_message) {
		return {
			error: true,
			message: error_message,
			details: null,
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
