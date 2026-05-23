import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { Condominium, Activity, Ticket } from '../types';
import { ItemDetailsModal } from './ItemDetailsModal';
import '../styles/dashboard.css';

export const GlobalCalendarPage: React.FC = () => {
    const [activities, setActivities] = useState<(Activity & { condominiumName: string })[]>([]);
    const [tickets, setTickets] = useState<(Ticket & { condominiumName: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [itemType, setItemType] = useState<'activity' | 'ticket' | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [currentDate, setCurrentDate] = useState(new Date());

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

                const allActivities = activitiesResults.flat();
                const allTickets = ticketsResults.flat();

                setActivities(allActivities);
                setTickets(allTickets);

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

            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <div key={i} className={`calendar-cell ${isToday ? 'today' : ''}`}>
                    <div className="calendar-day-number">{i}</div>
                    <div className="calendar-events">
                        {dayActivities.map((act, idx) => (
                            <div key={`act-${idx}`} className="calendar-event act-event" title={`${act.title} - ${act.condominiumName}`} onClick={() => { setSelectedItem(act); setItemType('activity'); }}>
                                {act.title}
                            </div>
                        ))}
                        {dayTickets.map((tkt, idx) => (
                            <div key={`tkt-${idx}`} className="calendar-event tkt-event" title={`${tkt.title} - ${tkt.condominiumName}`} onClick={() => { setSelectedItem(tkt); setItemType('ticket'); }}>
                                {tkt.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="page-title">
                    <CalendarIcon size={24} style={{ marginRight: '10px' }} />
                    Calendário Global
                </h2>

                <div className="calendar-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="secondary-btn" onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button className="secondary-btn" onClick={handleNextMonth}><ChevronRight size={18} /></button>
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
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .calendar-header-row {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background-color: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                }
                .calendar-header-cell {
                    padding: 12px;
                    text-align: center;
                    font-weight: 600;
                    color: #475569;
                    font-size: 0.875rem;
                }
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background-color: #e2e8f0;
                    gap: 1px;
                }
                .calendar-cell {
                    background: white;
                    min-height: 120px;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                }
                .calendar-cell.empty {
                    background: #f8fafc;
                }
                .calendar-cell.today {
                    background: #f0fdf4;
                }
                .calendar-day-number {
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 8px;
                    text-align: right;
                    font-size: 0.875rem;
                }
                .calendar-cell.today .calendar-day-number {
                    color: #16a34a;
                }
                .calendar-events {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    overflow-y: auto;
                    flex: 1;
                }
                .calendar-event {
                    font-size: 0.75rem;
                    padding: 4px 6px;
                    border-radius: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    cursor: pointer;
                }
                .act-event {
                    background-color: #e0f2fe;
                    color: #0369a1;
                    border-left: 3px solid #0284c7;
                }
                .tkt-event {
                    background-color: #fee2e2;
                    color: #b91c1c;
                    border-left: 3px solid #ef4444;
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
