import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function ProductModal({ product, onClose }) {
  const { dispatch } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product?.hasVariants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
    setPhotoIdx(0);
  }, [product]);

  if (!product) return null;

  const price = selectedVariant?.price ?? product.price;
  const images = (product.images || []).map(getImageUrl).filter(Boolean);
  if (!images.length && product.imageUrl) images.push(getImageUrl(product.imageUrl));
  const currentImage = images[photoIdx] || null;

  function handleAdd() {
    dispatch({
      type: 'ADD',
      item: {
        productId: product.id,
        variantId: selectedVariant?.id || null,
        name: product.name,
        variantName: selectedVariant
          ? selectedVariant.characteristics.map((c) => c.value).join(', ')
          : null,
        price,
        imageUrl: images[0] || null,
      },
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 700);
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />

        {/* Photo gallery */}
        <div style={styles.gallery}>
          {currentImage ? (
            <img src={currentImage} alt={product.name} style={styles.image} />
          ) : (
            <div style={styles.imagePlaceholder}><span style={{ fontSize: 56 }}>🛍️</span></div>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div style={styles.dots}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setPhotoIdx(i); }}
                  style={{ ...styles.dot, ...(i === photoIdx ? styles.dotActive : {}) }}
                />
              ))}
            </div>
          )}

          {/* Arrow navigation */}
          {images.length > 1 && photoIdx > 0 && (
            <button style={{ ...styles.arrow, left: 10 }}
              onClick={(e) => { e.stopPropagation(); setPhotoIdx(photoIdx - 1); }}>‹</button>
          )}
          {images.length > 1 && photoIdx < images.length - 1 && (
            <button style={{ ...styles.arrow, right: 10 }}
              onClick={(e) => { e.stopPropagation(); setPhotoIdx(photoIdx + 1); }}>›</button>
          )}
        </div>

        <div style={styles.body}>
          <h2 style={styles.name}>{product.name}</h2>
          {product.description && <p style={styles.desc}>{product.description}</p>}

          {/* Variants */}
          {product.hasVariants && product.variants.length > 0 && (
            <div style={styles.variantsSection}>
              <p style={styles.variantsLabel}>Вариант:</p>
              <div style={styles.variantsGrid}>
                {product.variants.map((v) => {
                  const label = v.characteristics.map((c) => c.value).join(' / ');
                  const isActive = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{ ...styles.variantBtn, ...(isActive ? styles.variantBtnActive : {}) }}
                    >
                      <span style={{ ...styles.variantLabel, color: isActive ? '#5B67F8' : '#1A1A2E' }}>
                        {label}
                      </span>
                      {v.price != null && (
                        <span style={styles.variantPrice}>{formatPrice(v.price)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={styles.footer}>
            <span style={styles.price}>{formatPrice(price)}</span>
            <button
              onClick={handleAdd}
              style={{ ...styles.addBtn, ...(added ? styles.addBtnAdded : {}) }}
            >
              {added ? '✓ Добавлено' : 'В корзину'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    zIndex: 200, display: 'flex', alignItems: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    width: '100%', background: '#fff',
    borderRadius: '24px 24px 0 0',
    maxHeight: '92vh', overflowY: 'auto',
    animation: 'slideUp 0.25s ease',
  },
  handle: {
    width: 40, height: 4, background: '#E5E7EB',
    borderRadius: 2, margin: '12px auto 0',
  },
  gallery: {
    position: 'relative', marginTop: 8,
    background: '#F5F6FA',
  },
  image: { width: '100%', height: 280, objectFit: 'contain', background: '#F5F6FA' },
  imagePlaceholder: {
    height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dots: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', gap: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(0,0,0,0.2)', transition: 'all 0.2s',
  },
  dotActive: { background: '#1A1A2E', width: 18, borderRadius: 3 },
  arrow: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)', fontSize: 22,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#1A1A2E', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  body: { padding: '16px 20px 40px' },
  name: { fontSize: 19, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 },
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 },
  variantsSection: { marginBottom: 20 },
  variantsLabel: { fontSize: 13, fontWeight: 600, color: '#9CA3AF', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  variantsGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  variantBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 16px', borderRadius: 12,
    border: '1.5px solid #E5E7EB', background: '#FAFAFA',
    cursor: 'pointer', transition: 'all 0.15s', minWidth: 70,
  },
  variantBtnActive: { border: '1.5px solid #5B67F8', background: '#EEF0FF' },
  variantLabel: { fontSize: 13, fontWeight: 600 },
  variantPrice: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  footer: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 24,
  },
  price: { fontSize: 22, fontWeight: 700, color: '#1A1A2E' },
  addBtn: {
    padding: '14px 28px', borderRadius: 14, fontSize: 15,
    fontWeight: 600, background: '#1A1A2E', color: '#fff', transition: 'all 0.2s',
  },
  addBtnAdded: { background: '#22C55E' },
};
