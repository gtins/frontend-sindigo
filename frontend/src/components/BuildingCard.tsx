import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Building } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import '../styles/dashboard.css';

interface BuildingCardProps {
    data: Building;
    onClick?: () => void;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ data, onClick }) => {
    return (
        <div className="building-card" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="card-header">
                <h3>{data.name}</h3>
                <StatusBadge
                    count={data.tickets}
                    text={data.statusText}
                    status={data.status}
                />
            </div>

            <div className="card-stats">
                <div className="stat-box">
                    <span className="stat-label">Unidades</span>
                    <span className="stat-value">{data.units}</span>
                </div>
                <div className="stat-box">
                    <span className="stat-label">Chamados abertos</span>
                    <span className="stat-value">{data.tickets}</span>
                </div>
            </div>

            <div className="card-footer">
                <span className="last-update">Última atualização {data.lastUpdate}</span>
                <button className="details-btn" onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};
