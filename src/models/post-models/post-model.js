const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');
const User = require('../user-models/user-model').User;
const Category = require('../post-models/category-model').Category;

const Country = require('../address-models/country-model').Country;
const Region = require('../address-models/regions-model').Region;
const District = require('../address-models/district-model').District;
const Zone = require('../address-models/zone-model').Zone;

const addressSchema = new mongoose.Schema({
	country: {
		type: mongoose.Schema.Types.Mixed,
		ref: Country,
		autopopulate: true,
		default: null,
	},
	region: {
		type: mongoose.Schema.Types.Mixed,
		ref: Region,
		autopopulate: true,
		default: null,
	},
	district: {
		type: mongoose.Schema.Types.Mixed,
		ref: District,
		autopopulate: true,
		default: null,
	},
	zone: {
		type: mongoose.Schema.Types.Mixed,
		ref: Zone,
		autopopulate: true,
		default: null,
	},
	street: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	location: {
		type: Array,
		default: [],
	},
	isAddressVisible: {
		type: Boolean,
		default: true,
	}
})

const modernizationSchema = new mongoose.Schema({
	modernizationComment: {
		type: String,
		default: null,
	},
	modernizationBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		default: null,
	},
	isSendedTelegram: {
		type: Boolean,
		default: false,
	},
})

const contactSchema = new mongoose.Schema({
	contactPhones: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	contactEmails: {
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
	}
})

const postPremiumSchema = new mongoose.Schema({
	isPremium: {
		type: Boolean,
		default: false,
	},
	premiumStartedAt: {
		type: Date,
		default: null,
	},
	premiumExpiredAt: {
		type: Date,
		default: null,
	}
})

const postSchema = new mongoose.Schema({
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
	tags: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	price: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	facilities: {
		// [wifi, parking, ...]
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
		// for editor
		type: mongoose.Schema.Types.Mixed,
		default: null,
		required: true,
	},
	address: {
		type: addressSchema,
		required: true,
	},
	contact: {
		type: contactSchema,
	},
	modernization: {
		type: modernizationSchema,
	},
	premium: {
		type: postPremiumSchema,
	},
	views: {
		type: Number,
		default: 0,
	},
	isPopular: {
		type: Boolean,
		default: false,
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		default: null,
	},
	status: {
		type: String,
		enum: ['pending', 'approved', 'rejected'],
		default: 'pending',
	}
}, {
	timestamps: true,
});

postSchema.pre('validate', function (next) {
	if (this.title) {
		this.slug = this.title;
	}
	next();
});

postSchema.plugin(require('mongoose-autopopulate'));
const Post = primaryDatabase.model('Post', postSchema);
exports.Post = Post;
