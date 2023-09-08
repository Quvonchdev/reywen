const mongoose = require('mongoose');
const generateSlag = require('../../helpers/slug-generator');
const { v4: uuid } = require('uuid');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');
const User = require('../user-models/user-model').User;
const Category = require('../post-models/category-model').Category;

const Country = require('../address-models/country-model').Country;
const Region = require('../address-models/regions-model').Region;
const District = require('../address-models/district-model').District;
const Zone = require('../address-models/zone-model').Zone;

const postSchema = new mongoose.Schema({
	uuid: {
		type: String,
		default: uuid(),
	},
	title: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		index: true,
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
		ref: Category,
		autopopulate: true,
		required: true,
	},
	operationType: {
		type: mongoose.Schema.Types.ObjectId,
		default: null,
	},
	currencyType: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	priceType: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	paymentTypes: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	price: {
		type: Number,
		required: true,
	},
	facilities: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
	},
	slug: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
		index: true,
	},
	fullInfo: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
	},
	// Address
	country: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Country,
		autopopulate: true,
	},
	region: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Region,
		autopopulate: true,
	},
	district: {
		type: mongoose.Schema.Types.ObjectId,
		ref: District,
		required: true,
		autopopulate: true,
	},
	zone: {
		type: mongoose.Schema.Types.ObjectId,
		ref: Zone,
		autopopulate: true,
	},
	street: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
	},
	location: {
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point',
		},
		coordinates: {
			type: [Number],
		},
	},
	isAddressVisible: {
		type: Boolean,
		default: true,
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
		ref: User,
		required: true,
	},
	updatedAt: {
		type: Date,
		default: null,
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		default: null,
	},
	// Admin panel
	modernizationStatus: {
		type: String,
		enum: ['pending', 'approved', 'rejected'],
		default: 'pending',
	},
	modernizationComment: {
		type: String,
		default: null,
	},
	modernizationBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
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
		ref: User,
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
	if (this.title) {
		this.slug = generateSlag(this.title);
	}
	next();
});

postSchema.plugin(require('mongoose-autopopulate'));
const Post = primaryDatabase.model('Post', postSchema);
exports.Post = Post;
