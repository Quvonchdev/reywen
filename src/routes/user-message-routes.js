const express = require('express');
const router = express.Router();
const UserMessageController = require('../controllers/user-message-controller');
const AuctionChatController = require('../controllers/auction-controller/auction-chat-controller');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');

const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');

const commonMiddleware = [rateLimit(60, 1), authRole];

router.post('/send', [...commonMiddleware], UserMessageController.sendMessages);
router.get(
	'/:userId',
	[...commonMiddleware, objectIdValidationMiddleware('userId')],
	UserMessageController.getMessages
);
router.patch(
	'/read/:messageId',
	[...commonMiddleware, objectIdValidationMiddleware('messageId')],
	UserMessageController.readMessage
);
router.delete(
	'/:messageId',
	[...commonMiddleware, objectIdValidationMiddleware('messageId')],
	UserMessageController.deleteMessage
);
router.delete(
	'/all/:userId',
	[...commonMiddleware, objectIdValidationMiddleware('userId')],
	UserMessageController.deleteMessages
);
router.put(
	'/:messageId/:userId',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('messageId'),
		objectIdValidationMiddleware('userId'),
	],
	UserMessageController.editMessage
);

// auction-chat
router.get(
	'/auction/all/:auctionId',
	[...commonMiddleware, objectIdValidationMiddleware('auctionId')],
	AuctionChatController.getAll
);

router.get(
	'/auction/:userId',
	[...commonMiddleware, objectIdValidationMiddleware('userId')],
	AuctionChatController.getMessagesByUser
);

router.get(
	'/auction/:auctionId/:userId',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('auctionId'),
		objectIdValidationMiddleware('userId'),
	],
	AuctionChatController.getMessagesByAuctionAndUser
);

router.delete(
	'/auction/:messageId/:userId',
	[...commonMiddleware, objectIdValidationMiddleware('messageId')],
	AuctionChatController.deleteMessageByUser
)

module.exports = router;
