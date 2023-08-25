const express = require('express');
const router = express.Router();
const AuctionController = require('../controllers/auction-controller/auction-controller');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');

router.get('/all', [], AuctionController.getAuctions);
router.get('/:auctionId', [], AuctionController.getAuction);
router.get('/', [], AuctionController.getAuctionsByPagination);
router.post('/', [], AuctionController.createAuction);
router.post(
	'/:auctionId/:userId/verify-auction',
	[objectIdValidationMiddleware('auctionId'), objectIdValidationMiddleware('userId')],
	AuctionController.VerifyAuction
);

module.exports = router;
