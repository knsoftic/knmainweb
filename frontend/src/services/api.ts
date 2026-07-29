import { API_BASE } from '../utils/api-url';

const API_BASE_URL = API_BASE;

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const handleUnauthorized = async (originalRequest: () => Promise<any>) => {
  if (typeof window === 'undefined') {
    throw new Error('Unauthorized');
  }

  if (!isRefreshing) {
    isRefreshing = true;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!res.ok) throw new Error('Refresh failed');
      
      const data = await res.json();
      sessionStorage.setItem('admin_token', data.token);
      
      isRefreshing = false;
      onRefreshed(data.token);
    } catch (err) {
      isRefreshing = false;
      sessionStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
      throw err;
    }
  }

  return new Promise((resolve) => {
    subscribeTokenRefresh(() => {
      resolve(originalRequest());
    });
  });
};

export const apiService = {
  async get(endpoint: string): Promise<any> {
    const execute = async () => {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        cache: 'default',
      });
      if (res.status === 401) {
        return handleUnauthorized(() => this.get(endpoint));
      }
      if (!res.ok) throw new Error(`Failed to fetch ${endpoint}: ${res.status}`);
      return res.json();
    };
    return execute();
  },

  async post(endpoint: string, data: any): Promise<any> {
    const execute = async () => {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        return handleUnauthorized(() => this.post(endpoint, data));
      }
      if (!res.ok) {
        let errMsg = `Failed to post to ${endpoint}: ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody.error) errMsg = errBody.error;
        } catch {}
        throw new Error(errMsg);
      }
      return res.json();
    };
    return execute();
  },

  async put(endpoint: string, data: any): Promise<any> {
    const execute = async () => {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        return handleUnauthorized(() => this.put(endpoint, data));
      }
      if (!res.ok) {
        let errMsg = `Failed to update ${endpoint}: ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody.error) errMsg = errBody.error;
        } catch {}
        throw new Error(errMsg);
      }
      return res.json();
    };
    return execute();
  },

  async delete(endpoint: string): Promise<any> {
    const execute = async () => {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
        credentials: 'include',
      });
      if (res.status === 401) {
        return handleUnauthorized(() => this.delete(endpoint));
      }
      if (!res.ok) {
        let errMsg = `Failed to delete ${endpoint}: ${res.status}`;
        try {
          const errBody = await res.json();
          if (errBody.error) errMsg = errBody.error;
        } catch {}
        throw new Error(errMsg);
      }
      const text = await res.text();
      return text ? JSON.parse(text) : { success: true };
    };
    return execute();
  },

  async uploadFile(file: File): Promise<any> {
    const execute = async () => {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        credentials: 'include',
        body: formData,
      });

      if (res.status === 401) {
        return handleUnauthorized(() => this.uploadFile(file));
      }
      if (!res.ok) throw new Error('File upload failed');
      return res.json();
    };
    return execute();
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

