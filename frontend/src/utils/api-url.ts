/**
 * Server-side API helper.
 * Centralizes the API base URL.
 */
export const API_BASE = (typeof window === 'undefined' && process.env.API_INTERNAL_URL)
  ? process.env.API_INTERNAL_URL
  : process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  console.warn('WARNING: NEXT_PUBLIC_API_URL is not set in environment variables.');
}

/** Build a full API URL from an endpoint like '/settings' */
export const apiUrl = (endpoint: string) => {
  if (!API_BASE) {
    throw new Error('NEXT_PUBLIC_API_URL is missing. Please configure it in your environment variables.');
  }
  return `${API_BASE}${endpoint}`;
};
