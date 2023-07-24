const mongoose = require('mongoose');

// create this schema when user is logged in
const userLogSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
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

const UserLog = mongoose.model('UserLog', userLogSchema);
exports.UserLog = UserLog;
