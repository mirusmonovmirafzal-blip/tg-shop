import { useState, useEffect } from 'react';
import { fetchCategories, fetchProducts, getCategoryImageUrl } from '../api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

const LIMIT = 30;

function buildTree(cats) {
  const roots = cats.filter((c) => !c.parentId);
  const children = (parentId) => cats.filter((c) => c.parentId === parentId);
  return roots.map((r) => ({ ...r, children: children(r.id) }));
}

export default function CatalogPage() {
  const [tree, setTree] = useState([]);
  const [activeCat, setActiveCat] = useState(null);      // root category id
  const [activeSubCat, setActiveSubCat] = useState(null); // subcategory id
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load categories once
  useEffect(() => {
    fetchCategories().then((cats) => {
      setTree(buildTree(cats));
    }).catch(console.error);
  }, []);

  // Determine which category id to filter by
  const filterCatId = activeSubCat || activeCat;

  useEffect(() => {
    setProducts([]);
    setOffset(0);
    setLoading(true);
    fetchProducts({ limit: LIMIT, offset: 0, categoryId: filterCatId })
      .then((data) => { setProducts(data.products); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterCatId]);

  function loadMore() {
    const newOffset = offset + LIMIT;
    setLoadingMore(true);
    fetchProducts({ limit: LIMIT, offset: newOffset, categoryId: filterCatId })
      .then((data) => { setProducts((p) => [...p, ...data.products]); setOffset(newOffset); })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  }

  // Current root category node
  const currentRoot = tree.find((n) => n.id === activeCat);
  const hasSubcats = currentRoot && currentRoot.children.length > 0;

  function selectRoot(id) {
    setActiveCat(id);
    setActiveSubCat(null);
  }

  const hasMore = products.length < total;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Baby Bee 🐝</span>
      </div>

      {/* Root category tabs */}
      <div style={styles.tabsWrap}>
        <div style={styles.tabs}>
          <button
            onClick={() => selectRoot(null)}
            style={{ ...styles.tab, ...(activeCat === null ? styles.tabActive : {}) }}
          >
            Все
          </button>
          {tree.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectRoot(cat.id)}
              style={{ ...styles.tab, ...(activeCat === cat.id ? styles.tabActive : {}) }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory grid — shown if root has children */}
      {hasSubcats && !activeSubCat && (
        <div style={styles.scroll}>
          <div style={styles.subGrid}>
            <button
              onClick={() => setActiveSubCat(null)}
              style={styles.subCard}
            >
              <div style={{ ...styles.subImgWrap, background: '#F0F0F5' }}>
                <span style={{ fontSize: 28 }}>🗂️</span>
              </div>
              <span style={styles.subName}>Все</span>
            </button>
            {currentRoot.children.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubCat(sub.id)}
                style={styles.subCard}
              >
                <div style={styles.subImgWrap}>
                  <img
                    src={getCategoryImageUrl(sub.id)}
                    alt={sub.name}
                    style={styles.subImg}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.background = '#F0F0F5';
                    }}
                  />
                </div>
                <span style={styles.subName}>{sub.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Back button from subcategory */}
      {activeSubCat && (
        <button onClick={() => setActiveSubCat(null)} style={styles.backCat}>
          ← {currentRoot?.name}
        </button>
      )}

      {/* Product grid */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        ) : products.length === 0 && !(hasSubcats && !activeSubCat) ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 40 }}>📦</p>
            <p style={{ color: '#6B7280', marginTop: 8, fontSize: 14 }}>Товары не найдены</p>
          </div>
        ) : (hasSubcats && !activeSubCat) ? null : (
          <>
            <div style={styles.grid}>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onOpenModal={setSelectedProduct} />
              ))}
            </div>
            {hasMore && (
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
  page: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F6FA', paddingBottom: 88 },
  header: {
    padding: '14px 16px 12px',
    background: '#fff', borderBottom: '1px solid #F0F0F0',
  },
  headerTitle: { fontSize: 20, fontWeight: 800, color: '#1A1A2E', letterSpacing: -0.5 },
  tabsWrap: {
    background: '#fff', borderBottom: '1px solid #F0F0F0',
    position: 'sticky', top: 0, zIndex: 10,
  },
  tabs: { display: 'flex', overflowX: 'auto', gap: 6, padding: '10px 12px', whiteSpace: 'nowrap' },
  tab: {
    flexShrink: 0, padding: '7px 14px', borderRadius: 20,
    fontSize: 13, fontWeight: 500, color: '#6B7280',
    background: '#F5F6FA', border: '1.5px solid transparent', transition: 'all 0.15s',
  },
  tabActive: { color: '#1A1A2E', background: '#E8E8F0', border: '1.5px solid #1A1A2E' },
  scroll: { flex: 1, overflowY: 'auto' },
  subGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10, padding: '12px 12px 4px',
  },
  subCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 6, cursor: 'pointer',
  },
  subImgWrap: {
    width: '100%', paddingTop: '100%', position: 'relative',
    borderRadius: 16, background: '#F0F0F5', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  subImg: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%', objectFit: 'cover',
  },
  subName: { fontSize: 11, fontWeight: 600, color: '#1A1A2E', textAlign: 'center' },
  backCat: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 16px', fontSize: 13, fontWeight: 600,
    color: '#5B67F8', background: 'transparent',
  },
  content: { flex: 1, overflowY: 'auto', padding: '10px 12px 8px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  skeleton: {
    height: 220, borderRadius: 16, background: '#E5E7EB',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  empty: { textAlign: 'center', padding: '60px 20px' },
  moreBtn: {
    display: 'block', width: '100%', marginTop: 14,
    padding: '13px 0', borderRadius: 14, fontSize: 14,
    fontWeight: 600, background: '#fff', color: '#1A1A2E',
    border: '1.5px solid #E5E7EB',
  },
};
