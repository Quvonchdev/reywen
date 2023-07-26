const express = require('express');
const router = express.Router();
const Category = require('../controllers/category-controller');
// for rate limiting requests from a single IP address.
// 20 requests per minute and 1 request per second
const rateLimit = require('../configurations/rate-limiter');
const upload = require('../utils/multer');
const authRole = require('../middlewares/auth-role-middleware');
const isBlockedUser = require('../middlewares/block-user-middleware');
const adminRole = require('../middlewares/admin-role-middleware');

// for UI
router.get('/', rateLimit(30, 2), Category.getCategoriesByPagination);
router.get('/all', rateLimit(30, 2), Category.getCategories);
router.get('/single/:categoryId', rateLimit(30, 2), Category.getCategory);

// for Admin
router.get(
	'/private/',
	[authRole, isBlockedUser, adminRole, rateLimit(25, 5)],
	Category.getCategoriesByPaginationForAdmin
);
router.get(
	'/private/all',
	[authRole, isBlockedUser, adminRole, rateLimit(25, 5)],
	Category.getCategoriesForAdmin
);
router.get(
	'/private/single/:categoryId',
	[authRole, isBlockedUser, adminRole, rateLimit(25, 5)],
	Category.getCategoryForAdmin
);
router.post(
	'/',
	[authRole, isBlockedUser, adminRole, rateLimit(25, 5), upload.single('coverImg')],
	Category.createCategory
);
router.put(
	'/:categoryId',
	[authRole, isBlockedUser, adminRole, rateLimit(25, 5), upload.single('coverImg')],
	Category.updateCategory
);
router.delete(
	'/:categoryId',
	[authRole, isBlockedUser, adminRole, rateLimit(25, 5)],
	Category.deleteCategory
);
router.post(
	'/batch-delete',
	[authRole, isBlockedUser, adminRole, rateLimit(25, 5)],
	Category.batchDeleteCategories
);

// go [src/extensions/routes-extension.js] to see how this works
module.exports = router;
