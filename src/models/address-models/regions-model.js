const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
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

const Region = mongoose.model('Region', regionSchema);
exports.Region = Region;
