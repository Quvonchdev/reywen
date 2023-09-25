const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statistics-controller');

const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddleware = [rateLimit(60, 1), authRole, checkRoles(['Admin', 'SuperAdmin'])];

router.get('/all', commonMiddleware, StatisticsController.all);

module.exports = router;
