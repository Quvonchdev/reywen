const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const streetSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
	shortDescription: {
		type: String,
		default: null,
	},
	status: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Street = primaryDatabase.model('Street', streetSchema);
exports.Street = Street;
