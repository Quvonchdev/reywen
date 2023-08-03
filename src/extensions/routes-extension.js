const error = require('../routes/error-routes');
const auth = require('../routes/auth-routes');
const category = require('../routes/category-routes');
const rateLimit = require('../configurations/rate-limiter');

const URL = '/api/v1';

module.exports = (app) => {
	// Add routes here
	routes('user', auth);
	routes('category', category);
	routes('error', error);

	// function to register routes. Don't touch this
	function routes(route, router) {
		app.use(`${URL}/${route}`, router);
	}
};