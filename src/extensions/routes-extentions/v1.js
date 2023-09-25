const auth_routes = require('../../routes/auth-routes');
const category_routes = require('../../routes/category-routes');
const address_routes = require('../../routes/address-routes');
const posts_routes = require('../../routes/post-routes');
const userMessage_routes = require('../../routes/user-message-routes');
const statistics_routes = require('../../routes/statistics-routes');
const auction_routes = require('../../routes/auction-routes');
const transaction_routes = require('../../routes/transaction-routes');

const BASE_URL = '/api/v1';

module.exports = (app) => {
	app.use(`${BASE_URL}/auth`, auth_routes);
	app.use(`${BASE_URL}/category`, category_routes);
	app.use(`${BASE_URL}/address`, address_routes);
	app.use(`${BASE_URL}/posts`, posts_routes);
	app.use(`${BASE_URL}/message`, userMessage_routes);
	app.use(`${BASE_URL}/statistics`, statistics_routes);
	app.use(`${BASE_URL}/auction`, auction_routes);
	app.use(`${BASE_URL}/payment`, transaction_routes);
};
