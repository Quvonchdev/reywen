const redis = require('redis');

// for development
const HOST = '127.0.0.1';
const PORT = '6379';

// for production
const URL = process.env.REDIS_URL;

let redisClient = null;

// for development
if (process.env.NODE_ENV === 'development') {
	redisClient = redis.createClient({
		socket: {
			host: HOST,
			port: PORT,
		},
	});

	// ----------Redis Events------------- //
	redisClient.on('connect', () => {
		console.log(`🍅 Redis is connected: ${process.env.NODE_ENV}`);
	});

	redisClient.on('error', (err) => {
		console.log(`❌ Error in the Connection: ${process.env.NODE_ENV}`, err);
		redisClient.quit();
	});
} else if (process.env.NODE_ENV === 'production') {
	redisClient = redis.createClient({
		url: URL,
	});

	// ----------Redis Events------------- //
	redisClient.on('connect', () => {
		console.log(`🍅 Redis is connected: ${process.env.NODE_ENV}`);
	});

	redisClient.on('error', (err) => {
		console.log(`❌ Error in the Connection: ${process.env.NODE_ENV}`, err);
		redisClient.quit();
	});
} else {
	// for default also development
	redisClient = redis.createClient({
		socket: {
			host: HOST,
			port: PORT,
		},
	});

	// ----------Redis Events------------- //
	redisClient.on('connect', () => {
		console.log(`🍅 Redis is connected: ${process.env.NODE_ENV}`);
	});

	redisClient.on('error', (err) => {
		console.log(`❌ Error in the Connection: ${process.env.NODE_ENV}`, err);
		redisClient.quit();
	});
}

module.exports = redisClient;
