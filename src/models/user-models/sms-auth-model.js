const mongoose = require('mongoose');
const userDatabase = require('../../connections/database-connections/user-db-connection');

const SmsTokenSchema = new mongoose.Schema(
	{
		token: {
			type: String,
			required: true,
			index: true,
		},
		createdAt: {
			type: Date,
			default: Date.now,
			expires: 60 * 60 * 24 * 29, // 29 days
		},
	},
	{
		collection: 'smsToken',
	}
);

module.exports = userDatabase.model('SmsToken', SmsTokenSchema);
