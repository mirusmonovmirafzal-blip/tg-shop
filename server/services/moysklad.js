const axios = require('axios');

const BASE_URL = 'https://api.moysklad.ru/api/remap/1.2';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.MOYSKLAD_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip',
  },
});

// Format price: MoySklad stores in kopecks → divide by 100
function formatPrice(raw) {
  return raw / 100;
}

// Get all product categories (folders)
async function getCategories() {
  const res = await api.get('/entity/productfolder?limit=100&order=name');
  return res.data.rows.map((f) => ({
    id: f.id,
    name: f.name,
    pathName: f.pathName || f.name,
    parentId: f.productFolder ? f.productFolder.meta.href.split('/').pop() : null,
  }));
}

// Get products with pagination, optionally filtered by category
async function getProducts({ limit = 50, offset = 0, categoryId = null } = {}) {
  let url = `/entity/product?limit=${limit}&offset=${offset}&expand=productFolder`;

  if (categoryId) {
    const folderHref = `${BASE_URL}/entity/productfolder/${categoryId}`;
    url += `&filter=productFolder=${encodeURIComponent(folderHref)}`;
  }

  const res = await api.get(url);
  const products = [];

  for (const p of res.data.rows) {
    const price = p.salePrices?.[0]?.value ? formatPrice(p.salePrices[0].value) : 0;
    const imageUrl = await getProductImage(p);

    const product = {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price,
      imageUrl,
      categoryId: p.productFolder ? p.productFolder.id : null,
      categoryName: p.productFolder ? p.productFolder.name : null,
      hasVariants: (p.variantsCount || 0) > 0,
      variants: [],
    };

    if (product.hasVariants) {
      product.variants = await getVariants(p.id, p.meta.href);
    }

    products.push(product);
  }

  return {
    products,
    total: res.data.meta.size,
    offset: res.data.meta.offset,
  };
}

// Get product image URL (best quality from images list)
async function getProductImage(product) {
  try {
    if (!product.images || product.images.meta.size === 0) return null;
    const imgRes = await api.get(`/entity/product/${product.id}/images?limit=1`);
    if (imgRes.data.rows.length === 0) return null;
    const img = imgRes.data.rows[0];
    // Return the download link with auth
    return img.meta.downloadHref || null;
  } catch {
    return null;
  }
}

// Get variants (modifications) for a product
async function getVariants(productId, productHref) {
  try {
    const res = await api.get(
      `/entity/variant?filter=product=${encodeURIComponent(productHref)}&limit=100`
    );
    return res.data.rows.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.salePrices?.[0]?.value ? formatPrice(v.salePrices[0].value) : null,
      characteristics: (v.characteristics || []).map((c) => ({
        name: c.name,
        value: c.value,
      })),
    }));
  } catch {
    return [];
  }
}

// Create a customer order in MoySklad
async function createOrder({ items, customerName, customerPhone, customerAddress, telegramUserId }) {
  const positions = items.map((item) => {
    const pos = {
      quantity: item.quantity,
      price: item.price * 100, // back to kopecks
      assortment: {
        meta: {
          href: item.variantId
            ? `${BASE_URL}/entity/variant/${item.variantId}`
            : `${BASE_URL}/entity/product/${item.productId}`,
          type: item.variantId ? 'variant' : 'product',
          mediaType: 'application/json',
        },
      },
    };
    return pos;
  });

  const description = [
    customerName ? `Имя: ${customerName}` : '',
    customerPhone ? `Телефон: ${customerPhone}` : '',
    customerAddress ? `Адрес: ${customerAddress}` : '',
    telegramUserId ? `Telegram ID: ${telegramUserId}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const body = {
    organization: await getDefaultOrganization(),
    positions,
    description,
  };

  const res = await api.post('/entity/customerorder', body);
  return res.data;
}

let _orgCache = null;
async function getDefaultOrganization() {
  if (_orgCache) return _orgCache;
  const res = await api.get('/entity/organization?limit=1');
  const org = res.data.rows[0];
  _orgCache = { meta: org.meta };
  return _orgCache;
}

module.exports = { getCategories, getProducts, getVariants, createOrder };
