const cors = require('cors');

module.exports = (app) => {
	const origin = '*';

	app.use(
		cors({
			origin: origin,
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
			optionsSuccessStatus: 200,
			maxAge: 4 * 60 * 60, // every 4 hours the preflight request will be sent again. preflight is an OPTIONS request that checks if the server allows the request
		})
	);
};
