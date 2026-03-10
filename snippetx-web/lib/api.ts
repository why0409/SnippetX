import axios from 'axios';

const api = axios.create({
  // 生产环境通过环境变量 NEXT_PUBLIC_API_URL 注入，例如 https://api.yourdomain.com
  // 本地开发默认使用 http://localhost:9999
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9999',
});

// 请求拦截器注入 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
