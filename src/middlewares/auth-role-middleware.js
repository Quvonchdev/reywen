const ReturnResult = require('../helpers/return-result');
const {
	verifyAccessToken,
	verifyDecodedTokenExists,
	verifyDecodedTokenHasUserRoles,
	verifyDecodedTokenHasVerifiedAccount,
	verifyUserData,
	reqAccessToken,
	verifyDecodedTokenHasUserRole,
	verifyUserIsBlocked,
} = require('./verify-access-token');
const envSecretsConfig = require('../configurations/env-secrets-config');
const ERROR_MESSAGES = require('./error-messages');
const JWT_SECRET_KEY = envSecretsConfig.JWT_SECRET_KEY;

module.exports = function authRole(req, res, next) {
	const accessToken = reqAccessToken(req);

	if (!accessToken) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.TOKEN_NOT_FOUND));
	}

	const decodedToken = verifyAccessToken(accessToken, JWT_SECRET_KEY);

	if (!verifyDecodedTokenExists(decodedToken)) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.INVALID_TOKEN));
	}

	if (!verifyDecodedTokenHasVerifiedAccount(decodedToken)) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.NOT_VERIFIED_ACCOUNT));
	}

	if (verifyUserIsBlocked(decodedToken)) {
		return res.status(403).json(ReturnResult.errorMessage(ERROR_MESSAGES.ACCOUNT_BLOCKED));
	}

	if (!verifyDecodedTokenHasUserRoles(decodedToken)) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.NO_ACCESS));
	}

	if (!verifyDecodedTokenHasUserRole(decodedToken)) {
		return res.status(401).json(ReturnResult.errorMessage(ERROR_MESSAGES.NO_ACCESS));
	}

	req.userData = verifyUserData(decodedToken);

	next();
};
