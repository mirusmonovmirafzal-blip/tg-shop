import { getImageUrl } from '../api';

function formatPrice(p) {
  return new Intl.NumberFormat('ru-RU').format(p) + ' сум';
}

export default function ProductCard({ product, onClick }) {
  const imageUrl = getImageUrl(product.imageUrl);
  const price = product.hasVariants && product.variants.length > 0
    ? product.variants[0].price ?? product.price
    : product.price;

  return (
    <div onClick={onClick} style={styles.card}>
      <div style={styles.imageWrap}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            style={styles.image}
            loading="lazy"
          />
        ) : (
          <div style={styles.imagePlaceholder}>🛍️</div>
        )}
      </div>
      <div style={styles.body}>
        <p style={styles.name}>{product.name}</p>
        <div style={styles.footer}>
          <span style={styles.price}>
            {product.hasVariants ? 'от ' : ''}{formatPrice(price)}
          </span>
          <div style={styles.addIcon}>+</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    transition: 'transform 0.15s, box-shadow 0.15s',
    active: { transform: 'scale(0.97)' },
  },
  imageWrap: {
    width: '100%',
    paddingTop: '75%',
    position: 'relative',
    background: '#F5F6FA',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
  },
  body: { padding: '10px 12px 12px' },
  name: {
    fontSize: 13,
    fontWeight: 500,
    color: '#1A1A2E',
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    marginBottom: 8,
  },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 13, fontWeight: 700, color: '#5B67F8' },
  addIcon: {
    width: 28, height: 28, borderRadius: 8,
    background: '#5B67F8', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 300, lineHeight: 1,
  },
};
