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
  type: string;
  expiresIn: number;
}

interface TokenValidationResponse {
  valid: boolean;
  reason?: string;
  expiresAt?: string;
}

export class AuthService {
  private static readonly STORAGE_KEY = 'auth_token';

  /**
   * Armazena o token no localStorage
   */
  static saveToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEY, token);
  }

  /**
   * Recupera o token do localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Remove o token do localStorage
   */
  static removeToken(): void {
    localStorage.removeItem(this.STORAGE_KEY);
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
      this.saveToken(response.data.token);
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
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
   * Realiza logout removendo token
   */
  static logout(): void {
    this.removeToken();
  }
}

export default AuthService;
