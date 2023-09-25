const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const categorySchemas = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
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
	slug: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
	status: {
		type: Boolean,
		default: true,
	},
	additionalInformation: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
}, {
	timestamps: true,
});

categorySchemas.pre('validate', function (next) {
	if (this.name) {
		this.slug = this.name;
	}
	next();
});

const Category = primaryDatabase.model('Category', categorySchemas);
exports.Category = Category;
