import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { createOrder } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

const tg = window.Telegram?.WebApp;

export default function CartPage() {
  const { items, total, dispatch } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleOrder() {
    if (items.length === 0) return;
    setLoading(true); setError('');
    try {
      const user = tg?.initDataUnsafe?.user;
      const { paymentUrl } = await createOrder({
        items: items.map((i) => ({
          productId: i.productId, variantId: i.variantId,
          name: i.name, variantName: i.variantName,
          price: i.price, quantity: i.quantity,
        })),
        customerName: name || null,
        customerPhone: phone || null,
        customerAddress: address || null,
        telegramUserId: user?.id || null,
        telegramUsername: user?.username || null,
      });
      dispatch({ type: 'CLEAR' });
      if (tg) tg.openLink(paymentUrl);
      else window.location.href = paymentUrl;
    } catch {
      setError('Ошибка оформления. Попробуйте снова.');
    } finally { setLoading(false); }
  }

  if (items.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.header}><h1 style={styles.title}>Корзина</h1></div>
        <div style={styles.empty}>
          <p style={{ fontSize: 52 }}>🛒</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>Корзина пуста</p>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>Добавьте товары из каталога</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}><h1 style={styles.title}>Корзина</h1></div>

      {/* Scrollable area stops before sticky footer */}
      <div style={styles.scroll}>
        <div style={styles.section}>
          {items.map((item) => <CartItem key={item.key} item={item} />)}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Данные для заказа</h3>
          <Field placeholder="Ваше имя" value={name} onChange={setName} icon="👤" />
          <Field placeholder="+998 __ ___ __ __" value={phone} onChange={setPhone} icon="📞" type="tel" />
          <Field placeholder="Адрес доставки" value={address} onChange={setAddress} icon="📍" />
        </div>

        <div style={styles.summary}>
          <div style={styles.row}>
            <span style={styles.lbl}>Товаров</span>
            <span style={styles.val}>{items.reduce((s, i) => s + i.quantity, 0)} шт.</span>
          </div>
          <div style={{ ...styles.row, marginTop: 8 }}>
            <span style={{ ...styles.lbl, fontSize: 16, fontWeight: 700, color: '#1A1A2E' }}>Итого</span>
            <span style={{ ...styles.val, fontSize: 18, fontWeight: 800, color: '#1A1A2E' }}>{formatPrice(total)}</span>
          </div>
        </div>

        {error && <p style={styles.err}>{error}</p>}
      </div>

      {/* Sticky pay button — stays visible even when keyboard opens */}
      <div style={styles.stickyFooter}>
        <button onClick={handleOrder} disabled={loading} style={styles.payBtn}>
          {loading ? 'Оформление...' : `Оплатить через Click • ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
}

function Field({ placeholder, value, onChange, icon, type = 'text' }) {
  return (
    <div style={styles.field}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, fontSize: 14, color: '#1A1A2E', border: 'none', outline: 'none', background: 'transparent' }}
      />
    </div>
  );
}

const styles = {
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: '#F5F6FA' },
  header: { padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid #F0F0F0', flexShrink: 0 },
  title: { fontSize: 20, fontWeight: 800, color: '#1A1A2E', textAlign: 'center' },
  scroll: { flex: 1, overflowY: 'auto', padding: '12px 16px 8px' },
  section: {
    background: '#fff', borderRadius: 16, padding: '4px 16px 8px',
    marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#1A1A2E', padding: '12px 0 8px' },
  field: {
    display: 'flex', alignItems: 'center', gap: 10,
    borderBottom: '1px solid #F5F5F5', padding: '12px 0',
  },
  summary: {
    background: '#fff', borderRadius: 16, padding: '16px',
    marginBottom: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lbl: { fontSize: 14, color: '#6B7280' },
  val: { fontSize: 15, fontWeight: 600 },
  err: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  stickyFooter: {
    flexShrink: 0,
    padding: '12px 16px 96px',
    background: '#F5F6FA',
  },
  payBtn: {
    width: '100%', padding: '16px 0', borderRadius: 16,
    background: '#1A1A2E', color: '#fff', fontSize: 15, fontWeight: 700,
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
};
