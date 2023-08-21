const express = require('express');
const router = express.Router();
const UserMessageController = require('../controllers/user-message-controller');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');

const commonMiddleware = [];

router.post('/send', [...commonMiddleware], UserMessageController.sendMessages);
router.get(
	'/get/:userId',
	[...commonMiddleware, objectIdValidationMiddleware('userId')],
	UserMessageController.getMessages
);
router.put(
	'/read/:messageId',
	[...commonMiddleware, objectIdValidationMiddleware('messageId')],
	UserMessageController.readMessage
);
router.delete(
	'/delete/:messageId',
	[...commonMiddleware, objectIdValidationMiddleware('messageId')],
	UserMessageController.deleteMessage
);
router.delete(
	'/delete/all/:userId',
	[...commonMiddleware, objectIdValidationMiddleware('userId')],
	UserMessageController.deleteMessages
);
router.put(
	'/edit/:messageId/:userId',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('messageId'),
		objectIdValidationMiddleware('userId'),
	],
	UserMessageController.editMessage
);

module.exports = router;
