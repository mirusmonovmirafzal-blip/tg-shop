const tg = window.Telegram?.WebApp;

export default function AccountPage() {
  const user = tg?.initDataUnsafe?.user;

  function openSupport() {
    const url = 'https://t.me/wishesuz';
    if (tg) tg.openLink(url);
    else window.open(url, '_blank');
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}><h1 style={styles.title}>Аккаунт</h1></div>
      <div style={styles.scroll}>
        {/* Profile */}
        <div style={styles.profileCard}>
          {user?.photo_url ? (
            <img src={user.photo_url} alt="" style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {user ? (user.first_name || 'U')[0].toUpperCase() : '👤'}
            </div>
          )}
          <div>
            <p style={styles.userName}>
              {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Гость'}
            </p>
            {user?.username && <p style={styles.userHandle}>@{user.username}</p>}
          </div>
        </div>

        {/* Info */}
        <div style={styles.card}>
          <Row icon="🐝" label="Магазин" value="Baby Bee" />
          <Row icon="📦" label="Доставка" value="Уточняйте при заказе" />
          <Row icon="💳" label="Оплата" value="Click" />
        </div>

        {/* Support button */}
        <button onClick={openSupport} style={styles.supportBtn}>
          <span style={{ fontSize: 20 }}>💬</span>
          <span>Написать в поддержку</span>
        </button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.rowIcon}>{icon}</span>
      <div style={styles.rowText}>
        <span style={styles.rowLabel}>{label}</span>
        <span style={styles.rowValue}>{value}</span>
      </div>
    </div>
  );
}

const styles = {
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: '#F5F6FA', paddingBottom: 88 },
  header: { padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid #F0F0F0' },
  title: { fontSize: 20, fontWeight: 800, color: '#1A1A2E', textAlign: 'center' },
  scroll: { flex: 1, overflowY: 'auto', padding: '16px' },
  profileCard: {
    background: '#fff', borderRadius: 16, padding: '20px',
    display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12,
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  avatar: { width: 56, height: 56, borderRadius: '50%', flexShrink: 0 },
  avatarPlaceholder: {
    width: 56, height: 56, borderRadius: '50%',
    background: '#1A1A2E', color: '#fff', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 700,
  },
  userName: { fontSize: 17, fontWeight: 700, color: '#1A1A2E' },
  userHandle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  card: {
    background: '#fff', borderRadius: 16, padding: '4px 16px',
    marginBottom: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 0', borderBottom: '1px solid #F5F5F5',
  },
  rowIcon: { fontSize: 18, flexShrink: 0 },
  rowText: { display: 'flex', flexDirection: 'column', gap: 2 },
  rowLabel: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4 },
  rowValue: { fontSize: 14, fontWeight: 600, color: '#1A1A2E' },
  supportBtn: {
    width: '100%', padding: '16px', borderRadius: 16,
    background: '#1A1A2E', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    fontSize: 15, fontWeight: 600,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  },
};
