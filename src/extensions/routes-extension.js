const error = require('../routes/error-routes');
const auth = require('../routes/auth-routes');
const category = require('../routes/category-routes');
const address = require('../routes/address-routes');
const clear = require('../routes/clear-routes');
const types = require('../routes/type-routes');
const rateLimit = require('../configurations/rate-limiter');

const URL_VERSION_1 = '/api/v1';

module.exports = (app) => {
	// Add routes here
	routesV1('user', auth);
	routesV1('category', category);
	routesV1('error', error);
	routesV1('address', address);
	routesV1('clear', clear);
	routesV1('types', types);

	// function to register routes. Don't touch this
	function routesV1(route, router, middleware = []) {
		app.use(`${URL_VERSION_1}/${route}`, middleware, router);
	}
};
