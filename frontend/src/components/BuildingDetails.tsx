import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Wrench,
    BookOpen,
    Check,
    X
} from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { Condominium, Activity, Reservation, Ticket, Provider } from '../types';
import { StatusBadge } from './StatusBadge';
import { CreateActivityModal } from './CreateActivityModal';
import { CreateReservationModal } from './CreateReservationModal';
import { CreateTicketModal } from './CreateTicketModal';
import { CreateProviderModal } from './CreateProviderModal';
import { ItemDetailsModal } from './ItemDetailsModal';
import '../styles/details.css';

export const BuildingDetails: React.FC = () => {
    const { id: condominiumId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [condominium, setCondominium] = useState<Condominium | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
    const [isCreateReservationOpen, setIsCreateReservationOpen] = useState(false);
    const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
    const [isCreateProviderOpen, setIsCreateProviderOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const [selectedItem, setSelectedItem] = useState<Activity | Reservation | Ticket | Provider | null>(null);
    const [itemType, setItemType] = useState<'activity' | 'reservation' | 'ticket' | 'provider' | null>(null);

    const handleItemClick = (item: any, type: 'activity' | 'reservation' | 'ticket' | 'provider') => {
        setSelectedItem(item);
        setItemType(type);
    };

    const handleApproveReservation = async (reservationId: string, status: 'CONFIRMED' | 'CANCELLED') => {
        let reason = '';
        if (status === 'CANCELLED') {
            reason = window.prompt('Motivo da rejeição (Opcional):') || '';
        }
        
        try {
            await CondominiumService.approveReservation(condominiumId, reservationId, { 
                status, 
                reason: reason.trim() ? reason.trim() : undefined 
            });
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Failed to update reservation status:', error);
            alert('Não foi possível alterar a reserva. Verifique se o status permite alteração ou suas permissões.');
        }
    };

    // Placeholders
    const placeholderUnits = 'Placeholder';
    const placeholderTickets = 'Placeholder';
    const placeholderStatus: 'healthy' | 'attention' | 'warning' = 'healthy';
    const placeholderTicketsList = [
        { id: '1', title: 'Chamado Pendente (Placeholder)', status: 'priority', statusLabel: 'Prioridade', meta: 'N/A' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch condomínio
                const condo = await CondominiumService.getById(condominiumId);
                setCondominium(condo);
            } catch (err) {
                console.error("Error fetching building details:", err);
            }

            try {
                const acts = await CondominiumService.getActivities(condominiumId);
                let activitiesData = acts;
                if (acts && !Array.isArray(acts)) {
                    activitiesData = (acts as any).content || (acts as any).data || (acts as any).items || [];
                }
                setActivities(activitiesData || []);
            } catch (err) {
                console.error("Activities unavailable:", err);
            }

            try {
                const res = await CondominiumService.getReservations(condominiumId);
                let reservationsData = res;
                if (res && !Array.isArray(res)) {
                    reservationsData = (res as any).content || (res as any).data || (res as any).items || [];
                }
                setReservations(reservationsData || []);
            } catch (err) {
                console.error("Reservations unavailable:", err);
            }

            try {
                const tkts = await CondominiumService.getTickets(condominiumId);
                let ticketsData = tkts;
                if (tkts && !Array.isArray(tkts)) {
                    ticketsData = (tkts as any).content || (tkts as any).data || (tkts as any).items || [];
                }
                setTickets(ticketsData || []);
            } catch (err) {
                console.error("Tickets unavailable:", err);
            }

            try {
                const provs = await CondominiumService.getProviders(condominiumId);
                let providersData = provs;
                if (provs && !Array.isArray(provs)) {
                    providersData = (provs as any).content || (provs as any).data || (provs as any).items || [];
                }
                setProviders(providersData || []);
            } catch (err) {
                console.error("Providers unavailable:", err);
            }

            setLoading(false);
        };
        if (condominiumId) {
            fetchData();
        }
    }, [condominiumId, refreshKey]);

    if (!condominiumId) return <div>ID do condomínio não foi providenciado.</div>;
    
    if (loading) {
        return <div className="dashboard-container"><div className="content-wrapper"><p>Carregando detalhes...</p></div></div>;
    }

    if (!condominium) {
        return <div className="dashboard-container"><div className="content-wrapper"><p>Condomínio não encontrado.</p></div></div>;
    }

    return (
        <div className="dashboard-container">
            <div className="content-wrapper">
                <div className="details-header">
                    <div className="breadcrumbs">
                        <span className="breadcrumb-item" onClick={() => navigate('/')}>Visão geral</span>
                        <ChevronRight size={14} />
                        <span style={{ color: 'var(--text-main)' }}>{condominium.name}</span>
                    </div>
                </div>

                <div className="details-title-row">
                    <div className="building-title-section">
                        <BuildingIcon size={24} />
                        <h1 className="building-title">{condominium.name}</h1>
                        <StatusBadge status={placeholderStatus} count={0 as any} text={placeholderStatus} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="primary-btn" onClick={() => navigate(`/buildings/${condominiumId}/finances`)} style={{ backgroundColor: '#10b981' }}>
                            <DollarSign size={16} />
                            Finanças
                        </button>
                        <button className="secondary-btn" onClick={() => navigate(`/buildings/${condominiumId}/finances-mock`)} style={{ border: '1px solid #1e3a8a', color: '#1e3a8a', backgroundColor: 'transparent' }}>
                            <DollarSign size={16} />
                            Finanças (Mock)
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
                        <span className="stat-key">Endereço</span>
                        <span className="stat-val" style={{ fontSize: '1rem', marginTop: '4px' }}>{condominium.address}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-key">Unidades</span>
                        <span className="stat-val">{placeholderUnits}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-key">Chamados abertos</span>
                        <span className="stat-val">{placeholderTickets}</span>
                    </div>
                </div>

                <div className="details-grid">
                    {/* Left Column */}
                    <div className="details-left">

                        {/* Activities Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Atividades recentes</h3>
                                <button className="action-btn" onClick={() => setIsCreateActivityOpen(true)}>
                                    <Plus size={16} />
                                    Registrar atividade
                                </button>
                            </div>

                            <div className="activity-list">
                                {(!Array.isArray(activities) || activities.length === 0) ? <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Nenhuma atividade registrada.</p> : null}
                                {Array.isArray(activities) && activities.map(activity => (
                                    <div key={activity.id} className="activity-item clickable-item" onClick={() => handleItemClick(activity, 'activity')}>
                                        <div className="activity-icon hover-icon-white">
                                            {activity.type === 'ONCE' && <Calendar size={20} color="#64748b" />}
                                            {activity.type === 'PERIODIC' && <Calendar size={20} color="#22c55e" />}
                                        </div>
                                        <div className="activity-content">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="hover-text-white">{activity.title}</span>
                                                <span style={{
                                                    fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600,
                                                    backgroundColor: activity.type === 'ONCE' ? '#f1f5f9' : '#dcfce7',
                                                    color: activity.type === 'ONCE' ? '#475569' : '#15803d'
                                                }}>
                                                    {activity.type === 'ONCE' ? 'Única' : 'Periódica'}
                                                </span>
                                            </div>
                                            <div className="hover-text-white" style={{ fontSize: '0.75rem', color: '#64748b' }}>{activity.description}</div>
                                        </div>
                                        <div className="activity-time hover-text-white">
                                            {activity.startDate} a {activity.endDate}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reservations Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Reservas</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="action-btn" onClick={() => setIsCreateReservationOpen(true)}>
                                        <Plus size={16} />
                                        Nova reserva
                                    </button>
                                </div>
                            </div>

                            <div className="activity-list">
                                {(!Array.isArray(reservations) || reservations.length === 0) ? <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Nenhuma reserva encontrada.</p> : null}
                                {Array.isArray(reservations) && reservations.map(res => (
                                    <div key={res.id} className="activity-item clickable-item" onClick={() => handleItemClick(res, 'reservation')}>
                                        <div className="activity-icon hover-icon-white">
                                            <BookOpen size={20} />
                                        </div>
                                        <div className="activity-content hover-text-white">{res.area || `Reserva #${res.id}`}</div>
                                        <div className="activity-time" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className="hover-text-white">
                                                {res.startTime ? new Date(res.startTime).toLocaleString('pt-BR') : ''} - {res.endTime ? new Date(res.endTime).toLocaleString('pt-BR') : ''}
                                                {res.status && ` (${res.status})`}
                                            </span>
                                            {res.status === 'PENDING' && (
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button 
                                                        className="action-btn" 
                                                        style={{ color: '#22c55e', padding: '4px', border: '1px solid #22c55e', minWidth: 'auto' }}
                                                        onClick={(e) => { e.stopPropagation(); handleApproveReservation(res.id, 'CONFIRMED'); }}
                                                        title="Aprovar Reserva"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button 
                                                        className="action-btn" 
                                                        style={{ color: '#ef4444', padding: '4px', border: '1px solid #ef4444', minWidth: 'auto' }}
                                                        onClick={(e) => { e.stopPropagation(); handleApproveReservation(res.id, 'CANCELLED'); }}
                                                        title="Rejeitar Reserva"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tickets Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Chamados abertos</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="action-btn">
                                        <Filter size={16} />
                                        Filtrar
                                    </button>
                                    <button className="action-btn" onClick={() => setIsCreateTicketOpen(true)}>
                                        <Plus size={16} />
                                        Novo chamado
                                    </button>
                                </div>
                            </div>

                            <div className="ticket-list">
                                {tickets.length === 0 ? <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Nenhum chamado aberto.</p> : null}
                                {tickets.map(ticket => (
                                    <div key={ticket.id} className="ticket-item clickable-item" onClick={() => handleItemClick(ticket, 'ticket')}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{
                                                backgroundColor: ticket.priority === 'URGENTE' || ticket.priority === 'CRITICA' ? '#fee2e2' : ticket.priority === 'ALTA' ? '#ffedd5' : ticket.priority === 'MEDIA' ? '#fef3c7' : '#dbeafe',
                                                color: ticket.priority === 'URGENTE' || ticket.priority === 'CRITICA' ? '#b91c1c' : ticket.priority === 'ALTA' ? '#c2410c' : ticket.priority === 'MEDIA' ? '#b45309' : '#1d4ed8',
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                                            }}>
                                                {ticket.priority}
                                            </span>
                                            <span className="hover-text-white" style={{ fontWeight: 500 }}>{ticket.title}</span>
                                        </div>
                                        <span className="hover-text-white" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{ticket.status} • {ticket.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="details-right">
                        <div className="section-card">
                            <div className="section-header" style={{ marginBottom: '1rem' }}>
                                <h3 className="section-title">Em destaque (Placeholder)</h3>
                                <div className="legend" style={{ marginBottom: 0, fontSize: '0.75rem' }}>
                                    <div className="legend-item"><span className="dot green"></span> Saudável</div>
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
                                <span className="badge-count">Placeholder</span>
                            </div>
                            <div className="compliance-row" style={{ borderBottom: 'none' }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <Calendar size={18} />
                                    <span>Próxima inspeção</span>
                                </div>
                                <span className="compliance-tag" style={{ background: '#fbbf24', color: '#78350f' }}>Placeholder</span>
                            </div>
                        </div>

                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Prestadores de Serviço</h3>
                                <button className="action-btn" onClick={() => setIsCreateProviderOpen(true)} style={{ padding: '4px 8px', fontSize: '0.875rem' }}>
                                    <Plus size={14} style={{ marginRight: '4px' }} /> Novo
                                </button>
                            </div>

                            <div className="contact-list">
                                {providers.length === 0 ? <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Nenhum prestador cadastrado.</p> : null}
                                {providers.map(provider => (
                                    <div key={provider.id} className="contact-item clickable-item" onClick={() => handleItemClick(provider, 'provider')} style={{ alignItems: 'flex-start', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className="hover-text-white" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 600, color: '#475569' }}>
                                                {provider.name.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span className="contact-name hover-text-white" style={{ fontSize: '0.875rem' }}>{provider.name}</span>
                                                <span className="contact-role hover-text-white" style={{ fontSize: '0.75rem', marginTop: '2px', color: '#64748b' }}>
                                                     {provider.serviceType === 'ELECTRICIAN' ? 'Eletricista' : provider.serviceType === 'PLUMBER' ? 'Encanador' : provider.serviceType === 'GARDENER' ? 'Jardineiro' : provider.serviceType === 'CARPENTER' ? 'Carpinteiro' : 'Outros'}
                                                </span>
                                                <span className="hover-text-white" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{provider.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCreateActivityOpen && (
                <CreateActivityModal
                    condominiumId={condominiumId}
                    tickets={tickets}
                    providers={providers}
                    onClose={() => setIsCreateActivityOpen(false)}
                    onSuccess={() => {
                        setIsCreateActivityOpen(false);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}

            {isCreateReservationOpen && (
                <CreateReservationModal
                    condominiumId={condominiumId}
                    onClose={() => setIsCreateReservationOpen(false)}
                    onSuccess={() => {
                        setIsCreateReservationOpen(false);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}

            {isCreateTicketOpen && (
                <CreateTicketModal
                    condominiumId={condominiumId}
                    onClose={() => setIsCreateTicketOpen(false)}
                    onSuccess={() => {
                        setIsCreateTicketOpen(false);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}

            {isCreateProviderOpen && (
                <CreateProviderModal
                    condominiumId={condominiumId}
                    onClose={() => setIsCreateProviderOpen(false)}
                    onSuccess={() => {
                        setIsCreateProviderOpen(false);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}

            <ItemDetailsModal
                isOpen={!!selectedItem}
                onClose={() => { setSelectedItem(null); setItemType(null); }}
                item={selectedItem}
                type={itemType}
            />
        </div>
    );
};
