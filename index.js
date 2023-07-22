const express = require('express');
const app = express();
const commonMiddlewaresExtensions = require('./src/extensions/common-middlewares-extension');
const corsMiddlewareExtensions = require('./src/extensions/cors-extension');
const routesMiddlewareExtensions = require('./src/extensions/routes-extension');
const internalError = require('./src/errors/internal-server');
const invalidRoute = require('./src/errors/invalid-routes');

const launchAppExtensions = require('./src/extensions/launch-extension');

// middleware
commonMiddlewaresExtensions(app);
// cors middleware
corsMiddlewareExtensions(app);

// Routes
routesMiddlewareExtensions(app);
// Invalid Route error handling
invalidRoute(app);

const apiTimeout = 2 * 1000;
app.use((req, res, next) => {
	// Set the timeout for all HTTP requests
	req.setTimeout(apiTimeout, () => {
		let err = new Error('Request Timeout');
		err.status = 408;
		next(err);
	});
	// Set the server response timeout for all HTTP requests
	res.setTimeout(apiTimeout, () => {
		let err = new Error('Service Unavailable');
		err.status = 503;
		next(err);
	});
	next();
});

// Global Error handling
internalError(app);

// Launch app on port 3000 or env port
// it launches db, redis and telegram bot connection
// and also handle unhandled promise rejections and uncaught exceptions
launchAppExtensions(app);
