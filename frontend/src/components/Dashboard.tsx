import React from 'react';
import { Search, Filter, LayoutGrid, Plus } from 'lucide-react';
import { BuildingCard } from './BuildingCard';
import { buildings } from '../data/mockData';
import '../styles/dashboard.css';

interface DashboardProps {
    onBuildingClick: (id: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBuildingClick }) => {
    return (
        <div className="content-wrapper">
            <div className="page-header">
                <h2 className="page-title">Prédios gerenciados</h2>

                <div className="header-actions">
                    <button className="action-btn">
                        <Search size={18} />
                        Buscar
                    </button>
                    <button className="primary-btn">
                        <Plus size={18} />
                        Novo prédio
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar prédios, endereço..."
                        className="search-input"
                    />
                </div>

                <button className="action-btn">
                    <Filter size={18} />
                    Filtros
                </button>

                <button className="action-btn">
                    <LayoutGrid size={18} />
                    Ordenar
                </button>
            </div>

            <div className="legend">
                <div className="legend-item">
                    <span className="dot green"></span>
                    <span>Saudável</span>
                </div>
                <div className="legend-item">
                    <span className="dot orange"></span>
                    <span>Atenção</span>
                </div>
                <div className="legend-item">
                    <span className="dot gray"></span>
                    <span>Em breve</span>
                </div>
            </div>

            <div className="buildings-grid">
                {buildings.map((building) => (
                    <BuildingCard
                        key={building.id}
                        data={building}
                        onClick={() => onBuildingClick(building.id)}
                    />
                ))}
            </div>
        </div>
    );
};
