const express = require('express');
const router = express.Router();
const PricesController = require('../controllers/post-controller/prices-controller');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');

const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddleware = [rateLimit(60, 1)];

router.get('/all', [...commonMiddleware], PricesController.getAllPrices);
router.get(
	'/:priceId',
	[...commonMiddleware, objectIdValidationMiddleware('priceId')],
	PricesController.getPriceById
);
router.get('/', [...commonMiddleware], PricesController.getPricesByPagination);
router.post(
	'/',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	PricesController.createPrice
);
router.put(
	'/:priceId',
	[
		...commonMiddleware,
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
		objectIdValidationMiddleware('priceId'),
	],
	PricesController.updatePrice
);
router.delete(
	'/:priceId',
	[
		...commonMiddleware,
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
		objectIdValidationMiddleware('priceId'),
	],
	PricesController.deletePrice
);
router.post(
	'/batch-delete',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	PricesController.batchDeletePrices
);
router.patch(
	'/status/:priceId',
	[
		...commonMiddleware,
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
		objectIdValidationMiddleware('priceId'),
	],
	PricesController.updatePriceStatus
);

module.exports = router;
