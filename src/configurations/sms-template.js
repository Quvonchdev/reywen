function smsTemplate(code, expiredAt = 30) {
	return `uyer.uz\nВаш код для авторизации : ${code}\nКод действителен в течении ${expiredAt} минут\n`;
}

module.exports = { smsTemplate };
