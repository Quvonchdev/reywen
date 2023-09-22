const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post-controller/post-controller');
const upload = require('../utils/multer');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');
const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddleware = [rateLimit(60, 1)];

router.get('/all', [...commonMiddleware], PostController.getAllPosts);
router.get('/', [...commonMiddleware], PostController.getPostsByPagination);
router.get(
	'/:postId/single',
	[...commonMiddleware, objectIdValidationMiddleware('postId')],
	PostController.getPost
);

router.post(
	'/',
	[...commonMiddleware, authRole, upload.array('files')],
	PostController.createPostByUser
);
router.put(
	'/modify/:postId',
	[
		...commonMiddleware,
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
		objectIdValidationMiddleware('postId'),
	],
	PostController.modifyPostByAdmin
);
router.put(
	'/:userId/:postId',
	[
		...commonMiddleware,
		authRole,
		objectIdValidationMiddleware('postId'),
	],
	PostController.updatePostByUser
);

router.put(
	'/:userId/:postId/cover-image',
	[
		...commonMiddleware,
		authRole,
		objectIdValidationMiddleware('postId'),
		upload.single('file'),
	],
	PostController.updatePostCoverImage
);

router.put(
	'/:userId/:postId/upload-image',
	[
		...commonMiddleware,
		authRole,
		objectIdValidationMiddleware('postId'),
		upload.single('files'),
	],
	PostController.uploadMorePostImages
);

router.delete(
	'/:userId/:postId',
	[
		...commonMiddleware,
		authRole,
		objectIdValidationMiddleware('postId'),
	],
	PostController.deletePostByUser
);
router.delete(
	'/:userId/:postId/private',
	[
		...commonMiddleware,
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
		objectIdValidationMiddleware('postId'),
	],
	PostController.deletePostByAdmin
);

module.exports = router;
