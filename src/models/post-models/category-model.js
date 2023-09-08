const mongoose = require('mongoose');
const generateSlag = require('../../helpers/slug-generator');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');
const User = require('../user-models/user-model').User;

const categorySchemas = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
	categoryId: {
		type: Number,
	},
	shortDescription: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	coverImage: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	slug: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
	clicks: {
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
	createdAt: {
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
});

categorySchemas.pre('validate', function (next) {
	if (this.name) {
		this.slug = generateSlag(this.name);
	}
	next();
});

categorySchemas.pre('save', function (next) {
	// Only increment when the document is new
	if (this.isNew) {
		Category.count().then((res) => {
			this.categoryId = res; // Increment count
			next();
		});
	} else {
		next();
	}
});

const Category = primaryDatabase.model('Category', categorySchemas);
exports.Category = Category;
