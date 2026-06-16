import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserService from './userService';
import api from './api';

// Mock api
vi.mock('./api', () => ({
    default: {
        put: vi.fn(),
    }
}));

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('changes user role successfully', async () => {
        const mockResponse = {
            data: {
                id: '123',
                name: 'User Test',
                email: 'test@sindigo.com',
                role: 'SINDICO',
                createdAt: '2026-06-16'
            }
        };

        vi.mocked(api.put).mockResolvedValue(mockResponse);

        const result = await UserService.changeUserRole('123', 'SINDICO');

        expect(api.put).toHaveBeenCalledWith('/user/change-role', {
            userId: '123',
            role: 'SINDICO'
        });
        expect(result).toEqual(mockResponse.data);
    });

    it('throws Access Denied error when status code is 403', async () => {
        const mockError = {
            response: {
                status: 403,
                data: { error: 'Forbidden' }
            }
        };

        vi.mocked(api.put).mockRejectedValue(mockError);

        await expect(UserService.changeUserRole('123', 'SINDICO')).rejects.toThrow(
            'Access Denied: Você não tem permissão para alterar papéis de usuário'
        );
    });

    it('throws custom message error when generic error is returned', async () => {
        const mockError = {
            response: {
                status: 400,
                data: { error: 'Invalid user id' }
            }
        };

        vi.mocked(api.put).mockRejectedValue(mockError);

        await expect(UserService.changeUserRole('123', 'SINDICO')).rejects.toThrow(
            'Invalid user id'
        );
    });

    it('throws default message error when error contains no response data', async () => {
        const mockError = new Error('Network Error');

        vi.mocked(api.put).mockRejectedValue(mockError);

        await expect(UserService.changeUserRole('123', 'SINDICO')).rejects.toThrow(
            'Erro ao alterar papel do usuário'
        );
    });
});
