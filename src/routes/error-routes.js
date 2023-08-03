const router = require('./base-router');
const error = require('../controllers/error-controller');
const upload = require('../utils/multer');
const authRole = require('../middlewares/auth-role-middleware');
const rateLimit = require('../configurations/rate-limiter');

router.get('/404', error.notFoundRoute);
router.post('/multer', upload.single('file'), error.multerError);
router.get('/timeout', error.timeoutError);
router.get('/error', [authRole], error.error);
router.get('/rate-limiter', rateLimit(5, 1), error.rateLimiterError);
router.get('/test-error', (req, res, next) => {
	if (req.query.triggerError) {
		const customError = new Error('This is a custom error');
		return next(customError);
	}

	res.status(200).json({ message: 'No error occurred' });
});

module.exports = router;
