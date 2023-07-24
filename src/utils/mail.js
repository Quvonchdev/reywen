const { transporter } = require('../connections/gmail-connection');
const ReturnResult = require('../helpers/return-result');

const sendMail = async (mailOptions) => {
	try {
		return await transporter.sendMail(mailOptions);
	} catch (error) {
		return ReturnResult.error(error, error.message);
	}
};

module.exports = { sendMail };
