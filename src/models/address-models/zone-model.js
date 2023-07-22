const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
	id: {
		type: Number,
		default: null
	},
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true
	},
	district_id: {
		type: Number,
		default: null
	},
	districtObjId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'District',
		required: true
	},
	regionObjId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Region',
		required: true
	},
	status: {
		type: Boolean,
		default: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
});

const Zone = mongoose.model('Zone', zoneSchema);
exports.Zone = Zone;
