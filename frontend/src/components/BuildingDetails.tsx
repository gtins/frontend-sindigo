import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Building as BuildingIcon,
    MapPin,
    Edit2,
    Plus,
    ShieldCheck,
    AlertCircle,
    Calendar,
    ChevronRight,
    DollarSign,
    BookOpen,
    Check,
    X,
    Users
} from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { Condominium, Activity, Reservation, Ticket, Provider } from '../types';
import { StatusBadge } from './StatusBadge';
import { CreateActivityModal } from './CreateActivityModal';
import { CreateReservationModal } from './CreateReservationModal';
import { CreateTicketModal } from './CreateTicketModal';
import { CreateProviderModal } from './CreateProviderModal';
import { ItemDetailsModal } from './ItemDetailsModal';
import { EditCondominiumModal } from './EditCondominiumModal';
import '../styles/details.css';

export const BuildingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const condominiumId = id!;
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
    const [isEditCondoOpen, setIsEditCondoOpen] = useState(false);
    const [isEditingMap, setIsEditingMap] = useState(false);
    const [customMapQuery, setCustomMapQuery] = useState('');
    const [activityFilter, setActivityFilter] = useState<'all' | 'open' | 'closed'>('open');
    const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'closed'>('open');
    const [reservationFilter, setReservationFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'pending'>('all');
    const [activityPage, setActivityPage] = useState(1);
    const [ticketPage, setTicketPage] = useState(1);
    const [reservationPage, setReservationPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    const userRole = localStorage.getItem('role') || 'MORADOR';
    const isAdminOrSindico = userRole === 'ADMIN' || userRole === 'SINDICO';

    const [selectedItem, setSelectedItem] = useState<Activity | Reservation | Ticket | Provider | null>(null);
    const [itemType, setItemType] = useState<'activity' | 'reservation' | 'ticket' | 'provider' | null>(null);

    useEffect(() => {
        const isModalOpen = isCreateActivityOpen || isCreateReservationOpen || isCreateTicketOpen || isCreateProviderOpen || isEditCondoOpen || !!selectedItem;
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCreateActivityOpen, isCreateReservationOpen, isCreateTicketOpen, isCreateProviderOpen, isEditCondoOpen, selectedItem]);

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
    const openTicketsCount = tickets.filter(t => ['OPEN', 'ABERTO'].includes(t.status)).length;
    const placeholderUnits = (condominium?.unidades !== undefined && condominium?.unidades !== null) ? String(condominium.unidades) : '0';
    const placeholderStatus: 'healthy' | 'attention' | 'warning' = openTicketsCount === 0 ? 'healthy' : openTicketsCount > 5 ? 'warning' : 'attention';

    const nextPeriodicActivity = activities
        .filter(a => a.type === 'PERIODIC' && !['CLOSED', 'COMPLETED', 'CANCELLED', 'RESOLVIDO', 'FECHADO'].includes(a.status || ''))
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .find(a => new Date(a.startDate).getTime() >= new Date().setHours(0,0,0,0));
    
    const nextInspectionDisplay = nextPeriodicActivity 
        ? new Date(nextPeriodicActivity.startDate).toLocaleDateString('pt-BR') 
        : 'N/A';

    const formatReservationTime = (startStr?: string, endStr?: string) => {
        if (!startStr) return '';
        try {
            const start = new Date(startStr);
            const end = endStr ? new Date(endStr) : null;
            
            const pad = (n: number) => String(n).padStart(2, '0');
            const day = pad(start.getDate());
            const month = pad(start.getMonth() + 1);
            const year = start.getFullYear();
            const startHour = pad(start.getHours());
            const startMin = pad(start.getMinutes());
            
            if (end) {
                const endHour = pad(end.getHours());
                const endMin = pad(end.getMinutes());
                return `${day}/${month}/${year} • ${startHour}:${startMin} às ${endHour}:${endMin}`;
            }
            return `${day}/${month}/${year} • ${startHour}:${startMin}`;
        } catch (e) {
            return startStr;
        }
    };

    const getReservationStatusInfo = (status?: string) => {
        switch (status) {
            case 'CONFIRMED':
                return { label: 'Confirmada', color: '#10b981', bg: '#dcfce7' };
            case 'PENDING':
                return { label: 'Pendente', color: '#f59e0b', bg: '#fef3c7' };
            case 'CANCELLED':
                return { label: 'Cancelada', color: '#ef4444', bg: '#fee2e2' };
            default:
                return { label: status || 'Desconhecido', color: '#64748b', bg: '#f1f5f9' };
        }
    };

    const getTicketStatusLabel = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'OPEN':
            case 'ABERTO':
                return 'Aberto';
            case 'IN_PROGRESS':
            case 'EM_ANDAMENTO':
                return 'Em Andamento';
            case 'RESOLVED':
            case 'RESOLVIDO':
                return 'Resolvido';
            case 'CLOSED':
            case 'FECHADO':
                return 'Fechado';
            default:
                return status || 'Aberto';
        }
    };

    const getTicketPriorityInfo = (priority?: string) => {
        switch (priority?.toUpperCase()) {
            case 'URGENTE':
            case 'CRITICA':
            case 'CRITICAL':
                return { label: 'Crítica', color: '#b91c1c', bg: '#fee2e2' };
            case 'ALTA':
            case 'HIGH':
                return { label: 'Alta', color: '#c2410c', bg: '#ffedd5' };
            case 'MEDIA':
            case 'MEDIUM':
                return { label: 'Média', color: '#b45309', bg: '#fef3c7' };
            case 'BAIXA':
            case 'LOW':
                return { label: 'Baixa', color: '#1d4ed8', bg: '#dbeafe' };
            default:
                return { label: priority || 'Normal', color: '#475569', bg: '#f1f5f9' };
        }
    };

    const formatPhone = (phone?: string) => {
        if (!phone) return 'N/A';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        } else if (digits.length === 10) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }
        return phone;
    };

    const getProviderServiceBadge = (type?: string) => {
        let label = 'Outros';
        switch (type) {
            case 'ELECTRICIAN':
                label = 'Eletricista';
                break;
            case 'PLUMBER':
                label = 'Encanador';
                break;
            case 'GARDENER':
                label = 'Jardineiro';
                break;
            case 'CARPENTER':
                label = 'Carpinteiro';
                break;
            default:
                label = type || 'Outros';
                break;
        }
        return (
            <span style={{
                alignSelf: 'flex-start',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
            }}>
                {label}
            </span>
        );
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
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

            if (isAdminOrSindico) {
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

    const savedQuery = localStorage.getItem(`map_query_${condominiumId}`);
    const mapAddress = savedQuery || condominium.address || '';

    const filteredActivities = activities.filter(a => {
        const isClosed = ['CLOSED', 'COMPLETED', 'CANCELLED', 'RESOLVIDO', 'FECHADO'].includes(a.status || '');
        if (activityFilter === 'open') return !isClosed;
        if (activityFilter === 'closed') return isClosed;
        return true;
    });

    const filteredTickets = tickets.filter(t => {
        const isClosed = ['CLOSED', 'RESOLVED', 'FECHADO', 'RESOLVIDO', 'CANCELADO'].includes(t.status || '');
        if (ticketFilter === 'open') return !isClosed;
        if (ticketFilter === 'closed') return isClosed;
        return true;
    });

    const filteredReservations = reservations.filter(res => {
        if (reservationFilter === 'confirmed') return res.status === 'CONFIRMED';
        if (reservationFilter === 'cancelled') return res.status === 'CANCELLED';
        if (reservationFilter === 'pending') return res.status === 'PENDING';
        return true;
    });

    const recordsPerPage = 5;

    const activityTotalPages = Math.max(Math.ceil(filteredActivities.length / recordsPerPage), 1);
    const activityStartIndex = (activityPage - 1) * recordsPerPage;
    const currentActivities = filteredActivities.slice(activityStartIndex, activityStartIndex + recordsPerPage);

    const ticketTotalPages = Math.max(Math.ceil(filteredTickets.length / recordsPerPage), 1);
    const ticketStartIndex = (ticketPage - 1) * recordsPerPage;
    const currentTickets = filteredTickets.slice(ticketStartIndex, ticketStartIndex + recordsPerPage);

    const reservationTotalPages = Math.max(Math.ceil(filteredReservations.length / recordsPerPage), 1);
    const reservationStartIndex = (reservationPage - 1) * recordsPerPage;
    const currentReservations = filteredReservations.slice(reservationStartIndex, reservationStartIndex + recordsPerPage);

    const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void) => {
        if (totalPages <= 1) return null;
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button
                    onClick={() => setPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="nav-arrow-btn"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-btn-neutral)', backgroundColor: 'var(--bg-btn-neutral)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                >
                    <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => setPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="nav-arrow-btn"
                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border-btn-neutral)', backgroundColor: 'var(--bg-btn-neutral)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="content-wrapper">
                <div className="details-header" style={{ marginBottom: '16px' }}>
                    <div className="breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.825rem', color: 'var(--text-light)', marginBottom: '16px', fontWeight: 500 }}>
                        <span className="breadcrumb-item" onClick={() => navigate('/dashboard')} style={{ color: 'var(--text-light)' }}>Visão geral</span>
                        <ChevronRight size={12} color="var(--text-light)" />
                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{condominium.name === 'a' ? 'Condomínio Mare di Capri' : condominium.name || 'Sem nome cadastrado'}</span>
                    </div>
                </div>

                <div className="details-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BuildingIcon size={22} color="var(--color-accent)" />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <h1 className="building-title" style={{ margin: 0 }}>{condominium.name === 'a' ? 'Condomínio Mare di Capri' : condominium.name || 'Sem nome cadastrado'}</h1>
                            <StatusBadge status={placeholderStatus} count={openTicketsCount as any} text={placeholderStatus === 'healthy' ? 'Saudável' : placeholderStatus === 'attention' ? 'Atenção' : 'Crítico'} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {isAdminOrSindico && (
                            <>
                                <button className="secondary-btn" onClick={() => navigate(`/buildings/${condominiumId}/members`)} style={{ height: '42px', borderRadius: '12px' }}>
                                    <Users size={16} />
                                    Moradores
                                </button>
                                <button className="primary-btn" onClick={() => navigate(`/buildings/${condominiumId}/finances`)} style={{ height: '42px', borderRadius: '12px', backgroundColor: '#10b981' }}>
                                    <DollarSign size={16} />
                                    Finanças
                                </button>
                            </>
                        )}
                        {isAdminOrSindico && (
                            <button 
                                className="primary-btn" 
                                style={{ height: '42px', borderRadius: '12px' }}
                                onClick={() => setIsEditCondoOpen(true)}
                            >
                                <Edit2 size={16} />
                                Editar prédio
                            </button>
                        )}
                    </div>
                </div>

                <div className="stats-row" style={{ display: 'flex', gap: '16px', marginBottom: 'var(--space-24)' }}>
                    <div className="stat-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MapPin size={22} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <span className="stat-key" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Endereço cadastrado</span>
                            <span className="stat-val" style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={condominium.address}>
                                {condominium.address === 'a' ? 'Av. Atlântica, 1420 - Copacabana, Rio de Janeiro - RJ' : condominium.address || 'Sem endereço cadastrado'}
                            </span>
                        </div>
                    </div>

                    <div className="stat-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <BuildingIcon size={22} />
                        </div>
                        <div>
                            <span className="stat-key" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Unidades ativas</span>
                            <span className="stat-val" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', lineHeight: '1' }}>{placeholderUnits}</span>
                        </div>
                    </div>

                    <div className="stat-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AlertCircle size={22} />
                        </div>
                        <div>
                            <span className="stat-key" style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', display: 'block', marginBottom: '4px' }}>Chamados em aberto</span>
                            <span className="stat-val" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', lineHeight: '1' }}>{openTicketsCount}</span>
                        </div>
                    </div>
                </div>

                <div className="details-grid">
                    {/* Left Column */}
                    <div className="details-left">

                        {/* Activities Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Atividades</h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select 
                                        value={activityFilter} 
                                        onChange={(e) => { setActivityFilter(e.target.value as any); setActivityPage(1); }}
                                        className="action-btn"
                                        style={{ height: '38px', borderRadius: '10px', fontSize: '0.875rem', padding: '0 12px', paddingRight: '32px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
                                    >
                                        <option value="all">Todas</option>
                                        <option value="open">Abertas</option>
                                        <option value="closed">Fechadas</option>
                                    </select>
                                    {isAdminOrSindico && (
                                        <button className="action-btn" onClick={() => setIsCreateActivityOpen(true)} style={{ height: '38px', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Plus size={16} />
                                            Registrar atividade
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="activity-list">
                                {(!Array.isArray(filteredActivities) || filteredActivities.length === 0) ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                                        <Calendar size={32} style={{ marginBottom: '12px', color: '#94a3b8' }} />
                                        <p style={{ fontSize: '0.875rem', margin: 0, maxWidth: '320px', lineHeight: '1.5' }}>
                                            Nenhuma atividade registrada ainda. Registre uma atividade para acompanhar manutenções e rotinas deste prédio.
                                        </p>
                                    </div>
                                ) : null}
                                {Array.isArray(currentActivities) && currentActivities.map(activity => (
                                    <div key={(activity as any).activityId || activity.id} className="activity-item clickable-item" onClick={() => handleItemClick({ ...activity, id: (activity as any).activityId || activity.id }, 'activity')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', marginBottom: '8px' }}>
                                        <div className="activity-icon hover-icon-white" style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0, marginRight: '16px' }}>
                                            {activity.type === 'ONCE' ? <Calendar size={20} color="var(--color-accent)" /> : <Calendar size={20} color="#22c55e" />}
                                        </div>
                                        <div className="activity-content" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="hover-text-white" style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{activity.title}</span>
                                                <span style={{
                                                    fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600,
                                                    backgroundColor: activity.type === 'ONCE' ? '#f1f5f9' : '#dcfce7',
                                                    color: activity.type === 'ONCE' ? '#475569' : '#15803d'
                                                }}>
                                                    {activity.type === 'ONCE' ? 'Única' : 'Periódica'}
                                                </span>
                                            </div>
                                            <div className="hover-text-white" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{activity.description}</div>
                                        </div>
                                        <div className="activity-time hover-text-white" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                                            {activity.startDate} a {activity.endDate}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderPagination(activityPage, activityTotalPages, setActivityPage)}
                        </div>

                        {/* Reservations Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Reservas</h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select 
                                        value={reservationFilter} 
                                        onChange={(e) => { setReservationFilter(e.target.value as any); setReservationPage(1); }}
                                        className="action-btn"
                                        style={{ height: '38px', borderRadius: '10px', fontSize: '0.875rem', padding: '0 12px', paddingRight: '32px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
                                    >
                                        <option value="all">Todas</option>
                                        <option value="confirmed">Confirmadas</option>
                                        <option value="cancelled">Canceladas</option>
                                        <option value="pending">Pendentes</option>
                                    </select>
                                    <button className="secondary-btn" onClick={() => setIsCreateReservationOpen(true)} style={{ height: '38px', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Plus size={16} />
                                        Nova reserva
                                    </button>
                                </div>
                            </div>

                            <div className="activity-list">
                                {(!Array.isArray(filteredReservations) || filteredReservations.length === 0) ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                                        <BookOpen size={32} style={{ marginBottom: '12px', color: '#94a3b8' }} />
                                        <p style={{ fontSize: '0.875rem', margin: 0, maxWidth: '320px', lineHeight: '1.5' }}>
                                            Nenhuma reserva encontrada.
                                        </p>
                                    </div>
                                ) : null}
                                {Array.isArray(currentReservations) && currentReservations.map(res => {
                                    const statusInfo = getReservationStatusInfo(res.status);
                                    return (
                                        <div key={res.id} className="activity-item clickable-item" onClick={() => handleItemClick(res, 'reservation')} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', marginBottom: '8px' }}>
                                            <div className="activity-icon hover-icon-white" style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0, marginRight: '16px' }}>
                                                <BookOpen size={20} color="var(--color-accent)" />
                                            </div>
                                            <div className="activity-content" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{res.area || `Reserva #${res.id}`}</span>
                                                {res.requestedByName && (
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        Solicitado por: <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>{res.requestedByName}</strong> {res.requestedByUnit ? `(Unidade ${res.requestedByUnit})` : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="activity-time" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
                                                <span className="hover-text-white" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {formatReservationTime(res.startTime, res.endTime)}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '4px 10px',
                                                    borderRadius: '12px',
                                                    fontWeight: 600,
                                                    backgroundColor: statusInfo.bg,
                                                    color: statusInfo.color
                                                }}>
                                                    {statusInfo.label}
                                                </span>
                                                {res.status === 'PENDING' && isAdminOrSindico && (
                                                    <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                                                        <button 
                                                            className="action-btn btn-approve-reservation" 
                                                            style={{ padding: '6px', borderRadius: '8px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                            onClick={() => handleApproveReservation(res.id, 'CONFIRMED')}
                                                            title="Aprovar Reserva"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button 
                                                            className="action-btn btn-reject-reservation" 
                                                            style={{ padding: '6px', borderRadius: '8px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                            onClick={() => handleApproveReservation(res.id, 'CANCELLED')}
                                                            title="Rejeitar Reserva"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {renderPagination(reservationPage, reservationTotalPages, setReservationPage)}
                        </div>

                        {/* Tickets Section */}
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Chamados</h3>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select 
                                        value={ticketFilter} 
                                        onChange={(e) => { setTicketFilter(e.target.value as any); setTicketPage(1); }}
                                        className="action-btn"
                                        style={{ height: '38px', borderRadius: '10px', fontSize: '0.875rem', padding: '0 12px', paddingRight: '32px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', cursor: 'pointer', outline: 'none' }}
                                    >
                                        <option value="all">Todos</option>
                                        <option value="open">Pendentes</option>
                                        <option value="closed">Fechados</option>
                                    </select>
                                    <button className="primary-btn" onClick={() => setIsCreateTicketOpen(true)} style={{ height: '38px', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Plus size={16} />
                                        Novo chamado
                                    </button>
                                </div>
                            </div>

                            <div className="ticket-list">
                                {filteredTickets.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                                        <AlertCircle size={32} style={{ marginBottom: '12px', color: '#94a3b8' }} />
                                        <p style={{ fontSize: '0.875rem', margin: 0, maxWidth: '320px', lineHeight: '1.5' }}>
                                            Nenhum chamado encontrado.
                                        </p>
                                    </div>
                                ) : null}
                                {currentTickets.map(ticket => {
                                    const priorityInfo = getTicketPriorityInfo(ticket.priority);
                                    return (
                                        <div key={ticket.id} className="ticket-item clickable-item" onClick={() => handleItemClick(ticket, 'ticket')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <span style={{
                                                    backgroundColor: priorityInfo.bg,
                                                    color: priorityInfo.color,
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600
                                                }}>
                                                    {priorityInfo.label}
                                                </span>
                                                <span className="hover-text-white" style={{ fontWeight: 600, fontSize: '0.925rem', color: 'var(--text-main)' }}>{ticket.title}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                                                    {getTicketStatusLabel(ticket.status)}
                                                </span>
                                                <span style={{ color: 'var(--text-light)', fontSize: '0.825rem' }}>•</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', fontWeight: 500 }}>
                                                    {ticket.category}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {renderPagination(ticketPage, ticketTotalPages, setTicketPage)}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="details-right">
                        <div className="section-card">
                            <div className="section-header" style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={20} color="#64748b" />
                                    <h3 className="section-title" style={{ margin: 0 }}>Localização</h3>
                                </div>
                                {isAdminOrSindico && (
                                    <button className="action-btn" onClick={() => {
                                        setCustomMapQuery(mapAddress);
                                        setIsEditingMap(true);
                                    }} style={{ height: '32px', borderRadius: '8px', padding: '0 12px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Edit2 size={14} /> Editar
                                    </button>
                                )}
                            </div>

                            {isEditingMap ? (
                                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                    <input 
                                        type="text" 
                                        value={customMapQuery} 
                                        onChange={(e) => setCustomMapQuery(e.target.value)}
                                        placeholder="Digite o endereço completo"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.875rem' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', height: '32px' }} onClick={() => {
                                            localStorage.setItem(`map_query_${condominiumId}`, customMapQuery);
                                            setIsEditingMap(false);
                                        }}>Salvar</button>
                                        <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', height: '32px' }} onClick={() => setIsEditingMap(false)}>Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="map-container" style={{ width: '100%', height: '260px', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                                    {mapAddress ? (
                                        <iframe 
                                            width="100%" 
                                            height="100%" 
                                            frameBorder="0" 
                                            scrolling="no" 
                                            marginHeight={0} 
                                            marginWidth={0} 
                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                        ></iframe>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                                            <MapPin size={32} style={{ marginBottom: '8px' }} />
                                            <p style={{ fontSize: '0.875rem' }}>Nenhum endereço informado</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="compliance-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                    <ShieldCheck size={18} color="#22c55e" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Conformidade</span>
                                </div>
                                <span className="compliance-tag" style={{ backgroundColor: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Em dia</span>
                            </div>
                            <div className="compliance-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                    <AlertCircle size={18} color="#f59e0b" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Chamados abertos</span>
                                </div>
                                <span className="badge-count" style={{ backgroundColor: '#f59e0b', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>{openTicketsCount}</span>
                            </div>
                            <div className="compliance-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: 'none' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)' }}>
                                    <Calendar size={18} color="#3b82f6" />
                                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Próxima inspeção</span>
                                </div>
                                <span className="compliance-tag" style={{ 
                                    backgroundColor: nextPeriodicActivity ? '#fef3c7' : '#f1f5f9', 
                                    color: nextPeriodicActivity ? '#b45309' : '#64748b', 
                                    padding: '4px 10px', 
                                    borderRadius: '12px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600 
                                }}>
                                    {nextInspectionDisplay === 'N/A' ? 'Não agendada' : nextInspectionDisplay}
                                </span>
                            </div>
                        </div>

                        {isAdminOrSindico && (
                            <div className="section-card">
                                <div className="section-header">
                                    <h3 className="section-title">Prestadores de Serviço</h3>
                                    <button className="action-btn" onClick={() => setIsCreateProviderOpen(true)} style={{ height: '32px', borderRadius: '8px', padding: '0 12px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Plus size={14} /> Novo
                                    </button>
                                </div>

                                <div className="contact-list" style={{ marginTop: '12px' }}>
                                    {providers.length === 0 ? <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Nenhum prestador cadastrado.</p> : null}
                                    {providers.map(provider => (
                                        <div key={provider.id} className="contact-item clickable-item" onClick={() => handleItemClick(provider, 'provider')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-surface)', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div className="hover-text-white" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                                                    {provider.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <span className="contact-name hover-text-white" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>{provider.name}</span>
                                                    {getProviderServiceBadge(provider.serviceType)}
                                                    <span className="hover-text-white" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatPhone(provider.phone)}</span>
                                                </div>
                                            </div>
                                            <button 
                                                className="action-btn"
                                                style={{ minWidth: 'auto', padding: '6px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                title="Ver detalhes"
                                            >
                                                <ChevronRight size={16} color="var(--text-secondary)" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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

            {isEditCondoOpen && (
                <EditCondominiumModal
                    condominium={condominium}
                    onClose={() => setIsEditCondoOpen(false)}
                    onSuccess={() => {
                        setIsEditCondoOpen(false);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}

            <ItemDetailsModal
                isOpen={!!selectedItem}
                onClose={() => { setSelectedItem(null); setItemType(null); }}
                item={selectedItem}
                type={itemType}
                condominiumId={condominiumId}
                onItemClosed={() => {
                    setSelectedItem(null);
                    setItemType(null);
                    setRefreshKey(prev => prev + 1);
                }}
            />
        </div>
    );
};
