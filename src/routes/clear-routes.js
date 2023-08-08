const express = require('express');
const RedisCache = require('../utils/redis');
const ReturnResult = require('../helpers/return-result');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/clear-cache', async (req, res, next) => {
	await RedisCache.flush();
	return res.status(200).json(ReturnResult.successMessage('Cache cleared successfully'));
});

router.get('/drop-db', async (req, res, next) => {
	await mongoose.connection.db.dropDatabase();
	return res.status(200).json(ReturnResult.successMessage('Database dropped successfully'));
});

router.get('/drop-collection/:collectionName', async (req, res, next) => {
	const { collectionName } = req.params;
	await mongoose.connection.db.collection(collectionName).drop();
	return res.status(200).json(ReturnResult.successMessage('Collection dropped successfully'));
});

module.exports = router;
