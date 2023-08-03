const mongoose = require('mongoose');

const paymentTypeSchema = new mongoose.Schema({
	name: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
		unique: true,
	},
	shortDescription: {
		type: mongoose.Schema.Types.Mixed,
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

const PaymentType = mongoose.model('PaymentType', paymentTypeSchema);
exports.PaymentType = PaymentType;
