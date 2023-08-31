const crypto = require('crypto');
const envSecretsConfig = require('../configurations/env-secrets-config');

const checkUzumSignature = (data, signString) => {
	const { transId, serviceId, userId, merchantOperationId, amount, action, signTime } = data;

	const UZUM_SECRET_KEY = envSecretsConfig.UZUM_SECRET_KEY;

	const prepareId = merchantOperationId || '';

	const signature = `${transId}${serviceId}${UZUM_SECRET_KEY}${userId}${prepareId}${amount}${action}${signTime}`;

	const signatureHash = crypto.createHash('sha256').update(signature).digest('hex');

	return signatureHash === signString;
};

module.exports = {
	checkUzumSignature,
};