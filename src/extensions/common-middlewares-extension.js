const bodyParser = require('body-parser');
const morgan = require('morgan');
const compression = require('compression');
const responseTime = require('response-time');
const envSecretsConfig = require('../configurations/env-secrets-config');
const scheduler = require('./scheduler-extention');

module.exports = (app) => {
	app.use(bodyParser.json({limit: '50mb'}));
	app.use(compression());
	app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
	app.use(responseTime());
	app.disable('x-powered-by');

	// Schedule Auction Status
	scheduler();

	// Morgan
	if (envSecretsConfig.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	}
};
