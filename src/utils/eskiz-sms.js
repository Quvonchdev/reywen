const axios = require('axios');
const querystring = require('querystring');

const SUCCESS = 200;
const PROCESSING = 102;
const FAILED = 400;
const INVALID_NUMBER = 160;
const MESSAGE_IS_EMPTY = 170;
const SMS_NOT_FOUND = 404;
const SMS_SERVICE_NOT_TURNED = 600;

const ESKIZ_EMAIL = process.env.ESKIZ_EMAIL;
const ESKIZ_PASSWORD = process.env.ESKIZ_PASSWORD;
const CLIENT_REDIRECT_URL = process.env.CLIENT_REDIRECT_URL;

class SmsEskiz {
	constructor(message, phone, email = ESKIZ_EMAIL, password = ESKIZ_PASSWORD) {
		this.message = message;
		this.phone = phone;
		this.spend = null;
		this.email = email;
		this.password = password;
	}

	async send() {
		const statusCode = await this.customValidation();
		if (statusCode === SUCCESS) {
			return this.sendMessage(this.message);
		}
		return statusCode;
	}

	async customValidation() {
		if (this.phone.toString().length !== 9) {
			return INVALID_NUMBER;
		}
		if (this.message === '' || !this.message) {
			return MESSAGE_IS_EMPTY;
		}
		return SUCCESS;
	}

	async authorization() {
		const data = querystring.stringify({
			email: this.email,
			password: this.password,
		});

		const AUTHORIZATION_URL = 'http://notify.eskiz.uz/api/auth/login';

		try {
			const response = await axios.post(AUTHORIZATION_URL, data);
			const token = response.data.data.token;

			if (token) {
				return token;
			} else {
				return FAILED;
			}
		} catch (error) {
			console.error('Error:', error);
			return FAILED;
		}
	}

	async sendMessage(message) {
		const token = await this.authorization();
		if (token === FAILED) {
			return FAILED;
		}

		const SEND_SMS_URL = 'http://notify.eskiz.uz/api/message/sms/send';

		const formData = new FormData();
		formData.append('mobile_phone', '998' + this.phone);
		formData.append('message', message);
		formData.append('from', '4546');
		formData.append('callback_url', 'http://afbaf9e5a0a6.ngrok.io/sms-api-result/');

		try {
			const response = await axios.post(SEND_SMS_URL, formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					...formData.getHeaders(),
				},
			});

			console.log(`Eskiz: ${response.data}`);
			return response.status;
		} catch (error) {
			console.error('Error:', error);
			return FAILED;
		}
	}

	// Other methods...
}

// Usage
const message = 'Салом дунё';
const phone = 919791999;
const eskizApi = new SmsEskiz(message, phone);
eskizApi
	.send()
	.then((result) => {
		console.log(result);
	})
	.catch((error) => {
		console.error('Error:', error);
	});
