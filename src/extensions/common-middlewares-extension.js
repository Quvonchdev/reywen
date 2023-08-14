const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const responseTime = require('response-time');
const envSecretsConfig = require('../configurations/env-secrets-config');

module.exports = (app) => {
	// Parse application/json
	app.use(
		bodyParser.json({
			limit: '50mb',
		})
	);

	// Parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));

	if (envSecretsConfig.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	}

	// Compress response bodies
	app.use(
		compression({
			threshold: 0,
			level: 9,
			memLevel: 9,
		})
	);

	// Add X-Response-Time header
	app.use(responseTime());
	// Disable X-Powered-By header: Express
	app.disable('x-powered-by');
};
