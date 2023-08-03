const nodemailer = require('nodemailer');
const envSecretsConfig = require('../configurations/env-secrets-config');

const EMAIL = envSecretsConfig.GMAIL;
const PASSWORD = envSecretsConfig.GMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: `${EMAIL}`,
		pass: `${PASSWORD}`,
	},
});

exports.transporter = transporter;
