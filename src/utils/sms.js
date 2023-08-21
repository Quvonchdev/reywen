const axios = require('axios');
const envSecretsConfig = require('../configurations/env-secrets-config');
const SmsToken = require('../models/user-models/sms-auth-model');

const URL = 'https://notify.eskiz.uz/api/';
const CONTENT_TYPE = 'multipart/form-data';

const MESSAGES = {
	SUCCESS: 'Сообщение успешно отправлено',
	PROCESSING: 'Сообщение находится в процессе отправки',
	FAILED: 'Ошибка отправки сообщения',
	INVALID_NUMBER: 'Неверный номер',
	MESSAGE_IS_EMPTY: 'Сообщение пустое',
	SMS_NOT_FOUND: 'Сообщение не найдено',
	SMS_SERVICE_NOT_TURNED: 'Сервис отправки сообщений не включен',
};

class SmsEskiz {
	// Main method to call from outside
	static sendMessage = async (message, mobile_phone, from, callback_url) => {
		const validation = await this.customValidation(mobile_phone, message);

		if (validation !== true) {
			return validation;
		}

		return await this.sendSms(message, mobile_phone, from, callback_url);
	};

	static sendSms = async (message, mobile_phone, from, callback_url) => {
		try {
			let token = null;

			const smsToken = await SmsToken.find();

			if (smsToken.length === 0) {
				token = await this.login();

				const newToken = new SmsToken({
					token: token,
				});
				await newToken.save();
			} else {
				token = smsToken[0].token;
			}

			if (!token || token == null || token === undefined) {
				return MESSAGES.SMS_SERVICE_NOT_TURNED;
			}

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

			return {
				response: response,
				message: MESSAGES.SUCCESS,
			};
		} catch (error) {
			return {
				response: error,
				message: MESSAGES.FAILED,
			};
		}
	};

	static login = async () => {
		const data = {
			email: envSecretsConfig.ESKIZ_SMS_EMAIL,
			password: envSecretsConfig.ESKIZ_SMS_PASSWORD,
		};

		const responseLogin = await axios.post(URL + 'auth/login', data);

		if (!responseLogin.data) {
			return 'Error: ' + responseLogin;
		}

		if (!responseLogin.data.data) {
			return 'Error: ' + responseLogin;
		}

		if (!responseLogin.data.data.token) {
			return 'Error: ' + responseLogin;
		}

		return responseLogin.data.data.token;
	};

	static customValidation = async (mobile_phone, message) => {
		if (mobile_phone.length < 9 || mobile_phone.length > 13) {
			return MESSAGES.INVALID_NUMBER;
		}
		if (message === '' || !message) {
			return MESSAGES.MESSAGE_IS_EMPTY;
		}
		return true;
	};

	static getBalance = async () => {
		let token = null;

		const smsToken = await SmsToken.find();

		if (smsToken.length === 0) {
			token = await this.login();

			const newToken = new SmsToken({
				token: token,
			});
			await newToken.save();
		} else {
			token = smsToken[0].token;
		}

		if (!token || token == null || token === undefined) {
			return MESSAGES.SMS_SERVICE_NOT_TURNED;
		}

		const response = await axios.get(URL + 'user/get-limit', {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		});

		return response;
	};

	static getNickname = async () => {
		let token = null;

		const smsToken = await SmsToken.find();

		if (smsToken.length === 0) {
			token = await this.login();

			const newToken = new SmsToken({
				token: token,
			});
			await newToken.save();
		} else {
			token = smsToken[0].token;
		}

		if (!token || token == null || token === undefined) {
			return MESSAGES.SMS_SERVICE_NOT_TURNED;
		}

		const response = await axios.get(URL + 'nick/me', {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		});

		return response;
	};

	static getUserInfo = async () => {
		let token = null;

		const smsToken = await SmsToken.find();

		if (smsToken.length === 0) {
			token = await this.login();

			const newToken = new SmsToken({
				token: token,
			});
			await newToken.save();
		} else {
			token = smsToken[0].token;
		}

		if (!token || token == null || token === undefined) {
			return MESSAGES.SMS_SERVICE_NOT_TURNED;
		}

		const response = await axios.get(URL + 'auth/user', {
			headers: {
				Authorization: 'Bearer ' + token,
			},
		});

		return response;
	};
}

module.exports = SmsEskiz;
