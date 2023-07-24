const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const responseTime = require('response-time');
const envSecretsConfig = require('../configurations/env-secrets-config');

module.exports = (app) => {
	app.use(bodyParser.json()); // Parse application/json
	app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded
	if (envSecretsConfig.NODE_ENV === 'development') {
		app.use(morgan('dev')); // Log requests to console
	}
	app.use(compression()); // Compress response bodies
	app.use(responseTime()); // Add X-Response-Time header
	// app.use(timeout('120s'));
	// give 150s for each request to finish
};
