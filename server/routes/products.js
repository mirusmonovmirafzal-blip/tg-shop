const express = require('express');
const router = express.Router();
const { getCategories, getProducts } = require('../services/moysklad');

// Simple in-memory cache (5 min TTL)
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

// GET /api/products?limit=50&offset=0&categoryId=xxx
router.get('/products', async (req, res) => {
  try {
    const { limit = 50, offset = 0, categoryId } = req.query;
    const cacheKey = `products_${categoryId || 'all'}_${offset}_${limit}`;
    const data = await cached(cacheKey, () =>
      getProducts({ limit: parseInt(limit), offset: parseInt(offset), categoryId })
    );
    res.json(data);
  } catch (err) {
    console.error('Products error:', err.message);
    res.status(500).json({ error: 'Ошибка загрузки товаров' });
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

module.exports = router;
