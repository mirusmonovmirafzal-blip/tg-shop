import { useState, useEffect, useCallback } from 'react';
import { fetchCategories, fetchProducts } from '../api';
import CategoryTabs from '../components/CategoryTabs';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CartFAB from '../components/CartFAB';

export default function CatalogPage({ onGoToCart }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeCat, setActiveCat] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const LIMIT = 30;

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setProducts([]);
    setOffset(0);
    setLoading(true);
    fetchProducts({ limit: LIMIT, offset: 0, categoryId: activeCat })
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeCat]);

  function loadMore() {
    const newOffset = offset + LIMIT;
    setLoadingMore(true);
    fetchProducts({ limit: LIMIT, offset: newOffset, categoryId: activeCat })
      .then((data) => {
        setProducts((prev) => [...prev, ...data.products]);
        setOffset(newOffset);
      })
      .catch(console.error)
      .finally(() => setLoadingMore(false));
  }

  const hasMore = products.length < total;

  return (
    <div style={styles.page}>
      <CategoryTabs
        categories={categories}
        activeId={activeCat}
        onSelect={(id) => setActiveCat(id)}
      />

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 40 }}>📦</p>
            <p style={{ color: '#6B7280', marginTop: 8 }}>Товары не найдены</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => setSelectedProduct(p)}
                />
              ))}
            </div>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={styles.loadMoreBtn}
              >
                {loadingMore ? 'Загрузка...' : 'Показать ещё'}
              </button>
            )}
          </>
        )}
      </div>

      <CartFAB onClick={onGoToCart} />

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
      `}</style>
    </div>
  );
}

const styles = {
  page: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F6FA' },
  content: { flex: 1, overflowY: 'auto', padding: '12px 12px 90px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  loading: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  skeleton: {
    height: 200, borderRadius: 16, background: '#E5E7EB',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  empty: { textAlign: 'center', padding: '60px 20px' },
  loadMoreBtn: {
    display: 'block', width: '100%', marginTop: 16,
    padding: '14px 0', borderRadius: 14, fontSize: 14,
    fontWeight: 600, background: '#fff', color: '#5B67F8',
    border: '1.5px solid #5B67F8',
  },
};
