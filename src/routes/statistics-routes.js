const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statistics-controller');

const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddleware = [rateLimit(60, 1), authRole, checkRoles(['Admin', 'SuperAdmin'])];

router.get('/primary-db', commonMiddleware, StatisticsController.primary);
router.get('/chats-db', commonMiddleware, StatisticsController.chat);
router.get('/users-db', commonMiddleware, StatisticsController.user);
router.get('/logs-db', commonMiddleware, StatisticsController.logs);
router.get('/auction-db', commonMiddleware, StatisticsController.auction);
router.get('/all', commonMiddleware, StatisticsController.all);

module.exports = router;
