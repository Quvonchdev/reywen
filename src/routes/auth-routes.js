const express = require('express');
const router = express.Router();
const User = require('../controllers/auth-controller');
const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddlewares = [rateLimit(10, 1)];
const authMiddleware = [authRole, rateLimit(50, 2)];

router.post('/register', [...commonMiddlewares], User.register);
router.post(
	'/:userId/verify-account',
	[...commonMiddlewares, objectIdValidationMiddleware('userId')],
	User.verifyAccount
);
router.post('/resend-verify-code', [...commonMiddlewares], User.resendVerifyCode);
router.post('/reset-password', [...commonMiddlewares], User.resetPassword);
router.post('/forgot-password', [...commonMiddlewares], User.forgotPassword);
router.post('/change-password', [...commonMiddlewares], User.changePassword);
router.post('/login', [...commonMiddlewares], User.login);

router.get(
	'/:userId/logs',
	[...commonMiddlewares, objectIdValidationMiddleware('userId')],
	User.getUserLogs
);
router.get(
	'/:userId/profile',
	[...authMiddleware, objectIdValidationMiddleware('userId')],
	User.getUserProfile
);
router.put(
	'/:userId',
	[...commonMiddlewares, objectIdValidationMiddleware('userId')],
	User.updateUser
);
router.get('/all', [...commonMiddlewares, authRole, checkRoles(['SuperAdmin'])], User.getAllUsers);
router.get('/roles', [...commonMiddlewares, checkRoles(['Admin'])], User.getUserRoles);
router.get(
	'/:userId/favorites',
	[...commonMiddlewares, authRole, objectIdValidationMiddleware('userId')],
	User.getUserFavorites
);

router.patch(
	'/:userId/favorite-category',
	[...authMiddleware, objectIdValidationMiddleware('userId')],
	User.updateUserFavoritesCategory
);
router.patch(
	'/:userId/favorite-post',
	[...authMiddleware, objectIdValidationMiddleware('userId')],
	User.updateUserFavoritesPost
);
router.patch(
	'/:userId/remove-favorite-category',
	[...authMiddleware, objectIdValidationMiddleware('userId')],
	User.removeUserFavoritesCategory
);
router.patch(
	'/:userId/remove-favorite-post',
	[...authMiddleware, objectIdValidationMiddleware('userId')],
	User.removeUserFavoritesPost
);

module.exports = router;
