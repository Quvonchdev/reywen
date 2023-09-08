const transactionDatabase = require('../../connections/database-connections/transaction-db-connection');
const { User } = require('../user-models/user-model').User;
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
	{
		click_trans_id: {
			type: String,
		},
		merchant_trans_id: {
			type: String,
		},
		amount: {
			type: String,
			required: true,
		},
		action: {
			type: String,
		},
		sign_string: {
			type: String,
		},
		sign_datetime: {
			type: Date,
		},
		status: {
			type: String,
			enum: ['processing', 'finished', 'canceled'],
			default: 'processing',
		},
	},
	{
		timestamps: true,
	}
);

const transactionModel = transactionDatabase.model('transaction', transactionSchema);
exports.transactionModel = transactionModel;
