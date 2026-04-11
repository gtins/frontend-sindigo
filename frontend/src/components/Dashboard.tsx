import React, { useState, useEffect } from 'react';
import { Search, Filter, LayoutGrid, Plus } from 'lucide-react';
import { BuildingCard } from './BuildingCard';
import CondominiumService from '../services/condominiumService';
import type { Condominium } from '../types';
import '../styles/dashboard.css';

interface DashboardProps {
    onBuildingClick: (id: string) => void;
    onCreateBuildingClick?: () => void;
    refreshKey?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBuildingClick, onCreateBuildingClick, refreshKey = 0 }) => {
    const [condos, setCondos] = useState<Condominium[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCondominiums = async () => {
            setLoading(true);
            try {
                const data = await CondominiumService.getAll();
                setCondos(data);
            } catch (err) {
                console.error('Failed to fetch condominiums:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCondominiums();
    }, [refreshKey]);
    return (
        <div className="content-wrapper">
            <div className="page-header">
                <h2 className="page-title">Prédios gerenciados</h2>

                <div className="header-actions">
                    <button className="action-btn">
                        <Search size={18} />
                        Buscar
                    </button>
                    <button className="primary-btn" onClick={onCreateBuildingClick}>
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
                {loading ? (
                    <p>Carregando condomínios...</p>
                ) : condos.length === 0 ? (
                    <p>Nenhum condomínio encontrado.</p>
                ) : (
                    condos.map((building) => (
                        <BuildingCard
                            key={building.id}
                            data={{
                                id: building.id as any, // Cast to any to reuse mock props temporarily
                                name: building.name,
                                units: 0, // Placeholder
                                tickets: 0, // Placeholder
                                lastUpdate: 'Agora', // Placeholder
                                status: 'healthy', // Placeholder
                            }}
                            onClick={() => onBuildingClick(building.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
