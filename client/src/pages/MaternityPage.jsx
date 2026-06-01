import { useState, useEffect } from 'react';
import { fetchMaternityBag } from '../api';
import { useCart } from '../context/CartContext';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function MaternityPage({ onBack, onSelectSubcategory, onOpenCart }) {
  const { count, total } = useCart();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaternityBag()
      .then((d) => setSubcategories(d.subcategories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D2400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={s.title}>Сумка в роддом</h1>
        <div style={{ width: 40 }} />
      </div>

      <div style={s.scroll}>
        {/* Hero */}
        <div style={s.hero}>
          <div style={s.heroIcon}>🧳</div>
          <h2 style={s.heroTitle}>Соберите свою сумку в роддом</h2>
          <p style={s.heroSub}>Выбирайте нужные товары и добавляйте их в корзину</p>
        </div>

        {/* Subcategory cards */}
        <div style={s.cards}>
          {loading ? (
            [1, 2, 3].map((i) => <div key={i} style={s.cardSkeleton} />)
          ) : (
            subcategories.map((sc) => (
              <button key={sc.id} style={s.card} onClick={() => onSelectSubcategory(sc)}>
                <div style={s.cardIcon}>{sc.emoji}</div>
                <div style={s.cardText}>
                  <span style={s.cardName}>{sc.name}</span>
                  <span style={s.cardCount}>{sc.count} {pluralItems(sc.count)}</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B89A60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))
          )}
        </div>
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

function pluralItems(n) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return 'товар';
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'товара';
  return 'товаров';
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
  scroll: { flex: 1, overflowY: 'auto', padding: '16px' },
  hero: {
    background: 'linear-gradient(135deg, #FFF6D6 0%, #FFE9A8 100%)',
    borderRadius: 22, padding: '28px 20px', textAlign: 'center', marginBottom: 18,
    boxShadow: '0 4px 20px rgba(245,166,35,0.15)',
  },
  heroIcon: { fontSize: 56, marginBottom: 10 },
  heroTitle: { fontSize: 22, fontWeight: 800, color: '#3D2400', lineHeight: 1.25, marginBottom: 8 },
  heroSub: { fontSize: 14, color: '#8A6D3B', lineHeight: 1.4 },
  cards: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#fff', borderRadius: 18, padding: '16px 18px',
    border: '1.5px solid #F0E6CC', cursor: 'pointer', textAlign: 'left',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  cardSkeleton: { height: 76, borderRadius: 18, background: '#F0E6CC' },
  cardIcon: {
    width: 52, height: 52, borderRadius: '50%', background: '#FFF3C4',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0,
  },
  cardText: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3 },
  cardName: { fontSize: 16, fontWeight: 700, color: '#3D2400' },
  cardCount: { fontSize: 13, color: '#B89A60' },
  cartBar: {
    position: 'fixed', left: 16, right: 16, bottom: 'calc(80px + env(safe-area-inset-bottom))',
    height: 54, borderRadius: 16, border: 'none', background: '#F5A623',
    display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(245,166,35,0.4)', zIndex: 60,
  },
  cartBarText: { flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 700, color: '#fff' },
  cartBarTotal: { fontSize: 14, fontWeight: 800, color: '#fff' },
};
