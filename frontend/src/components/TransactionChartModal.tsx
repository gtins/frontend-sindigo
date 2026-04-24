import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import type { FinancialEntry } from '../types';

interface TransactionChartModalProps {
    type: 'INCOME' | 'EXPENSE';
    entries: FinancialEntry[];
    onClose: () => void;
}

export const TransactionChartModal: React.FC<TransactionChartModalProps> = ({ type, entries, onClose }) => {
    const isIncome = type === 'INCOME';
    const title = isIncome ? 'Análise de Entradas' : 'Análise de Saídas';
    const color = isIncome ? '#10b981' : '#ef4444';
    const bgColor = isIncome ? '#d1fae5' : '#fee2e2';

    const dataDisplay = useMemo(() => {
        const filtered = entries.filter((e) => e.type === type && e.date);
        
        const groupedByISO: Record<string, number> = {};
        for(const entry of filtered) {
            const rawDateStr = new Date(entry.date).toISOString().split('T')[0];
            groupedByISO[rawDateStr] = (groupedByISO[rawDateStr] || 0) + entry.amount;
        }
        
        const sortedDates = Object.keys(groupedByISO).sort();
        
        return sortedDates.map(date => {
            return {
                label: new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                value: groupedByISO[date]
            };
        });
    }, [entries, type]);

    const maxValue = dataDisplay.length > 0 ? Math.max(...dataDisplay.map(d => d.value)) : 0;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <div style={headerStyle}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{title}</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748b' }}>Evolução por dia de transação</p>
                    </div>
                    <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
                </div>
                
                <div style={chartContainerStyle}>
                    {dataDisplay.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                            Nenhum dado encontrado para o período.
                        </div>
                    ) : (
                        <div style={chartWrapperStyle}>
                            {dataDisplay.map((item, idx) => {
                                const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                                return (
                                    <div key={idx} style={barColumnStyle}>
                                        <div style={tooltipStyle} className="chart-tooltip">
                                            {formatCurrency(item.value)}
                                        </div>
                                        <div style={{ ...barStyle, backgroundColor: bgColor, height: `${Math.max(heightPercentage, 2)}%` }}>
                                            <div style={{ ...barFillStyle, backgroundColor: color }}></div>
                                        </div>
                                        <span style={xLabelStyle}>{item.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
            </div>
            
            <style>
                {`
                .chart-tooltip {
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.2s;
                }
                .bar-column:hover .chart-tooltip {
                    opacity: 1;
                    transform: translateY(0);
                }
                .bar-column {
                    transition: opacity 0.2s;
                }
                .bar-column:hover {
                    opacity: 0.8;
                }
                `}
            </style>
        </div>
    );
};

// Styles
const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '550px',
    padding: '24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px'
};

const closeBtnStyle: React.CSSProperties = {
    background: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const chartContainerStyle: React.CSSProperties = {
    height: '250px',
    width: '100%',
    borderBottom: '1px solid #e2e8f0',
    position: 'relative'
};

const chartWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    paddingBottom: '12px',
    gap: '8px'
};

const barColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    flex: 1,
    maxWidth: '40px',
    position: 'relative',
    className: 'bar-column'
} as React.CSSProperties & { className: string };

const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-35px',
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 10
};

const barStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '4px 4px 0 0',
    overflow: 'hidden',
    position: 'relative',
    minHeight: '4px'
};

const barFillStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
};

const xLabelStyle: React.CSSProperties = {
    marginTop: '8px',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 500
};
