import React, { useEffect, useState, useRef } from 'react';
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
    Menu, // for 'Saldo do mês' lines icon
    DollarSign,
    ShieldCheck
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import CondominiumService from '../services/condominiumService';
import { CreateFinancialEntryModal } from './CreateFinancialEntryModal';
import { ExportFinancialModal } from './ExportFinancialModal';
import { TransactionChartModal } from './TransactionChartModal';
import type { Condominium, FinancialEntry, Balance } from '../types';
import '../styles/details.css';
import '../styles/finances.css';

export const BuildingFinancesReal: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const condominiumId = id!;
    const navigate = useNavigate();
    const [condominium, setCondominium] = useState<Condominium | null>(null);
    const [entries, setEntries] = useState<FinancialEntry[]>([]);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedChartType, setSelectedChartType] = useState<'INCOME' | 'EXPENSE' | null>(null);
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [refreshKey, setRefreshKey] = useState(0);
    const [isConfirmConciliationOpen, setIsConfirmConciliationOpen] = useState(false);
    const [toasts, setToasts] = useState<{ id: string; text: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const [isTopTypeDropdownOpen, setIsTopTypeDropdownOpen] = useState(false);
    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const topTypeDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setIsTypeDropdownOpen(false);
            }
            if (topTypeDropdownRef.current && !topTypeDropdownRef.current.contains(event.target as Node)) {
                setIsTopTypeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (text: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, text }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const handleConciliationConfirm = () => {
        setIsConfirmConciliationOpen(false);
        showToast("Conciliação realizada com sucesso!");
    };

    useEffect(() => {
        const isModalOpen = isCreateModalOpen || isExportModalOpen || !!selectedChartType || isConfirmConciliationOpen;
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isCreateModalOpen, isExportModalOpen, selectedChartType, isConfirmConciliationOpen]);

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

    const currentPeriod = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ');
    
    let lastConciliation = "Sem lançamentos";
    if (entries.length > 0) {
        const latestMs = Math.max(...entries.map(e => e.date ? new Date(e.date).getTime() : 0));
        if (latestMs > 0) {
            const diff = Math.floor((new Date().getTime() - latestMs) / (1000 * 60 * 60 * 24));
            lastConciliation = diff === 0 ? "Hoje" : `há ${diff} dia${diff > 1 ? 's' : ''}`;
        }
    }

    const filteredEntries = (filterType === 'ALL' ? entries : entries.filter(e => e.type === filterType))
        .filter(e => (e.description || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const totalIncomeFiltered = filteredEntries
        .filter(e => e.type === 'INCOME')
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalExpenseFiltered = filteredEntries
        .filter(e => e.type === 'EXPENSE')
        .reduce((sum, e) => sum + (e.amount || 0), 0);

    return (
        <div className="dashboard-container">
            <div className="content-wrapper">
                <div className="details-header">
                    <div className="breadcrumbs">
                        <span className="breadcrumb-item" onClick={() => navigate('/dashboard')}>Visão geral</span>
                        <ChevronRight size={14} />
                        <span className="breadcrumb-item" onClick={() => navigate(`/buildings/${condominiumId}`)}>{condominium.name}</span>
                        <ChevronRight size={14} />
                        <span style={{ color: 'var(--text-main)' }}>Finanças</span>
                    </div>
                </div>

                <div className="finance-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Wallet size={22} color="var(--color-accent)" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <h1 className="building-title" style={{ margin: 0 }}>Finanças · {condominium.name}</h1>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-light)' }}>
                                Controle de entradas, saídas e conciliação financeira do condomínio.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="secondary-btn" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', height: '42px', borderRadius: '12px' }} onClick={() => setIsExportModalOpen(true)}>
                            <Download size={16} />
                            Exportar CSV
                        </button>
                        <button className="primary-btn" style={{ height: '42px', borderRadius: '12px' }} onClick={() => setIsCreateModalOpen(true)}>
                            <Plus size={16} />
                            Novo lançamento
                        </button>
                    </div>
                </div>

                {/* Filters Chips Row */}
                <div className="filters-container-new">
                    <div className="filter-chip-new">
                        <span className="filter-chip-label-new">Período</span>
                        <span className="filter-chip-value-new" style={{ textTransform: 'capitalize' }}>{currentPeriod}</span>
                    </div>
                    <div className="filter-chip-new">
                        <span className="filter-chip-label-new">Conta</span>
                        <span className="filter-chip-value-new">Conta corrente</span>
                    </div>
                    <div className="filter-chip-new" ref={topTypeDropdownRef} style={{ position: 'relative' }}>
                        <span className="filter-chip-label-new" style={{ marginRight: '6px' }}>Tipo</span>
                        <button
                            type="button"
                            onClick={() => setIsTopTypeDropdownOpen(!isTopTypeDropdownOpen)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                outline: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                color: 'inherit',
                                padding: 0,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span>{filterType === 'ALL' ? 'Todos' : filterType === 'INCOME' ? 'Entradas' : 'Saídas'}</span>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', transform: isTopTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'all 0.2s' }}>▼</span>
                        </button>

                        {isTopTypeDropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                left: 0,
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
                                zIndex: 100,
                                padding: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                minWidth: '120px'
                            }}>
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        color: filterType === 'ALL' ? 'var(--color-accent)' : 'var(--text-secondary)',
                                        backgroundColor: filterType === 'ALL' ? 'var(--color-accent-light)' : 'transparent',
                                        fontWeight: filterType === 'ALL' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                    onClick={() => {
                                        setFilterType('ALL');
                                        setIsTopTypeDropdownOpen(false);
                                    }}
                                >
                                    Todos
                                </div>
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        color: filterType === 'INCOME' ? 'var(--color-accent)' : 'var(--text-secondary)',
                                        backgroundColor: filterType === 'INCOME' ? 'var(--color-accent-light)' : 'transparent',
                                        fontWeight: filterType === 'INCOME' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                    onClick={() => {
                                        setFilterType('INCOME');
                                        setIsTopTypeDropdownOpen(false);
                                    }}
                                >
                                    Entradas
                                </div>
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        color: filterType === 'EXPENSE' ? 'var(--color-accent)' : 'var(--text-secondary)',
                                        backgroundColor: filterType === 'EXPENSE' ? 'var(--color-accent-light)' : 'transparent',
                                        fontWeight: filterType === 'EXPENSE' ? 600 : 400,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                    onClick={() => {
                                        setFilterType('EXPENSE');
                                        setIsTopTypeDropdownOpen(false);
                                    }}
                                >
                                    Saídas
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="finance-stats-row">
                    <div className="finance-stat-card">
                        <div className="stat-card-header">
                            <span className="stat-label">Saldo atual</span>
                            <div className="stat-icon-wrapper" style={{ color: '#2563eb' }}>
                                <DollarSign size={18} />
                            </div>
                        </div>
                        <span className="stat-value-lg">{formatCurrency(safeBalance)}</span>
                        <span className="stat-helper-text">
                            {safeBalance === 0 ? 'Nenhum saldo registrado' : 'Saldo total consolidado em caixa'}
                        </span>
                    </div>
                    <div className="finance-stat-card">
                        <div className="stat-card-header">
                            <span className="stat-label">Entradas (mês)</span>
                            <div className="stat-icon-wrapper" style={{ color: '#059669' }}>
                                <TrendingUp size={18} />
                            </div>
                        </div>
                        <span className="stat-value-lg text-green">{balance ? formatCurrency(balance.totalIncome) : 'R$ 0,00'}</span>
                        <span className="stat-helper-text">
                            {(balance?.totalIncome || 0) === 0 ? 'Nenhum depósito registrado' : 'Depósitos e receitas do período'}
                        </span>
                    </div>
                    <div className="finance-stat-card">
                        <div className="stat-card-header">
                            <span className="stat-label">Saídas (mês)</span>
                            <div className="stat-icon-wrapper" style={{ color: '#dc2626' }}>
                                <TrendingDown size={18} />
                            </div>
                        </div>
                        <span className="stat-value-lg text-red">{balance ? formatCurrency(balance.totalExpense) : 'R$ 0,00'}</span>
                        <span className="stat-helper-text">
                            {(balance?.totalExpense || 0) === 0 ? 'Nenhuma despesa registrada' : 'Despesas e pagamentos do período'}
                        </span>
                    </div>
                    <div className="finance-stat-card">
                        <div className="stat-card-header">
                            <span className="stat-label">Última conciliação</span>
                            <div className="stat-icon-wrapper" style={{ color: '#475569' }}>
                                <ShieldCheck size={18} />
                            </div>
                        </div>
                        <span className="stat-value-lg">{lastConciliation}</span>
                        <span className="stat-helper-text">
                            {entries.length === 0 ? 'Sem lançamentos para conciliar' : 'Lançamentos revisados e validados'}
                        </span>
                    </div>
                </div>

                <div className="details-grid">
                    {/* Left: Transaction Table */}
                    <div className="details-left">
                        <div className="section-card">
                            <div className="section-header" style={{ borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ minWidth: '160px' }}>
                                    <h3 className="section-title" style={{ marginBottom: 0 }}>Extrato de transações</h3>
                                </div>

                                <div className="table-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span 
                                        className="total-badge text-green" 
                                        onClick={() => setFilterType(filterType === 'INCOME' ? 'ALL' : 'INCOME')}
                                        style={{ 
                                            fontSize: '0.85rem', 
                                            fontWeight: 600, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '4px', 
                                            background: filterType === 'INCOME' ? 'var(--status-green-border)' : 'var(--status-green-bg)', 
                                            border: filterType === 'INCOME' ? '1px solid var(--status-green)' : '1px solid transparent',
                                            padding: '4px 10px', 
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            opacity: filterType === 'EXPENSE' ? 0.4 : 1,
                                            transition: 'all 0.2s',
                                            userSelect: 'none'
                                        }}
                                        title={filterType === 'INCOME' ? "Mostrar todas as transações" : "Filtrar por Entradas"}
                                    >
                                        Entradas: {formatCurrency(totalIncomeFiltered)}
                                    </span>
                                    <span 
                                        className="total-badge text-red" 
                                        onClick={() => setFilterType(filterType === 'EXPENSE' ? 'ALL' : 'EXPENSE')}
                                        style={{ 
                                            fontSize: '0.85rem', 
                                            fontWeight: 600, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '4px', 
                                            background: filterType === 'EXPENSE' ? 'var(--status-red-border)' : 'var(--status-red-bg)', 
                                            border: filterType === 'EXPENSE' ? '1px solid var(--status-red)' : '1px solid transparent',
                                            padding: '4px 10px', 
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            opacity: filterType === 'INCOME' ? 0.4 : 1,
                                            transition: 'all 0.2s',
                                            userSelect: 'none'
                                        }}
                                        title={filterType === 'EXPENSE' ? "Mostrar todas as transações" : "Filtrar por Saídas"}
                                    >
                                        Saídas: {formatCurrency(totalExpenseFiltered)}
                                    </span>
                                    {isSearchOpen && (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Buscar por descrição..." 
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    style={{
                                                        width: '160px',
                                                        padding: '8px 12px',
                                                        paddingRight: '28px',
                                                        height: '38px',
                                                        borderRadius: '12px',
                                                        border: '1px solid var(--border-color)',
                                                        fontSize: '0.875rem',
                                                        outline: 'none',
                                                        backgroundColor: 'var(--bg-input)',
                                                        color: 'var(--text-main)',
                                                        boxSizing: 'border-box',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    autoFocus
                                                />
                                                {searchQuery && (
                                                    <button 
                                                        onClick={() => setSearchQuery('')}
                                                        style={{
                                                            position: 'absolute',
                                                            right: '8px',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#94a3b8',
                                                            padding: '2px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '1rem'
                                                        }}
                                                    >
                                                        &times;
                                                    </button>
                                                )}
                                            </div>

                                            {/* Custom Rounded Dropdown for Type Filter */}
                                            <div ref={typeDropdownRef} style={{ position: 'relative' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                                    style={{
                                                        padding: '0 16px',
                                                        height: '38px',
                                                        borderRadius: '12px',
                                                        border: '1px solid var(--border-color)',
                                                        fontSize: '0.875rem',
                                                        backgroundColor: 'var(--bg-input)',
                                                        color: 'var(--text-main)',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        fontWeight: 500,
                                                        boxSizing: 'border-box',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <span>{filterType === 'ALL' ? 'Todas' : filterType === 'INCOME' ? 'Entradas' : 'Saídas'}</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', transform: isTypeDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'all 0.2s' }}>▼</span>
                                                </button>

                                                {isTypeDropdownOpen && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 'calc(100% + 6px)',
                                                        left: 0,
                                                        backgroundColor: 'var(--bg-surface)',
                                                        border: '1px solid var(--border-color)',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
                                                        zIndex: 100,
                                                        padding: '6px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '2px',
                                                        minWidth: '120px'
                                                    }}>
                                                        <div
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '8px',
                                                                fontSize: '0.875rem',
                                                                color: filterType === 'ALL' ? 'var(--color-accent)' : 'var(--text-secondary)',
                                                                backgroundColor: filterType === 'ALL' ? 'var(--color-accent-light)' : 'transparent',
                                                                fontWeight: filterType === 'ALL' ? 600 : 400,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s'
                                                            }}
                                                            onClick={() => {
                                                                setFilterType('ALL');
                                                                setIsTypeDropdownOpen(false);
                                                            }}
                                                        >
                                                            Todas
                                                        </div>
                                                        <div
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '8px',
                                                                fontSize: '0.875rem',
                                                                color: filterType === 'INCOME' ? 'var(--color-accent)' : 'var(--text-secondary)',
                                                                backgroundColor: filterType === 'INCOME' ? 'var(--color-accent-light)' : 'transparent',
                                                                fontWeight: filterType === 'INCOME' ? 600 : 400,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s'
                                                            }}
                                                            onClick={() => {
                                                                setFilterType('INCOME');
                                                                setIsTypeDropdownOpen(false);
                                                            }}
                                                        >
                                                            Entradas
                                                        </div>
                                                        <div
                                                            style={{
                                                                padding: '8px 12px',
                                                                borderRadius: '8px',
                                                                fontSize: '0.875rem',
                                                                color: filterType === 'EXPENSE' ? 'var(--color-accent)' : 'var(--text-secondary)',
                                                                backgroundColor: filterType === 'EXPENSE' ? 'var(--color-accent-light)' : 'transparent',
                                                                fontWeight: filterType === 'EXPENSE' ? 600 : 400,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s'
                                                            }}
                                                            onClick={() => {
                                                                setFilterType('EXPENSE');
                                                                setIsTypeDropdownOpen(false);
                                                            }}
                                                        >
                                                            Saídas
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <button 
                                        className="action-btn" 
                                        onClick={() => {
                                            setIsSearchOpen(!isSearchOpen);
                                            if (isSearchOpen) {
                                                setSearchQuery('');
                                            }
                                        }}
                                        style={{
                                            borderColor: isSearchOpen ? 'var(--color-primary, #6366f1)' : '#cbd5e1',
                                            color: isSearchOpen ? 'var(--color-primary, #6366f1)' : 'inherit',
                                            backgroundColor: isSearchOpen ? 'rgba(99, 102, 241, 0.05)' : 'white'
                                        }}
                                    >
                                        <Filter size={16} />
                                        Filtrar
                                    </button>
                                    <button className="action-btn" onClick={() => setIsConfirmConciliationOpen(true)}>
                                        <RefreshCw size={16} />
                                        Conciliar
                                    </button>
                                </div>
                            </div>

                            {filteredEntries.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', textAlign: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#94a3b8' }}>
                                        <Wallet size={24} />
                                    </div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                                        Nenhum lançamento encontrado
                                    </h4>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '360px', marginBottom: '20px', lineHeight: '1.5' }}>
                                        Nenhuma movimentação financeira encontrada para este condomínio neste período. Comece adicionando um novo lançamento de receita ou despesa.
                                    </p>
                                    <button className="primary-btn" style={{ height: '38px', borderRadius: '8px' }} onClick={() => setIsCreateModalOpen(true)}>
                                        <Plus size={16} />
                                        Novo lançamento
                                    </button>
                                </div>
                            ) : (
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
                                        {filteredEntries.map(tx => (
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
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Right: Summary */}
                    <div className="details-right">
                        <div className="section-card">
                            <div className="section-header">
                                <h3 className="section-title">Resumo do mês</h3>
                                <div className="legend-dots">
                                    <span className="legend-item">
                                        <span className="legend-dot green"></span>
                                        Entradas
                                    </span>
                                    <span className="legend-item">
                                        <span className="legend-dot red"></span>
                                        Saídas
                                    </span>
                                </div>
                            </div>

                            <div className="summary-list">
                                <div className="summary-item clickable" onClick={() => setSelectedChartType('INCOME')} title="Ver gráfico">
                                    <div className="summary-icon icon-green">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-label">Total de entradas</span>
                                        <span className="summary-value text-green">{balance ? formatCurrency(balance.totalIncome) : 'R$ 0,00'}</span>
                                    </div>
                                </div>
                                <div className="summary-item clickable" onClick={() => setSelectedChartType('EXPENSE')} title="Ver gráfico">
                                    <div className="summary-icon icon-red">
                                        <TrendingDown size={20} />
                                    </div>
                                    <div className="summary-info">
                                        <span className="summary-label">Total de saídas</span>
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
                                        <span>Receitas gerais</span>
                                        <span className="text-green">
                                            {balance ? formatCurrency(balance.totalIncome) : 'R$ 0,00'}
                                        </span>
                                    </div>
                                    <div className="category-row">
                                        <span>Despesas gerais</span>
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

            {isExportModalOpen && (
                <ExportFinancialModal
                    condominiumId={condominiumId}
                    onClose={() => setIsExportModalOpen(false)}
                />
            )}
            
            {selectedChartType && (
                <TransactionChartModal
                    type={selectedChartType}
                    entries={entries}
                    onClose={() => setSelectedChartType(null)}
                />
            )}

            {isConfirmConciliationOpen && (
                <div className="modal-overlay" onClick={() => setIsConfirmConciliationOpen(false)}>
                    <div className="modal-card" style={{ maxWidth: '400px', width: '90%', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
                            Confirmar Conciliação
                        </h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
                            Deseja realmente realizar a conciliação financeira das transações deste período? Esta ação atualizará o status de conciliação do caixa.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button 
                                className="secondary-btn" 
                                onClick={() => setIsConfirmConciliationOpen(false)}
                                style={{ height: '38px', borderRadius: '8px' }}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="primary-btn" 
                                onClick={handleConciliationConfirm}
                                style={{ height: '38px', borderRadius: '8px', backgroundColor: '#10b981' }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toasts */}
            {toasts.map((toast, index) => (
                <div key={toast.id} className="finance-toast" style={{ top: `${24 + index * 60}px` }}>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{toast.text}</span>
                    <button 
                        className="finance-toast-close" 
                        onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                        aria-label="Fechar notificação"
                    >
                        &times;
                    </button>
                </div>
            ))}
        </div>
    );
};
