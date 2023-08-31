const mongoose = require('mongoose');
const chatDatabase = require('../../connections/database-connections/chat-db-connection');
const User = require('../user-models/user-model').User;
const Auction = require('../auction-models/auction-model').Auction;

const userAuctionMessagesSchema = new mongoose.Schema({
	auction: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Auction,
		required: true,
	},
	message: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	receiver: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now(),
	},
	isRead: {
		type: Boolean,
		default: false,
	},
	isDeleted: {
		type: Boolean,
		default: false,
	},
});

const UserAuctionMessage = chatDatabase.model('UserAuctionMessage', userAuctionMessagesSchema);
exports.UserAuctionMessage = UserAuctionMessage;
