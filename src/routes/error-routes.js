const express = require('express');
const router = express.Router();
const error = require('../controllers/error-controller');
const upload = require('../utils/multer');
const authRole = require('../middlewares/auth-role-middleware');
const tokenExpired = require('../middlewares/token-expired-middleware');

router.get('/404', error.notFoundRoute);
router.post('/multer', upload.single('file'), error.multerError);
router.get('/timeout', error.timeoutError);
router.get('/error', [authRole, tokenExpired], error.error);
router.get('/test-error', (req, res, next) => {
	if (req.query.triggerError) {
		const customError = new Error('This is a custom error');
		return next(customError);
	}

	res.status(200).json({ message: 'No error occurred' });
});

module.exports = router;
