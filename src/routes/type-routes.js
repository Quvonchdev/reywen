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

const commonMiddleware = [];

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

router.post('/currency', commonMiddleware, CurrencyTypes.createCurrencyType);
router.post('/operation', commonMiddleware, OperationTypes.createOperationType);
router.post('/price', commonMiddleware, PriceTypes.createPriceType);
router.post('/payment', commonMiddleware, PaymentTypes.createPaymentType);

router.put(
	'/currency/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	CurrencyTypes.updateCurrencyType
);
router.put(
	'/operation/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	OperationTypes.updateOperationType
);
router.put(
	'/price/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	PriceTypes.updatePriceType
);
router.put(
	'/payment/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	PaymentTypes.updatePaymentType
);

router.delete(
	'/currency/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	CurrencyTypes.deleteCurrencyType
);
router.delete(
	'/operation/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	OperationTypes.deleteOperationType
);
router.delete(
	'/price/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	PriceTypes.deletePriceType
);
router.delete(
	'/payment/:id',
	[...commonMiddleware, objectIdValidationMiddleware('id')],
	PaymentTypes.deletePaymentType
);

router.post('/currency/batch-delete', commonMiddleware, CurrencyTypes.batchDeleteCurrencyType);
router.post('/operation/batch-delete', commonMiddleware, OperationTypes.batchDeleteOperationType);
router.post('/price/batch-delete', commonMiddleware, PriceTypes.batchDeletePriceType);
router.post('/payment/batch-delete', commonMiddleware, PaymentTypes.batchDeletePaymentType);

module.exports = router;
