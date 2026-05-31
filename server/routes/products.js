const express = require('express');
const router = express.Router();
const { getCategories, getProducts, getCategoryImage } = require('../services/moysklad');

// Collect categoryId + all descendant IDs from the cached category list
function collectCategoryIds(allCats, rootId) {
  const ids = [rootId];
  const queue = [rootId];
  while (queue.length) {
    const pid = queue.shift();
    for (const c of allCats) {
      if (c.parentId === pid) { ids.push(c.id); queue.push(c.id); }
    }
  }
  return ids;
}

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function cached(key, fn) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < CACHE_TTL) return Promise.resolve(entry.data);
  return fn().then((data) => {
    cache.set(key, { data, time: Date.now() });
    return data;
  });
}

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await cached('categories', getCategories);
    res.json(categories);
  } catch (err) {
    console.error('Categories error:', err.message);
    res.status(500).json({ error: 'Ошибка загрузки категорий' });
  }
});

// GET /api/products?limit=50&offset=0&categoryId=xxx&search=yyy
router.get('/products', async (req, res) => {
  try {
    const { limit = 30, offset = 0, categoryId, search } = req.query;

    // Resolve categoryId → categoryId + all subcategory IDs
    let categoryIds = null;
    if (categoryId) {
      const allCats = await cached('categories', getCategories);
      categoryIds = collectCategoryIds(allCats, categoryId);
    }

    if (search) {
      const data = await getProducts({ limit: parseInt(limit), offset: parseInt(offset), categoryIds, search });
      return res.json(data);
    }
    const cacheKey = `products_${categoryId || 'all'}_${offset}_${limit}`;
    const data = await cached(cacheKey, () =>
      getProducts({ limit: parseInt(limit), offset: parseInt(offset), categoryIds })
    );
    res.json(data);
  } catch (err) {
    console.error('Products error:', err.message);
    res.status(500).json({ error: 'Ошибка загрузки товаров' });
  }
});

// GET /api/icon-names — list available icon filenames for fuzzy matching
router.get('/icon-names', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const iconsDir = path.join(__dirname, '../../client/dist/icons');
  try {
    if (fs.existsSync(iconsDir)) {
      const files = fs.readdirSync(iconsDir).filter(f => /\.(PNG|png)$/i.test(f));
      return res.json(files);
    }
    res.json([]);
  } catch {
    res.json([]);
  }
});

// Proxy MoySklad image (to avoid CORS / auth issues)
router.get('/image', async (req, res) => {
  const axios = require('axios');
  const { url } = req.query;
  if (!url) return res.status(400).send('No url');
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${process.env.MOYSKLAD_TOKEN}` },
      responseType: 'stream',
    });
    res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch {
    res.status(404).send('Image not found');
  }
});

// GET /api/category-image?id=xxx — proxy category image
router.get('/category-image', async (req, res) => {
  const axios = require('axios');
  const { id } = req.query;
  if (!id) return res.status(400).send('No id');
  try {
    const downloadHref = await cached(`cat-img-${id}`, () => getCategoryImage(id));
    if (!downloadHref) return res.status(404).send('No image');
    const response = await axios.get(downloadHref, {
      headers: { Authorization: `Bearer ${process.env.MOYSKLAD_TOKEN}` },
      responseType: 'stream',
    });
    res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch {
    res.status(404).send('Image not found');
  }
});

module.exports = router;
