const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
	},
	id: {
		type: Number,
		default: null,
	},
	region_id: {
		type: Number,
		default: null,
	},
	regionObjId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Region',
		required: true,
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

const District = mongoose.model('District', districtSchema);
exports.District = District;
