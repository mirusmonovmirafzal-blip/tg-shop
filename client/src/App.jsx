import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import AccountPage from './pages/AccountPage';
import SuccessPage from './pages/SuccessPage';
import BottomNav from './components/BottomNav';

function getInitialPage() {
  if (window.location.pathname === '/success') return 'success';
  return 'catalog';
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);

  if (page === 'success') {
    return (
      <CartProvider>
        <SuccessPage onBack={() => setPage('catalog')} />
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <div style={{ position: 'relative', height: '100vh' }}>
        {page === 'catalog' && <CatalogPage />}
        {page === 'cart' && <CartPage />}
        {page === 'account' && <AccountPage />}
        <BottomNav page={page} onNavigate={setPage} />
      </div>
    </CartProvider>
  );
}
