import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import AccountPage from './pages/AccountPage';
import SuccessPage from './pages/SuccessPage';
import BottomNav from './components/BottomNav';

function getInitialPage() {
  if (window.location.pathname === '/success') return 'success';
  return 'home';
}

export default function App() {
  const [page, setPage] = useState(getInitialPage);
  const [selectedCategory, setSelectedCategory] = useState(null);

  function handleCategorySelect(cat) {
    setSelectedCategory(cat);
    setPage('catalog');
  }

  function handleNavNavigate(tab) {
    if (tab === 'home') setSelectedCategory(null);
    setPage(tab);
  }

  if (page === 'success') {
    return (
      <CartProvider>
        <SuccessPage onBack={() => setPage('home')} />
      </CartProvider>
    );
  }

  // Catalog page hides the bottom nav's home tab active state
  const navPage = page === 'catalog' ? 'home' : page;

  return (
    <CartProvider>
      <div style={{ position: 'relative', height: '100vh' }}>
        {page === 'home' && <HomePage onCategorySelect={handleCategorySelect} />}
        {page === 'catalog' && (
          <CatalogPage
            category={selectedCategory}
            onBack={() => setPage('home')}
          />
        )}
        {page === 'cart' && <CartPage />}
        {page === 'account' && <AccountPage />}
        <BottomNav page={navPage} onNavigate={handleNavNavigate} />
      </div>
    </CartProvider>
  );
}
