const { TransactionStatus } = require("../../enums/transaction-enum");
const transactionDatabase = require('../../connections/database-connections/transaction-db-connection');
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transId: {
      type: String,
      required: true,
    },
    merchant_trans_id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    create_time: {
      type: Number,
      default: Date.now(),
    },
    perform_time: {
      type: Number,
      default: 0,
    },
    cancel_time: {
      type: Number,
      default: 0,
    },
    prepare_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const transactionModel = transactionDatabase.model("transaction", transactionSchema);
exports.transactionModel = transactionModel;