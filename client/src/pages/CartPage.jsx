import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { createOrder } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

const tg = window.Telegram?.WebApp;

export default function CartPage({ onBack }) {
  const { items, total, dispatch } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleOrder() {
    if (items.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const user = tg?.initDataUnsafe?.user;
      const { paymentUrl } = await createOrder({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          variantName: i.variantName,
          price: i.price,
          quantity: i.quantity,
        })),
        customerName: name || null,
        customerPhone: phone || null,
        customerAddress: address || null,
        telegramUserId: user?.id || null,
        telegramUsername: user?.username || null,
      });
      dispatch({ type: 'CLEAR' });
      // Open Click payment
      if (tg) {
        tg.openLink(paymentUrl);
      } else {
        window.location.href = paymentUrl;
      }
    } catch (e) {
      setError('Ошибка оформления заказа. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div style={styles.page}>
        <Header onBack={onBack} />
        <div style={styles.empty}>
          <p style={{ fontSize: 52 }}>🛒</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12, color: '#1A1A2E' }}>Корзина пуста</p>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>Добавьте товары из каталога</p>
          <button onClick={onBack} style={styles.backBtn}>Перейти в каталог</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header onBack={onBack} />

      <div style={styles.scroll}>
        {/* Cart items */}
        <div style={styles.section}>
          {items.map((item) => (
            <CartItem key={item.key} item={item} />
          ))}
        </div>

        {/* Customer info (optional) */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Данные для заказа <span style={styles.optional}>(необязательно)</span></h3>
          <Input
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon="👤"
          />
          <Input
            placeholder="+998 __ ___ __ __"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon="📞"
            type="tel"
          />
          <Input
            placeholder="Адрес доставки"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            icon="📍"
          />
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Товаров:</span>
            <span style={styles.summaryValue}>{items.reduce((s, i) => s + i.quantity, 0)} шт.</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Итого:</span>
            <span style={{ ...styles.summaryValue, color: '#5B67F8', fontSize: 18 }}>{formatPrice(total)}</span>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {/* Pay button */}
        <button onClick={handleOrder} disabled={loading} style={styles.payBtn}>
          {loading ? 'Оформление...' : `Оплатить через Click • ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
}

function Header({ onBack }) {
  return (
    <div style={styles.header}>
      <button onClick={onBack} style={styles.headerBack}>←</button>
      <h1 style={styles.headerTitle}>Корзина</h1>
      <div style={{ width: 36 }} />
    </div>
  );
}

function Input({ placeholder, value, onChange, icon, type = 'text' }) {
  return (
    <div style={styles.inputWrap}>
      <span style={styles.inputIcon}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={styles.input}
      />
    </div>
  );
}

const styles = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F6FA' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', background: '#fff', borderBottom: '1px solid #F0F0F0',
  },
  headerBack: {
    width: 36, height: 36, borderRadius: 10, background: '#F5F6FA',
    fontSize: 18, color: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: 700, color: '#1A1A2E' },
  scroll: { flex: 1, overflowY: 'auto', padding: '12px 16px 32px' },
  section: {
    background: '#fff', borderRadius: 16, padding: '4px 16px',
    marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 14, fontWeight: 600, color: '#1A1A2E',
    padding: '14px 0 10px',
  },
  optional: { fontSize: 12, fontWeight: 400, color: '#9CA3AF' },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    borderBottom: '1px solid #F0F0F0', padding: '12px 0',
  },
  inputIcon: { fontSize: 16, flexShrink: 0 },
  input: {
    flex: 1, fontSize: 14, color: '#1A1A2E',
    border: 'none', outline: 'none', background: 'transparent',
  },
  summary: {
    background: '#fff', borderRadius: 16, padding: '14px 16px',
    marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '4px 0',
  },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 15, fontWeight: 700, color: '#1A1A2E' },
  payBtn: {
    width: '100%', padding: '16px 0', borderRadius: 16,
    background: '#5B67F8', color: '#fff', fontSize: 15, fontWeight: 700,
    boxShadow: '0 4px 16px rgba(91,103,248,0.4)', marginBottom: 8,
  },
  error: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    marginTop: 20, padding: '12px 28px', borderRadius: 14,
    background: '#5B67F8', color: '#fff', fontSize: 14, fontWeight: 600,
  },
};
