const express = require('express');
const router = express.Router();
const {
	CurrencyTypes,
	OperationTypes,
	PriceTypes,
	PaymentTypes,
} = require('../controllers/post-controller/type-controller');
const objectIdValidationMiddleware = require('../middlewares/objectId-validation-middleware');

const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const checkRoles = require('../middlewares/roles-middleware');

const commonMiddleware = [rateLimit(60, 1)];

router.get('/currency', commonMiddleware, CurrencyTypes.getAllCurrencyType);
router.get('/operation', commonMiddleware, OperationTypes.getAllOperationType);
router.get('/price', commonMiddleware, PriceTypes.getAllPriceType);
router.get('/payment', commonMiddleware, PaymentTypes.getAllPaymentType);

router.get(
	'/currency/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	CurrencyTypes.getCurrencyType
);
router.get(
	'/operation/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	OperationTypes.getOperationType
);
router.get(
	'/price/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	PriceTypes.getPriceType
);
router.get(
	'/payment/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	PaymentTypes.getPaymentType
);

router.post(
	'/currency',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	CurrencyTypes.createCurrencyType
);
router.post(
	'/operation',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	OperationTypes.createOperationType
);
router.post(
	'/price',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	PriceTypes.createPriceType
);
router.post(
	'/payment',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	PaymentTypes.createPaymentType
);

router.put(
	'/currency/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	CurrencyTypes.updateCurrencyType
);
router.put(
	'/operation/:id',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('id'),
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
	],
	OperationTypes.updateOperationType
);
router.put(
	'/price/:id',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('id'),
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
	],
	PriceTypes.updatePriceType
);
router.put(
	'/payment/:id',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('id'),
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
	],
	PaymentTypes.updatePaymentType
);

router.delete(
	'/currency/:id',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('id'),
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
	],
	CurrencyTypes.deleteCurrencyType
);
router.delete(
	'/operation/:id',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('id'),
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
	],
	OperationTypes.deleteOperationType
);
router.delete(
	'/price/:id',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('id'),
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
	],
	PriceTypes.deletePriceType
);
router.delete(
	'/payment/:id',
	[
		...commonMiddleware,
		objectIdValidationMiddleware('id'),
		authRole,
		checkRoles(['Admin', 'SuperAdmin']),
	],
	PaymentTypes.deletePaymentType
);

router.post(
	'/currency/batch-delete',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	CurrencyTypes.batchDeleteCurrencyType
);
router.post(
	'/operation/batch-delete',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	OperationTypes.batchDeleteOperationType
);
router.post(
	'/price/batch-delete',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	PriceTypes.batchDeletePriceType
);
router.post(
	'/payment/batch-delete',
	[...commonMiddleware, authRole, checkRoles(['Admin', 'SuperAdmin'])],
	PaymentTypes.batchDeletePaymentType
);

module.exports = router;
