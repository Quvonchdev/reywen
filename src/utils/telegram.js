const ReturnResult = require('../helpers/return-result');
const secrets = require('../configurations/env-secrets-config');
const { bot } = require('../connections/telegram-bot-connection');

const TG_CHANNEL = secrets.TELEGRAM_CHANNEL_NAME;

class Telegram {
	static async sendMessage(message) {
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
					caption: index === 0 ? `
					🏠 ${data?.title || '–'} \n \n
					📍 Адрес: город ${data?.region || '–'}, ${data?.district || '–'}, ${data?.street || '–'} \n
					🛏️ Комнат: ${data?.fullInfo?.room || '–'} \n
					📏 Площадь: ${data?.fullInfo?.area || '–'} \n
					🏢 Этаж: ${data?.fullInfo?.floor || '–'} \n
					🔧 Ремонт: ${data?.fullInfo?.repair || '–'} \n
					🧱 Материал: ${data?.fullInfo?.material || '–'} \n \n \n

					💰 Цена: ${data?.price || '–'} ${data?.currencyType || '–'} (${data?.paymentTypes || '–'}) \n
					📞 Телефон: ${data?.contactPhone || '–'} \n \n \n

					👉 Подробнее на сайте \n

					🔍 Больше объявлений на ${url || '–'}
					` : null,
					parse_mode: 'Markdown',
				};
			})
		);
		return ReturnResult.successMessage('Pictures sent successfully to Telegram Channel');
	}
}

module.exports = Telegram;
