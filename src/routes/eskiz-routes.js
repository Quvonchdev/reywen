const express = require('express');
const router = express.Router();
const EskizController = require('../controllers/eskiz-controller');

const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddleware = [
	rateLimit(60, 1),
	rateLimit,
	authRole,
	checkRoles(['Admin', 'SuperAdmin']),
];

router.get('/nickname', commonMiddleware, EskizController.getNickname);
router.get('/user-info', commonMiddleware, EskizController.getUserInfo);
router.get('/balance', commonMiddleware, EskizController.getBalance);

module.exports = router;
