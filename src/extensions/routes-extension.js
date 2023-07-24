const error = require('../routes/error-routes');
const auth = require('../routes/auth-routes');

// import routes here : example below
// you can user rate limiting here also
module.exports = (app) => {
	app.use('/api/v1/error', error);
	app.use('/api/v1/user', auth);
};

// after registering the routes, you don't need to import them in index.js
