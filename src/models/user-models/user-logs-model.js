const mongoose = require('mongoose');
const logsDatabase = require('../../connections/database-connections/logs-db-connection');
const User = require('../user-models/user-model').User
// create this schema when user is logged in
const userLogSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	ip: {
		type: String,
		required: false,
		default: null,
	},
	device: {
		type: String,
		required: false,
		default: null,
	},
	browser: {
		type: String,
		required: false,
		default: null,
	},
	os: {
		type: String,
		required: false,
		default: null,
	},
	lastLogin: {
		type: Date,
		default: Date.now,
	},
});

const UserLog = logsDatabase.model('UserLog', userLogSchema);
exports.UserLog = UserLog;
