const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	shortDescription: {
		type: String,
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

const UserRole = mongoose.model('UserRole', userRoleSchema);
exports.UserRole = UserRole;
