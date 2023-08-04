const express = require('express');
const router = express.Router();
const User = require('../controllers/auth-controller');
const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');

const middleware = [rateLimit(10, 1)];
const authMiddleware = [rateLimit(10, 1), authRole];

router.post('/register', middleware, User.register);
router.post('/verify-account', middleware, User.verifyAccount);
router.post('/resend-verify-code', middleware, User.resendVerifyCode);
router.post('/reset-password', middleware, User.resetPassword);
router.post('/forgot-password', middleware, User.resendVerifyCode);
router.post('/change-password', middleware, User.changePassword);
router.post('/login', middleware, User.login);
router.get('/:userId/logs', middleware, User.getUserLogs);
router.get('/:userId/profile', middleware, User.getUser);
router.put('/:userId', middleware, User.updateUser);
router.get('/all', middleware, User.getAllUsers);

module.exports = router;
