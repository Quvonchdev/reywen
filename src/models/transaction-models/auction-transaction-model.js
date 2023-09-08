const mongoose = require('mongoose');
const User = require('../user-models/user-model').User;
const transactionDatabase = require('../../connections/database-connections/transaction-db-connection');

const transactionPostSchema = new mongoose.Schema(
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
		paymentType: {
			type: mongoose.Schema.Types.Mixed,
			required: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		status: {
			type: Boolean,
			default: false,
		},
	},
	{
		collection: 'transactionAuction',
		timestamps: true,
	}
);

const TransactionPost = transactionDatabase.model('TransactionPost', transactionPostSchema);
exports.TransactionPost = TransactionPost;
