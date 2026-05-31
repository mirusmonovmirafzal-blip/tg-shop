const express = require('express');
const router = express.Router();
const { verifyPrepareSign, verifyCompleteSign, ERRORS } = require('../services/clickPayment');
const { createOrder } = require('../services/moysklad');
const { sendOrderNotification } = require('../services/telegram');
const { pendingOrders } = require('./orders');

// Click PREPARE (action=0)
router.post('/prepare', async (req, res) => {
  const body = req.body;
  const { merchant_trans_id, amount } = body;

  if (!verifyPrepareSign(body)) {
    return res.json({ error: ERRORS.SIGN_FAILED, error_note: 'Invalid sign' });
  }

  const order = pendingOrders.get(merchant_trans_id);
  if (!order) {
    return res.json({ error: ERRORS.ORDER_NOT_FOUND, error_note: 'Order not found' });
  }
  if (order.status === 'paid') {
    return res.json({ error: ERRORS.ALREADY_PAID, error_note: 'Already paid' });
  }

  order.clickTransId = body.click_trans_id;
  order.merchantPrepareId = Date.now();

  res.json({
    click_trans_id: body.click_trans_id,
    merchant_trans_id,
    merchant_prepare_id: order.merchantPrepareId,
    error: ERRORS.SUCCESS,
    error_note: 'Success',
  });
});

// Click COMPLETE (action=1)
router.post('/complete', async (req, res) => {
  const body = req.body;
  const { merchant_trans_id, error: clickError } = body;

  if (!verifyCompleteSign(body)) {
    return res.json({ error: ERRORS.SIGN_FAILED, error_note: 'Invalid sign' });
  }

  const order = pendingOrders.get(merchant_trans_id);
  if (!order) {
    return res.json({ error: ERRORS.ORDER_NOT_FOUND, error_note: 'Order not found' });
  }
  if (order.status === 'paid') {
    return res.json({ error: ERRORS.ALREADY_PAID, error_note: 'Already paid' });
  }

  if (parseInt(clickError) < 0) {
    order.status = 'cancelled';
    return res.json({
      click_trans_id: body.click_trans_id,
      merchant_trans_id,
      merchant_confirm_id: null,
      error: ERRORS.TRANSACTION_CANCELLED,
      error_note: 'Transaction cancelled',
    });
  }

  // Payment successful — create order in MoySklad + send Telegram notification
  try {
    await createOrder(order);
    order.status = 'paid';
    // Send Telegram notification ONLY after successful payment
    await sendOrderNotification(order);
  } catch (err) {
    console.error('Post-payment processing failed:', err.message);
  }

  res.json({
    click_trans_id: body.click_trans_id,
    merchant_trans_id,
    merchant_confirm_id: order.merchantPrepareId,
    error: ERRORS.SUCCESS,
    error_note: 'Success',
  });
});

module.exports = router;
