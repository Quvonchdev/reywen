const router = require('./base-router');
const {
	CurrencyTypes,
	OperationTypes,
	PriceTypes,
	PaymentTypes,
} = require('../controllers/type-controller');
const rateLimit = require('../configurations/rate-limiter');
const authRole = require('../middlewares/auth-role-middleware');
const isBlockedUser = require('../middlewares/block-user-middleware');
const adminRole = require('../middlewares/admin-role-middleware');

const commonMiddleware = [authRole, isBlockedUser, adminRole, rateLimit(25, 1)];

router.get('/currency', commonMiddleware, CurrencyTypes.getCurrencyTypes);
router.get('/operation', commonMiddleware, OperationTypes.getOperationTypes);
router.get('/price', commonMiddleware, PriceTypes.getPriceTypes);
router.get('/payment', commonMiddleware, PaymentTypes.getPaymentTypes);

router.get('/currency/:currencyId', commonMiddleware, CurrencyTypes.getCurrencyType);
router.get('/operation/:operationId', commonMiddleware, OperationTypes.getOperationType);
router.get('/price/:priceId', commonMiddleware, PriceTypes.getPriceType);
router.get('/payment/:paymentId', commonMiddleware, PaymentTypes.getPaymentType);

router.post('/currency', commonMiddleware, CurrencyTypes.createCurrencyType);
router.post('/operation', commonMiddleware, OperationTypes.createOperationType);
router.post('/price', commonMiddleware, PriceTypes.createPriceType);
router.post('/payment', commonMiddleware, PaymentTypes.createPaymentType);

router.put('/currency/:currencyId', commonMiddleware, CurrencyTypes.updateCurrencyType);
router.put('/operation/:operationId', commonMiddleware, OperationTypes.updateOperationType);
router.put('/price/:priceId', commonMiddleware, PriceTypes.updatePriceType);
router.put('/payment/:paymentId', commonMiddleware, PaymentTypes.updatePaymentType);

router.delete('/currency/:currencyId', commonMiddleware, CurrencyTypes.deleteCurrencyType);
router.delete('/operation/:operationId', commonMiddleware, OperationTypes.deleteOperationType);
router.delete('/price/:priceId', commonMiddleware, PriceTypes.deletePriceType);
router.delete('/payment/:paymentId', commonMiddleware, PaymentTypes.deletePaymentType);

router.post('/currency/batch-delete', commonMiddleware, CurrencyTypes.batchDeleteCurrencyTypes);
router.post('/operation/batch-delete', commonMiddleware, OperationTypes.batchDeleteOperationTypes);
router.post('/price/batch-delete', commonMiddleware, PriceTypes.batchDeletePriceTypes);
router.post('/payment/batch-delete', commonMiddleware, PaymentTypes.batchDeletePaymentTypes);

module.exports = router;