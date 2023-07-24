const jwt = require('jsonwebtoken');
const ReturnResult = require('../helpers/return-result');
const { verifyAccessToken } = require('./verify-access-token');
const envSecretsConfig = require('../configurations/env-secrets-config');

const JWT_SECRET_KEY = envSecretsConfig.JWT_SECRET_KEY;

// we don't need try catch block here because we are using express-async-errors
module.exports = function superAdminRole(req, res, next) {
	const accessToken = req.headers.authorization?.split(' ')[1];

	if (!accessToken) {
		return res
			.status(401)
			.json(
				ReturnResult.errorMessage('Token not found. Authentication failed. Please login again')
			);
	}
	const decodedToken = verifyAccessToken(accessToken, JWT_SECRET_KEY);

	if (!decodedToken) {
		return res
			.status(401)
			.json(
				ReturnResult.errorMessage('Token is expired! Please login again')
			);
	}

	if (!decodedToken.userRoles.includes('SuperAdmin')) {
		return res
			.status(403)
			.json(
				ReturnResult.errorMessage(
					"You don't have permission to access this resource. Please contact admin for more information"
				)
			);
	}

	req.userData = {
		_id: decodedToken._id,
		fullName: decodedToken.fullName,
		email: decodedToken.email,
		phoneNumber: decodedToken.phoneNumber,
		userRoles: decodedToken.userRoles,
		isVerified: decodedToken.isVerified,
		isBlockedUser: decodedToken.isBlockedUser,
		coverImage: decodedToken.coverImage,
		shortDescription: decodedToken.shortDescription
	};

	next();
};
