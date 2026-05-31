const tg = window.Telegram?.WebApp;

export default function AccountPage() {
  const user = tg?.initDataUnsafe?.user;

  return (
    <div style={styles.page}>
      <div style={styles.header}><h1 style={styles.headerTitle}>Аккаунт</h1></div>
      <div style={styles.scroll}>
        {user ? (
          <div style={styles.profileCard}>
            {user.photo_url ? (
              <img src={user.photo_url} alt="" style={styles.avatar} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {(user.first_name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p style={styles.userName}>{user.first_name} {user.last_name || ''}</p>
              {user.username && <p style={styles.userHandle}>@{user.username}</p>}
            </div>
          </div>
        ) : (
          <div style={styles.profileCard}>
            <div style={styles.avatarPlaceholder}>👤</div>
            <p style={styles.userName}>Гость</p>
          </div>
        )}

        <div style={styles.infoCard}>
          <InfoRow icon="🛍️" label="Магазин" value="Baby Bee" />
          <InfoRow icon="📞" label="Поддержка" value="Написать в Telegram" link />
          <InfoRow icon="📦" label="Доставка" value="Уточняйте при заказе" />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, link }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoIcon}>{icon}</span>
      <div style={styles.infoText}>
        <span style={styles.infoLabel}>{label}</span>
        <span style={{ ...styles.infoValue, color: link ? '#5B67F8' : '#1A1A2E' }}>{value}</span>
      </div>
    </div>
  );
}

const styles = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F6FA', paddingBottom: 88 },
  header: { padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid #F0F0F0' },
  headerTitle: { fontSize: 20, fontWeight: 800, color: '#1A1A2E' },
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
  infoCard: {
    background: '#fff', borderRadius: 16, padding: '4px 16px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  infoRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 0', borderBottom: '1px solid #F5F5F5',
  },
  infoIcon: { fontSize: 18, flexShrink: 0 },
  infoText: { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue: { fontSize: 14, fontWeight: 600 },
};
