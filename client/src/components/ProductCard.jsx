import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function ProductCard({ product, onOpenModal }) {
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  // Touch swipe state
  const touchStartX = useRef(null);

  const images = (product.images || []).map(getImageUrl).filter(Boolean);
  if (!images.length && product.imageUrl) images.push(getImageUrl(product.imageUrl));
  const currentImage = images[imgIdx] || null;

  const price = product.price;

  function handlePlus(e) {
    e.stopPropagation();
    if (product.hasVariants && product.variants?.length > 0) {
      onOpenModal(product);
    } else {
      dispatch({
        type: 'ADD',
        item: {
          productId: product._realProductId || product.id,
          variantId: product._variantId || null,
          name: product.name,
          variantName: null,
          price,
          imageUrl: images[0] || null,
        },
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 700);
    }
  }

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 30) return; // not a swipe
    e.stopPropagation();
    if (dx < 0 && imgIdx < images.length - 1) setImgIdx((i) => i + 1);
    if (dx > 0 && imgIdx > 0) setImgIdx((i) => i - 1);
  }

  return (
    <div style={styles.card} onClick={() => onOpenModal(product)}>
      {/* Image with swipe */}
      <div
        style={styles.imageWrap}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {currentImage ? (
          <img
            key={imgIdx}
            src={currentImage}
            alt={product.name}
            style={{ ...styles.image, animation: 'fadeIn 0.2s ease' }}
            loading="lazy"
          />
        ) : (
          <div style={styles.placeholder}>🛍️</div>
        )}

        {/* Photo dots */}
        {images.length > 1 && (
          <div style={styles.dots}>
            {images.map((_, i) => (
              <div
                key={i}
                style={{ ...styles.dot, ...(i === imgIdx ? styles.dotActive : {}) }}
              />
            ))}
          </div>
        )}
      </div>

      <div style={styles.body}>
        <p style={styles.name}>{product.name}</p>
        <div style={styles.footer}>
          <span style={styles.price}>{formatPrice(price)}</span>
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
    width: '100%', paddingTop: '133.33%',
    position: 'relative', background: '#F5F6FA', overflow: 'hidden',
  },
  image: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%', objectFit: 'cover',
  },
  placeholder: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
  },
  dots: {
    position: 'absolute', bottom: 8, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', gap: 4,
  },
  dot: {
    width: 4, height: 4, borderRadius: '50%',
    background: 'rgba(255,255,255,0.5)',
  },
  dotActive: { background: '#fff', width: 12, borderRadius: 2 },
  body: { padding: '10px 10px 12px' },
  name: {
    fontSize: 12, fontWeight: 500, color: '#1A1A2E', lineHeight: 1.4, marginBottom: 8,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
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
