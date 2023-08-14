const express = require('express');
const router = express.Router();
const User = require('../controllers/auth-controller');
const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');

const commonMiddlewares = [rateLimit(10, 1)];
const authMiddleware = [authRole, rateLimit(50, 2)];

router.post('/register', [...commonMiddlewares], User.register);
router.post('/:userId/verify-account', [...commonMiddlewares], User.verifyAccount);
router.post('/resend-verify-code', [...commonMiddlewares], User.resendVerifyCode);
router.post('/reset-password', [...commonMiddlewares], User.resetPassword);
router.post('/forgot-password', [...commonMiddlewares], User.resendVerifyCode);
router.post('/change-password', [...commonMiddlewares], User.changePassword);
router.post('/login', [...commonMiddlewares], User.login);

router.get('/:userId/logs', [...commonMiddlewares], User.getUserLogs);
router.get('/:userId/profile', [...commonMiddlewares], User.getUserProfile);
router.put('/:userId', [...commonMiddlewares], User.updateUser);
router.get('/all', [...commonMiddlewares], User.getAllUsers);
router.get('/roles', [...commonMiddlewares], User.getUserRoles);
router.get('/:userId/favorites', [...commonMiddlewares], User.getUserFavorites);

router.patch('/:userId/favorite-category', [...authMiddleware], User.updateUserFavoritesCategory);
router.patch('/:userId/favorite-post', [...authMiddleware], User.updateUserFavoritesPost);
router.patch(
	'/:userId/remove-favorite-category',
	[...authMiddleware],
	User.removeUserFavoritesCategory
);
router.patch('/:userId/remove-favorite-post', [...authMiddleware], User.removeUserFavoritesPost);

module.exports = router;
