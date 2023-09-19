const { bot } = require('../connections/telegram-bot-connection');
const redisClient = require('../connections/redis-cache-connection');
const envSecretsConfig = require('../configurations/env-secrets-config');
const http = require('http');
const socketConnection = require('../connections/socket-io-connection');

const AuctionController = require('../controllers/auction-controller/auction-controller');

module.exports = (app) => {
	const server = http.createServer(app);
	// Database Connections
	require('../connections/database-connections/primary-db-connection');
	require('../connections/database-connections/chat-db-connection');
	require('../connections/database-connections/user-db-connection');
	require('../connections/database-connections/auction-db-connection');
	require('../connections/database-connections/transaction-db-connection');

	// Socket.io Connection
	socketConnection.init(server);

	// Auction Controller - Socket.io Connection
	AuctionController.setSocket(socketConnection);

	// Redis Cache Connection
	(async () => {
		await redisClient.connect();
	})();

	const port = envSecretsConfig.PORT || 3000;
	server.listen(port, () => {
		console.log(`🚀 Server is running on port ${port}: ${envSecretsConfig.NODE_ENV}`);

		bot
			.launch()
			.then(() => {
				console.log('🚀 Telegram Bot is running');
			})
			.catch((err) => {
				console.log('❌ Telegram Bot Error: ', err.message);
			});
	});

	// Handle unhandled promise rejections
	process.on('unhandledRejection', (err) => {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Unhandled Promise rejection');

		// shutdown server
		process.exit(1);
	});

	// Handle uncaught exceptions
	process.on('uncaughtException', (err) => {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		// shutdown server
		process.exit(1);
	});
};
