import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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

    it('renders units and tickets count', () => {
        render(<BuildingCard data={mockData} />);
        expect(screen.getByText("50")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it('renders status badge text', () => {
        render(<BuildingCard data={mockData} />);
        // "5 chamados abertos" should be visible (logic in StatusBadge)
        expect(screen.getByText(/5 chamados abertos/i)).toBeInTheDocument();
    });
});
