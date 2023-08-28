const mongoose = require('mongoose');
const auctionDatabase = require('../../connections/database-connections/auction-db-connection');
const Post = require('../post-models/post-model').Post;
const User = require('../user-models/user-model').User;
const { v4: uuid } = require('uuid');

const auctionSchema = new mongoose.Schema({
	uuid: {
		type: String,
		default: uuid(),
	},
	title: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	description: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: false,
	},
	startPrice: {
		type: Number,
		required: true,
	},
	bidIncrement: {
		type: Number,
		required: true,
	},
	bidIncrementType: {
		type: String,
		enum: ['fixed', 'percentage'],
		required: true,
	},
	currentPrice: {
		type: Number,
		default: null,
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
	},
	status: {
		type: String,
		enum: ['active', 'inactive', 'completed'],
		default: 'inactive',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	isPayed: {
		type: Boolean,
		default: false,
	},
	bidingUsers: [
		{
			price: {
				type: Number,
				required: true,
			},
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: User,
				required: true,
			},
			increment: {
				type: Number,
				required: true,
			},
			bidDate: {
				type: Date,
				default: Date.now,
			},
		},
	],
	post: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Post,
		required: true,
	},
});

auctionSchema.plugin(require('mongoose-autopopulate'));
const Auction = auctionDatabase.model('Auction', auctionSchema);
exports.Auction = Auction;
