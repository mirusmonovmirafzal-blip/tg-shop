const BASE = '/api';

export async function fetchCategories() {
  const res = await fetch(`${BASE}/categories`);
  if (!res.ok) throw new Error('Failed to load categories');
  return res.json();
}

export async function fetchProducts({ limit = 30, offset = 0, categoryId, search } = {}) {
  const params = new URLSearchParams({ limit, offset });
  if (categoryId) params.set('categoryId', categoryId);
  if (search) params.set('search', search);
  const res = await fetch(`${BASE}/products?${params}`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function fetchMaternityBag() {
  const res = await fetch(`${BASE}/maternity-bag`);
  if (!res.ok) throw new Error('Failed to load maternity bag');
  return res.json();
}

export async function fetchSarpa() {
  const res = await fetch(`${BASE}/sarpa`);
  if (!res.ok) throw new Error('Failed to load sarpa');
  return res.json();
}

export async function fetchIconNames() {
  try {
    const res = await fetch(`${BASE}/icon-names`);
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export function getImageUrl(downloadHref) {
  if (!downloadHref) return null;
  return `${BASE}/image?url=${encodeURIComponent(downloadHref)}`;
}

export function getCategoryImageUrl(categoryId) {
  return `${BASE}/category-image?id=${categoryId}`;
}

export async function createOrder(data) {
  const res = await fetch(`${BASE}/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}
