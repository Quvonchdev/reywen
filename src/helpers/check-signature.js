const envSecrets = require('../configurations/env-secrets-config');
const crypto = require('crypto');

function authorization(data) {
	let click_trans_id = data.click_trans_id;
	let amount = data.amount;
	let action = data.action;
	let sign_time = data.sign_time;
	let sign_string = data.sign_string;
	let merchant_trans_id = data.merchant_trans_id;
	let merchant_prepare_id = data.merchant_prepare_id || null;

	const { CLICK_SERVICE_ID, CLICK_SECRET_KEY } = envSecrets;

	let text = `${click_trans_id}${CLICK_SERVICE_ID}${CLICK_SECRET_KEY}${merchant_trans_id}`;

	if (merchant_prepare_id !== '' && merchant_prepare_id !== null) {
		text += `${merchant_prepare_id}`;
	}
	text += `${amount}${action}${sign_time}`;

	const encoded_hash = crypto.createHash('md5').update(text, 'utf-8').digest('hex');

	return encoded_hash === sign_string;
}

exports.authorization = authorization;
