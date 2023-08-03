const ReturnResult = require('../helpers/return-result');
const {
	verifyAccessToken,
	verifyUserIsBlocked,
	verifyUserData,
	reqAccessToken,
	verifyDecodedTokenExists
} = require('./verify-access-token');
const envSecretsConfig = require('../configurations/env-secrets-config');
const ERROR_MESSAGES = require('./error-messages');
const JWT_SECRET_KEY = envSecretsConfig.JWT_SECRET_KEY;

module.exports = function blockedUser(req, res, next) {
	const accessToken = reqAccessToken(req);

	if (!accessToken) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.TOKEN_NOT_FOUND));
	}

	const decodedToken = verifyAccessToken(accessToken, JWT_SECRET_KEY);

	if (!verifyDecodedTokenExists(decodedToken)) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.INVALID_TOKEN));
	}

	if (verifyUserIsBlocked(decodedToken)) {
		return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.ACCOUNT_BLOCKED));
	}

	req.userData = verifyUserData(decodedToken);

	next();
};
