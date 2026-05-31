import { useCart } from '../context/CartContext';

const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#F5A623' : 'none'} stroke={active ? '#F5A623' : '#B89A60'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const CartIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#F5A623' : '#B89A60'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
  </svg>
);

const UserIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#F5A623' : '#B89A60'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function BottomNav({ page, onNavigate }) {
  const { count } = useCart();

  const tabs = [
    { id: 'home', icon: (a) => <HomeIcon active={a} />, label: 'Главная' },
    { id: 'cart', icon: (a) => <CartIcon active={a} />, label: 'Корзина' },
    { id: 'account', icon: (a) => <UserIcon active={a} />, label: 'Профиль' },
  ];

  return (
    <div style={s.wrapper}>
      <div style={s.bar}>
        {tabs.map(tab => {
          const active = page === tab.id;
          return (
            <button key={tab.id} onClick={() => onNavigate(tab.id)} style={s.tab}>
              <div style={s.iconWrap}>
                {tab.icon(active)}
                {tab.id === 'cart' && count > 0 && (
                  <span style={s.badge}>{count > 9 ? '9+' : count}</span>
                )}
              </div>
              <span style={{ ...s.label, color: active ? '#F5A623' : '#B89A60', fontWeight: active ? 700 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: '#fff', borderTop: '1px solid #F0E6CC',
    paddingBottom: 'env(safe-area-inset-bottom)',
    zIndex: 100,
    boxShadow: '0 -4px 20px rgba(245,166,35,0.1)',
  },
  bar: {
    display: 'flex', justifyContent: 'space-around',
    padding: '10px 0 8px',
  },
  tab: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
    flex: 1, padding: '4px 8px', cursor: 'pointer',
  },
  iconWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, letterSpacing: 0.2 },
  badge: {
    position: 'absolute', top: -4, right: -8,
    background: '#F5A623', color: '#fff',
    fontSize: 9, fontWeight: 700,
    borderRadius: 10, padding: '1px 4px',
    minWidth: 16, textAlign: 'center',
    border: '1.5px solid #fff',
  },
};
