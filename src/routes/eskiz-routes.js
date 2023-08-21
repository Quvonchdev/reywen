const express = require('express');
const router = express.Router();
const EskizController = require('../controllers/eskiz-controller');

const commonMiddleware = [];

router.get('/nickname', commonMiddleware, EskizController.getNickname);
router.get('/user-info', commonMiddleware, EskizController.getUserInfo);
router.get('/balance', commonMiddleware, EskizController.getBalance);

module.exports = router;
