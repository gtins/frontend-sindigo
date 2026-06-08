import React, { useState } from 'react';
import { X } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateFinancialEntryPayload } from '../types';
import '../styles/finances.css';

interface CreateFinancialEntryModalProps {
    condominiumId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateFinancialEntryModal: React.FC<CreateFinancialEntryModalProps> = ({ condominiumId, onClose, onSuccess }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]); // defaults to today
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const formatAmountInput = (value: string) => {
        // Remove non-digits
        const cleanValue = value.replace(/\D/g, '');
        if (!cleanValue) return '';
        
        // Convert to cents
        const cents = parseInt(cleanValue, 10);
        if (isNaN(cents)) return '';
        
        // Format to BRL locale style without R$ symbol
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(cents / 100);
    };

    const formatDateBR = (dateString: string) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Normalize amount to a number (remove dot thousands separator, change comma to dot)
        const numericAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Por favor, insira um valor válido maior que zero.');
            setLoading(false);
            return;
        }

        try {
            const payload: CreateFinancialEntryPayload = {
                description,
                amount: numericAmount,
                type,
                date
            };
            
            await CondominiumService.createFinancialEntry(condominiumId, payload);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating financial entry:', err);
            setError('Falha ao registrar a movimentação financeira. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                            Nova Movimentação
                        </h2>
                        <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                            Registre uma entrada ou saída financeira do condomínio.
                        </span>
                    </div>
                    <button onClick={onClose} className="modal-close-btn-new" aria-label="Fechar modal">
                        <X size={18} />
                    </button>
                </div>
                
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    {/* Segmented Type Selection */}
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Tipo</label>
                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                            <button
                                type="button"
                                onClick={() => setType('EXPENSE')}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid',
                                    borderColor: type === 'EXPENSE' ? '#fecaca' : '#e2e8f0',
                                    backgroundColor: type === 'EXPENSE' ? '#fef2f2' : '#ffffff',
                                    color: type === 'EXPENSE' ? '#dc2626' : '#64748b',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>↓</span> Despesa
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('INCOME')}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid',
                                    borderColor: type === 'INCOME' ? '#bbf7d0' : '#e2e8f0',
                                    backgroundColor: type === 'INCOME' ? '#ecfdf5' : '#ffffff',
                                    color: type === 'INCOME' ? '#16a34a' : '#64748b',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>↑</span> Receita
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Descrição</label>
                        <input 
                            type="text" 
                            required 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="modal-input-field"
                            placeholder={type === 'EXPENSE' ? 'Ex: Manutenção do elevador' : 'Ex: Taxa condominial recebida'} 
                        />
                    </div>
                    
                    {/* Date */}
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Data</label>
                        <input 
                            type="date" 
                            required 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="modal-input-field"
                        />
                    </div>
                    
                    {/* Amount with fixed R$ prefix */}
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Valor</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                            <div style={{ position: 'absolute', left: '16px', color: '#94a3b8', fontWeight: 600, fontSize: '1.25rem', userSelect: 'none' }}>
                                R$
                            </div>
                            <input 
                                type="text" 
                                required 
                                value={amount} 
                                onChange={(e) => {
                                    const formatted = formatAmountInput(e.target.value);
                                    setAmount(formatted);
                                }} 
                                className="modal-input-field"
                                style={{ 
                                    paddingLeft: '48px', 
                                    fontSize: '1.25rem', 
                                    fontWeight: 700, 
                                    height: '52px',
                                    color: '#0f172a'
                                }} 
                                placeholder="0,00" 
                            />
                        </div>
                    </div>

                    {/* Dynamic Preview Summary */}
                    {description && amount && (
                        <div style={{
                            backgroundColor: '#f8fafc',
                            border: '1px dashed #e2e8f0',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '0.825rem',
                            color: '#475569',
                            lineHeight: '1.5',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '4px'
                        }}>
                            <div style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: type === 'INCOME' ? '#10b981' : '#ef4444',
                                flexShrink: 0
                            }}></div>
                            <span>
                                Você está registrando {type === 'INCOME' ? 'uma receita' : 'uma despesa'} de <strong>R$ {amount}</strong> referente a: <em>"{description}"</em> em {formatDateBR(date)}.
                            </span>
                        </div>
                    )}
                    
                    {/* Action buttons */}
                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" style={submitBtnStyle} disabled={loading}>
                            {loading ? 'Salvando...' : type === 'INCOME' ? 'Registrar receita' : 'Registrar despesa'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
};

const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '420px',
    padding: '28px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    boxSizing: 'border-box'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
};

const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
};

const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#475569'
};

const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '28px'
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#475569',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const submitBtnStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: 'var(--color-primary, #6366f1)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
};

const errorStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.875rem',
    marginBottom: '20px',
    fontWeight: 500
};
