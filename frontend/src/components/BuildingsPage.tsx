import React, { useState, useEffect } from 'react';
import { Search, Filter, LayoutGrid, Plus, Hotel, Check } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BuildingCard } from './BuildingCard';
import CondominiumService from '../services/condominiumService';
import type { Condominium } from '../types';
import '../styles/dashboard.css';

export const BuildingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshKey = 0, setIsCreateModalOpen } = useOutletContext<{ refreshKey: number, setIsCreateModalOpen: (open: boolean) => void }>() || {};

    const [allCondos, setAllCondos] = useState<Condominium[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const [showSortOptions, setShowSortOptions] = useState(false);
    const [sortBy, setSortBy] = useState<'name-asc' | 'tickets-desc' | 'updated-desc' | 'status-desc'>('name-asc');
    const [ticketsMap, setTicketsMap] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCondominiums = async () => {
            setLoading(true);
            try {
                const role = localStorage.getItem('role') || 'MORADOR';
                let data = (role === 'ADMIN' || role === 'SINDICO') 
                    ? await CondominiumService.getAll()
                    : await CondominiumService.getMyCondominiums();

                // 1. Trata se a API retornou no padrão Pageable do Spring (ex: data.content)
                if (data && !Array.isArray(data)) {
                    data = (data as any).content || (data as any).data || (data as any).items || [];
                }

                // 2. Transforma o DTO de Member no formato esperado pelo Frontend
                if (Array.isArray(data)) {
                    data = data.map((item: any) => {
                        // Se for o DTO que você enviou agora (my-condominiums)
                        if (item.condominiumId && item.condominiumName) {
                            return {
                                ...item,
                                id: item.condominiumId,    // Garante que o clique leve para a rota certa
                                name: item.condominiumName // Garante que o nome apareça no card
                            };
                        }
                        return item;
                    });
                }

                setAllCondos(data);

                // Fetch tickets count for each condo
                const ticketsResults = await Promise.all(data.map(async (condo: Condominium) => {
                    try {
                        let tktData = await CondominiumService.getTickets(condo.id as string);
                        if (tktData && !Array.isArray(tktData)) {
                            tktData = (tktData as any).content || [];
                        }
                        return { 
                            condoId: condo.id as string, 
                            count: (tktData || []).filter((t: any) => ['OPEN', 'ABERTO'].includes(t.status)).length 
                        };
                    } catch (err) {
                        console.error(`Failed to fetch tickets for condo ${condo.id}`, err);
                        return { condoId: condo.id as string, count: 0 };
                    }
                }));

                const newTicketsMap = ticketsResults.reduce((acc, curr) => {
                    acc[curr.condoId] = curr.count;
                    return acc;
                }, {} as Record<string, number>);
                
                setTicketsMap(newTicketsMap);

            } catch (err) {
                console.error('Failed to fetch condominiums:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCondominiums();
    }, [refreshKey]);

    const filteredCondos = allCondos.filter(condo => {
        if (!showInactive && condo.active === false) {
            return false;
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const nameMatch = condo.name?.toLowerCase().includes(query);
            const addressMatch = condo.address?.toLowerCase().includes(query);
            if (!nameMatch && !addressMatch) return false;
        }
        return true;
    });

    const sortOptions = [
        { value: 'name-asc', label: 'Nome: A-Z' },
        { value: 'tickets-desc', label: 'Mais chamados abertos' },
        { value: 'updated-desc', label: 'Atualizados recentemente' },
        { value: 'status-desc', label: 'Status crítico primeiro' }
    ] as const;

    const getSortLabel = (value: typeof sortBy) => {
        const option = sortOptions.find(opt => opt.value === value);
        return option ? option.label : 'A-Z';
    };

    const sortedCondos = [...filteredCondos].sort((a, b) => {
        if (sortBy === 'name-asc') {
            return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'tickets-desc') {
            const ticketsA = ticketsMap[a.id as string] || 0;
            const ticketsB = ticketsMap[b.id as string] || 0;
            return ticketsB - ticketsA;
        }
        if (sortBy === 'updated-desc') {
            const dateA = new Date((a as any).updatedAt || (a as any).createdAt || 0).getTime();
            const dateB = new Date((b as any).updatedAt || (b as any).createdAt || 0).getTime();
            if (dateA !== dateB) {
                return dateB - dateA;
            }
            return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'status-desc') {
            const getStatusScore = (condoId: string) => {
                const openTickets = ticketsMap[condoId] || 0;
                if (openTickets > 5) return 3; // Warning (Red)
                if (openTickets > 0) return 2; // Attention (Orange)
                return 1; // Healthy (Green)
            };
            const scoreA = getStatusScore(a.id as string);
            const scoreB = getStatusScore(b.id as string);
            if (scoreA !== scoreB) {
                return scoreB - scoreA;
            }
            return (a.name || '').localeCompare(b.name || '');
        }
        return 0;
    });

    return (
        <div className="content-wrapper">
            <div className="page-header" style={{ marginBottom: 'var(--space-24)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Hotel size={22} color="var(--color-accent)" />
                        </div>
                        <h2 className="page-title" style={{ margin: 0 }}>Condomínios</h2>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Gerencie os condomínios cadastrados, unidades, chamados e status operacional.
                    </p>
                </div>

                <div className="header-actions">
                    {(localStorage.getItem('role')?.includes('ADMIN') || localStorage.getItem('role')?.includes('SINDICO')) && (
                        <button className="primary-btn" onClick={() => setIsCreateModalOpen?.(true)}>
                            <Plus size={18} />
                            Novo prédio
                        </button>
                    )}
                </div>
            </div>

            <div className="filter-bar" style={{ marginTop: '20px' }}>
                <div className="search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por prédio, endereço ou condomínio..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <button 
                        className="action-btn"
                        onClick={() => {
                            setShowFilters(!showFilters);
                            setShowSortOptions(false);
                        }}
                        style={showFilters ? { borderColor: 'var(--color-accent)', color: 'var(--color-accent-hover)', backgroundColor: 'var(--color-accent-light)' } : undefined}
                    >
                        <Filter size={18} />
                        Filtros
                    </button>

                    {showFilters && (
                        <div className="building-card filters-popover-card" style={{ 
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            zIndex: 50,
                            width: '280px', 
                            padding: '16px', 
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Filtros avançados
                            </span>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                        Exibir inativos
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', lineHeight: '1.25' }}>
                                        Inclui prédios arquivados ou desativados na listagem.
                                    </span>
                                </div>
                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '36px', height: '20px', flexShrink: 0 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={showInactive} 
                                        onChange={(e) => setShowInactive(e.target.checked)}
                                        style={{ opacity: 0, width: 0, height: 0 }} 
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ position: 'relative' }}>
                    <button 
                        className="action-btn"
                        onClick={() => {
                            setShowSortOptions(!showSortOptions);
                            setShowFilters(false);
                        }}
                        style={sortBy !== 'name-asc' || showSortOptions ? { borderColor: 'var(--color-accent)', color: 'var(--color-accent-hover)', backgroundColor: 'var(--color-accent-light)' } : undefined}
                    >
                        <LayoutGrid size={18} />
                        {sortBy === 'name-asc' ? 'Ordenar' : `Ordenar: ${getSortLabel(sortBy)}`}
                    </button>

                    {showSortOptions && (
                        <div className="building-card filters-popover-card" style={{ 
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            zIndex: 50,
                            width: '240px', 
                            padding: '12px', 
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '4px 8px 8px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                                Ordenar por
                            </span>
                            {sortOptions.map((option) => {
                                const isActive = sortBy === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortBy(option.value);
                                            setShowSortOptions(false);
                                        }}
                                        className={`sort-option-item ${isActive ? 'active' : ''}`}
                                    >
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                                            {isActive ? <Check size={14} color="var(--color-accent)" /> : <span style={{ width: 14 }} />}
                                            {option.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="legend">
                <div className="legend-item">
                    <span className="dot green"></span>
                    <span>Saudável</span>
                </div>
                <div className="legend-item">
                    <span className="dot orange"></span>
                    <span>Atenção</span>
                </div>
                <div className="legend-item">
                    <span className="dot gray"></span>
                    <span>Sem dados</span>
                </div>
            </div>

            <div className="buildings-grid">
                {loading ? (
                    <p>Carregando condomínios...</p>
                ) : sortedCondos.length === 0 ? (
                    <p>Nenhum condomínio encontrado.</p>
                ) : (
                    sortedCondos.map((building) => {
                        const openTickets = ticketsMap[building.id as string] || 0;
                        const status = openTickets === 0 ? 'healthy' : openTickets > 5 ? 'warning' : 'attention';
                        return (
                            <BuildingCard
                                key={building.id}
                                data={{
                                    id: building.id as any,
                                    name: building.name,
                                    units: building.unidades || 0,
                                    tickets: openTickets,
                                    lastUpdate: 'agora',
                                    status: status,
                                }}
                                onClick={() => navigate(`/buildings/${building.id}`)}
                            />
                        );
                    })
                )}
            </div>

            <style>{`
                /* Toggle Switch Styling */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 36px;
                    height: 20px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--border-color);
                    transition: .2s;
                    border-radius: 20px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 14px;
                    width: 14px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .2s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: var(--color-accent);
                }
                input:checked + .slider:before {
                    transform: translateX(16px);
                }
                
                /* Dark Mode overrides for toggle */
                .dark .slider {
                    background-color: #374151 !important;
                }

                /* Disable hover translation on filters popover */
                .filters-popover-card:hover {
                    transform: none !important;
                    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04) !important;
                    border-color: var(--border-color) !important;
                }

                /* Sort Option Item styling */
                .sort-option-item {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: 8px 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-main);
                    font-size: 0.85rem;
                    font-weight: 500;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    text-align: left;
                }
                .sort-option-item:hover {
                    background-color: var(--bg-hover);
                    color: var(--color-accent-hover);
                }
                .sort-option-item.active {
                    background-color: var(--color-accent-light);
                    color: var(--color-accent);
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};
