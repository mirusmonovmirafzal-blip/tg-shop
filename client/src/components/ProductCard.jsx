import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function ProductCard({ product, onOpenModal }) {
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);

  const imageUrl = getImageUrl(product.imageUrl);
  const price = product.hasVariants && product.variants.length > 0
    ? (product.variants[0].price ?? product.price)
    : product.price;

  function handlePlus(e) {
    e.stopPropagation();
    if (product.hasVariants && product.variants.length > 0) {
      onOpenModal(product);
    } else {
      dispatch({
        type: 'ADD',
        item: {
          productId: product.id,
          variantId: null,
          name: product.name,
          variantName: null,
          price: product.price,
          imageUrl,
        },
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 700);
    }
  }

  return (
    <div style={styles.card} onClick={() => onOpenModal(product)}>
      <div style={styles.imageWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} style={styles.image} loading="lazy" />
        ) : (
          <div style={styles.placeholder}>🛍️</div>
        )}
      </div>
      <div style={styles.body}>
        <p style={styles.name}>{product.name}</p>
        <div style={styles.footer}>
          <span style={styles.price}>
            {product.hasVariants ? 'от ' : ''}{formatPrice(price)}
          </span>
          <button
            onClick={handlePlus}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              ...styles.addBtn,
              ...(added ? styles.addBtnDone : {}),
              animation: added ? 'cartBounce 0.5s ease' : 'none',
            }}
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: 16,
    overflow: 'hidden', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  imageWrap: {
    width: '100%',
    paddingTop: '133.33%', // 3:4 ratio
    position: 'relative', background: '#F5F6FA',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%', objectFit: 'cover',
  },
  placeholder: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 32,
  },
  body: { padding: '10px 10px 12px' },
  name: {
    fontSize: 12, fontWeight: 500, color: '#1A1A2E',
    lineHeight: 1.4, marginBottom: 8,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 12, fontWeight: 700, color: '#1A1A2E' },
  addBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: '#1A1A2E', color: '#fff',
    fontSize: 20, fontWeight: 300, lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'background 0.2s',
  },
  addBtnDone: { background: '#22C55E', fontSize: 16 },
};
