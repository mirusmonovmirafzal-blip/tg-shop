import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import SuccessPage from './pages/SuccessPage';

// Simple router based on URL
function getInitialPage() {
  if (window.location.pathname === '/success') return 'success';
  return 'catalog';
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);

  return (
    <CartProvider>
      {page === 'catalog' && (
        <CatalogPage onGoToCart={() => setPage('cart')} />
      )}
      {page === 'cart' && (
        <CartPage onBack={() => setPage('catalog')} />
      )}
      {page === 'success' && (
        <SuccessPage onBack={() => setPage('catalog')} />
      )}
    </CartProvider>
  );
}
