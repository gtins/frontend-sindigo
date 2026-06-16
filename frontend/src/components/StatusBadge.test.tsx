import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
    it('renders default text when count is not provided', () => {
        render(<StatusBadge />);
        expect(screen.getByText("0 chamados abertos")).toBeInTheDocument();
    });

    it('renders singular text when count is 1', () => {
        render(<StatusBadge count={1} />);
        expect(screen.getByText("1 chamado aberto")).toBeInTheDocument();
    });

    it('renders plural text when count is greater than 1', () => {
        render(<StatusBadge count={3} />);
        expect(screen.getByText("3 chamados abertos")).toBeInTheDocument();
    });

    it('renders custom text when text prop is passed', () => {
        render(<StatusBadge text="Custom Status" />);
        expect(screen.getByText("Custom Status")).toBeInTheDocument();
    });

    it('applies correct class for healthy status by default', () => {
        const { container } = render(<StatusBadge />);
        expect(container.firstChild).toHaveClass('status-green');
    });

    it('applies correct class for attention status', () => {
        const { container } = render(<StatusBadge status="attention" />);
        expect(container.firstChild).toHaveClass('status-orange');
    });

    it('applies correct class for warning status', () => {
        const { container } = render(<StatusBadge status="warning" />);
        expect(container.firstChild).toHaveClass('status-red');
    });

    it('applies correct class for gray status', () => {
        const { container } = render(<StatusBadge status="gray" />);
        expect(container.firstChild).toHaveClass('status-gray');
    });
});
