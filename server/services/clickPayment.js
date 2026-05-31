const md5 = require('md5');

const SERVICE_ID = process.env.CLICK_SERVICE_ID;
const SECRET_KEY = process.env.CLICK_SECRET_KEY;
const MERCHANT_ID = process.env.CLICK_MERCHANT_ID;

// Generate Click payment URL
function getPaymentUrl({ orderId, amount, returnUrl }) {
  const params = new URLSearchParams({
    service_id: SERVICE_ID,
    merchant_id: MERCHANT_ID,
    amount: amount,
    transaction_param: orderId,
    return_url: returnUrl,
  });
  return `https://my.click.uz/services/pay?${params.toString()}`;
}

// Verify PREPARE request signature
// sign = MD5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
function verifyPrepareSign(body) {
  const { click_trans_id, service_id, click_paydoc_id, merchant_trans_id, amount, action, sign_time, sign_string } = body;
  const expected = md5(
    `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`
  );
  return expected === sign_string;
}

// Verify COMPLETE request signature
// sign = MD5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
function verifyCompleteSign(body) {
  const { click_trans_id, service_id, merchant_trans_id, merchant_prepare_id, amount, action, sign_time, sign_string } = body;
  const expected = md5(
    `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`
  );
  return expected === sign_string;
}

// Error codes
const ERRORS = {
  SUCCESS: 0,
  SIGN_FAILED: -1,
  ORDER_NOT_FOUND: -5,
  ALREADY_PAID: -4,
  TRANSACTION_CANCELLED: -9,
};

module.exports = { getPaymentUrl, verifyPrepareSign, verifyCompleteSign, ERRORS };
