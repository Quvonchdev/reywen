const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post-controller/post-controller');
const upload = require('../utils/multer');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');

const commonMiddleware = [];

router.get('/all', commonMiddleware, PostController.getAllPosts);
router.get('/:postId/single', commonMiddleware, PostController.getPost);
router.get('/:userId', commonMiddleware, PostController.getPostByUser);
router.get('/:slug', commonMiddleware, PostController.getPostBySlug);
router.get('/:userId/posts', commonMiddleware, PostController.getPostByUserPagination);
router.get('/category/:categoryId', commonMiddleware, PostController.getPostByCategory);

router.post('/', commonMiddleware, upload.array('files'), PostController.createPostByUser);
router.put('/modify/:postId', commonMiddleware, PostController.modifyPostByAdmin);
router.put('/:userId/:postId', commonMiddleware, PostController.updatePostByUser);

module.exports = router;
