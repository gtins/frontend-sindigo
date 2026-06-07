import React from 'react';
import { Hotel } from 'lucide-react';
import type { Building } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import '../styles/dashboard.css';

interface BuildingCardProps {
    data: Building;
    onClick?: () => void;
}

export const BuildingCard: React.FC<BuildingCardProps> = ({ data, onClick }) => {
    return (
        <div className={`building-card status-${data.status}`} onClick={onClick} style={{ cursor: 'pointer' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <div className="building-icon-avatar">
                        <Hotel size={16} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {data.name === 'a' ? 'Condomínio A' : data.name}
                    </h3>
                </div>
                <StatusBadge
                    count={data.tickets}
                    text={data.statusText}
                    status={data.status}
                />
            </div>

            <div className="card-stats">
                <div className="stat-box">
                    <span className="stat-label">Unidades cadastradas</span>
                    {data.units === 0 ? (
                        <span className="stat-value" style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>Nenhuma</span>
                    ) : (
                        <span className="stat-value">{data.units}</span>
                    )}
                </div>
                <div className="stat-box">
                    <span className="stat-label">Chamados abertos</span>
                    <span className="stat-value">{data.tickets}</span>
                </div>
            </div>

            <div className="card-footer">
                <span className="last-update">Última atualização: {data.lastUpdate}</span>
                <button className="text-action-btn" style={{ padding: '4px 8px', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
                    Ver detalhes <span className="arrow" style={{ display: 'inline-block', transition: 'transform 0.2s' }}>→</span>
                </button>
            </div>
        </div>
    );
};

