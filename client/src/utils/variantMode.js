// Determines how to display variants based on characteristic name
// color → separate cards in catalog
// size  → selection inside one card

const COLOR_CHARS = ['color', 'colour', 'цвет', 'rang', 'renk'];
const SIZE_CHARS  = ['size', 'размер', 'olcham', 'razmer'];

export function getVariantMode(variants = []) {
  if (!variants.length) return 'none';

  // Collect all characteristic names across all variants (lowercase)
  const charNames = variants.flatMap((v) =>
    (v.characteristics || []).map((c) => c.name.toLowerCase().trim())
  );

  if (charNames.some((n) => COLOR_CHARS.includes(n))) return 'color'; // separate cards
  if (charNames.some((n) => SIZE_CHARS.includes(n)))  return 'size';  // selection

  // Default: size-like (selection)
  return 'size';
}

// Build a flat list of "virtual products" from a product's color variants
export function expandColorVariants(product) {
  return product.variants.map((v) => ({
    // Keep original product data but override with variant specifics
    ...product,
    id: `${product.id}__${v.id}`,       // unique key
    _realProductId: product.id,
    _variantId: v.id,
    name: v.name || product.name,
    price: v.price ?? product.price,
    hasVariants: true,                   // still open modal with all variants
    _preselectedVariantId: v.id,         // modal will pre-select this
  }));
}
