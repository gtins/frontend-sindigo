import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, AlertCircle, Clock, Hotel, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CondominiumService from '../services/condominiumService';
import type { Condominium, Activity, Ticket } from '../types';
import { ItemDetailsModal } from './ItemDetailsModal';
import '../styles/dashboard.css';

export const GlobalDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [condos, setCondos] = useState<Condominium[]>([]);
    const [activities, setActivities] = useState<(Activity & { condominiumName: string })[]>([]);
    const [tickets, setTickets] = useState<(Ticket & { condominiumName: string })[]>([]);
    const [reservations, setReservations] = useState<(any & { condominiumName: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [itemType, setItemType] = useState<'activity' | 'ticket' | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchGlobalData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Condominiums
                const role = localStorage.getItem('role') || 'MORADOR';
                let data = (role === 'ADMIN' || role === 'SINDICO') 
                    ? await CondominiumService.getAll()
                    : await CondominiumService.getMyCondominiums();

                if (data && !Array.isArray(data)) {
                    data = (data as any).content || (data as any).data || (data as any).items || [];
                }

                const parsedCondos = data.map((item: any) => ({
                    ...item,
                    id: item.condominiumId || item.id,
                    name: item.condominiumName || item.name
                }));
                
                setCondos(parsedCondos);

                const activitiesResults = await Promise.all(parsedCondos.map(async (condo: Condominium) => {
                    try {
                        const condoIdStr = condo.id as string;
                        let actData = await CondominiumService.getActivities(condoIdStr);
                        if (actData && !Array.isArray(actData)) {
                            actData = (actData as any).content || [];
                        }
                        return (actData || []).map((a: any) => ({ ...a, condominiumName: condo.name }));
                    } catch (err) {
                        console.error(`Failed to fetch activities for condo ${condo.id}`, err);
                        return [];
                    }
                }));

                const ticketsResults = await Promise.all(parsedCondos.map(async (condo: Condominium) => {
                    try {
                        const condoIdStr = condo.id as string;
                        let tktData = await CondominiumService.getTickets(condoIdStr);
                        if (tktData && !Array.isArray(tktData)) {
                            tktData = (tktData as any).content || [];
                        }
                        return (tktData || []).map((t: any) => ({ ...t, condominiumName: condo.name }));
                    } catch (err) {
                        console.error(`Failed to fetch tickets for condo ${condo.id}`, err);
                        return [];
                    }
                }));

                const reservationsResults = await Promise.all(parsedCondos.map(async (condo: Condominium) => {
                    try {
                        const condoIdStr = condo.id as string;
                        let resData = await CondominiumService.getReservations(condoIdStr);
                        if (resData && !Array.isArray(resData)) {
                            resData = (resData as any).content || [];
                        }
                        return (resData || []).map((r: any) => ({ ...r, condominiumName: condo.name }));
                    } catch (err) {
                        console.error(`Failed to fetch reservations for condo ${condo.id}`, err);
                        return [];
                    }
                }));

                const allActivities = activitiesResults.flat();
                const allTickets = ticketsResults.flat();
                const allReservations = reservationsResults.flat();

                setActivities(allActivities);
                setTickets(allTickets);
                setReservations(allReservations);

            } catch (err) {
                console.error('Failed to fetch global dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalData();
    }, [refreshKey]);

    const upcomingActivities = activities
        .filter(a => a.status !== 'CLOSED')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);

    const pendingTickets = tickets
        .filter(t => ['OPEN', 'ABERTO', 'IN_PROGRESS', 'EM_ANDAMENTO', 'EM ANDAMENTO'].includes(t.status))
        .sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime())
        .slice(0, 5);

    const openTicketsCount = tickets.filter(t => ['OPEN', 'ABERTO'].includes(t.status)).length;
    const pendingReservationsCount = reservations.filter(r => r.status === 'PENDING').length;
    const closedTicketsCount = tickets.filter(t => ['CLOSED', 'CONCLUIDO', 'CONCLUÍDO', 'RESOLVIDO', 'RESOLVED'].includes(t.status)).length;

    if (loading) {
        return (
            <div className="content-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <p>Carregando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: 'var(--space-24)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <LayoutDashboard size={22} color="var(--color-accent)" />
                        </div>
                        <h2 className="page-title" style={{ margin: 0 }}>Dashboard Global</h2>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Visão geral dos prédios, chamados e atividades.
                    </p>
                </div>
            </div>

            <div className="dashboard-stats-grid">
                <div className="dashboard-stat-card card-blue">
                    <div className="stat-card-left">
                        <div className="stat-icon-wrapper">
                            <Hotel size={20} />
                        </div>
                    </div>
                    <div className="stat-card-right">
                        <span className="stat-card-label">Prédios cadastrados</span>
                        <span className="stat-card-value">{condos.length}</span>
                        <span className="stat-card-desc">Total cadastrado</span>
                    </div>
                </div>

                <div className="dashboard-stat-card card-red">
                    <div className="stat-card-left">
                        <div className="stat-icon-wrapper">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                    <div className="stat-card-right">
                        <span className="stat-card-label">Chamados abertos</span>
                        <span className="stat-card-value text-red">{openTicketsCount}</span>
                        <span className="stat-card-desc">Aguardando atendimento</span>
                    </div>
                </div>

                <div className="dashboard-stat-card card-amber">
                    <div className="stat-card-left">
                        <div className="stat-icon-wrapper">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="stat-card-right">
                        <span className="stat-card-label">Reservas pendentes</span>
                        <span className="stat-card-value text-amber">{pendingReservationsCount}</span>
                        <span className="stat-card-desc">Aguardando aprovação</span>
                    </div>
                </div>

                <div className="dashboard-stat-card card-green">
                    <div className="stat-card-left">
                        <div className="stat-icon-wrapper">
                            <CheckSquare size={20} />
                        </div>
                    </div>
                    <div className="stat-card-right">
                        <span className="stat-card-label">Chamados concluídos</span>
                        <span className="stat-card-value text-green">{closedTicketsCount}</span>
                        <span className="stat-card-desc">Total resolvido</span>
                    </div>
                </div>
            </div>

            <div className="details-grid">
                <div className="details-left">
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={18} style={{ color: 'var(--color-accent)' }} /> Chamados recentes
                            </h3>
                            <button className="text-action-btn" onClick={() => navigate('/tickets')}>
                                Ver todos <span className="arrow">→</span>
                            </button>
                        </div>
                        <div className="summary-list">
                            {pendingTickets.length === 0 ? (
                                <p style={{ padding: '16px', color: 'var(--text-light)', fontSize: '0.875rem' }}>Nenhum chamado pendente.</p>
                            ) : (
                                pendingTickets.map((t, idx) => (
                                    <div key={idx} className="summary-item-refactored clickable-item" onClick={() => { setSelectedItem(t); setItemType('ticket'); }}>
                                        <div className={`summary-icon-refactored ${['OPEN', 'ABERTO'].includes(t.status) ? 'icon-red' : 'icon-orange'}`}>
                                            {['OPEN', 'ABERTO'].includes(t.status) ? <AlertCircle size={18} /> : <Clock size={18} />}
                                        </div>
                                        <div className="summary-info-refactored">
                                            <span className="summary-title-main">{t.title}</span>
                                            <span className="summary-meta-sub">
                                                {t.condominiumName} • Criado em {t.createdAt ? new Date(t.createdAt).toLocaleDateString('pt-BR') : 'Recente'}
                                            </span>
                                        </div>
                                        <div className={`status-badge-compact ${['OPEN', 'ABERTO'].includes(t.status) ? 'badge-red' : 'badge-orange'}`}>
                                            {['OPEN', 'ABERTO'].includes(t.status) ? 'Aberto' : 'Em andamento'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="details-right">
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} style={{ color: 'var(--color-accent)' }} /> Próximas atividades
                            </h3>
                            <button className="text-action-btn" onClick={() => navigate('/calendar')}>
                                Ver calendário <span className="arrow">→</span>
                            </button>
                        </div>
                        <div className="summary-list">
                            {upcomingActivities.length === 0 ? (
                                <p style={{ padding: '16px', color: 'var(--text-light)', fontSize: '0.875rem' }}>Nenhuma atividade próxima.</p>
                            ) : (
                                upcomingActivities.map((a, idx) => (
                                    <div key={idx} className="summary-item-refactored clickable-item" onClick={() => { setSelectedItem(a); setItemType('activity'); }}>
                                        <div className="summary-icon-refactored icon-blue-light">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="summary-info-refactored">
                                            <span className="summary-title-main">{a.title}</span>
                                            <span className="summary-meta-sub">{a.condominiumName || 'Sem condomínio'}</span>
                                        </div>
                                        <div className="date-badge-compact">
                                            {new Date(a.startDate).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <ItemDetailsModal
                isOpen={!!selectedItem}
                onClose={() => { setSelectedItem(null); setItemType(null); }}
                item={selectedItem}
                type={itemType}
                condominiumId={selectedItem?.condominiumId || ''}
                onItemClosed={() => {
                    setSelectedItem(null);
                    setItemType(null);
                    setRefreshKey(prev => prev + 1);
                }}
            />
        </div>
    );
};
