const { bot } = require('../connections/telegram-bot-connection');
const redisClient = require('../connections/redis-cache-connection');
const envSecretsConfig = require('../configurations/env-secrets-config');

module.exports = (app) => {
	// Database Connections
	require('../connections/database-connections/primary-db-connection');
	require('../connections/database-connections/chat-db-connection');
	require('../connections/database-connections/user-db-connection');
	require('../connections/database-connections/logs-db-connection');
	require('../connections/database-connections/auction-db-connection');

	// Redis Cache Connection
	(async () => {
		await redisClient.connect();
		// await new RabbitMQConnection().connect();
	})();

	const port = envSecretsConfig.PORT || 3000;
	app.listen(port, () => {
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
