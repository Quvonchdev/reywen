const router = require('./base-router');
const Category = require('../controllers/category-controller');
const rateLimit = require('../configurations/rate-limiter');
const upload = require('../utils/multer');
const authRole = require('../middlewares/auth-role-middleware');
const isBlockedUser = require('../middlewares/block-user-middleware');
const adminRole = require('../middlewares/admin-role-middleware');
const commonMiddleware = [authRole, isBlockedUser, adminRole, rateLimit(25, 1)];

// for UI
router.get('/', rateLimit(30, 2), Category.getCategoriesByPagination);
router.get('/all', rateLimit(30, 2), Category.getCategories);
router.get('/single/:categoryId', rateLimit(30, 2), Category.getCategory);

// for Admin
router.get('/private/', commonMiddleware, Category.getCategoriesByPaginationForAdmin);
router.get('/private/all', commonMiddleware, Category.getCategoriesForAdmin);
router.get('/private/single/:categoryId', commonMiddleware, Category.getCategoryForAdmin);
router.post('/', [...commonMiddleware, upload.single('coverImg')], Category.createCategory);
router.delete('/:categoryId', commonMiddleware, Category.deleteCategory);
router.post('/batch-delete', commonMiddleware, Category.batchDeleteCategories);
router.delete('/cover-img/:categoryId', commonMiddleware, Category.deleteCategoryCoverImage);
router.put(
	'/:categoryId',
	[...commonMiddleware, upload.single('coverImg')],
	Category.updateCategory
);

module.exports = router;