import axios from 'axios';
import AuthService from './authService';

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
let isAlerting403 = false;

// Função auxiliar para verificar se o token expirou localmente
const isTokenExpired = (token: string | null) => {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    const exp = decoded.exp;
    // Adiciona uma margem de segurança de 5 segundos
    const now = Date.now() / 1000;
    return exp < now + 5;
  } catch (e) {
    return true; // Se não conseguir parsear, assume expirado
  }
};

// Interceptor para capturar erros 401 e 403
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const token = localStorage.getItem('auth_token');
    const expired = isTokenExpired(token);

    // Se for 401 (Unauthorized) ou 403 (Forbidden mas com token expirado)
    if (error.response && (error.response.status === 401 || (error.response.status === 403 && expired))) {
      // Removemos todos os dados locais usando o AuthService
      AuthService.removeToken();
      
      if (!isRedirecting && window.location.pathname !== '/login') {
        isRedirecting = true;
        console.warn('Token expirado ou inválido. Redirecionando para login...');
        window.location.href = '/login';
      }
    } 
    // Se for 403 legítimo (falta de permissão de role)
    else if (error.response && error.response.status === 403) {
      if (!isAlerting403 && !isRedirecting) {
        isAlerting403 = true;
        alert('Você não tem permissão para executar essa ação (Acesso Negado)');
        
        // Evita spam de alertas liberando a flag após 3 segundos
        setTimeout(() => {
          isAlerting403 = false;
        }, 3000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
