const mongoose = require('mongoose');
const { v4: uuid } = require('uuid');

const userSchema = new mongoose.Schema(
	{
		uuid: {
			type: String,
			default: uuid(),
		},
		fullName: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 255,
		},
		phoneNumber: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 10,
			maxlength: 15,
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 1024,
		},
		confirmPassword: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			maxlength: 1024,
		},
		email: {
			type: String,
			required: false,
			unique: true,
			trim: true,
			minlength: 3,
			maxlength: 255,
		},
		// required: false
		shortDescription: {
			type: String,
			default: null,
		},
		coverImage: {
			type: String,
			default: null,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		userRoles: {
			type: [String],
			default: ['User'],
		},
		isBlockedUser: {
			type: Boolean,
			default: false,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model('User', userSchema);
exports.User = User;
