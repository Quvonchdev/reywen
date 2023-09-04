const mongoose = require('mongoose');
const auctionDatabase = require('../../connections/database-connections/auction-db-connection');
const User = require('../user-models/user-model').User;
const Auction = require('./auction-model').Auction;

const auctionSchema = new mongoose.Schema({
	auction: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Auction,
		required: true,
		index: true
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
		index: true,
	},
	isParticipating: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	isPayed: {
		type: Boolean,
		default: false,
	},
	status: {
		type: Boolean,
		default: false,
	},
});

const Participant = auctionDatabase.model('Participant', auctionSchema);
exports.Participant = Participant;
