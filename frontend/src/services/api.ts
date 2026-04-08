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

// Interceptor para capturar erro 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Capturou erro 401: removemos o token local
      localStorage.removeItem('auth_token');
      console.warn('Token expirado ou inválido. Faça login novamente.');
      // Opcionalmente podemos disparar um evento aqui para a UI redirecionar
    }
    return Promise.reject(error);
  }
);

export default api;
