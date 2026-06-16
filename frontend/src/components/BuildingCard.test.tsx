import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BuildingCard } from './BuildingCard';
import type { Building } from '../data/mockData';

const mockData: Building = {
    id: 1,
    name: "Prédio Teste",
    units: 50,
    tickets: 5,
    lastUpdate: "há 1h",
    status: "attention"
};

describe('BuildingCard', () => {
    it('renders building name correctly', () => {
        render(<BuildingCard data={mockData} />);
        expect(screen.getByText("Prédio Teste")).toBeInTheDocument();
    });

    it('renders custom name when name is "a"', () => {
        const specialMock = { ...mockData, name: 'a' };
        render(<BuildingCard data={specialMock} />);
        expect(screen.getByText("Condomínio Mare di Capri")).toBeInTheDocument();
    });

    it('renders units and tickets count', () => {
        render(<BuildingCard data={mockData} />);
        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it('renders "Nenhuma" when units count is 0', () => {
        const zeroUnitsMock = { ...mockData, units: 0 };
        render(<BuildingCard data={zeroUnitsMock} />);
        expect(screen.getByText("Nenhuma")).toBeInTheDocument();
    });

    it('renders status badge text', () => {
        render(<BuildingCard data={mockData} />);
        expect(screen.getByText(/5 chamados abertos/i)).toBeInTheDocument();
    });

    it('triggers onClick when the card is clicked', () => {
        const onClickMock = vi.fn();
        render(<BuildingCard data={mockData} onClick={onClickMock} />);
        
        fireEvent.click(screen.getByText("Prédio Teste"));
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    it('triggers onClick and stops propagation when the action button is clicked', () => {
        const onClickMock = vi.fn();
        render(<BuildingCard data={mockData} onClick={onClickMock} />);
        
        const button = screen.getByRole('button', { name: /ver detalhes/i });
        fireEvent.click(button);
        
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });
});
