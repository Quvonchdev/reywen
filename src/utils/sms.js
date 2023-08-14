const axios = require('axios');
const envSecretsConfig = require('../configurations/env-secrets-config');
const querystring = require('querystring');

const URL = 'https://notify.eskiz.uz/api/';
const CONTENT_TYPE = 'multipart/form-data';

class SmsEskiz {
	static sendMessage = async (message, mobile_phone, from, callback_url) => {
		const validation = await this.customValidation(mobile_phone, message);

		if (validation !== true) {
			return validation;
		}

		return await this.sendSms(message, mobile_phone, from, callback_url);
	};

	static sendSms = async (message, mobile_phone, from, callback_url) => {
		const token = await this.login();

		const response = await axios.post(
			URL + 'message/sms/send',
			{
				mobile_phone: mobile_phone,
				message: message,
				from: from,
				callback_url: callback_url,
			},
			{
				headers: {
					'Content-Type': CONTENT_TYPE,
					Authorization: 'Bearer ' + token,
				},
			}
		);

		return response;
	};

	static login = async () => {
		const data = querystring.stringify({
			email: envSecretsConfig.ESKIZ_EMAIL,
			password: envSecretsConfig.ESKIZ_PASSWORD,
		});
		const responseLogin = await axios.post(URL + 'auth/login', data);

		if (!response.data) {
			return 'Error: ' + responseLogin;
		}

		if (!response.data.data) {
			return 'Error: ' + responseLogin;
		}

		if (!response.data.data.token) {
			return 'Error: ' + responseLogin;
		}

		return response.data.data.token;
	};

	static customValidation = async (mobile_phone, message) => {
		if (mobile_phone.toString().length !== 9) {
			return 'Invalid number';
		}
		if (message === '' || !message) {
			return 'Message is empty';
		}
		return true;
	};
}

module.exports = SmsEskiz;
