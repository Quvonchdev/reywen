const redisClient = require('../connections/redis-cache-connection');

class RedisCache {
	static async get(key) {
		return await redisClient.get(key); // get value from redis cache
	}

	static async getAsync(key) {
		return await redisClient.getAsync(key); // get value from redis cache
	}

	static async set(key, value) {
		await redisClient.set(key, value); // set key to hold the value
	}

	static async del(key) {
		await redisClient.del(key); // delete key from redis cache
	}

	static async flush() {
		await redisClient.sendCommand(['FLUSHALL']); // delete all keys from cache
	}
}

module.exports = RedisCache;
