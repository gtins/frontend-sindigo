import React, { useState, useEffect } from 'react';
import { CheckSquare, Search, Filter } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { Condominium, Ticket } from '../types';
import { ItemDetailsModal } from './ItemDetailsModal';
import '../styles/dashboard.css';

export const GlobalTicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<(Ticket & { condominiumName: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [selectedTicket, setSelectedTicket] = useState<(Ticket & { condominiumName: string }) | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchGlobalTickets = async () => {
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
                
                const ticketsResults = await Promise.all(parsedCondos.map(async (condo: Condominium) => {
                    try {
                        let tktData = await CondominiumService.getTickets(condo.id as string);
                        if (tktData && !Array.isArray(tktData)) tktData = (tktData as any).content || [];
                        return (tktData || []).map((t: any) => ({ ...t, condominiumName: condo.name }));
                    } catch (err) {
                        console.error(`Failed to fetch tickets for condo ${condo.id}`, err);
                        return [];
                    }
                }));
                
                let allTickets = ticketsResults.flat();

                // Sort by newest first
                allTickets.sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime());

                setTickets(allTickets);
            } catch (err) {
                console.error('Failed to fetch global tickets:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalTickets();
    }, [refreshKey]);

    const filteredTickets = filterStatus === 'ALL' 
        ? tickets 
        : tickets.filter(t => 
            filterStatus === 'OPEN' ? ['OPEN', 'ABERTO'].includes(t.status) :
            filterStatus === 'IN_PROGRESS' ? ['IN_PROGRESS', 'EM_ANDAMENTO', 'EM ANDAMENTO'].includes(t.status) :
            filterStatus === 'CLOSED' ? ['CLOSED', 'CONCLUIDO', 'CONCLUÍDO', 'RESOLVIDO', 'RESOLVED'].includes(t.status) :
            t.status === filterStatus
        );

    return (
        <div className="content-wrapper">
            <div className="page-header">
                <h2 className="page-title">
                    <CheckSquare size={24} style={{ marginRight: '10px' }} />
                    Todos os Chamados
                </h2>

                <div className="header-actions">
                    <div className="search-input-wrapper" style={{ margin: 0 }}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar chamados..."
                            className="search-input"
                        />
                    </div>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-pill">
                    <span className="filter-label">Status</span>
                    <select 
                        className="filter-value"
                        style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">Todos</option>
                        <option value="OPEN">Abertos</option>
                        <option value="IN_PROGRESS">Em Andamento</option>
                        <option value="CLOSED">Concluídos</option>
                    </select>
                </div>
                
                <button className="action-btn">
                    <Filter size={18} />
                    Mais Filtros
                </button>
            </div>

            <div className="section-card" style={{ marginTop: '20px' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        Carregando chamados...
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        Nenhum chamado encontrado.
                    </div>
                ) : (
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Título</th>
                                <th>Descrição</th>
                                <th>Origem (Prédio)</th>
                                <th>Data de Abertura</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} onClick={() => setSelectedTicket(ticket)} style={{ cursor: 'pointer' }} className="hover-row">
                                    <td>
                                        <span className={`status-badge ${['OPEN', 'ABERTO'].includes(ticket.status) ? 'open' : ['IN_PROGRESS', 'EM_ANDAMENTO', 'EM ANDAMENTO'].includes(ticket.status) ? 'in_progress' : 'closed'}`}>
                                            {['OPEN', 'ABERTO'].includes(ticket.status) ? 'Aberto' : ['IN_PROGRESS', 'EM_ANDAMENTO', 'EM ANDAMENTO'].includes(ticket.status) ? 'Em andamento' : 'Concluído'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 500, color: '#1e293b' }}>{ticket.title}</td>
                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {ticket.description}
                                    </td>
                                    <td><span className="category-tag" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>{ticket.condominiumName}</span></td>
                                    <td>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            
            <style>{`
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                .status-badge.open {
                    background-color: #fee2e2;
                    color: #b91c1c;
                }
                .status-badge.in_progress {
                    background-color: #ffedd5;
                    color: #c2410c;
                }
                .status-badge.closed {
                    background-color: #dcfce7;
                    color: #15803d;
                }
                .hover-row:hover {
                    background-color: #f8fafc;
                }
            `}</style>
            
            <ItemDetailsModal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                item={selectedTicket}
                type="ticket"
                condominiumId={selectedTicket?.condominiumId || ''}
                onItemClosed={() => {
                    setSelectedTicket(null);
                    setRefreshKey(prev => prev + 1);
                }}
            />
        </div>
    );
};
