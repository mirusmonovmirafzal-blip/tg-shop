import { useState, useEffect } from 'react';
import { fetchProducts } from '../api';
import { getVariantMode, expandColorVariants } from '../utils/variantMode';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';

const LIMIT = 30;

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

export default function CatalogPage({ category, onBack }) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setProducts([]); setOffset(0); setLoading(true);
    fetchProducts({ limit: LIMIT, offset: 0, categoryId: category?.id || null })
      .then(d => { setProducts(expandProducts(d.products)); setTotal(d.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category?.id]);

  function loadMore() {
    const no = offset + LIMIT;
    setLoadingMore(true);
    fetchProducts({ limit: LIMIT, offset: no, categoryId: category?.id || null })
      .then(d => { setProducts(p => [...p, ...expandProducts(d.products)]); setOffset(no); })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
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
        <h1 style={s.title}>{category ? category.name : 'Все товары'}</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Content */}
      <div style={s.content}>
        {loading ? (
          <div style={s.grid}>
            {[...Array(6)].map((_, i) => <div key={i} style={s.skeleton} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: 44 }}>📦</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#3D2400', marginTop: 12 }}>Товары не найдены</p>
            <p style={{ fontSize: 13, color: '#B89A60', marginTop: 6 }}>В этой категории пока нет товаров</p>
          </div>
        ) : (
          <>
            <div style={s.grid}>
              {products.map(p => (
                <ProductCard key={p.id} product={p} onOpenModal={setSelectedProduct} />
              ))}
            </div>
            {products.length < total && (
              <button onClick={loadMore} disabled={loadingMore} style={s.moreBtn}>
                {loadingMore ? 'Загрузка...' : `Показать ещё (${total - products.length})`}
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

const s = {
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFBF0', paddingBottom: 80 },
  header: {
    padding: '12px 16px', background: '#FFFBF0',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #F0E6CC', flexShrink: 0,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, border: 'none',
    background: '#FFF3C4', display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
  title: { fontSize: 17, fontWeight: 800, color: '#3D2400', textAlign: 'center', flex: 1 },
  content: { flex: 1, overflowY: 'auto', padding: '14px 12px 8px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  skeleton: { height: 260, borderRadius: 16, background: '#F0E6CC' },
  empty: { textAlign: 'center', padding: '60px 20px' },
  moreBtn: {
    display: 'block', width: '100%', marginTop: 14, padding: '14px 0',
    borderRadius: 14, fontSize: 14, fontWeight: 600,
    background: '#FFF3C4', color: '#3D2400', border: '1.5px solid #F0E6CC',
  },
};
