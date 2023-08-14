const jwt = require('jsonwebtoken');

function reqAccessToken(req) {
	return req.headers.authorization?.split(' ')[1];
}

function verifyAccessToken(accessToken, JWT_SECRET_KEY) {
	try {
		return jwt.verify(accessToken, JWT_SECRET_KEY);
	} catch (err) {
		return null;
	}
}

function verifyUserData(decodedToken) {
	return {
		_id: decodedToken._id,
		fullName: decodedToken.fullName,
		email: decodedToken.email,
		phoneNumber: decodedToken.phoneNumber,
		userRoles: decodedToken.userRoles,
		isVerified: decodedToken.isVerified,
		isBlockedUser: decodedToken.isBlockedUser,
		coverImage: decodedToken.coverImage,
		shortDescription: decodedToken.shortDescription,
	};
}

function verifyDecodedTokenExists(decodedToken) {
	if (!decodedToken) return false;
	return true;
}

function verifyDecodedTokenHasVerifiedAccount(decodedToken) {
	return decodedToken.isVerified;
}

function verifyUserIsBlocked(decodedToken) {
	return decodedToken.isBlockedUser;
}

function verifyDecodedTokenHasUserRoles(decodedToken) {
	if (!decodedToken.userRoles || decodedToken.userRoles.length === 0) {
		return false;
	}
	return true;
}

function verifyDecodedTokenHasUserRole(decodedToken) {
	if (!decodedToken.userRoles.includes('User')) {
		return false;
	}
	return true;
}

module.exports = {
	reqAccessToken,
	verifyAccessToken,
	verifyUserData,
	verifyDecodedTokenExists,
	verifyDecodedTokenHasUserRoles,
	verifyDecodedTokenHasVerifiedAccount,
	verifyUserIsBlocked,
	verifyDecodedTokenHasUserRole,
};
