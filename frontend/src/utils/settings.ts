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

export const getSetting = (settings: any, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = settings?.[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return fallback;
};
