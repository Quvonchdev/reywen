const mongoose = require('mongoose');
const User = require('../user-models/user-model').User;
const transactionDatabase = require('../../connections/database-connections/transaction-db-connection');

const transactionSchema = new mongoose.Schema(
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
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
        participantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        }
	},
	{
		collection: 'transactionAuction',
		timestamps: true,
	}
);

const TransactionAuctionParticipant = transactionDatabase.model('TransactionAuctionParticipant', transactionSchema);
exports.TransactionAuctionParticipant = TransactionAuctionParticipant;
