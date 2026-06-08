import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CondominiumService from '../services/condominiumService';
import type { Condominium, Activity, Ticket } from '../types';
import { ItemDetailsModal } from './ItemDetailsModal';
import '../styles/dashboard.css';

export const GlobalCalendarPage: React.FC = () => {
    const navigate = useNavigate();
    const [activities, setActivities] = useState<(Activity & { condominiumName: string })[]>([]);
    const [tickets, setTickets] = useState<(Ticket & { condominiumName: string })[]>([]);
    const [reservations, setReservations] = useState<(any & { condominiumName: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [itemType, setItemType] = useState<'activity' | 'ticket' | 'reservation' | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [filterType, setFilterType] = useState<'all' | 'activity' | 'ticket' | 'reservation'>('all');

    useEffect(() => {
        const fetchGlobalData = async () => {
            setLoading(true);
            try {
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
                
                const activitiesResults = await Promise.all(parsedCondos.map(async (condo: Condominium) => {
                    try {
                        const condoIdStr = condo.id as string;
                        let actData = await CondominiumService.getActivities(condoIdStr);
                        if (actData && !Array.isArray(actData)) actData = (actData as any).content || [];
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
                        if (tktData && !Array.isArray(tktData)) tktData = (tktData as any).content || [];
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
                        if (resData && !Array.isArray(resData)) resData = (resData as any).content || [];
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
                console.error('Failed to fetch global calendar data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalData();
    }, [refreshKey]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);

        const days = [];
        // Empty cells before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
            const dayActivities = activities.filter(a => a.startDate && typeof a.startDate === 'string' && a.startDate.startsWith(dateStr));
            const dayTickets = tickets.filter(t => t.createdAt && typeof t.createdAt === 'string' && t.createdAt.startsWith(dateStr));
            const dayReservations = reservations.filter(r => r.startTime && typeof r.startTime === 'string' && r.startTime.startsWith(dateStr));

            const isTodayStr = new Date().toISOString().split('T')[0];
            const isToday = isTodayStr === dateStr;

            days.push(
                <div key={i} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                    <div className="calendar-day-header">
                        {isToday && <span className="today-badge">Hoje</span>}
                        <span className={`calendar-day-number ${isToday ? 'today-circle' : ''}`}>{i}</span>
                    </div>
                    <div className="calendar-events">
                        {['all', 'activity'].includes(filterType) && dayActivities.map((act, idx) => (
                            <div key={`act-${idx}`} className="calendar-event act-event" title={`${act.title} - ${act.condominiumName}`} onClick={() => { setSelectedItem(act); setItemType('activity'); }}>
                                📅 {act.title}
                            </div>
                        ))}
                        {['all', 'ticket'].includes(filterType) && dayTickets.map((tkt, idx) => (
                            <div key={`tkt-${idx}`} className="calendar-event tkt-event" title={`${tkt.title} - ${tkt.condominiumName}`} onClick={() => { setSelectedItem(tkt); setItemType('ticket'); }}>
                                🔧 {tkt.title}
                            </div>
                        ))}
                        {['all', 'reservation'].includes(filterType) && dayReservations.map((res, idx) => (
                            <div key={`res-${idx}`} className="calendar-event res-event" title={`${res.area} - ${res.condominiumName}`} onClick={() => { setSelectedItem(res); setItemType('reservation' as any); }}>
                                🔑 {res.area}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Fill empty cells at the end of the month to complete the week/grid
        const totalRendered = firstDay + daysInMonth;
        const totalCellsNeeded = Math.ceil(totalRendered / 7) * 7;
        const emptyCellsAtEnd = totalCellsNeeded - totalRendered;
        for (let i = 0; i < emptyCellsAtEnd; i++) {
            days.push(<div key={`empty-end-${i}`} className="calendar-cell empty"></div>);
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleGoToToday = () => {
        setCurrentDate(new Date());
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: 'var(--space-24)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CalendarIcon size={22} color="var(--color-accent)" />
                        </div>
                        <h2 className="page-title" style={{ margin: 0 }}>Calendário Global</h2>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Visualize atividades, chamados e reservas agendadas nos condomínios.
                    </p>
                </div>

                <div className="header-actions">
                    {(localStorage.getItem('role')?.includes('ADMIN') || localStorage.getItem('role')?.includes('SINDICO')) && (
                        <button className="primary-btn" onClick={() => navigate('/buildings')}>
                            <Plus size={18} />
                            Nova atividade
                        </button>
                    )}
                </div>
            </div>

            <div className="calendar-control-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 16px 0', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="month-nav-container">
                        <button className="nav-arrow-btn" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
                        <span className="month-display-text">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button className="nav-arrow-btn" onClick={handleNextMonth}><ChevronRight size={16} /></button>
                    </div>
                    
                    <button className="action-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleGoToToday}>
                        Hoje
                    </button>
                </div>

                <div className="calendar-filter-group">
                    <button className={`filter-tab ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>Todos</button>
                    <button className={`filter-tab ${filterType === 'activity' ? 'active' : ''}`} onClick={() => setFilterType('activity')}>Atividades</button>
                    <button className={`filter-tab ${filterType === 'ticket' ? 'active' : ''}`} onClick={() => setFilterType('ticket')}>Chamados</button>
                    <button className={`filter-tab ${filterType === 'reservation' ? 'active' : ''}`} onClick={() => setFilterType('reservation')}>Reservas</button>
                </div>
            </div>

            <div className="legend" style={{ marginBottom: '16px', display: 'flex', gap: '16px', fontSize: '0.82rem' }}>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="dot blue" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }}></span>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Atividades</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="dot red" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Chamados</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="dot orange" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Reservas</span>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <p>Carregando calendário...</p>
                </div>
            ) : (
                <div className="calendar-container">
                    <div className="calendar-header-row">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                            <div key={day} className="calendar-header-cell">{day}</div>
                        ))}
                    </div>
                    <div className="calendar-grid">
                        {renderCalendar()}
                    </div>
                </div>
            )}

            <style>{`
                .calendar-container {
                    background: white;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow-card);
                }
                .calendar-header-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background-color: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .calendar-header-cell {
                    padding: 10px;
                    text-align: center;
                    font-weight: 700;
                    color: var(--text-secondary);
                    font-size: 0.78rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background-color: #f1f5f9; /* Soft grid lines */
                    gap: 1px;
                }
                .calendar-cell {
                    background: white;
                    min-height: 105px;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    transition: background-color 0.2s ease;
                }
                .calendar-cell:not(.empty) {
                    cursor: pointer;
                }
                .calendar-cell:not(.empty):hover {
                    background-color: var(--bg-hover);
                }
                .calendar-cell.empty {
                    background: #fafafa;
                }
                .calendar-day-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 6px;
                }
                .today-badge {
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: var(--color-accent);
                    background-color: var(--color-accent-light);
                    padding: 2px 6px;
                    border-radius: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .calendar-day-number {
                    font-weight: 600;
                    color: var(--text-main);
                    font-size: 0.85rem;
                    width: 24px;
                    height: 24px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .today-circle {
                    background-color: var(--color-accent);
                    color: white !important;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
                }
                .calendar-events {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    overflow-y: auto;
                    flex: 1;
                }
                .calendar-event {
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 5px 8px;
                    border-radius: 6px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: pointer;
                    border: 1px solid transparent;
                    border-left-width: 3px;
                    transition: all 0.2s ease;
                }
                .calendar-event:hover {
                    transform: translateY(-0.5px);
                    box-shadow: 0 2px 4px rgba(15, 23, 42, 0.05);
                }
                .act-event {
                    background-color: #eff6ff;
                    color: #1d4ed8;
                    border-color: #dbeafe;
                    border-left-color: #3b82f6;
                }
                .act-event:hover {
                    border-color: #cbd5e1;
                    border-left-color: #2563eb;
                }
                .tkt-event {
                    background-color: #fef2f2;
                    color: #b91c1c;
                    border-color: #fee2e2;
                    border-left-color: #ef4444;
                }
                .tkt-event:hover {
                    border-color: #cbd5e1;
                    border-left-color: #dc2626;
                }
                .res-event {
                    background-color: #fff7ed;
                    color: #b45309;
                    border-color: #ffedd5;
                    border-left-color: #f59e0b;
                }
                .res-event:hover {
                    border-color: #cbd5e1;
                    border-left-color: #d97706;
                }
                
                /* Month Nav Styles */
                .month-nav-container {
                    background: white;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    box-shadow: var(--shadow-sm);
                }
                .nav-arrow-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    padding: 6px 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .nav-arrow-btn:hover {
                    background-color: var(--bg-hover);
                    color: var(--text-main);
                }
                .month-display-text {
                    padding: 0 12px;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: var(--text-main);
                    min-width: 130px;
                    text-align: center;
                }
                
                /* Filter Tabs */
                .calendar-filter-group {
                    display: flex;
                    background-color: #f1f5f9;
                    padding: 3px;
                    border-radius: 10px;
                    border: 1px solid #e2e8f0;
                }
                .filter-tab {
                    background: transparent;
                    border: none;
                    padding: 6px 14px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .filter-tab:hover {
                    color: var(--text-main);
                }
                .filter-tab.active {
                    background-color: white;
                    color: var(--color-accent-hover);
                    box-shadow: var(--shadow-sm);
                }

                /* Dark Mode overrides */
                .dark .calendar-container {
                    background: var(--bg-surface) !important;
                    border-color: var(--border-color) !important;
                }
                .dark .calendar-header-row {
                    background-color: var(--bg-surface-2) !important;
                    border-bottom-color: var(--border-color) !important;
                }
                .dark .calendar-header-cell {
                    color: var(--text-secondary) !important;
                }
                .dark .calendar-grid {
                    background-color: var(--border-color) !important;
                }
                .dark .calendar-cell {
                    background-color: var(--bg-surface) !important;
                }
                .dark .calendar-cell.empty {
                    background-color: var(--bg-body) !important;
                }
                .dark .month-nav-container {
                    background-color: var(--bg-surface) !important;
                    border-color: var(--border-color) !important;
                }
                .dark .calendar-filter-group {
                    background-color: var(--bg-input) !important;
                    border-color: var(--border-color) !important;
                }
                .dark .filter-tab.active {
                    background-color: var(--color-accent) !important;
                    color: white !important;
                }
                .dark .filter-tab:not(.active) {
                    color: var(--text-secondary) !important;
                }
                .dark .filter-tab:not(.active):hover {
                    color: var(--text-main) !important;
                }
                
                /* Event colors in Dark Mode */
                .dark .act-event {
                    background-color: rgba(59, 130, 246, 0.15) !important;
                    color: #60a5fa !important;
                    border-color: rgba(59, 130, 246, 0.25) !important;
                    border-left-color: #3b82f6 !important;
                }
                .dark .act-event:hover {
                    border-color: rgba(59, 130, 246, 0.45) !important;
                    background-color: rgba(59, 130, 246, 0.25) !important;
                }
                .dark .tkt-event {
                    background-color: rgba(239, 68, 68, 0.15) !important;
                    color: #f87171 !important;
                    border-color: rgba(239, 68, 68, 0.25) !important;
                    border-left-color: #ef4444 !important;
                }
                .dark .tkt-event:hover {
                    border-color: rgba(239, 68, 68, 0.45) !important;
                    background-color: rgba(239, 68, 68, 0.25) !important;
                }
                .dark .res-event {
                    background-color: rgba(245, 158, 11, 0.15) !important;
                    color: #fbbf24 !important;
                    border-color: rgba(245, 158, 11, 0.25) !important;
                    border-left-color: #f59e0b !important;
                }
                .dark .res-event:hover {
                    border-color: rgba(245, 158, 11, 0.45) !important;
                    background-color: rgba(245, 158, 11, 0.25) !important;
                }
            `}</style>

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
