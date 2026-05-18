import React, { useState } from 'react';
import { X, Download, Calendar, FileText } from 'lucide-react';
import ReportService from '../services/reportService';

interface ExportFinancialModalProps {
    condominiumId: string;
    onClose: () => void;
}

export const ExportFinancialModal: React.FC<ExportFinancialModalProps> = ({ condominiumId, onClose }) => {
    const [exportType, setExportType] = useState<'ALL' | 'PERIOD' | 'MONTH' | 'INCOME' | 'EXPENSE'>('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [month, setMonth] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            switch (exportType) {
                case 'ALL':
                    await ReportService.exportAll(condominiumId);
                    break;
                case 'PERIOD':
                    if (!startDate || !endDate) {
                        setError('Selecione as datas de início e fim.');
                        setLoading(false);
                        return;
                    }
                    if (new Date(startDate) > new Date(endDate)) {
                        setError('A data de início deve ser anterior ou igual à data de fim.');
                        setLoading(false);
                        return;
                    }
                    await ReportService.exportByPeriod(condominiumId, startDate, endDate);
                    break;
                case 'MONTH':
                    if (!month) {
                        setError('Selecione o mês desejado.');
                        setLoading(false);
                        return;
                    }
                    await ReportService.exportByMonth(condominiumId, month);
                    break;
                case 'INCOME':
                    await ReportService.exportIncomeOnly(condominiumId);
                    break;
                case 'EXPENSE':
                    await ReportService.exportExpenseOnly(condominiumId);
                    break;
            }
            onClose();
        } catch (err: any) {
            console.error('Error exporting report:', err);
            setError(err.response?.data || 'Falha ao exportar relatório. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} /> Exportar Relatório CSV
                    </h2>
                    <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
                </div>
                
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleExport} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Tipo de Relatório</label>
                        <select 
                            value={exportType} 
                            onChange={(e) => setExportType(e.target.value as any)}
                            style={inputStyle}
                        >
                            <option value="ALL">Todas as Movimentações</option>
                            <option value="PERIOD">Por Período (Datas)</option>
                            <option value="MONTH">Por Mês</option>
                            <option value="INCOME">Apenas Entradas (Receitas)</option>
                            <option value="EXPENSE">Apenas Saídas (Despesas)</option>
                        </select>
                    </div>

                    {exportType === 'PERIOD' && (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ ...inputGroupStyle, flex: 1 }}>
                                <label style={labelStyle}>Data Inicial</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    style={inputStyle} 
                                />
                            </div>
                            <div style={{ ...inputGroupStyle, flex: 1 }}>
                                <label style={labelStyle}>Data Final</label>
                                <input 
                                    type="date" 
                                    required 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    style={inputStyle} 
                                />
                            </div>
                        </div>
                    )}

                    {exportType === 'MONTH' && (
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Mês</label>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <div style={{ position: 'absolute', left: '12px', color: '#64748b' }}>
                                    <Calendar size={16} />
                                </div>
                                <input 
                                    type="month" 
                                    required 
                                    value={month} 
                                    onChange={(e) => setMonth(e.target.value)} 
                                    style={{ ...inputStyle, paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }} 
                                />
                            </div>
                        </div>
                    )}
                    
                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={loading}>Cancelar</button>
                        <button type="submit" style={submitBtnStyle} disabled={loading}>
                            {loading ? 'Processando...' : (
                                <>
                                    <Download size={16} style={{ marginRight: '6px' }} />
                                    Download CSV
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
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
    borderRadius: '8px',
    width: '100%',
    maxWidth: '450px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
};

const closeBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px'
};

const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
};

const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#334155'
};

const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem'
};

const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px'
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#475569',
    fontWeight: 500,
    cursor: 'pointer'
};

const submitBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3b82f6', // blue for export
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const errorStyle: React.CSSProperties = {
    padding: '10px',
    borderRadius: '6px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.875rem',
    marginBottom: '16px'
};
