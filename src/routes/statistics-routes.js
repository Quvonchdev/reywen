const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statistics-controller');

router.get('/primary-db', StatisticsController.primary);
router.get('/chats-db', StatisticsController.chat);
router.get('/users-db', StatisticsController.user);
router.get('/logs-db', StatisticsController.logs);
router.get('/auction-db', StatisticsController.auction);
router.get('/all', StatisticsController.all);

module.exports = router;
