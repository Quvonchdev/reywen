const { isValidObjectId } = require('mongoose');
const ReturnResult = require('../helpers/return-result');

function objectIdValidatorMiddleware(paramName) {
	return function (req, res, next) {
		const paramValue = req.params[paramName];
		if (isValidObjectId(paramValue)) {
			next(); // ObjectId is valid, proceed to the next middleware or route handler
		} else {
			res
				.status(400)
				.json(
					ReturnResult.errorMessage(
						'Invalid ObjectId. Please check the value of the parameter. It should be a valid ObjectId.'
					)
				);
		}
	};
}

module.exports = objectIdValidatorMiddleware;
