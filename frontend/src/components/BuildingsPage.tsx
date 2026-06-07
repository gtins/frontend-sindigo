import React, { useState, useEffect } from 'react';
import { Search, Filter, LayoutGrid, Plus } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BuildingCard } from './BuildingCard';
import CondominiumService from '../services/condominiumService';
import type { Condominium } from '../types';
import '../styles/dashboard.css';

export const BuildingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { refreshKey = 0, setIsCreateModalOpen } = useOutletContext<{ refreshKey: number, setIsCreateModalOpen: (open: boolean) => void }>() || {};

    const [condos, setCondos] = useState<Condominium[]>([]);
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

                setCondos(data);

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
    return (
        <div className="content-wrapper">
            <div className="page-header-container" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="page-title-main" style={{ fontSize: '1.6rem' }}>Prédios gerenciados</h2>
                    <p className="page-subtitle-main" style={{ margin: '4px 0 0 0', fontSize: '0.875rem' }}>
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
                    />
                </div>

                <button className="action-btn">
                    <Filter size={18} />
                    Filtros
                </button>

                <button className="action-btn">
                    <LayoutGrid size={18} />
                    Ordenar
                </button>
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
                ) : condos.length === 0 ? (
                    <p>Nenhum condomínio encontrado.</p>
                ) : (
                    condos.map((building) => {
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
        </div>
    );
};
