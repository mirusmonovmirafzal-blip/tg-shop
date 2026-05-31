import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function CartItem({ item }) {
  const { dispatch } = useCart();

  return (
    <div style={styles.row}>
      <div style={styles.imageWrap}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} style={styles.image} />
        ) : (
          <div style={styles.imagePlaceholder}>🛍️</div>
        )}
      </div>
      <div style={styles.info}>
        <p style={styles.name}>{item.name}</p>
        {item.variantName && <p style={styles.variant}>{item.variantName}</p>}
        <p style={styles.price}>{formatPrice(item.price)}</p>
      </div>
      <div style={styles.controls}>
        <button style={styles.btn} onClick={() => dispatch({ type: 'DECREMENT', key: item.key })}>−</button>
        <span style={styles.qty}>{item.quantity}</span>
        <button style={styles.btn} onClick={() => dispatch({ type: 'INCREMENT', key: item.key })}>+</button>
      </div>
    </div>
  );
}

const styles = {
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 0', borderBottom: '1px solid #F0F0F0',
  },
  imageWrap: {
    width: 64, height: 64, borderRadius: 12,
    overflow: 'hidden', background: '#F5F6FA', flexShrink: 0,
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: 600, color: '#1A1A2E', marginBottom: 2 },
  variant: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: 700, color: '#5B67F8' },
  controls: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  btn: {
    width: 32, height: 32, borderRadius: 10,
    background: '#F5F6FA', fontSize: 18, color: '#5B67F8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 600, lineHeight: 1,
  },
  qty: { fontSize: 15, fontWeight: 700, color: '#1A1A2E', minWidth: 20, textAlign: 'center' },
};
