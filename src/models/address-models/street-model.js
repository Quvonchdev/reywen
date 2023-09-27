const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const streetSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	}
}, {
	timestamps: true
});

const Street = primaryDatabase.model('Street', streetSchema);
exports.Street = Street;
