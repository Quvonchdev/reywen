const mongoose = require('mongoose');
const userDatabase = require('../../connections/database-connections/user-db-connection');
const User = require('../user-models/user-model').User;

const verifyCodeSchema = new mongoose.Schema(
	{
		verifyCode: {
			type: Number,
			required: true,
			index: true,
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: User,
			required: true,
		},
		isExpired: {
			type: Boolean,
			default: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			expires: 900,
		},
	},
	{
		timestamps: true,
	}
);

const VerifyCode = userDatabase.model('VerifyCode', verifyCodeSchema);
exports.VerifyCode = VerifyCode;
