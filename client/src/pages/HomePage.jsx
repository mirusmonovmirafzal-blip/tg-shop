import { useState, useEffect, useRef } from 'react';
import { fetchCategories, fetchProducts } from '../api';
import { getVariantMode, expandColorVariants } from '../utils/variantMode';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

const BANNERS = [
  { src: '/banners/banner1.png', alt: 'Подгузники' },
  { src: '/banners/banner2.png', alt: 'Ножницы и Расчески' },
  { src: '/banners/banner3.png', alt: 'Детская бутылочка' },
];

const FREE_DELIVERY = 800000;

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p);
}

function expandProducts(products) {
  const result = [];
  for (const p of products) {
    if (!p.hasVariants || !p.variants.length) { result.push(p); continue; }
    const mode = getVariantMode(p.variants);
    if (mode === 'color') result.push(...expandColorVariants(p));
    else result.push(p);
  }
  return result;
}

export default function HomePage({ onCategorySelect }) {
  const { total } = useCart();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loadingRec, setLoadingRec] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  // Auto-advance banner
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setBannerIdx(i => (i + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    fetchCategories()
      .then(cats => setCategories(cats.filter(c => !c.parentId)))
      .catch(console.error);

    fetchProducts({ limit: 8 })
      .then(d => setRecommended(expandProducts(d.products)))
      .catch(console.error)
      .finally(() => setLoadingRec(false));
  }, []);

  const deliveryLeft = Math.max(0, FREE_DELIVERY - total);
  const deliveryPct = Math.min(100, (total / FREE_DELIVERY) * 100);

  function onBannerTouchStart(e) { touchStartX.current = e.touches[0].clientX; }
  function onBannerTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40) return;
    clearInterval(timerRef.current);
    setBannerIdx(i => dx < 0 ? (i + 1) % BANNERS.length : (i - 1 + BANNERS.length) % BANNERS.length);
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.logo}>Baby Bee 🐝</span>
      </div>

      {/* Search bar */}
      <div style={s.searchWrap}>
        <div style={s.searchBar}>
          <span style={{ fontSize: 16, color: '#B89A60' }}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="Поиск товаров"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={s.scroll}>
        {/* Banner Carousel */}
        <div
          style={s.bannerWrap}
          onTouchStart={onBannerTouchStart}
          onTouchEnd={onBannerTouchEnd}
        >
          <img
            key={bannerIdx}
            src={BANNERS[bannerIdx].src}
            alt={BANNERS[bannerIdx].alt}
            style={s.bannerImg}
          />
          <div style={s.bannerDots}>
            {BANNERS.map((_, i) => (
              <button
                key={i}
                style={{ ...s.dot, ...(i === bannerIdx ? s.dotActive : {}) }}
                onClick={() => { clearInterval(timerRef.current); setBannerIdx(i); }}
              />
            ))}
          </div>
        </div>

        {/* Categories */}
        <div style={s.catSection}>
          <div style={s.catScroll}>
            {categories.map(cat => (
              <button key={cat.id} style={s.catItem} onClick={() => onCategorySelect(cat)}>
                <div style={s.catIconWrap}>
                  <img
                    src={`/icons/${encodeURIComponent(cat.name)}.PNG`}
                    alt={cat.name}
                    style={s.catIcon}
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.querySelector('.fallback').style.display = 'flex';
                    }}
                  />
                  <div className="fallback" style={{ ...s.catIconFallback, display: 'none' }}>🐝</div>
                </div>
                <span style={s.catName}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery banner */}
        {total > 0 ? (
          <div style={s.deliveryCard}>
            <span style={{ fontSize: 24 }}>🚚</span>
            <div style={{ flex: 1 }}>
              {deliveryLeft > 0 ? (
                <p style={s.deliveryText}>
                  Добавьте на <b>{formatPrice(deliveryLeft)} сум</b> для бесплатной доставки
                </p>
              ) : (
                <p style={s.deliveryText}><b>Бесплатная доставка! 🎉</b></p>
              )}
              <div style={s.progressBg}>
                <div style={{ ...s.progressFill, width: `${deliveryPct}%` }} />
              </div>
              <div style={s.progressLabels}>
                <span>{formatPrice(total)} сум</span>
                <span>800 000 сум</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={s.deliveryCardSimple}>
            <span style={{ fontSize: 22 }}>🚚</span>
            <span style={s.deliverySimpleText}>Бесплатная доставка при заказе от 800 000 сум</span>
          </div>
        )}

        {/* Recommended */}
        <div style={s.recSection}>
          <h2 style={s.recTitle}>Рекомендуем для вас</h2>
          {loadingRec ? (
            <div style={s.recScroll}>
              {[1, 2, 3].map(i => <div key={i} style={s.skeleton} />)}
            </div>
          ) : (
            <div style={s.recScroll}>
              {recommended.map(p => (
                <div key={p.id} style={s.recCardWrap}>
                  <ProductCard product={p} onOpenModal={setSelectedProduct} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 16 }} />
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

const s = {
  page: {
    height: '100%', display: 'flex', flexDirection: 'column',
    background: '#FFFBF0', paddingBottom: 80,
  },
  header: {
    padding: '14px 16px 10px',
    background: '#FFFBF0',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  logo: { fontSize: 22, fontWeight: 800, color: '#3D2400', letterSpacing: -0.5 },
  searchWrap: { padding: '0 16px 10px', background: '#FFFBF0', flexShrink: 0 },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', borderRadius: 14, padding: '10px 14px',
    border: '1.5px solid #F0E6CC',
  },
  searchInput: {
    flex: 1, fontSize: 14, color: '#3D2400', border: 'none', outline: 'none',
    background: 'transparent',
  },
  scroll: { flex: 1, overflowY: 'auto' },

  // Banner
  bannerWrap: {
    margin: '0 16px 16px',
    borderRadius: 18, overflow: 'hidden',
    position: 'relative', flexShrink: 0,
    boxShadow: '0 4px 20px rgba(245,166,35,0.15)',
  },
  bannerImg: { width: '100%', display: 'block', aspectRatio: '2.5/1', objectFit: 'cover' },
  bannerDots: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', gap: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(255,255,255,0.5)', border: 'none', padding: 0, cursor: 'pointer',
  },
  dotActive: { background: '#fff', width: 18, borderRadius: 3 },

  // Categories
  catSection: { marginBottom: 8, paddingLeft: 16 },
  catScroll: { display: 'flex', overflowX: 'auto', gap: 6, paddingRight: 16, paddingBottom: 4 },
  catItem: {
    display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    flexShrink: 0, width: 76, cursor: 'pointer', border: 'none', background: 'transparent',
    padding: '6px 4px',
  },
  catIconWrap: {
    width: 64, height: 64, borderRadius: 20,
    background: '#FFF3C4', border: '2px solid #F0E6CC',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative', flexShrink: 0,
  },
  catIcon: { width: '100%', height: '100%', objectFit: 'contain', padding: 4 },
  catIconFallback: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
  },
  catName: {
    fontSize: 10, fontWeight: 600, color: '#3D2400', textAlign: 'center',
    lineHeight: 1.3, maxWidth: 72, wordBreak: 'break-word',
  },

  // Delivery
  deliveryCard: {
    margin: '0 16px 16px',
    background: '#fff', borderRadius: 16, padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 14,
    border: '1.5px solid #F0E6CC',
    boxShadow: '0 2px 10px rgba(245,166,35,0.08)',
  },
  deliveryText: { fontSize: 12, color: '#3D2400', marginBottom: 8, lineHeight: 1.4 },
  progressBg: { height: 6, background: '#F0E6CC', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#F5A623', borderRadius: 4, transition: 'width 0.4s ease' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#B89A60' },
  deliveryCardSimple: {
    margin: '0 16px 16px',
    background: '#FFF3C4', borderRadius: 16, padding: '12px 16px',
    display: 'flex', alignItems: 'center', gap: 12,
    border: '1.5px solid #F0E6CC',
  },
  deliverySimpleText: { fontSize: 13, fontWeight: 600, color: '#3D2400' },

  // Recommended
  recSection: { paddingLeft: 16, marginBottom: 8 },
  recTitle: { fontSize: 16, fontWeight: 800, color: '#3D2400', marginBottom: 12, paddingRight: 16 },
  recScroll: { display: 'flex', overflowX: 'auto', gap: 10, paddingRight: 16, paddingBottom: 4 },
  recCardWrap: { flexShrink: 0, width: 150 },
  skeleton: { flexShrink: 0, width: 150, height: 220, borderRadius: 16, background: '#F0E6CC' },
};
