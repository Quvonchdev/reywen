const mongoose = require('mongoose');

const verifyCodeSchema = new mongoose.Schema(
	{
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
		createdAt: {
			type: Date,
			default: Date.now,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

verifyCodeSchema.index(
	{ createdAt: 1 },
	{
		expireAfterSeconds: 10,
	}
);

const VerifyCode = mongoose.model('VerifyCode', verifyCodeSchema);
exports.VerifyCode = VerifyCode;
