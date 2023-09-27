const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const zoneSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		index: true,
	},
	district: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'District',
		default: null,
	},
	id: {
		type: Number,
	}
}, {
	timestamps: true
});

const Zone = primaryDatabase.model('Zone', zoneSchema);
exports.Zone = Zone;
