import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';
import AuthService from '../services/authService';

// Mock AuthService
vi.mock('../services/authService', () => ({
    default: {
        hasToken: vi.fn(),
    }
}));

// Mock react-router-dom elements
vi.mock('react-router-dom', () => ({
    Navigate: vi.fn(({ to, replace }) => (
        <div data-testid="navigate" data-to={to} data-replace={String(replace)} />
    )),
    Outlet: vi.fn(() => <div data-testid="outlet" />)
}));

describe('ProtectedRoute', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('redirects to /login if user has no authentication token', () => {
        vi.mocked(AuthService.hasToken).mockReturnValue(false);

        render(<ProtectedRoute />);

        const navigate = screen.getByTestId('navigate');
        expect(navigate).toBeInTheDocument();
        expect(navigate.getAttribute('data-to')).toBe('/login');
        expect(navigate.getAttribute('data-replace')).toBe('true');
    });

    it('redirects to fallback path if user role does not match requiredRole list', () => {
        vi.mocked(AuthService.hasToken).mockReturnValue(true);
        localStorage.setItem('role', 'MORADOR');

        render(<ProtectedRoute requiredRole={['ADMIN']} redirectPath="/denied" />);

        const navigate = screen.getByTestId('navigate');
        expect(navigate).toBeInTheDocument();
        expect(navigate.getAttribute('data-to')).toBe('/denied');
    });

    it('redirects to default root path if user role does not match and no redirectPath is specified', () => {
        vi.mocked(AuthService.hasToken).mockReturnValue(true);
        localStorage.setItem('role', 'MORADOR');

        render(<ProtectedRoute requiredRole={['ADMIN']} />);

        const navigate = screen.getByTestId('navigate');
        expect(navigate).toBeInTheDocument();
        expect(navigate.getAttribute('data-to')).toBe('/');
    });

    it('renders children components when authenticated and role matches', () => {
        vi.mocked(AuthService.hasToken).mockReturnValue(true);
        localStorage.setItem('role', 'ADMIN');

        render(
            <ProtectedRoute requiredRole={['ADMIN']}>
                <div data-testid="child">Private Content</div>
            </ProtectedRoute>
        );

        expect(screen.getByTestId('child')).toBeInTheDocument();
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('renders Outlet component when no children are provided and role matches', () => {
        vi.mocked(AuthService.hasToken).mockReturnValue(true);
        localStorage.setItem('role', 'SINDICO');

        render(<ProtectedRoute requiredRole={['SINDICO']} />);

        expect(screen.getByTestId('outlet')).toBeInTheDocument();
        expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
});
