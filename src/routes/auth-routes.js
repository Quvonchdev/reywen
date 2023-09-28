const express = require('express');
const router = express.Router();
const User = require('../controllers/auth-controller');
const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const objIdValidate = require('../middlewares/objectId-validation-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddlewares = [rateLimit(10, 1)];
const authMiddleware = [authRole, rateLimit(50, 2)];

router.post('/register', [...commonMiddlewares], User.register);
router.post(
	'/:userId/verify-account',
	[...commonMiddlewares, objIdValidate('userId')],
	User.verifyAccount
);
router.post('/resend-verify-code', [...commonMiddlewares], User.resendVerifyCode);
router.post('/reset-password', [...commonMiddlewares], User.resetPassword);
router.post('/forgot-password', [...commonMiddlewares], User.forgotPassword);
router.post('/change-password', [...commonMiddlewares], User.changePassword);
router.post('/login', [...commonMiddlewares], User.login);

router.get(
	'/:userId/profile',
	[...authMiddleware, objIdValidate('userId')],
	User.getUserProfile
);
router.put(
	'/:userId',
	[...commonMiddlewares, objIdValidate('userId')],
	User.updateUser
);
router.get('/all', 
	[...commonMiddlewares, 
	authRole, 
	checkRoles(['SuperAdmin'])], 
	User.getAllUsers
);
router.get(
	'/:userId/favorites',
	[...commonMiddlewares, authRole, objIdValidate('userId')],
	User.getUserFavorites
);

router.patch(
	'/:userId/favorite-category',
	[...authMiddleware, objIdValidate('userId')],
	User.updateUserFavoritesCategory
);
router.patch(
	'/:userId/favorite-post',
	[...authMiddleware, objIdValidate('userId')],
	User.updateUserFavoritesPost
);
router.patch(
	'/:userId/remove-favorite-category',
	[...authMiddleware, objIdValidate('userId')],
	User.removeUserFavoritesCategory
);
router.patch(
	'/:userId/remove-favorite-post',
	[...authMiddleware, objIdValidate('userId')],
	User.removeUserFavoritesPost
);

router.patch(
	'/:userId/update-permission',
	[...authMiddleware, checkRoles(['SuperAdmin']), 
	objIdValidate('userId')],
	User.givePermissionForUser
);

router.put(
	'/:userId/block-user',
	[...authMiddleware, checkRoles(['SuperAdmin']), 
	objIdValidate('userId')],
	User.blockUserBySuperAdmin
)

module.exports = router;
