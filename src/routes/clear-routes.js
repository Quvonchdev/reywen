const express = require('express');
const RedisCache = require('../utils/redis');
const ReturnResult = require('../helpers/return-result');
const router = express.Router();

router.get('/clear-cache', async (req, res, next) => {
    await RedisCache.flush();
    return res.status(200).json(ReturnResult.successMessage('Cache cleared successfully'));
});

module.exports = router;