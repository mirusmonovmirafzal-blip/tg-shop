import { useCart } from '../context/CartContext';

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function BottomNav({ page, onNavigate }) {
  const { count } = useCart();

  const tabs = [
    { id: 'catalog', icon: <HomeIcon />, label: 'Главная' },
    { id: 'cart', icon: <CartIcon />, label: 'Корзина' },
    { id: 'account', icon: <UserIcon />, label: 'Аккаунт' },
  ];

  return (
    <div style={styles.wrapper}>
      <div style={styles.pill}>
        {tabs.map((tab) => {
          const active = page === tab.id;
          return (
            <button key={tab.id} onClick={() => onNavigate(tab.id)} style={styles.tab}>
              <div style={{ ...styles.iconWrap, ...(active ? styles.iconActive : {}) }}>
                <span style={{ color: active ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                  {tab.icon}
                </span>
                {tab.id === 'cart' && count > 0 && (
                  <span style={styles.badge}>{count > 9 ? '9+' : count}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'center',
    padding: '0 24px 20px', zIndex: 100,
    pointerEvents: 'none',
  },
  pill: {
    background: '#1A1A2E',
    borderRadius: 40, padding: '8px 12px',
    display: 'flex', gap: 4,
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    pointerEvents: 'all',
  },
  tab: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '4px 8px',
  },
  iconWrap: {
    width: 48, height: 40, borderRadius: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', transition: 'background 0.2s',
  },
  iconActive: { background: 'rgba(255,255,255,0.15)' },
  badge: {
    position: 'absolute', top: 2, right: 2,
    background: '#5B67F8', color: '#fff',
    fontSize: 9, fontWeight: 700,
    borderRadius: 10, padding: '1px 4px',
    minWidth: 16, textAlign: 'center',
  },
};
