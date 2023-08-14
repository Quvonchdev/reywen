const express = require('express');
const router = express.Router();
const PricesController = require('../controllers/post-controller/prices-controller');

const commonMiddleware = [];

router.get('/all', commonMiddleware, PricesController.getAllPrices);
router.get('/:priceId', commonMiddleware, PricesController.getPriceById);
router.get('/', commonMiddleware, PricesController.getPricesByPagination);
router.post('/', commonMiddleware, PricesController.createPrice);
router.put('/:priceId', commonMiddleware, PricesController.updatePrice);
router.delete('/:priceId', commonMiddleware, PricesController.deletePrice);
router.post('/batch-delete', commonMiddleware, PricesController.batchDeletePrices);
router.get('/status/:priceId', commonMiddleware, PricesController.updatePriceStatus)

module.exports = router;
