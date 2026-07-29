import { API_BASE } from './api-url';

const BACKEND_URL = (API_BASE || '').replace(/\/api\/?$/, '');

export const resolveImageUrl = (value?: string | null, fallback = '') => {
  if (!value) {
    return fallback;
  }

  if (value.startsWith('http')) {
    return value;
  }

  if (value.startsWith('/uploads')) {
    return `${BACKEND_URL}${value}`;
  }

  if (value.startsWith('/')) {
    return value;
  }

  return `${BACKEND_URL}/${value}`;
};