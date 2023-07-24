const redis = require('redis');
const envSecretsConfig = require('../configurations/env-secrets-config');

const NODE_ENV = envSecretsConfig.NODE_ENV;
// for development
const LOCAL_HOST = envSecretsConfig.REDIS_LOCAL_HOST;
const LOCAL_PORT = envSecretsConfig.REDIS_LOCAL_PORT;

// for production
const PRODUCTION_DEV_URL = envSecretsConfig.REDIS_URL;

let redisClient = null;

// for development
if (NODE_ENV === 'development') {
	redisClient = redis.createClient({
		socket: {
			host: LOCAL_HOST,
			port: LOCAL_PORT,
		},
	});

	// ----------Redis Events------------- //
	redisClient.on('connect', () => {
		console.log(`🍅 Redis is connected: ${NODE_ENV}`);
	});

	redisClient.on('error', (err) => {
		console.log(`❌ Error in the Connection: ${NODE_ENV}`, err);
		redisClient.quit();
	});
} else if (NODE_ENV === 'production') {
	redisClient = redis.createClient({
		url: PRODUCTION_DEV_URL,
	});

	// ----------Redis Events------------- //
	redisClient.on('connect', () => {
		console.log(`🍅 Redis is connected: ${NODE_ENV}`);
	});

	redisClient.on('error', (err) => {
		console.log(`❌ Error in the Connection: ${NODE_ENV}`, err);
		redisClient.quit();
	});
} else {
	// for default also development
	redisClient = redis.createClient({
		socket: {
			host: LOCAL_HOST,
			port: LOCAL_PORT,
		},
	});

	// ----------Redis Events------------- //
	redisClient.on('connect', () => {
		console.log(`🍅 Redis is connected: ${NODE_ENV}`);
	});

	redisClient.on('error', (err) => {
		console.log(`❌ Error in the Connection: ${NODE_ENV}`, err);
		redisClient.quit();
	});
}

module.exports = redisClient;
