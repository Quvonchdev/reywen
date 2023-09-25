const mongoose = require('mongoose');
const User = require('../user-models/user-model').User;
const transactionDatabase = require('../../connections/database-connections/transaction-db-connection');

const transactionAuctionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: User,
			required: true,
			index: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		auctionId: {
			type: String,
			required: true,
		},
	},
	{
		collection: 'transactionAuction',
		timestamps: true,
	}
);

const TransactionPost = transactionDatabase.model('TransactionAuction', transactionAuctionSchema);
exports.TransactionPost = TransactionPost;
