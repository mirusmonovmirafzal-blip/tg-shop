import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getImageUrl, fetchProducts } from '../api';
import { getVariantMode, expandColorVariants } from '../utils/variantMode';
import ProductCard from '../components/ProductCard';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function ProductPage({ product, onBack, onOpenProduct }) {
  const { dispatch } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    if (!product) return;
    setPhotoIdx(0);
    setQty(1);
    setAdded(false);
    if (product.hasVariants && product.variants?.length > 0) {
      const pre = product._preselectedVariantId;
      setSelectedVariant(pre ? product.variants.find((v) => v.id === pre) || product.variants[0] : product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product?.id]);

  // Load similar products from same category
  useEffect(() => {
    if (!product?.categoryId) { setSimilar([]); return; }
    fetchProducts({ categoryId: product.categoryId, limit: 12 })
      .then((d) => {
        const realId = product._realProductId || product.id;
        const list = [];
        for (const p of d.products) {
          if (p.id === realId) continue;
          if (!p.hasVariants || !p.variants.length) { list.push(p); continue; }
          const mode = getVariantMode(p.variants);
          if (mode === 'color') list.push(...expandColorVariants(p));
          else list.push(p);
        }
        setSimilar(list.slice(0, 10));
      })
      .catch(() => setSimilar([]));
  }, [product?.id, product?.categoryId]);

  if (!product) return null;

  const price = selectedVariant?.price ?? product.price;
  const images = (product.images || []).map(getImageUrl).filter(Boolean);
  if (!images.length && product.imageUrl) images.push(getImageUrl(product.imageUrl));
  const currentImage = images[photoIdx] || null;

  const isColorMode = product.variants?.some((v) =>
    v.characteristics?.some((c) => ['color', 'colour', 'цвет', 'rang'].includes(c.name.toLowerCase()))
  );

  function handleAdd() {
    dispatch({
      type: 'ADD',
      item: {
        productId: product._realProductId || product.id,
        variantId: selectedVariant?.id || null,
        name: product.name,
        variantName: selectedVariant ? selectedVariant.characteristics.map((c) => c.value).join(', ') : null,
        price,
        quantity: qty,
        imageUrl: images[0] || null,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D2400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={s.title}>Товар</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Scroll content */}
      <div style={s.scroll}>
        {/* Gallery */}
        <div style={s.gallery}>
          {currentImage ? (
            <img key={photoIdx} src={currentImage} alt={product.name} style={s.image} />
          ) : (
            <div style={s.noImg}><span style={{ fontSize: 64 }}>🛍️</span></div>
          )}
          {images.length > 1 && (
            <>
              <div style={s.dots}>
                {images.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)} style={{ ...s.dot, ...(i === photoIdx ? s.dotActive : {}) }} />
                ))}
              </div>
              {photoIdx > 0 && (
                <button style={{ ...s.arrow, left: 12 }} onClick={() => setPhotoIdx(photoIdx - 1)}>‹</button>
              )}
              {photoIdx < images.length - 1 && (
                <button style={{ ...s.arrow, right: 12 }} onClick={() => setPhotoIdx(photoIdx + 1)}>›</button>
              )}
            </>
          )}
        </div>

        <div style={s.body}>
          <h2 style={s.name}>{product.name}</h2>

          <div style={s.priceRow}>
            <span style={s.price}>{formatPrice(price)}</span>
            <span style={s.inStock}>● В наличии</span>
          </div>

          {product.description && <p style={s.desc}>{product.description}</p>}

          {/* Variants */}
          {product.hasVariants && product.variants?.length > 0 && (
            <div style={s.variantsSection}>
              <p style={s.variantsLabel}>{isColorMode ? 'Цвет:' : 'Размер:'}</p>
              <div style={s.variantsWrap}>
                {product.variants.map((v) => {
                  const label = v.characteristics.map((c) => c.value).join(' / ');
                  const isActive = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      style={{ ...s.variantBtn, ...(isActive ? s.variantBtnActive : {}) }}
                    >
                      <span style={{ ...s.variantLabel, color: isActive ? '#fff' : '#3D2400' }}>{label}</span>
                      {v.price != null && (
                        <span style={{ ...s.variantPrice, color: isActive ? 'rgba(255,255,255,0.8)' : '#B89A60' }}>
                          {formatPrice(v.price)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity stepper */}
          <div style={s.qtyRow}>
            <span style={s.qtyLabel}>Количество</span>
            <div style={s.stepper}>
              <button style={s.stepBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span style={s.qtyVal}>{qty}</span>
              <button style={s.stepBtn} onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          {/* Similar products */}
          {similar.length > 0 && (
            <div style={s.similarSection}>
              <h3 style={s.similarTitle}>Похожие товары</h3>
              <div style={s.similarScroll}>
                {similar.map((p) => (
                  <div key={p.id} style={s.similarCard}>
                    <ProductCard product={p} onOpenModal={onOpenProduct} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div style={s.footer}>
        <button onClick={handleAdd} style={{ ...s.addBtn, ...(added ? s.addBtnDone : {}) }}>
          {added ? '✓ Добавлено в корзину' : `Добавить в корзину • ${formatPrice(price * qty)}`}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFBF0' },
  header: {
    padding: '12px 16px', background: '#FFFBF0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #F0E6CC', flexShrink: 0,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, border: 'none',
    background: '#FFF3C4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  title: { fontSize: 17, fontWeight: 800, color: '#3D2400', textAlign: 'center', flex: 1 },
  scroll: { flex: 1, overflowY: 'auto' },
  gallery: { position: 'relative', background: '#fff', borderBottom: '1px solid #F0E6CC' },
  image: { width: '100%', height: 320, objectFit: 'contain', background: '#fff', animation: 'fadeIn 0.2s' },
  noImg: { height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'rgba(61,36,0,0.2)', border: 'none', padding: 0, cursor: 'pointer' },
  dotActive: { background: '#F5A623', width: 18, borderRadius: 3 },
  arrow: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 34, height: 34, borderRadius: '50%', border: 'none',
    background: 'rgba(255,255,255,0.95)', fontSize: 24, color: '#3D2400',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  body: { padding: '18px 18px 24px' },
  name: { fontSize: 21, fontWeight: 800, color: '#3D2400', lineHeight: 1.3, marginBottom: 12 },
  priceRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  price: { fontSize: 24, fontWeight: 800, color: '#3D2400' },
  inStock: { fontSize: 13, fontWeight: 600, color: '#22C55E' },
  desc: { fontSize: 14, color: '#6B5A38', lineHeight: 1.6, marginBottom: 20 },
  variantsSection: { marginBottom: 20 },
  variantsLabel: { fontSize: 12, fontWeight: 700, color: '#B89A60', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  variantsWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  variantBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '10px 16px', borderRadius: 14,
    background: '#fff', border: '1.5px solid #F0E6CC', cursor: 'pointer', transition: 'all 0.15s',
  },
  variantBtnActive: { background: '#F5A623', border: '1.5px solid #F5A623' },
  variantLabel: { fontSize: 13, fontWeight: 700 },
  variantPrice: { fontSize: 10, marginTop: 2 },
  qtyRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  qtyLabel: { fontSize: 15, fontWeight: 700, color: '#3D2400' },
  stepper: { display: 'flex', alignItems: 'center', gap: 4, background: '#fff', borderRadius: 14, border: '1.5px solid #F0E6CC', padding: 4 },
  stepBtn: {
    width: 38, height: 38, borderRadius: 10, border: 'none', background: '#FFF3C4',
    fontSize: 22, fontWeight: 600, color: '#3D2400', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  qtyVal: { minWidth: 36, textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#3D2400' },
  similarSection: { marginTop: 8 },
  similarTitle: { fontSize: 17, fontWeight: 800, color: '#3D2400', marginBottom: 12 },
  similarScroll: { display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 4, margin: '0 -18px', padding: '0 18px 4px' },
  similarCard: { flexShrink: 0, width: 150 },
  footer: {
    flexShrink: 0, padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
    background: '#FFFBF0', borderTop: '1px solid #F0E6CC',
  },
  addBtn: {
    width: '100%', padding: '16px 0', borderRadius: 16, border: 'none',
    background: '#F5A623', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(245,166,35,0.35)', transition: 'all 0.2s',
  },
  addBtnDone: { background: '#22C55E', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' },
};
