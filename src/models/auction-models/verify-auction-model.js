const mongoose = require('mongoose');
const auctionDatabase = require('../../connections/database-connections/auction-db-connection');
const User = require('../user-models/user-model').User;
const Auction = require('./auction-model').Auction;

const verifyAuctionSchema = new mongoose.Schema(
	{
		auction: {
			type: mongoose.Schema.Types.ObjectId,
			ref: Auction,
			required: true,
			index: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: User,
			required: true,
			index: true,
		},
		verifyCode: {
			type: Number,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const VerifyAuction = auctionDatabase.model('VerifyAuction', verifyAuctionSchema);
exports.VerifyAuction = VerifyAuction;
