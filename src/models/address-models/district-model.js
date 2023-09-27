const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const districtSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
	region: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Region',
		autopopulate: true,
	},
	id: {
		type: Number,
	},
}, {
	timestamps: true
});

districtSchema.plugin(require('mongoose-autopopulate'));
const District = primaryDatabase.model('District', districtSchema);
exports.District = District;
