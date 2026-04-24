import React, { useEffect, useState } from 'react';
import {
    Wallet,
    ChevronRight,
    TrendingUp,
    TrendingDown,
    Plus,
    Loader,
    Download,
    Filter,
    RefreshCw,
    Menu // for 'Saldo do mês' lines icon
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import CondominiumService from '../services/condominiumService';
import { CreateFinancialEntryModal } from './CreateFinancialEntryModal';
import { TransactionChartModal } from './TransactionChartModal';
import type { Condominium, FinancialEntry, Balance } from '../types';
import '../styles/details.css';
import '../styles/finances.css';

export const BuildingFinancesReal: React.FC = () => {
    const { id: condominiumId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [condominium, setCondominium] = useState<Condominium | null>(null);
    const [entries, setEntries] = useState<FinancialEntry[]>([]);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedChartType, setSelectedChartType] = useState<'INCOME' | 'EXPENSE' | null>(null);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [refreshKey, setRefreshKey] = useState(0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch condo info
                const condo = await CondominiumService.getById(condominiumId);
                setCondominium(condo);

                // Fetch balance
                const bal = await CondominiumService.getFinanceBalance(condominiumId);
                setBalance(bal);

                // Fetch entries
                const ent = await CondominiumService.getFinancialEntries(condominiumId);
                let entriesData = ent;
                if (ent && !Array.isArray(ent)) {
                    // some backends wrap lists in content/data
                    entriesData = (ent as any).content || (ent as any).data || (ent as any).items || [];
                }
                setEntries(entriesData || []);
            } catch (err) {
                console.error("Error fetching financial data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (condominiumId) {
            fetchData();
        }
    }, [condominiumId, refreshKey]);

    if (!condominiumId) return <div>ID do condomínio não foi providenciado.</div>;

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="content-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#64748b' }}>
                        <Loader className="spin-animation" size={32} />
                        <p>Carregando dados financeiros...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!condominium) {
        return <div className="dashboard-container"><div className="content-wrapper"><p>Condomínio não encontrado.</p></div></div>;
    }

    const safeBalance = balance ? (typeof balance.balance === 'number' && !isNaN(balance.balance) ? balance.balance : balance.totalIncome - balance.totalExpense) : 0;
    const netBalanceColor = safeBalance >= 0 ? 'text-green' : 'text-red';
    const isNetBalancePositive = safeBalance >= 0;

    const currentPeriod = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ');
    
    let lastConciliation = "Sem lançamentos";
    if (entries.length > 0) {
        const latestMs = Math.max(...entries.map(e => e.date ? new Date(e.date).getTime() : 0));
        if (latestMs > 0) {
            const diff = Math.floor((new Date().getTime() - latestMs) / (1000 * 60 * 60 * 24));
            lastConciliation = diff === 0 ? "Hoje" : `há ${diff} dia${diff > 1 ? 's' : ''}`;
        }
    }

    const filteredEntries = filterType === 'ALL' ? entries : entries.filter(e => e.type === filterType);

    return (
        <div className="dashboard-container">
            <div className="content-wrapper">
                <div className="details-header">
                    <div className="breadcrumbs">
                        <span className="breadcrumb-item" onClick={() => navigate('/')}>Visão geral</span>
                        <ChevronRight size={14} />
                        <span className="breadcrumb-item" onClick={() => navigate(`/buildings/${condominiumId}`)}>{condominium.name}</span>
                        <ChevronRight size={14} />
                        <span style={{ color: 'var(--text-main)' }}>Finanças</span>
                    </div>
                </div>

                <div className="finance-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-box">
                            <Wallet size={24} color="var(--text-main)" />
                        </div>
                        <h1 className="building-title">Finanças · {condominium.name}</h1>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="secondary-btn" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                            <Download size={16} />
                            Exportar (CSV)
                        </button>
                        <button className="primary-btn" onClick={() => setIsCreateModalOpen(true)}>
                            <Plus size={16} />
                            Novo lançamento
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="filters-row">
                    <div className="filter-pill">
                        <span className="filter-label">Período</span>
                        <span className="filter-value" style={{ textTransform: 'capitalize' }}>{currentPeriod}</span>
                    </div>
                    <div className="filter-pill">
                        <span className="filter-label">Conta</span>
                        <span className="filter-value">Conta corrente</span>
                    </div>
                    <div className="filter-pill">
                        <span className="filter-label">Tipo</span>
                        <select 
                            className="filter-value"
                            style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: 0, appearance: 'none' }}
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            title="Filtrar por tipo"
                        >
                            <option value="ALL">Todos</option>
                            <option value="INCOME">Entradas</option>
                            <option value="EXPENSE">Saídas</option>
                        </select>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="finance-stats-row">
                    <div className="finance-stat-card">
                        <span className="stat-label">Saldo atual</span>
                        <span className="stat-value-lg">{formatCurrency(safeBalance)}</span>
                    </div>
                    <div className="finance-stat-card">
                        <span className="stat-label">Entradas (mês)</span>
                        <span className="stat-value-lg text-green">{balance ? formatCurrency(balance.totalIncome) : 'R$ 0,00'}</span>
                    </div>
                    <div className="finance-stat-card">
                        <span className="stat-label">Saídas (mês)</span>
                        <span className="stat-value-lg text-red">{balance ? formatCurrency(balance.totalExpense) : 'R$ 0,00'}</span>
                    </div>
                    <div className="finance-stat-card">
                        <span className="stat-label">Última conciliação</span>
                        <span className="stat-value-lg">{lastConciliation}</span>
                    </div>
                </div>

                <div className="details-grid">
                    {/* Left: Transaction Table */}
                    <div className="details-left">
                        <div className="section-card">
                            <div className="section-header" style={{ borderBottom: 'none' }}>
                                <div style={{ width: '200px' }}>
                                    <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>Extrato de transações</h3>
                                </div>

                                <div className="table-controls">
                                    <input type="text" placeholder="Entradas:" className="mini-input" disabled />
                                    <input type="text" placeholder="Saídas:" className="mini-input" disabled />
                                    <button className="action-btn">
                                        <Filter size={16} />
                                        Filtrar
                                    </button>
                                    <button className="action-btn">
                                        <RefreshCw size={16} />
                                        Conciliar
                                    </button>
                                </div>
                            </div>

                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Descrição</th>
                                        <th>Categoria</th>
                                        <th>Conta</th>
                                        <th style={{ textAlign: 'right' }}>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEntries.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                                Nenhuma movimentação registrada.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEntries.map(tx => (
                                            <tr key={tx.id}>
                                                <td>{tx.date ? new Date(tx.date).toLocaleDateString('pt-BR') : '-'}</td>
                                                <td>
                                                    <span className="tx-desc">{tx.description}</span>
                                                </td>
                                                <td><span className="category-tag">{tx.type === 'INCOME' ? 'Receitas' : 'Manutenção'}</span></td>
                                                <td>Conta corrente</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span className={`tx-value ${tx.type === 'INCOME' ? 'text-green' : 'text-red'}`}>
                                                        {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.amount)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div className="details-right">
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Resumo do mês</h3>
                                <div className="legend-dots">
                                    <span className="legend-dot green"></span> Depósitos
                                    <span className="legend-dot red"></span> Compras
                                </div>
                            </div>

                            <div className="summary-list">
                                <div className="summary-item clickable" onClick={() => setSelectedChartType('INCOME')} title="Ver gráfico">
                                    <div className="summary-icon icon-green">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-label">Total de depósitos</span>
                                        <span className="summary-value text-green">{balance ? formatCurrency(balance.totalIncome) : 'R$ 0,00'}</span>
                                    </div>
                                </div>
                                <div className="summary-item clickable" onClick={() => setSelectedChartType('EXPENSE')} title="Ver gráfico">
                                    <div className="summary-icon icon-red">
                                        <TrendingDown size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-label">Total de compras</span>
                                        <span className="summary-value text-red">{balance ? formatCurrency(balance.totalExpense) : 'R$ 0,00'}</span>
                                    </div>
                                </div>
                                <div className="summary-item summary-total">
                                    <div className="summary-icon">
                                        <Menu size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-label">Saldo do mês</span>
                                        <span className="summary-value">{formatCurrency(safeBalance)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <h4 className="subsection-title">Categorias principais</h4>
                                <div className="category-list">
                                    <div className="category-row">
                                        <span>Geral (Receitas)</span>
                                        <span className="text-green">
                                            {balance ? formatCurrency(balance.totalIncome) : 'R$ 0,00'}
                                        </span>
                                    </div>
                                    <div className="category-row">
                                        <span>Geral (Despesas)</span>
                                        <span className="text-red">
                                            {balance ? formatCurrency(balance.totalExpense) : 'R$ 0,00'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateFinancialEntryModal
                    condominiumId={condominiumId}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        setRefreshKey(prev => prev + 1);
                    }}
                />
            )}
            
            {selectedChartType && (
                <TransactionChartModal
                    type={selectedChartType}
                    entries={entries}
                    onClose={() => setSelectedChartType(null)}
                />
            )}
        </div>
    );
};
