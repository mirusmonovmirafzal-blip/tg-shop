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

function formatPrice(raw) {
  return raw / 100;
}

// Get all product categories with parent info
async function getCategories() {
  const res = await api.get('/entity/productfolder?limit=100&order=name');
  return res.data.rows.map((f) => ({
    id: f.id,
    name: f.name,
    parentId: f.productFolder ? f.productFolder.meta.href.split('/').pop() : null,
    imageUrl: null, // will be fetched separately if needed
  }));
}

// Get category image
async function getCategoryImage(categoryId) {
  try {
    const res = await api.get(`/entity/productfolder/${categoryId}/images?limit=1`);
    if (res.data.rows.length === 0) return null;
    return res.data.rows[0].meta.downloadHref || null;
  } catch {
    return null;
  }
}

// Get ALL images for a product
async function getProductImages(productId) {
  try {
    const res = await api.get(`/entity/product/${productId}/images?limit=10`);
    return res.data.rows.map((img) => img.meta.downloadHref).filter(Boolean);
  } catch {
    return [];
  }
}

// Get products with pagination, optionally filtered by category or search query
async function getProducts({ limit = 50, offset = 0, categoryId = null, search = null } = {}) {
  let url = `/entity/product?limit=${limit}&offset=${offset}&expand=productFolder`;

  const filters = [];
  if (categoryId) {
    const folderHref = `${BASE_URL}/entity/productfolder/${categoryId}`;
    filters.push(`productFolder=${encodeURIComponent(folderHref)}`);
  }
  if (search) {
    filters.push(`name~=${encodeURIComponent(search)}`);
  }
  if (filters.length) {
    url += `&filter=${filters.join(';')}`;
  }

  const res = await api.get(url);
  const products = [];

  for (const p of res.data.rows) {
    const price = p.salePrices?.[0]?.value ? formatPrice(p.salePrices[0].value) : 0;
    const images = await getProductImages(p.id);

    const product = {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price,
      imageUrl: images[0] || null,
      images,
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
  const positions = items.map((item) => ({
    quantity: item.quantity,
    price: item.price * 100,
    assortment: {
      meta: {
        href: item.variantId
          ? `${BASE_URL}/entity/variant/${item.variantId}`
          : `${BASE_URL}/entity/product/${item.productId}`,
        type: item.variantId ? 'variant' : 'product',
        mediaType: 'application/json',
      },
    },
  }));

  const description = [
    customerName ? `Имя: ${customerName}` : '',
    customerPhone ? `Телефон: ${customerPhone}` : '',
    customerAddress ? `Адрес: ${customerAddress}` : '',
    telegramUserId ? `Telegram ID: ${telegramUserId}` : '',
  ].filter(Boolean).join('\n');

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

module.exports = { getCategories, getProducts, getVariants, createOrder, getCategoryImage };
