const mongoose = require('mongoose');
const generateSlag = require('../../helpers/slug-generator');
const { v4: uuid } = require('uuid');

const postSchema = new mongoose.Schema({
	uuid: {
		type: mongoose.Schema.Types.UUID,
		default: uuid(),
	},
	title: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	shortDescription: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	coverImage: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	postImages: {
		type: Array,
		default: [],
	},
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Category',
		autopopulate: true,
	},
	operationType: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'OperationType',
			autopopulate: true,
		},
	],
	currencyType: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'CurrencyType',
		autopopulate: true,
	},
	priceType: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'PriceType',
			autopopulate: true,
		},
	],
	price: {
		type: Number,
		required: true,
	},
	paymentTypes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'PaymentType',
			autopopulate: true,
		},
	],
	facilities: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
	},
	slug: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
	},
	fullInfo: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	// Address
	country: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Country',
		autopopulate: true,
	},
	district: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'District',
		required: true,
		autopopulate: true,
	},
	zone: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Zone',
		autopopulate: true,
	},
	street: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
	},
	latitude: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
	},
	longitude: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
	},
	// Contact
	contactPhone: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	contactEmail: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	contactAddress: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	socialContacts: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	isContactVisible: {
		type: Boolean,
		default: true,
	},
	// User panel
	createdByAt: {
		type: Date,
		default: Date.now,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	updatedAt: {
		type: Date,
		default: null,
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null,
	},
	// Admin panel
	moderationStatus: {
		type: String,
		enum: ['pending', 'approved', 'rejected'],
		default: 'pending',
	},
	moderationComment: {
		type: String,
		default: null,
	},
	moderationBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null,
	},
	isUrgently: {
		type: Boolean,
		default: false,
	},
	expiredUrgentlyAt: {
		type: Date,
		default: null,
	},
	isPremium: {
		type: Boolean,
		default: false,
	},
	expiredPremiumAt: {
		type: Date,
		default: null,
	},
	isVip: {
		type: Boolean,
		default: false,
	},
	expiredVipAt: {
		type: Date,
		default: null,
	},
	isTop: {
		type: Boolean,
		default: false,
	},
	expiredTopAt: {
		type: Date,
		default: null,
	},
	// Telegram
	isSendedTelegram: {
		type: Boolean,
		default: false,
	},
	telegramMessage: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	telegramSendedAt: {
		type: Date,
		default: null,
	},
	telegramSendedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null,
	},
	views: {
		type: Number,
		default: 0,
	},
	isPopular: {
		type: Boolean,
		default: false,
	},
	status: {
		type: Boolean,
		default: true,
	},
});

postSchema.pre('validate', function (next) {
	if (this.name) {
		this.slug = generateSlag(this.name);
	}
	next();
});

postSchema.plugin(require('mongoose-autopopulate'));
const Post = mongoose.model('Post', postSchema);
exports.Post = Post;
