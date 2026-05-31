import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import SubcategoryPage from './pages/SubcategoryPage';
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
  const [allCategories, setAllCategories] = useState([]);
  const [catalogBackTo, setCatalogBackTo] = useState('home');

  function handleCategoriesLoaded(cats) {
    setAllCategories(cats);
  }

  function handleCategorySelect(cat) {
    const subs = allCategories.filter(c => c.parentId === cat.id);
    setSelectedCategory(cat);
    if (subs.length > 0) {
      setPage('subcategory');
    } else {
      setCatalogBackTo('home');
      setPage('catalog');
    }
  }

  function handleSubcategorySelect(subcat) {
    setSelectedCategory(subcat);
    setCatalogBackTo('subcategory');
    setPage('catalog');
  }

  function handleViewAll() {
    setCatalogBackTo('subcategory');
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

  const navPage = page === 'catalog' || page === 'subcategory' ? 'home' : page;
  const subcategories = selectedCategory ? allCategories.filter(c => c.parentId === selectedCategory.id) : [];

  return (
    <CartProvider>
      <div style={{ position: 'relative', height: '100vh' }}>
        {page === 'home' && (
          <HomePage
            onCategorySelect={handleCategorySelect}
            onCategoriesLoaded={handleCategoriesLoaded}
          />
        )}
        {page === 'subcategory' && (
          <SubcategoryPage
            parentCategory={selectedCategory}
            subcategories={subcategories}
            onSelectSubcategory={handleSubcategorySelect}
            onViewAll={handleViewAll}
            onBack={() => setPage('home')}
          />
        )}
        {page === 'catalog' && (
          <CatalogPage
            category={selectedCategory}
            onBack={() => setPage(catalogBackTo)}
          />
        )}
        {page === 'cart' && <CartPage />}
        {page === 'account' && <AccountPage />}
        <BottomNav page={navPage} onNavigate={handleNavNavigate} />
      </div>
    </CartProvider>
  );
}
