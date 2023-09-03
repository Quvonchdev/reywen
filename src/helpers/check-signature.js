const crypto = require("crypto");

const envSecrets = require("../configurations/env-secrets-config");

const checkClickSignature = (data, signString) => {
  const {
    click_trans_id,
    service_id,
    merchant_trans_id,
    merchantPrepareId,
    amount,
    action,
    sign_time,
  } = data;

  const CLICK_SECRET_KEY = envSecrets.CLICK_SECRET_KEY;
  console.log(CLICK_SECRET_KEY);

  const prepareId = merchantPrepareId || "";

  const signature = `${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${prepareId}${amount}${action}${sign_time}`;

  const signatureHash = crypto
    .createHash("md5")
    .update(signature)
    .digest("hex");
    
    const sg = signatureHash
    console.log(sg === signatureHash);

  return signatureHash === sg;
};

module.exports = {checkClickSignature};