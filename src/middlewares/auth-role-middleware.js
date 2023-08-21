const ReturnResult = require('../helpers/return-result');
const { User } = require('../models/user-models/user-model');
const {
	verifyAccessToken,
	verifyDecodedTokenExists,
	verifyUserData,
	reqAccessToken,
} = require('./verify-access-token');
const envSecretsConfig = require('../configurations/env-secrets-config');
const ERROR_MESSAGES = require('./error-messages');
const JWT_SECRET_KEY = envSecretsConfig.JWT_SECRET_KEY;

module.exports = async function authRole(req, res, next) {
	const accessToken = reqAccessToken(req);

	if (!accessToken) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.TOKEN_NOT_FOUND));
	}

	const decodedToken = verifyAccessToken(accessToken, JWT_SECRET_KEY);

	if (!verifyDecodedTokenExists(decodedToken)) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.INVALID_TOKEN));
	}

	const user = await User.findById(decodedToken._id);

	if (!user) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.INVALID_TOKEN));
	}

	if(!user.userRoles.includes('User')) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.INVALID_TOKEN));
	}

	req.userData = verifyUserData(decodedToken);

	next();
};
