const TelegramBot = require('node-telegram-bot-api');

let bot;

function getBot() {
  if (!bot) {
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
  }
  return bot;
}

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(price) + ' сум';
}

async function sendOrderNotification(order) {
  const b = getBot();
  const adminId = process.env.TELEGRAM_ADMIN_ID;

  const lines = [
    `🛒 *Новый заказ #${order.orderId}*`,
    ``,
    `👤 *Покупатель:*`,
    order.customerName ? `Имя: ${order.customerName}` : '',
    order.customerPhone ? `Телефон: ${order.customerPhone}` : '',
    order.customerAddress ? `Адрес: ${order.customerAddress}` : '',
    order.telegramUserId ? `Telegram: @${order.telegramUsername || order.telegramUserId}` : '',
    ``,
    `📦 *Товары:*`,
    ...order.items.map(
      (item) =>
        `• ${item.name}${item.variantName ? ` (${item.variantName})` : ''} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
    ),
    ``,
    `💰 *Итого: ${formatPrice(order.total)}*`,
    ``,
    `✅ Оплата через Click`,
  ].filter((l) => l !== undefined && l !== null);

  const text = lines.join('\n');

  await b.sendMessage(adminId, text, { parse_mode: 'Markdown' });
}

async function sendPaymentConfirmation(order) {
  const b = getBot();
  const adminId = process.env.TELEGRAM_ADMIN_ID;

  await b.sendMessage(
    adminId,
    `✅ *Оплата подтверждена* для заказа #${order.orderId}\n💰 ${formatPrice(order.total)}`,
    { parse_mode: 'Markdown' }
  );
}

module.exports = { sendOrderNotification, sendPaymentConfirmation };
