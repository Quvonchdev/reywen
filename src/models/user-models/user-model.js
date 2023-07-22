const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	// required: true
	fullName: {
		type: String,
		required: true,
		unique: true,
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
	// required: false
	email: {
		type: String,
		default: null,
		unique: true,
		trim: true,
		minlength: 5,
		maxlength: 255,
	},
	shortDescription: {
		type: String,
		default: null,
	},
	userRoles: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'UserRole',
			default: null,
		},
	],
	status: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

const User = mongoose.model('User', userSchema);
exports.User = User;
