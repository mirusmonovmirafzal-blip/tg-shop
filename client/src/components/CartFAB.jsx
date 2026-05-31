import { useCart } from '../context/CartContext';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function CartFAB({ onClick }) {
  const { count, total } = useCart();
  if (count === 0) return null;

  return (
    <button onClick={onClick} style={styles.fab}>
      <span style={styles.icon}>🛒</span>
      <span style={styles.text}>Корзина • {formatPrice(total)}</span>
      <span style={styles.badge}>{count}</span>
    </button>
  );
}

const styles = {
  fab: {
    position: 'fixed',
    bottom: 20,
    left: 16,
    right: 16,
    height: 56,
    background: '#5B67F8',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: 10,
    boxShadow: '0 4px 20px rgba(91,103,248,0.45)',
    zIndex: 50,
    cursor: 'pointer',
    animation: 'slideUp 0.2s ease',
  },
  icon: { fontSize: 20 },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    textAlign: 'left',
  },
  badge: {
    background: '#fff',
    color: '#5B67F8',
    fontWeight: 700,
    fontSize: 13,
    borderRadius: 20,
    padding: '2px 9px',
    minWidth: 26,
    textAlign: 'center',
  },
};
