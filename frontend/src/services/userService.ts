import api from './api';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  message?: string;
}

export class UserService {
  /**
   * Altera a role (papel) de um usuário
   * IMPORTANTE: Apenas usuários com role ADMIN podem usar este endpoint.
   * @param userId UUID do usuário
   * @param role Novo papel: ADMIN, SINDICO ou MORADOR
   */
  static async changeUserRole(userId: string, role: 'ADMIN' | 'SINDICO' | 'MORADOR'): Promise<UserResponse> {
    try {
      const response = await api.put<UserResponse>('/user/change-role', {
        userId,
        role
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao alterar papel do usuário:', error);
      if (error.response && error.response.status === 403) {
        throw new Error('Access Denied: Você não tem permissão para alterar papéis de usuário');
      }
      throw new Error(error.response?.data?.error || 'Erro ao alterar papel do usuário');
    }
  }
}

export default UserService;
