import React from 'react';
import {

    Wallet,
    ChevronRight,
    Download,
    Plus,
    Filter,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Menu // for 'Saldo do mês' lines icon
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import type { BuildingDetailsData } from '../data/mockData';
import '../styles/details.css';
import '../styles/finances.css';

interface BuildingFinancesProps {
    data: BuildingDetailsData;
}

export const BuildingFinances: React.FC<BuildingFinancesProps> = ({ data }) => {
    const { id: condominiumId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const finances = data.finances;

    if (!finances) {
        return <div className="dashboard-container"><div className="content-wrapper">Dados financeiros não disponíveis</div></div>;
    }

    return (
        <div className="dashboard-container">
            <div className="content-wrapper">
                <div className="details-header">
                    <div className="breadcrumbs">
                        <span className="breadcrumb-item" onClick={() => navigate('/')}>Visão geral</span>
                        <ChevronRight size={14} />
                        <span className="breadcrumb-item" onClick={() => navigate(`/buildings/${condominiumId}`)}>{data.name}</span>
                        <ChevronRight size={14} />
                        <span style={{ color: 'var(--text-main)' }}>Finanças</span>
                    </div>
                </div>

                <div className="finance-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="icon-box">
                            <Wallet size={24} color="var(--text-main)" />
                        </div>
                        <h1 className="building-title">Finanças · {data.name}</h1>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="secondary-btn" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                            <Download size={16} />
                            Exportar (CSV)
                        </button>
                        <button className="primary-btn">
                            <Plus size={16} />
                            Novo lançamento
                        </button>
                    </div>
                </div>

                {/* Filters Row - Mock */}
                <div className="filters-row">
                    <div className="filter-pill">
                        <span className="filter-label">Período</span>
                        <span className="filter-value">{finances.period}</span>
                    </div>
                    <div className="filter-pill">
                        <span className="filter-label">Conta</span>
                        <span className="filter-value">{finances.account}</span>
                    </div>
                    <div className="filter-pill">
                        <span className="filter-label">Tipo</span>
                        <span className="filter-value">Todos</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="finance-stats-row">
                    <div className="finance-stat-card">
                        <span className="stat-label">Saldo atual</span>
                        <span className="stat-value-lg">{finances.stats.balance}</span>
                    </div>
                    <div className="finance-stat-card">
                        <span className="stat-label">Entradas (mês)</span>
                        <span className="stat-value-lg text-green">{finances.stats.inflow}</span>
                    </div>
                    <div className="finance-stat-card">
                        <span className="stat-label">Saídas (mês)</span>
                        <span className="stat-value-lg text-red">{finances.stats.outflow}</span>
                    </div>
                    <div className="finance-stat-card">
                        <span className="stat-label">Última conciliação</span>
                        <span className="stat-value-lg">{finances.stats.lastConciliation}</span>
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
                                    {finances.transactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td>{tx.date}</td>
                                            <td>
                                                <span className="tx-desc">{tx.description}</span>
                                            </td>
                                            <td><span className="category-tag">{tx.category}</span></td>
                                            <td>{tx.account}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <span className={`tx-value ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                                                    {tx.value}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
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
                                <div className="summary-item">
                                    <div className="summary-icon icon-green">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-label">Total de depósitos</span>
                                        <span className="summary-value text-green">{finances.summary.deposits}</span>
                                    </div>
                                </div>
                                <div className="summary-item">
                                    <div className="summary-icon icon-red">
                                        <TrendingDown size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-label">Total de compras</span>
                                        <span className="summary-value text-red">{finances.summary.purchases}</span>
                                    </div>
                                </div>
                                <div className="summary-item summary-total">
                                    <div className="summary-icon">
                                        <Menu size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-label">Saldo do mês</span>
                                        <span className="summary-value">{finances.summary.balance}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 'var(--space-lg)' }}>
                                <h4 className="subsection-title">Categorias principais</h4>
                                <div className="category-list">
                                    {finances.summary.categories.map((cat, idx) => (
                                        <div key={idx} className="category-row">
                                            <span>{cat.label}</span>
                                            <span className={idx === 0 ? 'text-red' : idx === 1 ? 'text-red' : 'text-green'}>
                                                {cat.value}
                                            </span>
                                            {/* Note: In real app color logic would depend on category type (expense vs income) */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
