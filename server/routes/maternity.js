const express = require('express');
const router = express.Router();
const config = require('../data/maternityBag');
const { getAllRawProducts, buildProductsSequentially } = require('../services/moysklad');

let cache = null;
let cacheTime = 0;
const TTL = 5 * 60 * 1000;

// Find a raw MoySklad product row matching a config entry (by id or name)
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

// GET /api/maternity-bag — returns subcategories with grouped products
router.get('/maternity-bag', async (req, res) => {
  try {
    if (cache && Date.now() - cacheTime < TTL) return res.json(cache);

    const allRows = await getAllRawProducts();
    const subcategories = [];

    for (const sc of config.subcategories) {
      const result = { id: sc.id, name: sc.name, emoji: sc.emoji, obligatory: [], recommended: [] };

      for (const tab of ['obligatory', 'recommended']) {
        const entries = sc.items[tab] || [];
        const rows = [];
        const qtyByRowId = {};
        for (const e of entries) {
          const row = findRow(allRows, e);
          if (row) {
            rows.push(row);
            qtyByRowId[row.id] = e.qty || null;
          }
        }
        const built = await buildProductsSequentially(rows);
        result[tab] = built.map((p) => ({ ...p, qty: qtyByRowId[p.id] || null }));
      }

      result.count = result.obligatory.length + result.recommended.length;
      subcategories.push(result);
    }

    cache = { subcategories };
    cacheTime = Date.now();
    res.json(cache);
  } catch (err) {
    console.error('Maternity error:', err.message);
    res.status(500).json({ error: 'Ошибка загрузки раздела' });
  }
});

module.exports = router;
