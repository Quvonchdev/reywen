const mongoose = require('mongoose');

const streetSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true
	},
	shortDescription: {
		type: String,
		default: null
	},
	status: {
		type: Boolean,
		default: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

const Street = mongoose.model('Street', streetSchema);
exports.Street = Street;
