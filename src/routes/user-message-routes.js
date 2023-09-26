const express = require('express');
const router = express.Router();
const UserMessageController = require('../controllers/user-message-controller');
const AuctionChatController = require('../controllers/auction-controller/auction-chat-controller');
const objIdValidate = require('../middlewares/objectId-validation-middleware');

const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');

const commonMiddleware = [rateLimit(60, 1), authRole];

router.post('/send', [...commonMiddleware], UserMessageController.sendMessages);
router.get(
	'/:userId',
	[...commonMiddleware, objIdValidate('userId')],
	UserMessageController.getMessages
);
router.patch(
	'/read/:messageId',
	[...commonMiddleware, objIdValidate('messageId')],
	UserMessageController.readMessage
);
router.delete(
	'/:messageId',
	[...commonMiddleware, objIdValidate('messageId')],
	UserMessageController.deleteMessage
);
router.delete(
	'/all/:userId',
	[...commonMiddleware, objIdValidate('userId')],
	UserMessageController.deleteMessages
);
router.put(
	'/:messageId/:userId',
	[
		...commonMiddleware,
		objIdValidate('messageId'),
		objIdValidate('userId'),
	],
	UserMessageController.editMessage
);

// auction-chat
router.get(
	'/auction/all/:auctionId',
	[...commonMiddleware, objIdValidate('auctionId')],
	AuctionChatController.getAll
);

router.get(
	'/auction/:userId',
	[...commonMiddleware, objIdValidate('userId')],
	AuctionChatController.getMessagesByUser
);

router.get(
	'/auction/:auctionId/:userId',
	[
		...commonMiddleware,
		objIdValidate('auctionId'),
		objIdValidate('userId'),
	],
	AuctionChatController.getMessagesByAuctionAndUser
);

router.delete(
	'/auction/:messageId/:userId',
	[...commonMiddleware, objIdValidate('messageId')],
	AuctionChatController.deleteMessageByUser
);

module.exports = router;
