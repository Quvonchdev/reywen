const error = require('../routes/error-routes');

module.exports = (app) => {
	// import routes here : example below
	app.use('/api/error', error);
};
