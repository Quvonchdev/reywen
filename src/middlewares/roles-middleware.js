const ReturnResult = require('../helpers/return-result');
const { User } = require('../models/user-models/user-model');
const ERROR_MESSAGES = require('./error-messages');

const checkRoles = (roles) => async (req, res, next) => {
	const userData = req?.userData;

	if (!userData)
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.INVALID_TOKEN));

	const user = await User.findOne({ phoneNumber: userData?.phoneNumber });

	if (!user) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.INVALID_TOKEN));
	}

	if (user.isBlockedUser == true) {
		return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.ACCOUNT_BLOCKED));
	}

	const hasRole = user.userRoles.some((role) => roles.includes(role));

	if (!hasRole) {
		return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.NO_ACCESS));
	}
	next();
};

module.exports = checkRoles;
