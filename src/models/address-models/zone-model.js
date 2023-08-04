const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
	id: {
		type: Number,
		default: null,
	},
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	district_id: {
		type: Number,
		default: null,
	},
	districtObjId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'District',
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

const Zone = mongoose.model('Zone', zoneSchema);
exports.Zone = Zone;
