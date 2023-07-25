const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth-controller');
// for rate limiting requests from a single IP address.
// 20 requests per minute and 1 request per second
const rateLimit = require('../configurations/rate-limiter');

router.post('/register', rateLimit(10, 10), auth.register);
router.post('/verify-account', rateLimit(10, 2), auth.verifyAccount);
router.post('/resend-verify-code', rateLimit(10, 2), auth.resendVerifyCode);
router.post('/reset-password', rateLimit(10, 5), auth.resetPassword);
router.post('/forgot-password', rateLimit(10, 5), auth.resendVerifyCode);
router.post('/change-password', rateLimit(10, 5), auth.changePassword);
router.post('/login', rateLimit(10, 2), auth.login);

// go [src/extensions/routes-extension.js] to see how this works
module.exports = router;
