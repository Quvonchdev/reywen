const express = require('express');
const router = express.Router();
const Category = require('../controllers/category-controller');
// for rate limiting requests from a single IP address.
// 20 requests per minute and 1 request per second
const rateLimit = require('../configurations/rate-limiter');
const upload = require('../utils/multer');

router.get('/', rateLimit(30, 2), Category.getCategoriesByPagination);
router.get('/all', rateLimit(30, 2), Category.getCategories);
router.get('/:categoryId', rateLimit(30, 2), Category.getCategory);
router.post('/', rateLimit(30, 2), upload.single('coverImg'), Category.createCategory);
router.put('/:categoryId', rateLimit(30, 2), upload.single('coverImg'), Category.updateCategory);
router.delete('/:categoryId', rateLimit(30, 2), Category.deleteCategory);
router.post('/batch-delete', rateLimit(30, 2), Category.batchDeleteCategories);

// go [src/extensions/routes-extension.js] to see how this works
module.exports = router;
