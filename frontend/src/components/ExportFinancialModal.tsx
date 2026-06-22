import React, { useState } from 'react';
import { X, Download, Calendar, FileText } from 'lucide-react';
import ReportService from '../services/reportService';
import { CustomSelect } from './CustomSelect';

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
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-card" style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} /> Exportar Relatório CSV
                    </h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                
                {error && <div className="modal-error">{error}</div>}
                
                <form onSubmit={handleExport} className="modal-form">
                    <div className="modal-input-group">
                        <label className="modal-label">Tipo de Relatório</label>
                        <CustomSelect 
                            value={exportType} 
                            onChange={(val) => setExportType(val as any)}
                            options={[
                                { value: 'ALL', label: 'Todas as Movimentações' },
                                { value: 'PERIOD', label: 'Por Período (Datas)' },
                                { value: 'MONTH', label: 'Por Mês' },
                                { value: 'INCOME', label: 'Apenas Entradas (Receitas)' },
                                { value: 'EXPENSE', label: 'Apenas Saídas (Despesas)' }
                            ]}
                        />
                    </div>

                    {exportType === 'PERIOD' && (
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div className="modal-input-group" style={{ flex: 1 }}>
                                <label className="modal-label">Data Inicial</label>
                                <div className="date-input-wrapper">
                                    <input 
                                        type="date" 
                                        required 
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)} 
                                        className="modal-input date-input-field" 
                                    />
                                    <Calendar size={16} className="date-input-icon" />
                                </div>
                            </div>
                            <div className="modal-input-group" style={{ flex: 1 }}>
                                <label className="modal-label">Data Final</label>
                                <div className="date-input-wrapper">
                                    <input 
                                        type="date" 
                                        required 
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)} 
                                        className="modal-input date-input-field" 
                                    />
                                    <Calendar size={16} className="date-input-icon" />
                                </div>
                            </div>
                        </div>
                    )}

                    {exportType === 'MONTH' && (
                        <div className="modal-input-group">
                            <label className="modal-label">Mês</label>
                            <div className="date-input-wrapper">
                                <input 
                                    type="month" 
                                    required 
                                    value={month} 
                                    onChange={(e) => setMonth(e.target.value)} 
                                    className="modal-input date-input-field" 
                                />
                                <Calendar size={16} className="date-input-icon" />
                            </div>
                        </div>
                    )}
                    
                    <div className="modal-footer" style={{ marginTop: '20px', paddingTop: '12px' }}>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="secondary-btn" 
                            style={{ height: '42px', borderRadius: '12px' }}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="primary-btn" 
                            style={{ height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            disabled={loading}
                        >
                            {loading ? 'Processando...' : (
                                <>
                                    <Download size={16} />
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
