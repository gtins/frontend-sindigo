import axios from 'axios';
import AuthService from './authService';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
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
let isAlerting403 = false;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void, reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Função auxiliar para verificar se o token expirou localmente
const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp;
    const now = Date.now() / 1000;
    return exp < now + 5;
  } catch (e) {
    return true;
  }
};

// Interceptor para capturar erros 401 e 403
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const token = localStorage.getItem('auth_token');
    const expired = isTokenExpired(token);

    // Evitar loop infinito se o próprio endpoint de refresh falhar
    if (originalRequest.url === '/auth/refresh') {
      return Promise.reject(error);
    }

    // Se for 401 (Unauthorized) ou 403 (Forbidden mas com token expirado)
    if (error.response && (error.response.status === 401 || (error.response.status === 403 && expired))) {
      if (!originalRequest._retry) {
        if (!isRefreshing) {
          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const authResponse = await AuthService.refreshAuthToken();
            const newToken = authResponse.token;

            processQueue(null, newToken);
            isRefreshing = false;

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;

            AuthService.removeToken();
            if (!isRedirecting && window.location.pathname !== '/login') {
              isRedirecting = true;
              console.warn('Sessão expirada. Redirecionando para login...');
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        } else {
          // Se já está atualizando o token, coloca na fila
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }
      }
    }
    // Se for 403 legítimo (falta de permissão de role)
    else if (error.response && error.response.status === 403) {
      // Ignorar alerta no logout e em requisições GET (leitura não deve travar a tela)
      if (originalRequest.url !== '/auth/logout' && originalRequest.method !== 'get') {
        if (!isAlerting403 && !isRedirecting) {
          isAlerting403 = true;
          alert('Você não tem permissão para executar essa ação (Acesso Negado)');

          setTimeout(() => {
            isAlerting403 = false;
          }, 3000);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
