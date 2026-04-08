import React from 'react';
import {
    Building as BuildingIcon,
    MapPin,
    Edit2,
    Plus,
    Filter,
    ShieldCheck,
    AlertCircle,
    Calendar,
    ChevronRight,
    DollarSign,
    ClipboardCheck,
    Wrench
} from 'lucide-react';
import type { BuildingDetailsData } from '../data/mockData';
import { StatusBadge } from './StatusBadge';
import '../styles/details.css';

interface BuildingDetailsProps {
    data: BuildingDetailsData;
    onBack: () => void;
    onFinancesClick: () => void;
}

export const BuildingDetails: React.FC<BuildingDetailsProps> = ({ data, onBack, onFinancesClick }) => {
    return (
        <div className="dashboard-container">
            {/* Sidebar is rendered by App parent, or should be included here? 
           Based on Dashboard.tsx structure, Sidebar is sibling to main. 
           We will assume App handles the layout or we need to wrap this content same as dashboard.
           For now, let's assume this renders INTO the main content area.
       */}

            <div className="content-wrapper">
                <div className="details-header">
                    <div className="breadcrumbs">
                        <span className="breadcrumb-item" onClick={onBack}>Visão geral</span>
                        <ChevronRight size={14} />
                        <span style={{ color: 'var(--text-main)' }}>{data.name}</span>
                    </div>
                </div>

                <div className="details-title-row">
                    <div className="building-title-section">
                        <BuildingIcon size={24} />
                        <h1 className="building-title">{data.name}</h1>
                        <StatusBadge status={data.status} count={data.tickets} text={data.statusText} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary-btn" onClick={onFinancesClick} style={{ backgroundColor: '#1e3a8a' }}>
                            <DollarSign size={16} />
                            Finanças
                        </button>
                        <button className="map-btn">
                            <MapPin size={16} />
                            Ver no mapa
                        </button>
                        <button className="primary-btn">
                            <Edit2 size={16} />
                            Editar prédio
                        </button>
                    </div>
                </div>

                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-key">Unidades</span>
                        <span className="stat-val">{data.units}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-key">Chamados abertos</span>
                        <span className="stat-val">{data.tickets}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-key">Última atualização</span>
                        <span className="stat-val">{data.lastUpdate}</span>
                    </div>
                </div>

                <div className="details-grid">
                    {/* Left Column */}
                    <div className="details-left">

                        {/* Activities Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Atividades recentes</h3>
                                <button className="action-btn">
                                    <Plus size={16} />
                                    Registrar atividade
                                </button>
                            </div>

                            <div className="activity-list">
                                {data.activities.map(activity => (
                                    <div key={activity.id} className="activity-item">
                                        <div className="activity-icon">
                                            {activity.type === 'maintenance' && <Wrench size={20} />}
                                            {activity.type === 'inspection' && <ClipboardCheck size={20} />}
                                            {activity.type === 'financial' && <DollarSign size={20} />}
                                        </div>
                                        <div className="activity-content">{activity.title}</div>
                                        <div className="activity-time">{activity.time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tickets Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Chamados abertos ({data.ticketsList.length})</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="action-btn">
                                        <Filter size={16} />
                                        Filtrar
                                    </button>
                                    <button className="action-btn">
                                        <Plus size={16} />
                                        Novo chamado
                                    </button>
                                </div>
                            </div>

                            <div className="ticket-list">
                                {data.ticketsList.map(ticket => (
                                    <div key={ticket.id} className="ticket-item">
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span className={`ticket-status-badge status-${ticket.status}`}>
                                                {ticket.statusLabel}
                                            </span>
                                            <span style={{ fontWeight: 500 }}>{ticket.title}</span>
                                        </div>
                                        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{ticket.meta}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="details-right">
                        <div className="section-card">
                            <div className="section-header" style={{ marginBottom: '1rem' }}>
                                <h3 className="section-title">Em destaque</h3>
                                <div className="legend" style={{ marginBottom: 0, fontSize: '0.75rem' }}>
                                    <div className="legend-item"><span className="dot green"></span> Saudável</div>
                                    {/* Simplified legend for space */}
                                </div>
                            </div>

                            <div className="map-placeholder">
                                {/* Image would go here, using CSS bg for now */}
                            </div>

                            <div className="compliance-row">
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <ShieldCheck size={18} />
                                    <span>Conformidade</span>
                                </div>
                                <span className="compliance-tag">Em dia</span>
                            </div>
                            <div className="compliance-row">
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <AlertCircle size={18} />
                                    <span>Chamados abertos</span>
                                </div>
                                <span className="badge-count">{data.tickets}</span>
                            </div>
                            <div className="compliance-row" style={{ borderBottom: 'none' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <Calendar size={18} />
                                    <span>Próxima inspeção</span>
                                </div>
                                <span className="compliance-tag" style={{ background: '#fbbf24', color: '#78350f' }}>12 de nov</span>
                            </div>
                        </div>

                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Contatos</h3>
                                <button className="action-btn" style={{ padding: '4px 8px', fontSize: '0.875rem' }}>Ver todos</button>
                            </div>

                            <div className="contact-list">
                                {data.contacts.map(contact => (
                                    <div key={contact.id} className="contact-item">
                                        <div className="contact-info">
                                            <img src={contact.avatarUrl} alt={contact.name} className="contact-avatar" />
                                            <span className="contact-role">{contact.role}</span>
                                        </div>
                                        <span className="contact-name">{contact.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
