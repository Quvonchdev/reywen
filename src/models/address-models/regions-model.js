const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const regionSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
	id: {
		type: Number,
		default: null,
	},
	countryObjId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Country',
		default: null,
	},
	status: {
		type: Boolean,
		default: true,
	},
	shortDescription: {
		type: String,
		default: null,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const Region = primaryDatabase.model('Region', regionSchema);
exports.Region = Region;
