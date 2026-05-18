import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Calendar, AlertCircle, Clock, CheckCircle } from 'lucide-react';
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
            <div className="page-header">
                <h2 className="page-title">
                    <LayoutDashboard size={24} style={{ marginRight: '10px' }} />
                    Dashboard Global
                </h2>
            </div>

            <div className="finance-stats-row" style={{ marginBottom: '24px' }}>
                <div className="finance-stat-card">
                    <span className="stat-label">Prédios</span>
                    <span className="stat-value-lg">{condos.length}</span>
                </div>
                <div className="finance-stat-card">
                    <span className="stat-label">Chamados Abertos</span>
                    <span className="stat-value-lg text-red">{openTicketsCount}</span>
                </div>
                <div className="finance-stat-card">
                    <span className="stat-label">Reservas a aprovar</span>
                    <span className="stat-value-lg text-orange">{pendingReservationsCount}</span>
                </div>
                <div className="finance-stat-card">
                    <span className="stat-label">Chamados Concluídos</span>
                    <span className="stat-value-lg text-green">{closedTicketsCount}</span>
                </div>
            </div>

            <div className="details-grid">
                <div className="details-left">
                    <div className="section-card">
                        <div className="section-header">
                            <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={20} /> Chamados Pendentes Recentes
                            </h3>
                            <button className="secondary-btn" onClick={() => navigate('/tickets')}>Ver todos</button>
                        </div>
                        <div className="summary-list">
                            {pendingTickets.length === 0 ? (
                                <p style={{ padding: '16px', color: '#64748b' }}>Nenhum chamado pendente.</p>
                            ) : (
                                pendingTickets.map((t, idx) => (
                                    <div key={idx} className="summary-item clickable-item" onClick={() => { setSelectedItem(t); setItemType('ticket'); }} style={{ cursor: 'pointer' }}>
                                        <div className={`summary-icon ${['OPEN', 'ABERTO'].includes(t.status) ? 'icon-red' : 'icon-orange'}`}>
                                            {['OPEN', 'ABERTO'].includes(t.status) ? <AlertCircle size={20} /> : <Clock size={20} />}
                                        </div>
                                        <div className="summary-info" style={{ flex: 1 }}>
                                            <span className="summary-label" style={{ fontWeight: 600 }}>{t.title}</span>
                                            <span className="summary-value" style={{ fontSize: '0.85rem' }}>{t.condominiumName}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
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
                                <Calendar size={20} /> Próximas Atividades
                            </h3>
                            <button className="secondary-btn" onClick={() => navigate('/calendar')}>Ver calendário</button>
                        </div>
                        <div className="summary-list">
                            {upcomingActivities.length === 0 ? (
                                <p style={{ padding: '16px', color: '#64748b' }}>Nenhuma atividade próxima.</p>
                            ) : (
                                upcomingActivities.map((a, idx) => (
                                    <div key={idx} className="summary-item clickable-item" onClick={() => { setSelectedItem(a); setItemType('activity'); }} style={{ cursor: 'pointer' }}>
                                        <div className="summary-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                                            <Calendar size={20} />
                                        </div>
                                        <div className="summary-info">
                                            <span className="summary-label" style={{ fontWeight: 600 }}>{a.title}</span>
                                            <span className="summary-value" style={{ fontSize: '0.85rem' }}>
                                                {new Date(a.startDate).toLocaleDateString('pt-BR')} • {a.condominiumName}
                                            </span>
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
