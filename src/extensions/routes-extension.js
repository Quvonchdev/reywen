const error = require('../routes/error-routes');
const auth = require('../routes/auth-routes');
const category = require('../routes/category-routes');
const address = require('../routes/address-routes');
const clear = require('../routes/clear-routes');
const types = require('../routes/type-routes');
const prices = require('../routes/price-routes');
const posts = require('../routes/post-routes');
const eskiz = require('../routes/eskiz-routes');
const userMessage = require('../routes/user-message-routes');
const statistics = require('../routes/statistics-routes');
const auction = require('../routes/auction-routes');

// for versioning
const url_v1 = '/api/v1';

module.exports = (app) => {
	// Add routes here
	routes_v1('user', auth);
	routes_v1('category', category);
	routes_v1('error', error);
	routes_v1('address', address);
	routes_v1('clear', clear);
	routes_v1('types', types);
	routes_v1('prices', prices);
	routes_v1('posts', posts);
	routes_v1('eskiz', eskiz);
	routes_v1('message', userMessage);
	routes_v1('statistics', statistics);
	routes_v1('auction', auction);

	// function to register routes. Don't touch this
	function routes_v1(route, router, middleware = []) {
		app.use(`${url_v1}/${route}`, middleware, router);
	}
};
