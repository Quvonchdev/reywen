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
			return Date.now() + 15 * 60 * 1000; // expired after 15 minutes;
		},
	},
});

const VerifyCode = mongoose.model('VerifyCode', verifyCodeSchema);
exports.VerifyCode = VerifyCode;
