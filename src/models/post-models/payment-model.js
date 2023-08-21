const mongoose = require('mongoose');
const primaryDatabase = require('../../connections/database-connections/primary-db-connection');

const paymentSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	postId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post',
		required: true,
	},
	paymentId: {
		type: String,
		required: true,
	},
	paymentStatus: {
		type: String,
		required: true,
	},
	paymentAmount: {
		type: Number,
		required: true,
	},
	paymentCurrency: {
		type: String,
		required: true,
	},
	paymentDescription: {
		type: String,
		default: null,
	},
	paymentCreatedAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = primaryDatabase.model('Payment', paymentSchema);
