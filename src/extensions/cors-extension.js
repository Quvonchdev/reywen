const cors = require('cors');

module.exports = (app) => {
	app.use(
		cors({
			origin: 'http://localhost:4200', // Access-Control-Allow-Origin: http://localhost:4200
			credentials: true, // Access-Control-Allow-Credentials: true
			optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // If needed Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
			maxAge: 21600, // 3 hours Access-Control-Max-Age: 21600 (seconds)
		})
	);
};
