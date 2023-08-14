function smsTemplate(code, expiredAt = 60) {
	return `Ваш код доступа: ${code}. Код действителен в течение ${expiredAt} минут.`;
}

module.exports = { smsTemplate };
