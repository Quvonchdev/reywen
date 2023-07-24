const notFoundRoute = (req, res) => {
	res.status(200).json({
		message: 'Route not found on the server',
	});
};

const rateLimiterError = (req, res) => {
	res.status(200).json({
		message: 'Occured Error in the Rate Limiter',
	});
};

const multerError = (req, res) => {
	res.status(200).json({
		message: 'Occured Error in the Multer',
	});
};

const timeoutError = (req, res) => {
	setTimeout(() => {
		// if(req.timedout) {
		//     return
		// }
		res.status(200).json({
			message: 'Occured Error in the Timeout',
		});
	}, 50000);
};

const error = (req, res) => {
	res.status(200).json({
		message: 'Occured Error in the Error',
	});
};

const errorController = {
	notFoundRoute,
	rateLimiterError,
	multerError,
	timeoutError,
	error,
};

module.exports = errorController;
