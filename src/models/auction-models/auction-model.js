const mongoose = require('mongoose');
const auctionDatabase = require('../../connections/database-connections/auction-db-connection');
const Post = require('../post-models/post-model').Post;
const User = require('../user-models/user-model').User;

const auctionSchema = new mongoose.Schema({
	title: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	description: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
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
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	paymentStatus: {
		type: String,
		enum: ['pending', 'paid'],
		default: 'pending',
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
		autopopulate: true,
	},
	slug: {
		type: mongoose.Schema.Types.Mixed
	}
}, {
	timestamps: true,
});

auctionSchema.plugin(require('mongoose-autopopulate'));

auctionSchema.pre('validate', function (next) {
	if (this.title) {
		this.slug = this.title;
	}
	next();
});

const Auction = auctionDatabase.model('Auction', auctionSchema);
exports.Auction = Auction;
