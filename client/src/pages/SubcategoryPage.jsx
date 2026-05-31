import { useState, useEffect } from 'react';
import { fetchIconNames } from '../api';

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9а-яёa-z]/gi, '');
}

export default function SubcategoryPage({ parentCategory, subcategories, onSelectSubcategory, onViewAll, onBack }) {
  const [iconNames, setIconNames] = useState([]);

  useEffect(() => {
    fetchIconNames().then(setIconNames);
  }, []);

  function getIconUrl(catName) {
    if (iconNames.length === 0) return null;
    const catNorm = norm(catName);
    const match = iconNames.find(f => norm(f.replace(/\.(PNG|png)$/i, '')) === catNorm);
    if (match) return `/icons/${encodeURIComponent(match)}`;
    return null;
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3D2400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={s.title}>{parentCategory.name}</h1>
        <div style={{ width: 40 }} />
      </div>

      <div style={s.content}>
        <button style={s.viewAllBtn} onClick={onViewAll}>
          <span>Все товары категории</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        <div style={s.grid}>
          {subcategories.map(cat => {
            const iconUrl = getIconUrl(cat.name);
            return (
              <button key={cat.id} style={s.card} onClick={() => onSelectSubcategory(cat)}>
                <div style={s.iconWrap}>
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={cat.name}
                      style={s.icon}
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                        const fb = e.currentTarget.parentElement.querySelector('.fb');
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="fb" style={{ ...s.iconFallback, display: iconUrl ? 'none' : 'flex' }}>🐝</div>
                </div>
                <span style={s.catName}>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    height: '100%', display: 'flex', flexDirection: 'column',
    background: '#FFFBF0', paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
  },
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
  content: { flex: 1, overflowY: 'auto', padding: '16px 12px' },
  viewAllBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', padding: '14px 18px', marginBottom: 16,
    background: '#F5A623', color: '#fff', border: 'none',
    borderRadius: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(245,166,35,0.3)',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '20px 12px 16px', background: '#fff',
    border: '1.5px solid #F0E6CC', borderRadius: 18,
    cursor: 'pointer', gap: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  iconWrap: {
    width: 80, height: 80, borderRadius: '50%',
    background: '#FFFBF0', border: '2px solid #F0E6CC',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  icon: { width: '80%', height: '80%', objectFit: 'contain' },
  iconFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 36 },
  catName: { fontSize: 13, fontWeight: 700, color: '#3D2400', textAlign: 'center', lineHeight: 1.3 },
};
