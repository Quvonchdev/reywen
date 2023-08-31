const express = require('express');
const router = express.Router();
const AuctionController = require('../controllers/auction-controller/auction-controller');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');

const authRole = require('../middlewares/auth-role-middleware');
const rateLimit = require('../configurations/rate-limiter');
const checkRoles = require('../middlewares/roles-middleware');

router.get('/all', [rateLimit(50, 1)], AuctionController.getAuctions);
router.get('/:auctionId/single', [rateLimit(50, 1)], AuctionController.getAuction);
router.get('/', [rateLimit(50, 1)], AuctionController.getAuctionsByPagination);
router.get('/:auctionId/user/:userId', [rateLimit(50, 1)], AuctionController.getAuctionsByUserId);

router.post('/', [rateLimit(10, 1), authRole], AuctionController.createAuction);

router.post(
	'/:auctionId/:userId/verify-auction',
	[
		rateLimit(10, 1),
		objectIdValidationMiddleware('auctionId'),
		objectIdValidationMiddleware('userId'),
		authRole,
	],
	AuctionController.VerifyAuction
);

router.get(
	'/:auctionId/:userId/resend-verify-code',
	[rateLimit(10, 1), authRole],
	AuctionController.resendVerifyCode
);

router.put(
	'/:auctionId/:userId',
	[
		rateLimit(10, 1),
		objectIdValidationMiddleware('auctionId'),
		objectIdValidationMiddleware('userId'),
		authRole,
	],
	AuctionController.updateAuction
);
router.put(
	'/:auctionId/:userId/update-date',
	[
		rateLimit(10, 1),
		objectIdValidationMiddleware('auctionId'),
		objectIdValidationMiddleware('userId'),
		authRole,
	],
	AuctionController.updateStartingDateAndEndDate
);
router.put(
	'/:auctionId/:userId/update-start',
	[
		rateLimit(10, 1),
		objectIdValidationMiddleware('auctionId'),
		objectIdValidationMiddleware('userId'),
		authRole,
	],
	AuctionController.updateStartingDateAndEndDateNoParticipation
);
router.put(
	'/:auctionId/:userId/update-bid',
	[
		rateLimit(10, 1),
		objectIdValidationMiddleware('auctionId'),
		objectIdValidationMiddleware('userId'),
		authRole,
	],
	AuctionController.updateBidIncrement
);

router.put(
	'/:auctionId/:userId/bid',
	[
		rateLimit(30, 1),
		objectIdValidationMiddleware('auctionId'),
		objectIdValidationMiddleware('userId'),
		authRole,
	],
	AuctionController.playAuction
);

router.post(
	'/:auctionId/:userId/participate',
	[rateLimit(10, 1), authRole],
	AuctionController.participateInAuction
);
router.put(
	'/:auctionId/:userId/verify-participation',
	[rateLimit(10, 1), authRole],
	AuctionController.verifyParticipation
);
router.put(
	'/:auctionId/:userId/leave',
	[rateLimit(10, 1), authRole],
	AuctionController.leaveAuction
);
router.put(
	'/:auctionId/:userId/leave-private',
	[rateLimit(10, 1), authRole, checkRoles(['Admin', 'SuperAdmin'])],
	AuctionController.removeParticipantByAdmin
);
router.put(
	'/:auctionId/:userId/re-participate',
	[rateLimit(10, 1), authRole],
	AuctionController.participateInAuctionAgain
);
router.get(
	'/:auctionId/count-participate',
	[rateLimit(10, 1), authRole],
	AuctionController.participantsCount
);

router.delete('/:auctionId/:userId', [rateLimit(10, 1), authRole], AuctionController.deleteAuction);
router.delete(
	'/:auctionId/:userId/private',
	[rateLimit(10, 1), authRole, checkRoles(['Admin', 'SuperAdmin'])],
	AuctionController.deleteAuctionByAdmin
);

module.exports = router;
