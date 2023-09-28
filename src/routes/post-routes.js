const express = require('express');
const router = express.Router();
const PostController = require('../controllers/post-controller/post-controller');
const upload = require('../utils/multer');
const objIdValidate = require('../middlewares/objectId-validation-middleware');
const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddleware = [rateLimit(60, 1)];

router.get('/all', [...commonMiddleware], PostController.getAllPosts);
router.get('/', [...commonMiddleware], PostController.getPostsByPagination);
router.get(
	'/:postId/single',
	[...commonMiddleware, objIdValidate('postId')],
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
		objIdValidate('postId'),
	],
	PostController.modifyPostByAdmin
);
router.put(
	'/:userId/:postId',
	[
		...commonMiddleware,
		authRole,
		objIdValidate('postId'),
		objIdValidate('userId'),

	],
	PostController.updatePostByUser
);

router.put(
	'/:userId/:postId/upload-image',
	[
		...commonMiddleware,
		authRole,
		objIdValidate('postId'),
		upload.array('files'),
	],
	PostController.uploadMorePostImages
);

router.put(
	'/:userId/:postId/remove-images',
	[
		...commonMiddleware,
		authRole,
		objIdValidate('postId'),
		objIdValidate('userId')
	],
	PostController.deletePostImage
);

router.put(
	'/:userId/:postId/premium',
	[
		...commonMiddleware,
		authRole,
		objIdValidate('postId'),
		objIdValidate('userId'),
	],
	PostController.premiumPost
);

router.delete(
	'/:userId/:postId',
	[
		...commonMiddleware,
		authRole,
		objIdValidate('postId'),
	],
	PostController.deletePostByUser
);

// body add message
router.post(
	'/:userId/:postId/private',
	[
		...commonMiddleware,
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
		objIdValidate('postId'),
	],
	PostController.deletePostByAdmin
);

module.exports = router;
