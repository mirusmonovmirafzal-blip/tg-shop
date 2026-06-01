const express = require('express');
const router = express.Router();
const config = require('../data/sarpa');
const { getAllRawProducts, buildProductsSequentially } = require('../services/moysklad');

let cache = null;
let cacheTime = 0;
const TTL = 5 * 60 * 1000;

function findRow(allRows, entry) {
  if (entry.productId) {
    return allRows.find((r) => r.id === entry.productId) || null;
  }
  if (entry.name) {
    const n = entry.name.toLowerCase().trim();
    return (
      allRows.find((r) => r.name.toLowerCase().trim() === n) ||
      allRows.find((r) => r.name.toLowerCase().includes(n)) ||
      null
    );
  }
  return null;
}

async function buildTab(allRows, entries) {
  const rows = [];
  const qtyByRowId = {};
  for (const e of entries || []) {
    const row = findRow(allRows, e);
    if (row) {
      rows.push(row);
      qtyByRowId[row.id] = e.qty || null;
    }
  }
  const built = await buildProductsSequentially(rows);
  return built.map((p) => ({ ...p, qty: qtyByRowId[p.id] || null }));
}

// GET /api/sarpa — returns { obligatory: [...], recommended: [...] }
router.get('/sarpa', async (req, res) => {
  try {
    if (cache && Date.now() - cacheTime < TTL) return res.json(cache);
    const allRows = await getAllRawProducts();
    const obligatory = await buildTab(allRows, config.obligatory);
    const recommended = await buildTab(allRows, config.recommended);
    cache = { obligatory, recommended };
    cacheTime = Date.now();
    res.json(cache);
  } catch (err) {
    console.error('Sarpa error:', err.message);
    res.status(500).json({ error: 'Ошибка загрузки раздела' });
  }
});

module.exports = router;
