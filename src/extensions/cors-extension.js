const cors = require('cors');
const secrets = require('../configurations/env-secrets-config');

module.exports = (app) => {
	let origins;

	if (secrets.NODE_ENV === 'production') {
		origins = [
			// react app
			'http://localhost:3000',
			'https://localhost:3000/',
		];
	} else {
		origins = '*';
	}

	app.use(
		// cors settings url : https://www.npmjs.com/package/cors
		cors({
			origin: origins,
			methods: ['GET', 'POST', 'PUT', 'DELETE'],
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
			optionsSuccessStatus: 200,
			maxAge: 4 * 60 * 60, // every 4 hours the preflight request will be sent again. preflight is an OPTIONS request that checks if the server allows the request
		})
	);
};
