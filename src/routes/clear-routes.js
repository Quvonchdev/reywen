const express = require('express');
const RedisCache = require('../utils/redis');
const ReturnResult = require('../helpers/return-result');
const router = express.Router();
const primaryDatabase = require('../connections/database-connections/primary-db-connection');
const chatDatabase = require('../connections/database-connections/chat-db-connection');
const logsDatabase = require('../connections/database-connections/logs-db-connection');
const transactionDatabase = require('../connections/database-connections/transaction-db-connection');
const userDatabase = require('../connections/database-connections/user-db-connection');
const auctionDatabase = require('../connections/database-connections/auction-db-connection');

router.get('/clear-cache', async (req, res, next) => {
	await RedisCache.flush();
	return res.status(200).json(ReturnResult.successMessage('Cache cleared successfully'));
});

router.get('/drop-db', async (req, res, next) => {
	
	await primaryDatabase.dropDatabase();
	await chatDatabase.dropDatabase();
	await logsDatabase.dropDatabase();
	await transactionDatabase.dropDatabase();
	await userDatabase.dropDatabase();
	await auctionDatabase.dropDatabase();

	return res.status(200).json(ReturnResult.successMessage('Database dropped successfully'));
});

router.get('/drop-collection/:collectionName', async (req, res, next) => {
	const { collectionName } = req.params;
	await mongoose.collection(collectionName).drop();
	return res.status(200).json(ReturnResult.successMessage('Collection dropped successfully'));
});

module.exports = router;
