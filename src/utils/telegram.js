const ReturnResult = require('../helpers/return-result');
const secrets = require('../configurations/env-secrets-config');
const { bot } = require('../connections/telegram-bot-connection');

const TG_CHANNEL = secrets.TELEGRAM_CHANNEL_NAME;

class Telegram {
	static async sendMessage(message) {
		console.log(TG_CHANNEL);
		await bot.telegram.sendMessage(TG_CHANNEL, message);
		return ReturnResult.successMessage('Message sent successfully to Telegram Channel');
	}

	static async sendPicture(pictures, captionText, url) {
		await bot.telegram.sendPhoto(TG_CHANNEL, pictures, {
			caption: `${captionText}`,
			allow_sending_without_reply: true,
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: [[{ text: 'More Info', url: `${url}` }]],
			},
		});
		return ReturnResult.successMessage('Picture sent successfully to Telegram Channel');
	}

	static async sendPictures(pictures, data, url) {
		await bot.telegram.sendMediaGroup(
			TG_CHANNEL,
			pictures.map((image, index) => {
				return {
					type: 'photo',
					media: image,
					caption: index === 0 ? data : null,
					parse_mode: 'HTML',
					reply_markup: {
						inline_keyboard: [[{ text: 'More Info', url: `${url}` }]],
					},
				};
			})
		);
		return ReturnResult.successMessage('Pictures sent successfully to Telegram Channel');
	}
}

module.exports = Telegram;
