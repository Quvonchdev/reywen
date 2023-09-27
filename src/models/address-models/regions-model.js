const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const regionSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
		index: true,
	},
	country: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Country',
		autopopulate: true,
	},
	id: {
		type: Number,
	}
}, {
	timestamps: true
});

regionSchema.plugin(require('mongoose-autopopulate'));
const Region = primaryDatabase.model('Region', regionSchema);
exports.Region = Region;
