export type SocialLink = {
  platform?: string;
  label?: string;
  url?: string;
  icon?: string;
  enabled?: boolean;
  display_order?: number;
};

export const parseSocialLinks = (settings: any): SocialLink[] => {
  const raw = settings?.social_links;

  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  const legacyLinks: SocialLink[] = [
    { platform: 'facebook', label: 'Facebook', url: settings?.facebook_url, icon: 'fab fa-facebook-f' },
    { platform: 'instagram', label: 'Instagram', url: settings?.instagram_url, icon: 'fab fa-instagram' },
    { platform: 'linkedin', label: 'LinkedIn', url: settings?.linkedin_url, icon: 'fab fa-linkedin-in' },
    { platform: 'twitter', label: 'X / Twitter', url: settings?.twitter_url, icon: 'fab fa-x-twitter' },
    { platform: 'youtube', label: 'YouTube', url: settings?.youtube_url, icon: 'fab fa-youtube' },
  ];

  return legacyLinks.filter((link) => Boolean(link.url));
};

export const getEnabledSocialLinks = (settings: any) => {
  return parseSocialLinks(settings)
    .filter((link) => link.enabled !== false && Boolean(link.url))
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
};

// The social networks' own front pages. A link to one of these is a placeholder someone never
// replaced, not a profile.
const SOCIAL_PLACEHOLDER = /^(https?:)?\/\/(www\.)?[a-z0-9-]+\.[a-z.]+\/?$/i;

/**
 * True when a URL points at an actual profile. Rejects empty values, a network's bare domain
 * (https://www.linkedin.com/), and any link back to this site — all three render as an icon that
 * takes the visitor nowhere, which is worse than no icon at all.
 */
export const isRealProfileUrl = (value?: string | null) => {
  const raw = String(value || '').trim();
  if (!raw || SOCIAL_PLACEHOLDER.test(raw)) {
    return false;
  }

  try {
    const url = new URL(raw, 'https://knsoftic.com');
    if (!url.pathname.replace(/\/+$/, '')) {
      return false;
    }
    return !/(^|\.)knsoftic\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
};

/** Social links that are both switched on and actually point somewhere. */
export const getRealSocialLinks = (settings: any) =>
  getEnabledSocialLinks(settings).filter((link) => isRealProfileUrl(link.url));

/**
 * Breaks a one-line address into the parts search engines index separately. A leading company
 * name is dropped, the last part is treated as the country and the one before it as the town.
 * Returns null when there is too little to be worth publishing.
 */
export const toPostalAddress = (address?: string | null, businessName?: string) => {
  const parts = String(address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (businessName && parts[0] && parts[0].toLowerCase() === businessName.trim().toLowerCase()) {
    parts.shift();
  }

  if (parts.length < 2) {
    return null;
  }

  const country = parts.pop() as string;
  const locality = parts.pop() as string;

  return {
    '@type': 'PostalAddress',
    ...(parts.length ? { streetAddress: parts.join(', ') } : {}),
    addressLocality: locality,
    addressCountry: /^pakistan$/i.test(country) ? 'PK' : country,
  };
};

const DAYS: Record<string, string> = {
  mon: 'Mo', tue: 'Tu', wed: 'We', thu: 'Th', fri: 'Fr', sat: 'Sa', sun: 'Su',
};

const to24Hour = (hour: string, minute: string, meridiem?: string) => {
  let value = Number(hour) % 12;
  if (/pm/i.test(meridiem || '')) {
    value += 12;
  }
  return `${String(value).padStart(2, '0')}:${minute}`;
};

/**
 * Turns "Mon – Sat: 9:00 AM – 7:00 PM" into schema.org's "Mo-Sa 09:00-19:00".
 * Returns null for anything it cannot read with confidence, rather than guessing.
 */
export const toOpeningHours = (value?: string | null) => {
  const text = String(value || '').replace(/[–—]/g, '-');
  const match = text.match(
    /([a-z]{3})[a-z]*\s*-\s*([a-z]{3})[a-z]*\s*:?\s*(\d{1,2}):(\d{2})\s*([ap]m)?\s*-\s*(\d{1,2}):(\d{2})\s*([ap]m)?/i
  );
  if (!match) {
    return null;
  }

  const [, fromDay, toDay, fromHour, fromMinute, fromMeridiem, toHour, toMinute, toMeridiem] = match;
  const start = DAYS[fromDay.toLowerCase()];
  const end = DAYS[toDay.toLowerCase()];
  if (!start || !end) {
    return null;
  }

  return `${start}-${end} ${to24Hour(fromHour, fromMinute, fromMeridiem)}-${to24Hour(toHour, toMinute, toMeridiem)}`;
};

/** The one number the business answers on, wherever a phone number is shown or published. */
export const PRIMARY_PHONE = '+92 345 2470250';

/**
 * The number to show anywhere on the site.
 *
 * Several settings fields can hold a phone number and they had drifted apart - the footer showed
 * one, the structured data published another. Everything asks this for it now, so the visible
 * number, the tel: link, the WhatsApp link and what search engines are told can never disagree.
 */
export const getPrimaryPhone = (settings: any) =>
  getSetting(settings, ['contact_phone', 'whatsapp_number', 'customer_care_number', 'phone_number'], PRIMARY_PHONE);

export const getSetting = (settings: any, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = settings?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return fallback;
};
