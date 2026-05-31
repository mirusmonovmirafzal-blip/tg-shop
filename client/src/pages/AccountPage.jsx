import { useState, useEffect } from 'react';

const tg = window.Telegram?.WebApp;

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AccountPage() {
  const user = tg?.initDataUnsafe?.user;
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersOpen, setOrdersOpen] = useState(false);

  useEffect(() => {
    if (!tg?.CloudStorage) { setLoadingOrders(false); return; }
    tg.CloudStorage.getItem('orders', (err, val) => {
      if (!err && val) {
        try { setOrders(JSON.parse(val)); } catch { }
      }
      setLoadingOrders(false);
    });
  }, []);

  function openSupport() {
    const url = 'https://t.me/wishesuz';
    if (tg) tg.openLink(url);
    else window.open(url, '_blank');
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Аккаунт</h1>
      </div>

      <div style={s.scroll}>
        {/* Profile card */}
        <div style={s.profileCard}>
          {user?.photo_url ? (
            <img src={user.photo_url} alt="" style={s.avatar} />
          ) : (
            <div style={s.avatarPlaceholder}>
              {user ? (user.first_name || 'U')[0].toUpperCase() : '🐝'}
            </div>
          )}
          <div>
            <p style={s.userName}>
              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Гость'}
            </p>
            {user?.username && <p style={s.userHandle}>@{user.username}</p>}
            {user?.phone_number && <p style={s.userHandle}>{user.phone_number}</p>}
          </div>
        </div>

        {/* My Orders */}
        <div style={s.card}>
          <button style={s.menuRow} onClick={() => setOrdersOpen(o => !o)}>
            <div style={s.menuLeft}>
              <span style={s.menuIcon}>📦</span>
              <span style={s.menuLabel}>Мои заказы</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {orders.length > 0 && (
                <span style={s.badge}>{orders.length}</span>
              )}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B89A60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: ordersOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          {ordersOpen && (
            <div style={s.ordersSection}>
              {loadingOrders ? (
                <p style={s.ordersEmpty}>Загрузка...</p>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: 28 }}>📭</p>
                  <p style={s.ordersEmpty}>Заказов пока нет</p>
                </div>
              ) : (
                orders.map((order, i) => (
                  <div key={order.id || i} style={s.orderRow}>
                    <div>
                      <p style={s.orderDate}>{formatDate(order.date)}</p>
                      <p style={s.orderItems}>{order.itemCount} товар(а)</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={s.orderTotal}>{formatPrice(order.total)}</p>
                      <span style={s.orderStatus}>оплачен</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Menu */}
        <div style={s.card}>
          <button style={s.menuRow} onClick={openSupport}>
            <div style={s.menuLeft}>
              <span style={s.menuIcon}>💬</span>
              <span style={s.menuLabel}>Поддержка</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B89A60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Info card */}
        <div style={s.card}>
          <InfoRow icon="🐝" label="Магазин" value="Baby Bee" />
          <InfoRow icon="🚚" label="Бесплатная доставка" value="от 800 000 сум" last />
        </div>

        {/* Bee illustration */}
        <div style={s.beeCard}>
          <p style={{ fontSize: 48, marginBottom: 8 }}>🐝🍯</p>
          <p style={s.beeTitle}>Спасибо, что выбираете Baby Bee!</p>
          <p style={s.beeText}>Мы заботимся о самых маленьких вместе с вами ❤️</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, last }) {
  return (
    <div style={{ ...s.menuRow, borderBottom: last ? 'none' : '1px solid #F5F5F5', cursor: 'default' }}>
      <div style={s.menuLeft}>
        <span style={s.menuIcon}>{icon}</span>
        <div>
          <p style={{ fontSize: 11, color: '#B89A60', marginBottom: 1 }}>{label}</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#3D2400' }}>{value}</p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFBF0', paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' },
  header: {
    padding: '14px 16px 12px', background: '#FFFBF0',
    borderBottom: '1px solid #F0E6CC',
    display: 'flex', justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: 800, color: '#3D2400' },
  scroll: { flex: 1, overflowY: 'auto', padding: '16px' },
  profileCard: {
    background: '#fff', borderRadius: 20, padding: '20px',
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12,
    border: '1.5px solid #F0E6CC', boxShadow: '0 2px 10px rgba(245,166,35,0.08)',
  },
  avatar: { width: 60, height: 60, borderRadius: '50%', flexShrink: 0, border: '2px solid #F0E6CC' },
  avatarPlaceholder: {
    width: 60, height: 60, borderRadius: '50%',
    background: '#F5A623', color: '#fff', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, fontWeight: 700,
  },
  userName: { fontSize: 17, fontWeight: 700, color: '#3D2400' },
  userHandle: { fontSize: 13, color: '#B89A60', marginTop: 2 },
  card: {
    background: '#fff', borderRadius: 16, marginBottom: 12,
    border: '1px solid #F0E6CC', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
    overflow: 'hidden',
  },
  menuRow: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px', border: 'none', background: 'transparent', cursor: 'pointer',
    borderBottom: '1px solid #F5F5F5',
  },
  menuLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  menuIcon: { fontSize: 20 },
  menuLabel: { fontSize: 15, fontWeight: 600, color: '#3D2400' },
  badge: {
    background: '#F5A623', color: '#fff', fontSize: 11, fontWeight: 700,
    borderRadius: 10, padding: '2px 7px', minWidth: 20, textAlign: 'center',
  },
  ordersSection: { padding: '0 16px 8px' },
  ordersEmpty: { fontSize: 13, color: '#B89A60', textAlign: 'center', padding: '8px 0' },
  orderRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid #F5F5F5',
  },
  orderDate: { fontSize: 13, fontWeight: 600, color: '#3D2400' },
  orderItems: { fontSize: 11, color: '#B89A60', marginTop: 2 },
  orderTotal: { fontSize: 14, fontWeight: 700, color: '#3D2400' },
  orderStatus: { fontSize: 11, color: '#22C55E', fontWeight: 600 },
  beeCard: {
    background: 'linear-gradient(135deg, #FFF3C4, #FFFBF0)', borderRadius: 20,
    padding: '24px 20px', textAlign: 'center',
    border: '1.5px solid #F0E6CC',
  },
  beeTitle: { fontSize: 16, fontWeight: 800, color: '#3D2400', marginBottom: 6 },
  beeText: { fontSize: 13, color: '#B89A60', lineHeight: 1.5 },
};
