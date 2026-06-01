import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import SubcategoryPage from './pages/SubcategoryPage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import MaternityPage from './pages/MaternityPage';
import MaternityListPage from './pages/MaternityListPage';
import SarpaPage from './pages/SarpaPage';
import CartPage from './pages/CartPage';
import AccountPage from './pages/AccountPage';
import SuccessPage from './pages/SuccessPage';
import BottomNav from './components/BottomNav';

function getInitialStack() {
  if (window.location.pathname === '/success') return [{ page: 'success' }];
  return [{ page: 'home' }];
}

// Pages that live "under" the Home tab
const HOME_GROUP = ['home', 'subcategory', 'catalog', 'maternity', 'maternityList', 'sarpa', 'product'];

export default function App() {
  const [stack, setStack] = useState(getInitialStack);
  const [allCategories, setAllCategories] = useState([]);

  const current = stack[stack.length - 1];

  const push = (entry) => setStack((s) => [...s, entry]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  const goTab = (page) => setStack([{ page }]);

  function handleCategoriesLoaded(cats) {
    setAllCategories(cats);
  }

  function handleCategorySelect(cat) {
    const subs = allCategories.filter((c) => c.parentId === cat.id);
    if (subs.length > 0) push({ page: 'subcategory', category: cat });
    else push({ page: 'catalog', category: cat });
  }

  function handleNavNavigate(tab) {
    goTab(tab);
  }

  const openProduct = (product) => push({ page: 'product', product });

  if (current.page === 'success') {
    return (
      <CartProvider>
        <SuccessPage onBack={() => goTab('home')} />
      </CartProvider>
    );
  }

  const subcategories = current.category
    ? allCategories.filter((c) => c.parentId === current.category.id)
    : [];

  const navPage = HOME_GROUP.includes(current.page) ? 'home' : current.page;
  const showNav = current.page !== 'product';

  return (
    <CartProvider>
      <div style={{ position: 'relative', height: '100vh' }}>
        {current.page === 'home' && (
          <HomePage
            onCategorySelect={handleCategorySelect}
            onCategoriesLoaded={handleCategoriesLoaded}
            onOpenProduct={openProduct}
            onOpenMaternity={() => push({ page: 'maternity' })}
            onOpenSarpa={() => push({ page: 'sarpa' })}
          />
        )}

        {current.page === 'subcategory' && (
          <SubcategoryPage
            parentCategory={current.category}
            subcategories={subcategories}
            onSelectSubcategory={(subcat) => push({ page: 'catalog', category: subcat })}
            onViewAll={() => push({ page: 'catalog', category: current.category })}
            onBack={back}
          />
        )}

        {current.page === 'catalog' && (
          <CatalogPage category={current.category} onBack={back} onOpenProduct={openProduct} />
        )}

        {current.page === 'maternity' && (
          <MaternityPage
            onBack={back}
            onSelectSubcategory={(sc) => push({ page: 'maternityList', subcategory: sc })}
            onOpenCart={() => goTab('cart')}
          />
        )}

        {current.page === 'maternityList' && (
          <MaternityListPage
            subcategory={current.subcategory}
            onBack={back}
            onOpenProduct={openProduct}
            onOpenCart={() => goTab('cart')}
          />
        )}

        {current.page === 'sarpa' && (
          <SarpaPage onBack={back} onOpenProduct={openProduct} onOpenCart={() => goTab('cart')} />
        )}

        {current.page === 'product' && (
          <ProductPage product={current.product} onBack={back} onOpenProduct={openProduct} />
        )}

        {current.page === 'cart' && <CartPage />}
        {current.page === 'account' && <AccountPage />}

        {showNav && <BottomNav page={navPage} onNavigate={handleNavNavigate} />}
      </div>
    </CartProvider>
  );
}
