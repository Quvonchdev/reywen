const express = require('express');
const router = express.Router();
const Category = require('../controllers/post-controller/category-controller');
const rateLimit = require('../configurations/rate-limiter');
const upload = require('../utils/multer');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');
const objIdValidate = require('../middlewares/objectId-validation-middleware');

// authRole, checkRoles(['Admin', 'SuperAdmin']),
const commonMiddleware = [rateLimit(30, 2)];

// for UI
router.get('/', rateLimit(30, 2), Category.getCategoriesByPagination);
router.get('/all', rateLimit(30, 2), Category.getCategories);
router.get(
	'/single/:categoryId',
	[rateLimit(30, 2), objIdValidate('categoryId')],
	Category.getCategory
);

router.post(
	'/',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin']), upload.single('file')],
	Category.createCategory
);
router.delete(
	'/:categoryId',
	[
		...commonMiddleware,
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
		objIdValidate('categoryId'),
	],
	Category.deleteCategory
);
router.post(
	'/batch-delete',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	Category.batchDeleteCategories
);
router.put(
	'/:categoryId',
	[
		...commonMiddleware,
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
		objIdValidate('categoryId'),
		upload.single('file'),
	],
	Category.updateCategory
);

module.exports = router;
