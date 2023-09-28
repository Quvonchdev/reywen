const express = require('express');
const router = express.Router();
const AuctionController = require('../controllers/auction-controller/auction-controller');
const objIdValidate = require('../middlewares/objectId-validation-middleware');

const authRole = require('../middlewares/auth-role-middleware');
const rateLimit = require('../configurations/rate-limiter');
const checkRoles = require('../middlewares/roles-middleware');

router.get('/all', [rateLimit(50, 1)], AuctionController.getAuctions);
router.get('/:auctionId/single', [rateLimit(50, 1)], AuctionController.getAuction);
router.get('/', [rateLimit(50, 1)], AuctionController.getAuctionsByPagination);

router.post('/', [rateLimit(10, 1), authRole], AuctionController.createAuction);
router.put('/:auctionId/:userId/payment', [rateLimit(10, 1), authRole], AuctionController.paymentAuction);

router.put(
	'/:auctionId/:userId',
	[
		rateLimit(20, 1),
		objIdValidate('auctionId'),
		objIdValidate('userId'),
		authRole,
	],
	AuctionController.updateAuction
);
router.put(
	'/:auctionId/:userId/update-date',
	[
		rateLimit(20, 1),
		objIdValidate('auctionId'),
		objIdValidate('userId'),
		authRole,
	],
	AuctionController.updateStartingDateAndEndDate
);
router.put(
	'/:auctionId/:userId/update-start',
	[
		rateLimit(20, 1),
		objIdValidate('auctionId'),
		objIdValidate('userId'),
		authRole,
	],
	AuctionController.updateStartingDateAndEndDateNoParticipation
);
router.put(
	'/:auctionId/:userId/update-bid',
	[
		rateLimit(20, 1),
		objIdValidate('auctionId'),
		objIdValidate('userId'),
		authRole,
	],
	AuctionController.updateBidIncrement
);

router.put(
	'/:auctionId/:userId/bid',
	[
		rateLimit(30, 1),
		objIdValidate('auctionId'),
		objIdValidate('userId'),
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
	'/:auctionId/:userId/payment-confirmation',
	[rateLimit(10, 1), authRole],
	AuctionController.paymentForParticipating
);
router.delete('/:auctionId/:userId', [rateLimit(10, 1), authRole], AuctionController.deleteAuction);


module.exports = router;
