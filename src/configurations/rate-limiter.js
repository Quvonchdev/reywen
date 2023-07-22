const rateLimiter = require('express-rate-limit');
const ReturnResult = require('../helpers/return.result');

const SECOND = 1000;
const MINUTE = 60 * SECOND;

const limiter = (limit, windowMinutes) => {
	return rateLimiter({
		windowMs: windowMinutes * MINUTE,
		max: limit,
		headers: true,
		statusbar: true,
		handler: function (req, res) {
			res
				.status(429)
				.json(
					ReturnResult.errorMessage(
						`Too many requests, please try again after ${windowMinutes} minutes.`
					)
				);
		},
	});
};

module.exports = limiter;
