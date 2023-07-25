const error = require('../routes/error-routes');
const auth = require('../routes/auth-routes');
const category = require('../routes/category-routes');

// import routes here : example below
// you can user rate limiting here also
module.exports = (app) => {
	app.use('/api/v1/error', error);
	app.use('/api/v1/user', auth);
	app.use('/api/v1/category', category);
};

// after registering the routes, you don't need to import them in index.js
