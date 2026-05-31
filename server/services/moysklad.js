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

// Fetch raw product rows for a single folder filter (or no filter if folderId is null)
async function fetchRawProducts({ limit, offset, folderId = null, search = null }) {
  const params = { limit, offset, expand: 'productFolder' };
  const filterParts = [];
  if (folderId) {
    filterParts.push(`productFolder=${BASE_URL}/entity/productfolder/${folderId}`);
  }
  if (search) {
    filterParts.push(`name~=${search}`);
  }
  if (filterParts.length) params.filter = filterParts.join(';');

  console.log('[MoySklad] GET /entity/product params:', JSON.stringify(params));
  try {
    const res = await api.get('/entity/product', { params });
    console.log(`[MoySklad] returned ${res.data.rows.length} / ${res.data.meta.size} products`);
    return res.data;
  } catch (err) {
    const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
    console.error(`[MoySklad] error ${err.response?.status}: ${detail}`);
    throw err;
  }
}

async function buildProductsSequentially(rows) {
  const products = [];
  for (const p of rows) {
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
  return products;
}

// In-memory cache of ALL raw product rows (no images), refreshed every 5 min
let _allRowsCache = null;
let _allRowsCacheTime = 0;
const ALL_CACHE_TTL = 5 * 60 * 1000;

async function getAllRawProducts() {
  if (_allRowsCache && Date.now() - _allRowsCacheTime < ALL_CACHE_TTL) {
    return _allRowsCache;
  }
  const allRows = [];
  let offset = 0;
  const limit = 100;
  let total = Infinity;
  while (offset < total) {
    const data = await fetchRawProducts({ limit, offset });
    total = data.meta.size;
    allRows.push(...data.rows);
    offset += data.rows.length;
    if (data.rows.length < limit) break;
  }
  console.log(`[MoySklad] all-products cache loaded: ${allRows.length} rows`);
  _allRowsCache = allRows;
  _allRowsCacheTime = Date.now();
  return allRows;
}

// Get products with pagination, optionally filtered by category or search query
async function getProducts({ limit = 50, offset = 0, categoryIds = null, search = null } = {}) {
  // Search: MoySklad name~ filter works fine
  if (search) {
    const data = await fetchRawProducts({ limit, offset, search });
    const products = await buildProductsSequentially(data.rows);
    return { products, total: data.meta.size, offset: data.meta.offset };
  }

  // No category filter: direct paginated request (fast)
  if (!categoryIds || categoryIds.length === 0) {
    const data = await fetchRawProducts({ limit, offset });
    const products = await buildProductsSequentially(data.rows);
    return { products, total: data.meta.size, offset: data.meta.offset };
  }

  // Category filter: load all rows into cache, filter in-memory
  const allRows = await getAllRawProducts();
  const idsSet = new Set(categoryIds);
  const filtered = allRows.filter(p => p.productFolder && idsSet.has(p.productFolder.id));
  const page = filtered.slice(offset, offset + limit);
  const products = await buildProductsSequentially(page);
  return { products, total: filtered.length, offset };
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

module.exports = { getCategories, getProducts, getVariants, createOrder, getCategoryImage, BASE_URL };
