const jwt = require('jsonwebtoken');

function verifyAccessToken(accessToken, JWT_SECRET_KEY) {
	try {
		return jwt.verify(accessToken, JWT_SECRET_KEY);
	} catch (err) {
		return null;
	}
}

exports.verifyAccessToken = verifyAccessToken;
