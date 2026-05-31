const express = require('express');
const router = express.Router();
const { createOrder } = require('../services/moysklad');
const { sendOrderNotification } = require('../services/telegram');
const { getPaymentUrl } = require('../services/clickPayment');

// In-memory pending orders store
const pendingOrders = new Map();
let orderCounter = 1000;

// POST /api/orders/create
// Body: { items, customerName?, customerPhone?, customerAddress?, telegramUserId?, telegramUsername? }
router.post('/create', async (req, res) => {
  try {
    const { items, customerName, customerPhone, customerAddress, telegramUserId, telegramUsername } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пустая' });
    }

    const orderId = `ORD-${++orderCounter}`;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Save pending order
    pendingOrders.set(orderId, {
      orderId,
      items,
      total,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      customerAddress: customerAddress || null,
      telegramUserId: telegramUserId || null,
      telegramUsername: telegramUsername || null,
      status: 'pending',
      createdAt: new Date(),
    });

    // Send initial Telegram notification
    await sendOrderNotification(pendingOrders.get(orderId));

    // Generate Click payment URL
    const returnUrl = `${process.env.APP_URL}/success?orderId=${orderId}`;
    const paymentUrl = getPaymentUrl({ orderId, amount: total, returnUrl });

    res.json({ orderId, paymentUrl, total });
  } catch (err) {
    console.error('Order create error:', err.message);
    res.status(500).json({ error: 'Ошибка создания заказа' });
  }
});

// GET /api/orders/:orderId
router.get('/:orderId', (req, res) => {
  const order = pendingOrders.get(req.params.orderId);
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });
  res.json(order);
});

module.exports = { router, pendingOrders };
