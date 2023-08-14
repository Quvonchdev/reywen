const express = require('express');
const router = express.Router();
const Category = require('../controllers/post-controller/category-controller');
const rateLimit = require('../configurations/rate-limiter');
const upload = require('../utils/multer');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddleware = [authRole, checkRoles(['Admin', 'SuperAdmin']), rateLimit(30, 2)];

// for UI
router.get('/', rateLimit(30, 2), Category.getCategoriesByPagination);
router.get('/all', rateLimit(30, 2), Category.getCategories);
router.get('/single/:categoryId', rateLimit(30, 2), Category.getCategory);

// for Admin
router.get('/private/', [...commonMiddleware], Category.getCategoriesByPaginationForAdmin);
router.get('/private/all', [...commonMiddleware], Category.getCategoriesForAdmin);
router.get('/private/single/:categoryId', [...commonMiddleware], Category.getCategoryForAdmin);
router.post('/', [...commonMiddleware, upload.single('file')], Category.createCategory);
router.delete('/:categoryId', [...commonMiddleware], Category.deleteCategory);
router.post('/batch-delete', [...commonMiddleware], Category.batchDeleteCategories);
router.delete('/cover-img/:categoryId', [...commonMiddleware], Category.deleteCategoryCoverImage);
router.put('/:categoryId', [...commonMiddleware, upload.single('file')], Category.updateCategory);

module.exports = router;
