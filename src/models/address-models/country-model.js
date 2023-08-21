const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const countrySchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
	Code: {
		type: String,
		default: null,
	},
	phoneCode: {
		type: String,
		default: null,
	},
	currencyCode: {
		type: String,
		default: null,
	},
	currencyName: {
		type: String,
		default: null,
	},
	status: {
		type: Boolean,
		default: true,
	},
	shortDescription: {
		type: mongoose.Schema.Types.Mixed,
		default: null,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Country = primaryDatabase.model('Country', countrySchema);
exports.Country = Country;
