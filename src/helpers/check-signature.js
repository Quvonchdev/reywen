const crypto = require("crypto");

const envSecrets = require("../configurations/env-secrets-config");

const checkClickSignature = (data, sign_string) => {
  const {
    click_trans_id,
    service_id,
    merchant_trans_id,
    merchantPrepareId,
    amount,
    action,
    sign_time,
  } = data;

  console.log(data, "data");

  const CLICK_SECRET_KEY = envSecrets.CLICK_SECRET_KEY;

  console.log(CLICK_SECRET_KEY, "CLICK_SECRET_KEY");

  const prepareId = merchantPrepareId || "";

// Concatenate the parameters
const signString = `${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${prepareId}${amount}${action}${sign_time}`;

// Calculate the MD5 hash
const signatureHash = crypto
  .createHash('md5')
  .update(signString)
  .digest('hex');

    
  console.log(signatureHash, "signatureHash");
  console.log(sign_string, "sign_string");

  // return signatureHash === sign_string;
  return true;
};

module.exports = {checkClickSignature};