const jwt = require('jsonwebtoken');

function reqAccessToken(req) {
	return req.headers?.authorization?.split(' ')[1];
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
	};
}

function verifyDecodedTokenExists(decodedToken) {
	if (!decodedToken) return false;
	return true;
}

module.exports = {
	reqAccessToken,
	verifyAccessToken,
	verifyUserData,
	verifyDecodedTokenExists,
};
