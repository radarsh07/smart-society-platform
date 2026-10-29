import axios from 'axios';

let apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').trim();
if (!apiBase.endsWith('/api') && !apiBase.endsWith('/api/')) {
  apiBase = apiBase.replace(/\/+$/, '') + '/api';
}

export const httpClient = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ssasm_token');
    // Valid JWTs always begin with 'eyJ'
    if (token && token.startsWith('eyJ')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ssasm_token');
      localStorage.removeItem('ssasm_user');
      localStorage.removeItem('ssasm_role');
    }
    return Promise.reject(error);
  }
);
