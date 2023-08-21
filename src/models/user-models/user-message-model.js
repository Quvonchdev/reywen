const mongoose = require('mongoose');
const chatDatabase = require('../../connections/database-connections/chat-db-connection');

const userMessagesSchema = new mongoose.Schema({
	message: {
		type: mongoose.Schema.Types.Mixed,
		required: true,
	},
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	receiver: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	date: {
		type: Date,
		default: Date.now(),
	},
	isRead: {
		type: Boolean,
		default: false,
	},
});

const UserMessage = chatDatabase.model('UserMessage', userMessagesSchema);
exports.UserMessage = UserMessage;
