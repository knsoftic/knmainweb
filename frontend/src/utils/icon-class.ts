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
  // Bootstrap Icons is no longer loaded (every icon on the site is Font Awesome), so a "bi-" name
  // would render as an empty space. Show the fallback icon instead of nothing.
  if (value.startsWith('bi-')) return `fa ${fallback}`;
  return `fab fa-${value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
