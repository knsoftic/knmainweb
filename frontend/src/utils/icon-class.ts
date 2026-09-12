/**
 * Turns the icon typed in the admin into icon classes.
 * "fa-desktop" → "fa fa-desktop"; a full class list ("fab fa-shopify") is used as it is;
 * a bare name like "Shopify" is treated as a Font Awesome brand icon ("fab fa-shopify").
 */
export function iconClass(icon?: string | null, fallback = 'fa-desktop') {
  const value = String(icon || '').trim();
  if (!value) return `fa ${fallback}`;
  if (value.includes(' ')) return value;
  if (value.startsWith('fa-')) return `fa ${value}`;
  if (value.startsWith('bi-')) return `bi ${value}`;
  return `fab fa-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
