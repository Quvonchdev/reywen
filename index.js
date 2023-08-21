const express = require('express');
const app = express();

const commonMiddlewaresExtensions = require('./src/extensions/common-middlewares-extension');
const corsMiddlewareExtensions = require('./src/extensions/cors-extension');
const helmetMiddlewareExtensions = require('./src/extensions/helmet-extension');
const routesMiddlewareExtensions = require('./src/extensions/routes-extension');

const internalError = require('./src/errors/internal-server');
const invalidRoute = require('./src/errors/invalid-routes');
const multerErrors = require('./src/errors/multer-error');

const launchAppExtensions = require('./src/extensions/launch-extension');

// You dont have to use try catch block for async functions
// This package will handle it for you
require('express-async-errors');

// Primary Database Connection

// Middlewares
commonMiddlewaresExtensions(app);

// Serve static files: html, css, js, images, etc.
app.use(express.static('public'));

corsMiddlewareExtensions(app);

helmetMiddlewareExtensions(app);

routesMiddlewareExtensions(app);

// Multer error handling
multerErrors(app);
// Invalid Route error handling
invalidRoute(app);
// Global Error handling
internalError(app);

// Launch app on port 3000 or env port
// it launches redis and telegram bot connection
// and also handle unhandled promise rejections and uncaught exceptions
launchAppExtensions(app);
