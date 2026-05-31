export default function SuccessPage({ onBack }) {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <span style={styles.icon}>✅</span>
        </div>
        <h1 style={styles.title}>Оплата прошла!</h1>
        <p style={styles.subtitle}>
          Ваш заказ {orderId ? `#${orderId}` : ''} успешно оформлен.{'\n'}
          Мы свяжемся с вами в ближайшее время.
        </p>
        <button onClick={onBack} style={styles.btn}>
          Вернуться в каталог
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#F5F6FA', padding: 24,
  },
  card: {
    background: '#fff', borderRadius: 24, padding: '40px 24px',
    textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%',
    maxWidth: 360,
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: '50%',
    background: '#F0FDF4', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 20px',
  },
  icon: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: 700, color: '#1A1A2E', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 28 },
  btn: {
    width: '100%', padding: '14px 0', borderRadius: 14,
    background: '#5B67F8', color: '#fff', fontSize: 15, fontWeight: 600,
  },
};
