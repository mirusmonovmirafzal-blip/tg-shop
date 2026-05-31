import { useState, useEffect } from 'react';
import { fetchCategories, fetchProducts } from '../api';
import { getVariantMode, expandColorVariants } from '../utils/variantMode';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

const LIMIT = 30;

const GRADIENTS = [
  ['#FF6B6B','#FF8E53'],['#4ECDC4','#44A08D'],['#667EEA','#764BA2'],
  ['#F093FB','#F5576C'],['#4FACFE','#00F2FE'],['#43E97B','#38F9D7'],
  ['#FA709A','#FEE140'],['#A18CD1','#FBC2EB'],['#FDB99B','#CF392A'],['#84FAB0','#8FD3F4'],
];
function gradientFor(name = '') {
  let h = 0; for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  const [c1, c2] = GRADIENTS[h % GRADIENTS.length];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

function buildTree(cats) {
  const roots = cats.filter((c) => !c.parentId);
  return roots.map((r) => ({ ...r, children: cats.filter((c) => c.parentId === r.id) }));
}

// Expand products: color variants → separate cards, size variants → one card
function expandProducts(products) {
  const result = [];
  for (const p of products) {
    if (!p.hasVariants || !p.variants.length) {
      result.push(p);
      continue;
    }
    const mode = getVariantMode(p.variants);
    if (mode === 'color') {
      // Each color variant becomes its own card
      result.push(...expandColorVariants(p));
    } else {
      // Size or default: one card with variant selection
      result.push(p);
    }
  }
  return result;
}

export default function CatalogPage() {
  const [tree, setTree] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [activeSubCat, setActiveSubCat] = useState(null);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchCategories().then((cats) => setTree(buildTree(cats))).catch(console.error);
  }, []);

  const filterCatId = activeSubCat || activeCat;

  useEffect(() => {
    setProducts([]); setOffset(0); setLoading(true);
    fetchProducts({ limit: LIMIT, offset: 0, categoryId: filterCatId })
      .then((d) => { setProducts(expandProducts(d.products)); setTotal(d.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterCatId]);

  function loadMore() {
    const no = offset + LIMIT; setLoadingMore(true);
    fetchProducts({ limit: LIMIT, offset: no, categoryId: filterCatId })
      .then((d) => { setProducts((p) => [...p, ...expandProducts(d.products)]); setOffset(no); })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  }

  const currentRoot = tree.find((n) => n.id === activeCat);
  const hasSubcats = currentRoot && currentRoot.children.length > 0;
  function selectRoot(id) { setActiveCat(id); setActiveSubCat(null); }

  // When opening a color-variant card, pass the real product with preselect
  function handleOpenModal(card) {
    if (card._realProductId) {
      // Find the original product from products (or reconstruct)
      // card already has all variants from expandColorVariants
      setSelectedProduct(card);
    } else {
      setSelectedProduct(card);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <span style={styles.logo}>Baby Bee 🐝</span>
      </div>

      <div style={styles.tabsRow}>
        <div style={styles.tabs}>
          <button onClick={() => selectRoot(null)} style={{ ...styles.tab, ...(activeCat === null ? styles.tabActive : {}) }}>Все</button>
          {tree.map((cat) => (
            <button key={cat.id} onClick={() => selectRoot(cat.id)}
              style={{ ...styles.tab, ...(activeCat === cat.id ? styles.tabActive : {}) }}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.content}>
        {/* Subcategory horizontal scroll */}
        {hasSubcats && (
          <div style={styles.subScroll}>
            <button onClick={() => setActiveSubCat(null)} style={styles.subItem}>
              <div style={{ ...styles.subBox, background: '#E8E8F0' }}>
                <span style={{ fontSize: 22 }}>🗂️</span>
              </div>
              <span style={{ ...styles.subLabel, fontWeight: !activeSubCat ? 700 : 500, color: !activeSubCat ? '#1A1A2E' : '#6B7280' }}>Все</span>
            </button>
            {currentRoot.children.map((sub) => {
              const active = activeSubCat === sub.id;
              return (
                <button key={sub.id} onClick={() => setActiveSubCat(sub.id)} style={styles.subItem}>
                  <div style={{ ...styles.subBox, background: gradientFor(sub.name), border: active ? '2.5px solid #1A1A2E' : '2.5px solid transparent' }}>
                    <span style={styles.subInitial}>{sub.name[0].toUpperCase()}</span>
                  </div>
                  <span style={{ ...styles.subLabel, fontWeight: active ? 700 : 500, color: active ? '#1A1A2E' : '#6B7280' }}>{sub.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div style={styles.grid}>{[...Array(6)].map((_, i) => <div key={i} style={styles.skeleton} />)}</div>
        ) : products.length === 0 ? (
          <div style={styles.empty}><p style={{ fontSize: 40 }}>📦</p><p style={{ color: '#6B7280', marginTop: 8 }}>Товары не найдены</p></div>
        ) : (
          <>
            <div style={styles.grid}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onOpenModal={handleOpenModal} />
              ))}
            </div>
            {products.length < total && (
              <button onClick={loadMore} disabled={loadingMore} style={styles.moreBtn}>
                {loadingMore ? 'Загрузка...' : 'Показать ещё'}
              </button>
            )}
          </>
        )}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}

const styles = {
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: '#F5F6FA', paddingBottom: 88 },
  header: { padding: '14px 16px 12px', background: '#fff', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'center' },
  logo: { fontSize: 20, fontWeight: 800, color: '#1A1A2E', letterSpacing: -0.5 },
  tabsRow: { background: '#fff', borderBottom: '1px solid #F0F0F0' },
  tabs: { display: 'flex', overflowX: 'auto', gap: 6, padding: '10px 12px', whiteSpace: 'nowrap' },
  tab: { flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, color: '#6B7280', background: '#F5F6FA', border: '1.5px solid transparent' },
  tabActive: { color: '#1A1A2E', background: '#E8E8F0', border: '1.5px solid #1A1A2E' },
  content: { flex: 1, overflowY: 'auto', padding: '12px 12px 8px' },
  subScroll: { display: 'flex', overflowX: 'auto', gap: 12, paddingBottom: 14 },
  subItem: { display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, width: 72, cursor: 'pointer' },
  subBox: { width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  subInitial: { fontSize: 24, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.2)' },
  subLabel: { fontSize: 10, textAlign: 'center', whiteSpace: 'normal', lineHeight: 1.3, maxWidth: 72, wordBreak: 'break-word' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  skeleton: { height: 260, borderRadius: 16, background: '#E5E7EB', animation: 'pulse 1.5s ease-in-out infinite' },
  empty: { textAlign: 'center', padding: '60px 20px' },
  moreBtn: { display: 'block', width: '100%', marginTop: 14, padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 600, background: '#fff', color: '#1A1A2E', border: '1.5px solid #E5E7EB' },
};
