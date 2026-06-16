import api from './api';

interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string; // Adicionado para a nova arquitetura
  type: string;
  expiresIn: number;
  role?: string;
  id?: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface TokenValidationResponse {
  valid: boolean;
  reason?: string;
  expiresAt?: string;
}

export class AuthService {
  private static readonly STORAGE_KEY = 'auth_token';

  private static readonly REFRESH_STORAGE_KEY = 'refresh_token';

  /**
   * Armazena os tokens no localStorage
   */
  static saveTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.STORAGE_KEY, token);
    localStorage.setItem(this.REFRESH_STORAGE_KEY, refreshToken);
  }

  /**
   * Recupera o token do localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Recupera o refresh token do localStorage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_STORAGE_KEY);
  }

  /**
   * Remove os tokens e perfil do localStorage
   */
  static removeToken(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.REFRESH_STORAGE_KEY);
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }

  /**
   * Verifica se existe token no localStorage
   */
  static hasToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Valida o token com o backend
   */
  static async validateToken(): Promise<TokenValidationResponse> {
    const token = this.getToken();

    if (!token) {
      return { valid: false, reason: 'Token não encontrado' };
    }

    try {
      const response = await api.get<TokenValidationResponse>('/auth/validate');
      return response.data;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      this.removeToken();
      return { valid: false, reason: 'Erro ao validar token' };
    }
  }

  /**
   * Realiza login do usuário
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      this.saveTokens(response.data.token, response.data.refreshToken);
      
      if (response.data.role) {
        localStorage.setItem('role', response.data.role);
      }
      
      // Alguns backends retornam id no login, se vier, salvamos
      if (response.data.id) {
        localStorage.setItem('userId', response.data.id);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  /**
   * Obtém os dados do usuário atual (novo endpoint)
   */
  static async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await api.get<UserProfile>('/user/me');
      if (response.data.role) localStorage.setItem('role', response.data.role);
      if (response.data.id) localStorage.setItem('userId', response.data.id);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário atual:', error);
      throw error;
    }
  }

  /**
   * Realiza o cadastro do usuário
   */
  static async register(credentials: RegisterCredentials): Promise<void> {
    try {
      await api.post('/auth/register', credentials);
    } catch (error) {
      console.error('Erro ao fazer cadastro:', error);
      throw error;
    }
  }

  /**
   * Tenta renovar o token usando o refresh token
   */
  static async refreshAuthToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) throw new Error('Sessão expirada. Por favor, faça login novamente.');

    try {
      // Fazemos a chamada contornando o interceptor usando axios puro ou ignorando auth
      const response = await api.post<AuthResponse>('/auth/refresh', { refreshToken });
      
      this.saveTokens(response.data.token, response.data.refreshToken);
      return response.data;
    } catch (error) {
      this.removeToken();
      throw error;
    }
  }

  /**
   * Realiza logout adicionando o token na blacklist do backend e limpando local
   */
  static async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        // Envia requisição para a blacklist no backend
        await api.post('/auth/logout', null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.warn('Erro ao avisar backend sobre logout, forçando limpeza local', error);
    } finally {
      this.removeToken();
    }
  }
}

export default AuthService;
