import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function ProductModal({ product, onClose }) {
  const { dispatch } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product?.hasVariants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (!product) return null;

  const price = selectedVariant?.price ?? product.price;
  const imageUrl = getImageUrl(product.imageUrl);

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
        imageUrl,
      },
    });
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 800);
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />

        {imageUrl ? (
          <img src={imageUrl} alt={product.name} style={styles.image} />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span style={{ fontSize: 48 }}>🛍️</span>
          </div>
        )}

        <div style={styles.body}>
          <h2 style={styles.name}>{product.name}</h2>
          {product.description && <p style={styles.desc}>{product.description}</p>}

          {product.hasVariants && product.variants.length > 0 && (
            <div style={styles.variantsSection}>
              <p style={styles.variantsLabel}>Выберите вариант:</p>
              <div style={styles.variantsGrid}>
                {product.variants.map((v) => {
                  const label = v.characteristics.map((c) => c.value).join(' / ');
                  const isActive = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        ...styles.variantBtn,
                        ...(isActive ? styles.variantBtnActive : {}),
                      }}
                    >
                      <span style={styles.variantLabel}>{label}</span>
                      {v.price && (
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
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    zIndex: 100, display: 'flex', alignItems: 'flex-end',
    animation: 'fadeIn 0.2s ease',
  },
  sheet: {
    width: '100%', background: '#fff', borderRadius: '20px 20px 0 0',
    maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.25s ease',
  },
  handle: {
    width: 40, height: 4, background: '#E5E7EB',
    borderRadius: 2, margin: '12px auto 0',
  },
  image: {
    width: '100%', height: 240, objectFit: 'cover',
    marginTop: 12,
  },
  imagePlaceholder: {
    height: 200, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#F5F6FA', marginTop: 12,
  },
  body: { padding: '16px 20px 32px' },
  name: { fontSize: 20, fontWeight: 700, color: '#1A1A2E', marginBottom: 8 },
  desc: { fontSize: 14, color: '#6B7280', lineHeight: 1.5, marginBottom: 16 },
  variantsSection: { marginBottom: 20 },
  variantsLabel: { fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 10 },
  variantsGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  variantBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 14px', borderRadius: 12,
    border: '1.5px solid #E5E7EB', background: '#F9FAFB',
    cursor: 'pointer', transition: 'all 0.15s', minWidth: 80,
  },
  variantBtnActive: {
    border: '1.5px solid #5B67F8', background: '#EEF0FF',
  },
  variantLabel: { fontSize: 13, fontWeight: 600, color: '#1A1A2E' },
  variantPrice: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  footer: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 24,
  },
  price: { fontSize: 22, fontWeight: 700, color: '#5B67F8' },
  addBtn: {
    padding: '14px 28px', borderRadius: 14, fontSize: 15,
    fontWeight: 600, background: '#5B67F8', color: '#fff',
    transition: 'all 0.2s',
  },
  addBtnAdded: { background: '#22C55E' },
};
