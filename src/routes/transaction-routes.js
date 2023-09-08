const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction-controller');

router.post('/click/create', TransactionController.generateUrl);
router.post('/click/prepare', TransactionController.prepare);
router.post('/click/complete', TransactionController.complete);

module.exports = router;
