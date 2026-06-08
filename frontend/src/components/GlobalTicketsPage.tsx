import React, { useState, useEffect } from 'react';
import { CheckSquare, Search, Filter, Eye, RotateCw, ChevronLeft, ChevronRight } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { Condominium, Ticket } from '../types';
import { ItemDetailsModal } from './ItemDetailsModal';
import '../styles/dashboard.css';

// Generic Custom Select Component to bypass browser-native dropdown styling limitations
interface CustomSelectOption<T> {
    value: T;
    label: string;
}

interface CustomSelectProps<T> {
    value: T;
    onChange: (value: T) => void;
    options: CustomSelectOption<T>[];
    placeholder?: string;
    width?: string;
    minWidth?: string;
}

export const CustomSelect = <T extends string | number>({ 
    value, 
    onChange, 
    options, 
    placeholder, 
    width = '100%',
    minWidth
}: CustomSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={containerRef} className="custom-select-container" style={{ width, minWidth }}>
            <button
                type="button"
                className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{selectedOption ? selectedOption.label : placeholder}</span>
                <svg 
                    className={`custom-select-arrow-svg ${isOpen ? 'open' : ''}`} 
                    width="10" 
                    height="6" 
                    viewBox="0 0 10 6" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            
            {isOpen && (
                <div className="custom-select-dropdown">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const GlobalTicketsPage: React.FC = () => {
    const [tickets, setTickets] = useState<(Ticket & { condominiumName: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<(Ticket & { condominiumName: string }) | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [condoNames, setCondoNames] = useState<string[]>([]);

    // Extra Filters States
    const [showExtraFilters, setShowExtraFilters] = useState(false);
    const [filterCondo, setFilterCondo] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(10);

    const sanitizeTicket = (t: Ticket, condoName: string) => {
        return {
            ...t,
            title: t.title || 'Chamado Sem Título',
            description: t.description || 'Sem descrição.',
            condominiumName: condoName || 'Sem prédio vinculado'
        };
    };

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
                
                const condoNamesList = parsedCondos.map((c: any) => c.name || '').filter(Boolean);
                setCondoNames(Array.from(new Set(condoNamesList)) as string[]);
                
                const ticketsResults = await Promise.all(parsedCondos.map(async (condo: Condominium) => {
                    try {
                        let tktData = await CondominiumService.getTickets(condo.id as string);
                        if (tktData && !Array.isArray(tktData)) tktData = (tktData as any).content || [];
                        return (tktData || []).map((t: any) => sanitizeTicket(t, condo.name));
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

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchTerm, filterCondo, filterPriority]);

    const filteredTickets = tickets.filter(t => {
        // Status filter
        if (filterStatus !== 'ALL') {
            const statusMatch = 
                filterStatus === 'OPEN' ? ['OPEN', 'ABERTO'].includes(t.status) :
                filterStatus === 'IN_PROGRESS' ? ['IN_PROGRESS', 'EM_ANDAMENTO', 'EM ANDAMENTO'].includes(t.status) :
                filterStatus === 'CLOSED' ? ['CLOSED', 'CONCLUIDO', 'CONCLUÍDO', 'RESOLVIDO', 'RESOLVED'].includes(t.status) :
                t.status === filterStatus;
            if (!statusMatch) return false;
        }
        
        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const titleMatch = t.title?.toLowerCase().includes(term);
            const descMatch = t.description?.toLowerCase().includes(term);
            const condoMatch = t.condominiumName?.toLowerCase().includes(term);
            if (!titleMatch && !descMatch && !condoMatch) return false;
        }

        // Condo filter
        if (filterCondo && t.condominiumName !== filterCondo) {
            return false;
        }

        // Priority filter
        if (filterPriority && t.priority !== filterPriority) {
            return false;
        }

        return true;
    });

    // Unique Condominium names for filter dropdown (reflecting all buildings present in the buildings tab)
    const uniqueCondos = condoNames.length > 0 ? condoNames : Array.from(new Set(tickets.map(t => t.condominiumName).filter(Boolean)));

    // Pagination calculations
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = filteredTickets.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.max(Math.ceil(filteredTickets.length / recordsPerPage), 1);

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: 'var(--space-24)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <CheckSquare size={22} color="var(--color-accent)" />
                        </div>
                        <h2 className="page-title" style={{ margin: 0 }}>Todos os Chamados</h2>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Visualize, filtre e acompanhe os chamados abertos e concluídos dos prédios.
                    </p>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="building-card tickets-filter-card" style={{ 
                marginBottom: 'var(--space-24)', 
                padding: '20px', 
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
            }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                    
                    {/* Search Input */}
                    <div style={{ flex: '1 1 320px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por título, descrição ou prédio..."
                            className="tickets-filter-input"
                        />
                    </div>
                    
                    {/* Status Select */}
                    <CustomSelect
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={[
                            { value: 'ALL', label: 'Todos os status' },
                            { value: 'OPEN', label: 'Abertos' },
                            { value: 'IN_PROGRESS', label: 'Em Andamento' },
                            { value: 'CLOSED', label: 'Concluídos' }
                        ]}
                        minWidth="170px"
                        width="auto"
                    />

                    {/* Mais Filtros Button */}
                    <button 
                        type="button" 
                        onClick={() => setShowExtraFilters(!showExtraFilters)}
                        className={`tickets-action-btn ${showExtraFilters ? 'active' : ''}`}
                    >
                        <Filter size={16} />
                        Mais filtros
                    </button>

                    {/* Limpar Filtros Button */}
                    {(searchTerm || filterStatus !== 'ALL' || filterCondo || filterPriority) && (
                        <button 
                            className="secondary-btn" 
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('ALL');
                                setFilterCondo('');
                                setFilterPriority('');
                            }}
                            style={{ height: '42px', padding: '0 16px', fontSize: '0.875rem', borderRadius: '12px' }}
                        >
                            Limpar filtros
                        </button>
                    )}

                    {/* Refresh Button */}
                    <button 
                        className="primary-btn" 
                        onClick={() => setRefreshKey(prev => prev + 1)}
                        style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', fontSize: '0.875rem', marginLeft: 'auto', borderRadius: '12px' }}
                    >
                        <RotateCw size={14} className={loading ? 'spin-animation' : ''} />
                        Atualizar
                    </button>
                </div>

                {/* Collapsible extra filters */}
                {showExtraFilters && (
                    <div style={{ 
                        marginTop: '16px', 
                        paddingTop: '16px', 
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        gap: '24px',
                        flexWrap: 'wrap',
                        animation: 'fadeIn 0.2s ease-out forwards'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                                Filtrar por prédio
                            </span>
                            <CustomSelect
                                value={filterCondo}
                                onChange={setFilterCondo}
                                options={[
                                    { value: '', label: 'Todos os prédios' },
                                    ...uniqueCondos.map(name => ({ value: name, label: name }))
                                ]}
                                minWidth="220px"
                                width="auto"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                                Filtrar por prioridade
                            </span>
                            <CustomSelect
                                value={filterPriority}
                                onChange={setFilterPriority}
                                options={[
                                    { value: '', label: 'Todas as prioridades' },
                                    { value: 'BAIXA', label: 'Baixa' },
                                    { value: 'MEDIA', label: 'Média' },
                                    { value: 'ALTA', label: 'Alta' },
                                    { value: 'CRITICA', label: 'Crítica' },
                                    { value: 'URGENTE', label: 'Urgente' }
                                ]}
                                minWidth="190px"
                                width="auto"
                            />
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    Exibindo <strong>{filteredTickets.length}</strong> {filteredTickets.length === 1 ? 'chamado encontrado' : 'chamados encontrados'}.
                </div>
            </div>

            {/* Listagem */}
            <div className="building-card tickets-table-card" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <RotateCw size={24} className="spin-animation" style={{ display: 'block', margin: '0 auto 12px auto', color: 'var(--color-accent)' }} />
                        Carregando chamados...
                    </div>
                ) : currentRecords.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Nenhum chamado encontrado.
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)' }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.825rem', width: '130px' }}>Status</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.825rem' }}>Título</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.825rem', maxWidth: '300px' }}>Descrição</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.825rem' }}>Origem (Prédio)</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.825rem', width: '140px' }}>Data de Abertura</th>
                                        <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.825rem', width: '120px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRecords.map(ticket => (
                                        <tr 
                                            key={ticket.id} 
                                            onClick={() => setSelectedTicket(ticket)} 
                                            className="ticket-table-row"
                                        >
                                            {/* Status Badge */}
                                            <td style={{ padding: '10px 16px' }}>
                                                <span className={`status-badge-custom ${
                                                    ['OPEN', 'ABERTO'].includes(ticket.status) ? 'open' : 
                                                    ['IN_PROGRESS', 'EM_ANDAMENTO', 'EM ANDAMENTO'].includes(ticket.status) ? 'in_progress' : 
                                                    'closed'
                                                }`}>
                                                    {['OPEN', 'ABERTO'].includes(ticket.status) ? 'Aberto' : 
                                                     ['IN_PROGRESS', 'EM_ANDAMENTO', 'EM ANDAMENTO'].includes(ticket.status) ? 'Em andamento' : 
                                                     'Concluído'}
                                                </span>
                                            </td>
                                            
                                            {/* Title */}
                                            <td style={{ padding: '10px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                                                {ticket.title}
                                            </td>
                                            
                                            {/* Description */}
                                            <td style={{ 
                                                padding: '10px 16px', 
                                                fontSize: '0.85rem', 
                                                color: 'var(--text-secondary)',
                                                maxWidth: '300px', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis', 
                                                whiteSpace: 'nowrap' 
                                            }} title={ticket.description}>
                                                {ticket.description}
                                            </td>
                                            
                                            {/* Origin (Prédio) */}
                                            <td style={{ padding: '10px 16px' }}>
                                                <span className="condo-badge">
                                                    {ticket.condominiumName}
                                                </span>
                                            </td>
                                            
                                            {/* Opening Date */}
                                            <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('pt-BR') : '-'}
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '10px 16px' }}>
                                                <button 
                                                    type="button" 
                                                    className="ticket-details-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTicket(ticket);
                                                    }}
                                                >
                                                    <Eye size={13} />
                                                    Detalhes
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginação */}
                        <div className="ticket-pagination-container">
                            <div className="ticket-pagination-info">
                                Exibindo <strong>{indexOfFirstRecord + 1}</strong> a{' '}
                                <strong>{Math.min(indexOfLastRecord, filteredTickets.length)}</strong> de{' '}
                                <strong>{filteredTickets.length}</strong> chamados
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Itens por página:</span>
                                    <select
                                        value={recordsPerPage}
                                        onChange={(e) => {
                                            setRecordsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="ticket-page-size-select"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <div className="ticket-pagination-buttons">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="ticket-nav-page-btn"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="ticket-nav-page-btn"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            
            <style>{`
                /* Overrides for building-card in this page to disable hover translation and fix z-index stacking */
                .tickets-filter-card {
                    position: relative;
                    z-index: 10;
                }
                .tickets-filter-card:hover {
                    transform: none !important;
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04) !important;
                    border-color: var(--border-color) !important;
                }
                
                .tickets-table-card {
                    position: relative;
                    z-index: 1;
                }
                .tickets-table-card:hover {
                    transform: none !important;
                    box-shadow: var(--shadow-card) !important;
                    border-color: var(--border-color) !important;
                }

                /* Custom Select component styling */
                .custom-select-container {
                    position: relative;
                    display: inline-block;
                }

                .custom-select-trigger {
                    width: 100%;
                    height: 42px;
                    padding: 0 16px;
                    background-color: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: var(--text-main);
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                    transition: all 0.2s ease-in-out;
                    text-align: left;
                }

                .custom-select-trigger:hover {
                    border-color: #cbd5e1;
                }

                .custom-select-trigger.active {
                    border-color: var(--color-accent);
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
                }

                .custom-select-arrow-svg {
                    color: var(--text-secondary);
                    transition: transform 0.2s ease;
                    flex-shrink: 0;
                }

                .custom-select-arrow-svg.open {
                    transform: rotate(180deg);
                }

                .custom-select-dropdown {
                    position: absolute;
                    top: calc(100% + 6px);
                    left: 0;
                    right: 0;
                    background-color: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
                    z-index: 100;
                    padding: 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    max-height: 240px;
                    overflow-y: auto;
                    animation: fadeIn 0.15s ease-out forwards;
                }

                .custom-select-option {
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.15s ease;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .custom-select-option:hover {
                    background-color: var(--bg-hover);
                    color: var(--text-main);
                }

                .custom-select-option.selected {
                    background-color: #f5f3ff;
                    color: var(--color-accent-hover);
                    font-weight: 600;
                }

                /* Filters Styling */
                .tickets-filter-input {
                    width: 100%;
                    height: 42px;
                    padding: 0 12px 0 38px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    background-color: var(--bg-surface) !important;
                    color: var(--text-main) !important;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s ease-in-out;
                }
                
                .tickets-filter-input:focus {
                    border-color: var(--color-accent);
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
                }

                .tickets-action-btn {
                    height: 42px;
                    padding: 0 16px;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    background-color: var(--bg-surface);
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                    font-weight: 500;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }

                .tickets-action-btn:hover {
                    border-color: #cbd5e1;
                    color: var(--text-main);
                }

                .tickets-action-btn.active {
                    border-color: var(--color-accent);
                    background-color: #f5f3ff;
                    color: var(--color-accent-hover);
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
                }

                .spin-animation {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Table Custom Styles */
                .ticket-table-row {
                    border-bottom: 1px solid var(--border-light);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .ticket-table-row:hover {
                    background-color: var(--bg-hover);
                }

                /* Status Badges */
                .status-badge-custom {
                    display: inline-block;
                    padding: 3px 10px;
                    border-radius: 9999px;
                    font-size: 0.725rem;
                    font-weight: 700;
                    text-align: center;
                    min-width: 90px;
                }

                .status-badge-custom.open {
                    background-color: #ffedd5;
                    color: #c2410c;
                }

                .status-badge-custom.in_progress {
                    background-color: #dbeafe;
                    color: #1e40af;
                }

                .status-badge-custom.closed {
                    background-color: #dcfce7;
                    color: #15803d;
                }

                /* Condo badge */
                .condo-badge {
                    background-color: #f1f5f9;
                    color: #475569;
                    font-weight: 600;
                    font-size: 0.775rem;
                    padding: 3px 8px;
                    border-radius: var(--radius-sm);
                }

                /* Details button */
                .ticket-details-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--color-accent);
                    background-color: var(--color-accent-light);
                    border: none;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .ticket-details-btn:hover {
                    background-color: var(--color-accent);
                    color: white;
                    transform: translateY(-1px);
                }

                /* Pagination Styling */
                .ticket-pagination-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-16) var(--space-24);
                    border-top: 1px solid var(--border-color);
                    background-color: var(--bg-surface);
                    flex-wrap: wrap;
                    gap: 16px;
                }
                
                .ticket-pagination-info {
                    font-size: 0.825rem;
                    color: var(--text-secondary);
                }
                
                .ticket-page-size-select {
                    height: 30px;
                    padding: 0 4px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    background-color: var(--bg-surface);
                    color: var(--text-main);
                    font-size: 0.8rem;
                    outline: none;
                    cursor: pointer;
                }
                
                .ticket-pagination-buttons {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .ticket-nav-page-btn {
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 1px solid var(--border-color);
                    background-color: var(--bg-surface);
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .ticket-nav-page-btn:hover:not(:disabled) {
                    background-color: var(--bg-hover);
                    border-color: #cbd5e1;
                }
                
                .ticket-nav-page-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
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

export default GlobalTicketsPage;
