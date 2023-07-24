const mongoose = require('mongoose');

const verifyCodeSchema = new mongoose.Schema({
	verifyCode: {
		type: Number,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	isExpired: {
		type: Boolean,
		default: false,
	},
	expiredAt: {
		type: Date,
		default: () => {
			return Date.now() + 1 * 60 * 1000; // expired after 1 minutes;
		},
	},
});

const VerifyCode = mongoose.model('VerifyCode', verifyCodeSchema);
exports.VerifyCode = VerifyCode;
