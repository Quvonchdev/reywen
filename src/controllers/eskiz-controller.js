const smsEskiz = require('../utils/sms');

class EskizController {
	static getNickname = async (req, res) => {
		const response = await smsEskiz.getNickname();
		return res.status(200).json(response.data);
	};

	static getUserInfo = async (req, res) => {
		const response = await smsEskiz.getUserInfo();
		return res.status(200).json(response.data);
	};

	static getBalance = async (req, res) => {
		const response = await smsEskiz.getBalance();
		return res.status(200).json(response.data);
	};
}

module.exports = EskizController;
