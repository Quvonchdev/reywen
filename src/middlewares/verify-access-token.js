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
	if (!decodedToken.userRoles) {
		return false;
	}
	return true;
}

function verifyDecodedTokenHasAdminRole(decodedToken) {
	if (!decodedToken.userRoles.includes('Admin')) {
		return false;
	}
	return true;
}

function verifyDecodedTokenHasSuperAdminRole(decodedToken) {
	if (!decodedToken.userRoles.includes('SuperAdmin')) {
		return false;
	}
	return true;
}

function verifyDecodedTokenHasManagerRole(decodedToken) {
	if (!decodedToken.userRoles.includes('Manager')) {
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
	verifyDecodedTokenHasAdminRole,
	verifyDecodedTokenHasSuperAdminRole,
	verifyDecodedTokenHasManagerRole,
	verifyDecodedTokenHasVerifiedAccount,
	verifyUserIsBlocked,
};
