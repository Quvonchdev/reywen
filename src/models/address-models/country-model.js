const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const countrySchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
}, {
	timestamps: true
});

const Country = primaryDatabase.model('Country', countrySchema);
exports.Country = Country;
