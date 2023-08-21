const mongoose = require('mongoose');
const userDatabase = require('../../connections/database-connections/user-db-connection');

const userRoleSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		index: true,
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

const UserRole = userDatabase.model('UserRole', userRoleSchema);
exports.UserRole = UserRole;
