function smsTemplate(code, expiredAt = 30) {
	return `uyer.uz\nВаш код: ${code}\nКод действителен в течении ${expiredAt} минут\n`;
}

module.exports = { smsTemplate };
