import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function ProductListItem({ product, onOpenProduct }) {
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);

  const images = (product.images || []).map(getImageUrl).filter(Boolean);
  if (!images.length && product.imageUrl) images.push(getImageUrl(product.imageUrl));
  const image = images[0] || null;

  function handleAdd(e) {
    e.stopPropagation();
    // Variant products → open full page to choose
    if (product.hasVariants && product.variants?.length > 0) {
      onOpenProduct(product);
      return;
    }
    dispatch({
      type: 'ADD',
      item: {
        productId: product._realProductId || product.id,
        variantId: product._variantId || null,
        name: product.name,
        variantName: null,
        price: product.price,
        imageUrl: image,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <div style={s.row} onClick={() => onOpenProduct(product)}>
      <div style={s.imgWrap}>
        {image ? <img src={image} alt={product.name} style={s.img} loading="lazy" /> : <div style={s.ph}>🛍️</div>}
      </div>
      <div style={s.mid}>
        <p style={s.name}>{product.name}</p>
        {product.qty && <p style={s.qty}>{product.qty}</p>}
        <p style={s.price}>{formatPrice(product.price)}</p>
      </div>
      <button onClick={handleAdd} style={{ ...s.addBtn, ...(added ? s.addBtnDone : {}) }}>
        {added ? '✓ В корзине' : '+ В корзину'}
      </button>
    </div>
  );
}

const s = {
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: '#fff', borderRadius: 16, padding: 12, marginBottom: 10,
    border: '1px solid #F0E6CC', cursor: 'pointer',
    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
  },
  imgWrap: {
    width: 78, height: 78, borderRadius: 12, overflow: 'hidden',
    background: '#FFFBF0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  ph: { fontSize: 28 },
  mid: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 14, fontWeight: 600, color: '#3D2400', lineHeight: 1.3, marginBottom: 3,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  qty: { fontSize: 12, color: '#B89A60', marginBottom: 4 },
  price: { fontSize: 15, fontWeight: 800, color: '#3D2400' },
  addBtn: {
    flexShrink: 0, alignSelf: 'center',
    padding: '10px 14px', borderRadius: 12, border: 'none',
    background: '#FFF3C4', color: '#3D2400', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
  },
  addBtnDone: { background: '#22C55E', color: '#fff' },
};
