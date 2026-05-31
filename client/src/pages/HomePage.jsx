import { useState, useEffect, useRef } from 'react';
import { fetchCategories, fetchProducts, fetchIconNames } from '../api';
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

// Normalize string: lowercase, keep only alphanumeric
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9а-яёa-z]/gi, '');
}

export default function HomePage({ onCategorySelect }) {
  const { total } = useCart();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [iconNames, setIconNames] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loadingRec, setLoadingRec] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);
  const searchTimer = useRef(null);
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

    fetchIconNames().then(setIconNames);

    fetchProducts({ limit: 8 })
      .then(d => setRecommended(expandProducts(d.products)))
      .catch(console.error)
      .finally(() => setLoadingRec(false));
  }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const d = await fetchProducts({ limit: 20, search: searchQuery.trim() });
        setSearchResults(expandProducts(d.products));
      } catch { }
      finally { setSearching(false); }
    }, 500);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery]);

  // Fuzzy icon match
  function getIconUrl(catName) {
    if (iconNames.length === 0) return `/icons/${encodeURIComponent(catName)}.PNG`;
    const catNorm = norm(catName);
    const match = iconNames.find(f => norm(f.replace(/\.(PNG|png)$/i, '')) === catNorm);
    if (match) return `/icons/${encodeURIComponent(match)}`;
    return null;
  }

  const deliveryLeft = Math.max(0, FREE_DELIVERY - total);
  const deliveryPct = Math.min(100, (total / FREE_DELIVERY) * 100);
  const isSearching = searchQuery.trim().length > 0;

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
          {searchQuery.length > 0 && (
            <button onClick={() => setSearchQuery('')} style={s.clearBtn}>✕</button>
          )}
        </div>
      </div>

      <div style={s.scroll}>
        {isSearching ? (
          /* Search results */
          <div style={{ padding: '12px 12px 8px' }}>
            <p style={{ fontSize: 13, color: '#B89A60', marginBottom: 12 }}>
              {searching ? 'Поиск...' : `Результаты: ${searchResults.length} товаров`}
            </p>
            {searching ? (
              <div style={s.grid}>
                {[...Array(4)].map((_, i) => <div key={i} style={s.skeleton} />)}
              </div>
            ) : searchResults.length === 0 ? (
              <div style={s.empty}>
                <p style={{ fontSize: 36 }}>🔍</p>
                <p style={{ color: '#B89A60', marginTop: 8 }}>Ничего не найдено</p>
              </div>
            ) : (
              <div style={s.grid}>
                {searchResults.map(p => (
                  <ProductCard key={p.id} product={p} onOpenModal={setSelectedProduct} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
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

            {/* Categories — no section title */}
            <div style={s.catSection}>
              <div style={s.catScroll}>
                {categories.map(cat => {
                  const iconUrl = getIconUrl(cat.name);
                  return (
                    <button key={cat.id} style={s.catItem} onClick={() => onCategorySelect(cat)}>
                      <div style={s.catIconWrap}>
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt={cat.name}
                            style={s.catIcon}
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                              const fb = e.currentTarget.parentElement.querySelector('.fb');
                              if (fb) fb.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="fb" style={{ ...s.catIconFallback, display: iconUrl ? 'none' : 'flex' }}>🐝</div>
                      </div>
                      <span style={s.catName}>{cat.name}</span>
                    </button>
                  );
                })}
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
                  {[1, 2, 3].map(i => <div key={i} style={s.recSkeleton} />)}
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
          </>
        )}
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
    background: '#FFFBF0', paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
  },
  header: {
    padding: '14px 16px 10px', background: '#FFFBF0',
    display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  logo: { fontSize: 22, fontWeight: 800, color: '#3D2400', letterSpacing: -0.5 },
  searchWrap: { padding: '0 16px 10px', background: '#FFFBF0', flexShrink: 0 },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', borderRadius: 14, padding: '10px 14px',
    border: '1.5px solid #F0E6CC',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#3D2400', border: 'none', outline: 'none', background: 'transparent' },
  clearBtn: { fontSize: 14, color: '#B89A60', padding: '0 4px', border: 'none', background: 'none', cursor: 'pointer' },
  scroll: { flex: 1, overflowY: 'auto' },

  // Banner — taller
  bannerWrap: {
    margin: '0 16px 14px', borderRadius: 18, overflow: 'hidden',
    position: 'relative', flexShrink: 0,
    boxShadow: '0 4px 20px rgba(245,166,35,0.15)',
  },
  bannerImg: { width: '100%', display: 'block', aspectRatio: '2/1', objectFit: 'cover' },
  bannerDots: {
    position: 'absolute', bottom: 10, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', border: 'none', padding: 0, cursor: 'pointer' },
  dotActive: { background: '#fff', width: 18, borderRadius: 3 },

  // Categories — no title, icons bigger
  catSection: { marginBottom: 12, paddingLeft: 16 },
  catScroll: { display: 'flex', overflowX: 'auto', gap: 8, paddingRight: 16, paddingBottom: 4 },
  catItem: {
    display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    flexShrink: 0, width: 80, cursor: 'pointer', border: 'none', background: 'transparent', padding: '4px 2px',
  },
  catIconWrap: {
    width: 68, height: 68, borderRadius: '50%',
    background: '#fff', border: '2px solid #F0E6CC',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative', flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  catIcon: { width: '88%', height: '88%', objectFit: 'contain' },
  catIconFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 },
  catName: { fontSize: 10, fontWeight: 600, color: '#3D2400', textAlign: 'center', lineHeight: 1.3, maxWidth: 78, wordBreak: 'break-word' },

  // Delivery
  deliveryCard: {
    margin: '0 16px 14px', background: '#fff', borderRadius: 16, padding: '14px 16px',
    display: 'flex', alignItems: 'center', gap: 14,
    border: '1.5px solid #F0E6CC', boxShadow: '0 2px 10px rgba(245,166,35,0.08)',
  },
  deliveryText: { fontSize: 12, color: '#3D2400', marginBottom: 8, lineHeight: 1.4 },
  progressBg: { height: 6, background: '#F0E6CC', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#F5A623', borderRadius: 4, transition: 'width 0.4s ease' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: '#B89A60' },
  deliveryCardSimple: {
    margin: '0 16px 14px', background: '#FFF3C4', borderRadius: 16, padding: '12px 16px',
    display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #F0E6CC',
  },
  deliverySimpleText: { fontSize: 13, fontWeight: 600, color: '#3D2400' },

  // Recommended
  recSection: { paddingLeft: 16, marginBottom: 8 },
  recTitle: { fontSize: 16, fontWeight: 800, color: '#3D2400', marginBottom: 12, paddingRight: 16 },
  recScroll: { display: 'flex', overflowX: 'auto', gap: 10, paddingRight: 16, paddingBottom: 4 },
  recCardWrap: { flexShrink: 0, width: 155 },
  recSkeleton: { flexShrink: 0, width: 155, height: 230, borderRadius: 16, background: '#F0E6CC' },

  // Search grid
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  skeleton: { height: 260, borderRadius: 16, background: '#F0E6CC' },
  empty: { textAlign: 'center', padding: '40px 20px' },
};
