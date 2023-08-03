const router = require('./base-router');
const auth = require('../controllers/auth-controller');
const rateLimit = require('../configurations/rate-limiter');

const middleware = [rateLimit(10,1)]

router.post('/register', middleware, auth.register);
router.post('/verify-account', middleware, auth.verifyAccount);
router.post('/resend-verify-code', middleware, auth.resendVerifyCode);
router.post('/reset-password', middleware, auth.resetPassword);
router.post('/forgot-password', middleware, auth.resendVerifyCode);
router.post('/change-password', middleware, auth.changePassword);
router.post('/login', middleware, auth.login);

module.exports = router;
