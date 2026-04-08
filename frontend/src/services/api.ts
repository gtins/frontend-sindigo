import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Interceptor para inserir token automaticamente no header Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRedirecting = false;

// Interceptor para capturar erro 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Capturou erro 401: removemos o token local
      localStorage.removeItem('auth_token');
      
      if (!isRedirecting && window.location.pathname !== '/login') {
        isRedirecting = true;
        console.warn('Token expirado ou inválido. Redirecionando para login...');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
