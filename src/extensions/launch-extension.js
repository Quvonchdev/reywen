const { bot } = require('../connections/telegram-bot-connection');
const mongodbConnection = require('../connections/mongodb-connection');
const redisClient = require('../connections/redis-cache-connection');
const envSecretsConfig = require('../configurations/env-secrets-config');

module.exports = (app) => {
	// MongoDB Connection
	(async () => await mongodbConnection())();
	// Redis Cache Connection
	(async () => {
		await redisClient.connect();
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
		process.exit(1);
	});

	// Handle uncaught exceptions
	process.on('uncaughtException', (err) => {
		console.log(`❌ Error: ${err.message}`);
		console.log('Shutting down the server due to Uncaught Exception');
		process.exit(1);
	});
};
