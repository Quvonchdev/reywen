const express = require('express');
const app = express();
const commonMiddlewaresExtensions = require('./src/extensions/common-middlewares-extension');
const corsMiddlewareExtensions = require('./src/extensions/cors-extension');
const routesMiddlewareExtensions = require('./src/extensions/routes-extension');
const internalError = require('./src/errors/internal-server');
const invalidRoute = require('./src/errors/invalid-routes');

const launchAppExtensions = require('./src/extensions/launch-extension');
require('express-async-errors');

// middleware
commonMiddlewaresExtensions(app);
// cors middleware
corsMiddlewareExtensions(app);

// Routes
routesMiddlewareExtensions(app);

// Invalid Route error handling
invalidRoute(app);

// Global Error handling
internalError(app);

// Launch app on port 3000 or env port
// it launches db, redis and telegram bot connection
// and also handle unhandled promise rejections and uncaught exceptions
launchAppExtensions(app);
