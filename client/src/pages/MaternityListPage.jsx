import { useState } from 'react';
import { useCart } from '../context/CartContext';
import ProductListItem from '../components/ProductListItem';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

function pluralItems(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'товар';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'товара';
  return 'товаров';
}

export default function MaternityListPage({ subcategory, onBack, onOpenProduct, onOpenCart }) {
  const { count, total } = useCart();
  const [tab, setTab] = useState('obligatory');

  const list = subcategory[tab] || [];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D2400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={s.title}>{subcategory.name}</h1>
        <div style={{ width: 40 }} />
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab === 'obligatory' ? s.tabActive : {}) }} onClick={() => setTab('obligatory')}>
          Обязательно
        </button>
        <button style={{ ...s.tab, ...(tab === 'recommended' ? s.tabActive : {}) }} onClick={() => setTab('recommended')}>
          Рекомендуется
        </button>
      </div>

      {/* List */}
      <div style={s.scroll}>
        {list.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: 44 }}>🧺</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#3D2400', marginTop: 12 }}>Пока пусто</p>
            <p style={{ fontSize: 13, color: '#B89A60', marginTop: 6 }}>Скоро здесь появятся товары</p>
          </div>
        ) : (
          list.map((p) => <ProductListItem key={p.id} product={p} onOpenProduct={onOpenProduct} />)
        )}
      </div>

      {/* Cart bar */}
      {count > 0 && (
        <button style={s.cartBar} onClick={onOpenCart}>
          <span style={{ fontSize: 20 }}>🛒</span>
          <span style={s.cartBarText}>Ваша корзина · {count} {pluralItems(count)}</span>
          <span style={s.cartBarTotal}>{formatPrice(total)}</span>
        </button>
      )}
    </div>
  );
}

const s = {
  page: { height: '100%', display: 'flex', flexDirection: 'column', background: '#FFFBF0', paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' },
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
  tabs: { display: 'flex', gap: 8, padding: '12px 16px 4px', flexShrink: 0 },
  tab: {
    flex: 1, padding: '10px 0', borderRadius: 12, border: '1.5px solid #F0E6CC',
    background: '#fff', color: '#B89A60', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
  },
  tabActive: { background: '#F5A623', border: '1.5px solid #F5A623', color: '#fff' },
  scroll: { flex: 1, overflowY: 'auto', padding: '12px 16px 8px' },
  empty: { textAlign: 'center', padding: '60px 20px' },
  cartBar: {
    position: 'fixed', left: 16, right: 16, bottom: 'calc(80px + env(safe-area-inset-bottom))',
    height: 54, borderRadius: 16, border: 'none', background: '#F5A623',
    display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(245,166,35,0.4)', zIndex: 60,
  },
  cartBarText: { flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 700, color: '#fff' },
  cartBarTotal: { fontSize: 14, fontWeight: 800, color: '#fff' },
};
