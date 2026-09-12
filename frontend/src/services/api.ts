import { API_BASE } from '../utils/api-url';

const API_BASE_URL = API_BASE;

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SESSION_EXPIRED = 'Your session has expired. Please log in again.';

// One refresh at a time; requests that hit a 401 meanwhile wait for the same one.
let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await res.json();
      sessionStorage.setItem('admin_token', data.token);
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const endSession = () => {
  sessionStorage.removeItem('admin_token');
  // Leaves a note for the sign-in page, so people are told why they were signed out
  // instead of simply landing back on the login screen.
  try { sessionStorage.setItem('admin_signed_out_reason', 'expired'); } catch {}
  // This module runs outside React, so there's no router here; a full navigation also drops in-memory admin state.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = '/admin/login';
};

/**
 * Sends a request; on a 401 it refreshes the access token and retries once. `send` must build its
 * headers on each call so the retry carries the new token.
 */
const sendWithAuth = async (send: () => Promise<Response>): Promise<Response> => {
  const res = await send();
  if (res.status !== 401 || typeof window === 'undefined') {
    return res;
  }

  try {
    await refreshAccessToken();
  } catch {
    endSession();
    throw new Error(SESSION_EXPIRED);
  }

  const retried = await send();
  if (retried.status === 401) {
    endSession();
    throw new Error(SESSION_EXPIRED);
  }
  return retried;
};

// Prefer the API's own explanation (e.g. "Image is too large…") over a generic message.
const readError = async (res: Response, fallback: string) => {
  try {
    const body = await res.json();
    if (body?.error) return String(body.error);
  } catch {}
  return fallback;
};

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  ...getAuthHeaders(),
});

export const apiService = {
  async get(endpoint: string): Promise<any> {
    const res = await sendWithAuth(() => fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { ...getAuthHeaders() },
      credentials: 'include',
      cache: 'default',
    }));
    if (!res.ok) throw new Error(await readError(res, `Failed to fetch ${endpoint}: ${res.status}`));
    return res.json();
  },

  async post(endpoint: string, data: any): Promise<any> {
    const res = await sendWithAuth(() => fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: jsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    }));
    if (!res.ok) throw new Error(await readError(res, `Failed to post to ${endpoint}: ${res.status}`));
    return res.json();
  },

  async put(endpoint: string, data: any): Promise<any> {
    const res = await sendWithAuth(() => fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: jsonHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    }));
    if (!res.ok) throw new Error(await readError(res, `Failed to update ${endpoint}: ${res.status}`));
    return res.json();
  },

  async delete(endpoint: string): Promise<any> {
    const res = await sendWithAuth(() => fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
      credentials: 'include',
    }));
    if (!res.ok) throw new Error(await readError(res, `Failed to delete ${endpoint}: ${res.status}`));
    const text = await res.text();
    return text ? JSON.parse(text) : { success: true };
  },

  async uploadFile(file: File): Promise<any> {
    const res = await sendWithAuth(() => {
      const formData = new FormData();
      formData.append('image', file);
      return fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        body: formData,
      });
    });
    if (!res.ok) throw new Error(await readError(res, 'File upload failed'));
    return res.json();
  },

  async getGlobalSeo() {
    return this.get('/seo/global');
  },

  async updateGlobalSeo(data: any) {
    return this.put('/seo/global', data);
  },

  async getPageSeo(slug: string) {
    return this.get(`/seo/pages/${slug}`);
  },

  async updatePageSeo(slug: string, data: any) {
    return this.put(`/seo/pages/${slug}`, data);
  },

  async changePassword(data: any) {
    return this.put('/auth/change-password', data);
  },
};
