const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transaction-controller');

router.post("/click/prepare", TransactionController.prepareTransaction);

router.post("/click/complete", TransactionController.completeTransaction);

module.exports = router;