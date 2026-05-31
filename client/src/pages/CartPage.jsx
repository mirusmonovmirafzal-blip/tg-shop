import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { createOrder } from '../api';

const FREE_DELIVERY = 800000;
const DELIVERY_FEE = 30000;

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

  const deliveryLeft = Math.max(0, FREE_DELIVERY - total);
  const deliveryPct = Math.min(100, (total / FREE_DELIVERY) * 100);
  const isFreeDelivery = total >= FREE_DELIVERY;

  async function handleOrder() {
    if (items.length === 0) return;
    setLoading(true); setError('');
    try {
      const user = tg?.initDataUnsafe?.user;
      const { paymentUrl, orderId } = await createOrder({
        items: items.map(i => ({
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

      // Save order to Telegram CloudStorage
      if (tg?.CloudStorage) {
        try {
          tg.CloudStorage.getItem('orders', (err, val) => {
            const saved = JSON.parse(val || '[]');
            saved.unshift({
              id: orderId || Date.now(),
              date: new Date().toISOString(),
              total,
              itemCount: items.reduce((s, i) => s + i.quantity, 0),
              status: 'pending',
            });
            tg.CloudStorage.setItem('orders', JSON.stringify(saved.slice(0, 20)));
          });
        } catch { /* ignore */ }
      }

      dispatch({ type: 'CLEAR' });
      if (tg) tg.openLink(paymentUrl);
      else window.location.href = paymentUrl;
    } catch {
      setError('Ошибка оформления. Попробуйте снова.');
    } finally { setLoading(false); }
  }

  if (items.length === 0) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>Корзина</h1>
        </div>
        <div style={s.empty}>
          <p style={{ fontSize: 52 }}>🛒</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#3D2400', marginTop: 12 }}>Корзина пуста</p>
          <p style={{ fontSize: 13, color: '#B89A60', marginTop: 6 }}>Добавьте товары из каталога</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Корзина</h1>
        <button style={s.clearBtn} onClick={() => dispatch({ type: 'CLEAR' })}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B89A60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      <div style={s.scroll}>
        {/* Delivery progress */}
        <div style={s.deliveryCard}>
          <span style={{ fontSize: 22 }}>🚚</span>
          <div style={{ flex: 1 }}>
            {isFreeDelivery ? (
              <p style={s.deliveryText}><b>Бесплатная доставка! 🎉</b></p>
            ) : (
              <p style={s.deliveryText}>
                Добавьте на <b>{formatPrice(deliveryLeft)}</b> для бесплатной доставки
              </p>
            )}
            <div style={s.progressBg}>
              <div style={{ ...s.progressFill, width: `${deliveryPct}%` }} />
            </div>
            <div style={s.progressLabels}>
              <span>{formatPrice(total)}</span>
              <span>800 000 сум</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={s.section}>
          {items.map(item => <CartItem key={item.key} item={item} />)}
        </div>

        {/* Order form */}
        <div style={s.section}>
          <h3 style={s.sectionTitle}>Данные для доставки</h3>
          <Field placeholder="Ваше имя" value={name} onChange={setName} icon="👤" />
          <Field placeholder="+998 __ ___ __ __" value={phone} onChange={setPhone} icon="📞" type="tel" />
          <Field placeholder="Адрес доставки" value={address} onChange={setAddress} icon="📍" />
        </div>

        {/* Summary */}
        <div style={s.summary}>
          <div style={s.row}>
            <span style={s.lbl}>Товаров</span>
            <span style={s.val}>{items.reduce((sum, i) => sum + i.quantity, 0)} шт.</span>
          </div>
          <div style={{ ...s.row, marginTop: 6 }}>
            <span style={s.lbl}>Доставка</span>
            <span style={{ ...s.val, color: isFreeDelivery ? '#22C55E' : '#3D2400' }}>
              {isFreeDelivery ? 'Бесплатно' : formatPrice(DELIVERY_FEE)}
            </span>
          </div>
          <div style={{ height: 1, background: '#F0E6CC', margin: '12px 0' }} />
          <div style={s.row}>
            <span style={{ ...s.lbl, fontSize: 16, fontWeight: 700, color: '#3D2400' }}>Итого</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#3D2400' }}>
              {formatPrice(total + (isFreeDelivery ? 0 : DELIVERY_FEE))}
            </span>
          </div>
        </div>

        {error && <p style={s.err}>{error}</p>}
      </div>

      <div style={s.stickyFooter}>
        <button onClick={handleOrder} disabled={loading} style={s.payBtn}>
          {loading ? 'Оформление...' : `Оплатить через Click • ${formatPrice(total + (isFreeDelivery ? 0 : DELIVERY_FEE))}`}
        </button>
      </div>
    </div>
  );
}

function Field({ placeholder, value, onChange, icon, type = 'text' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F5F5F5', padding: '12px 0' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, fontSize: 14, color: '#3D2400', border: 'none', outline: 'none', background: 'transparent' }}
      />
    </div>
  );
}

const s = {
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFBF0' },
  header: {
    padding: '14px 16px 12px', background: '#FFFBF0',
    borderBottom: '1px solid #F0E6CC', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  title: { fontSize: 20, fontWeight: 800, color: '#3D2400' },
  clearBtn: {
    position: 'absolute', right: 16,
    width: 36, height: 36, borderRadius: 10, border: 'none',
    background: '#FFF3C4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  scroll: { flex: 1, overflowY: 'auto', padding: '12px 16px 8px' },
  deliveryCard: {
    background: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 14,
    border: '1.5px solid #F0E6CC', boxShadow: '0 2px 10px rgba(245,166,35,0.08)',
  },
  deliveryText: { fontSize: 12, color: '#3D2400', marginBottom: 8, lineHeight: 1.4 },
  progressBg: { height: 6, background: '#F0E6CC', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#F5A623', borderRadius: 4, transition: 'width 0.4s ease' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#B89A60' },
  section: {
    background: '#fff', borderRadius: 16, padding: '4px 16px 8px', marginBottom: 10,
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #F0E6CC',
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#3D2400', padding: '12px 0 8px' },
  summary: {
    background: '#fff', borderRadius: 16, padding: '16px', marginBottom: 10,
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)', border: '1px solid #F0E6CC',
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  lbl: { fontSize: 14, color: '#B89A60' },
  val: { fontSize: 14, fontWeight: 600, color: '#3D2400' },
  err: { color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  stickyFooter: { flexShrink: 0, padding: '12px 16px calc(88px + env(safe-area-inset-bottom))', background: '#FFFBF0' },
  payBtn: {
    width: '100%', padding: '16px 0', borderRadius: 16,
    background: '#F5A623', color: '#fff', fontSize: 15, fontWeight: 700,
    boxShadow: '0 4px 16px rgba(245,166,35,0.35)',
  },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
};
