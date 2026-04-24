import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateFinancialEntryPayload } from '../types';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Normalize amount to a number
        const numericAmount = parseFloat(amount.replace(',', '.'));
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
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Nova Movimentação</h2>
                    <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
                </div>
                
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Tipo</label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="EXPENSE" 
                                    checked={type === 'EXPENSE'} 
                                    onChange={() => setType('EXPENSE')} 
                                />
                                <span style={{ color: '#ef4444', fontWeight: 500 }}>Despesa</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                <input 
                                    type="radio" 
                                    name="type" 
                                    value="INCOME" 
                                    checked={type === 'INCOME'} 
                                    onChange={() => setType('INCOME')} 
                                />
                                <span style={{ color: '#10b981', fontWeight: 500 }}>Receita</span>
                            </label>
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Descrição</label>
                        <input 
                            type="text" 
                            required 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            style={inputStyle} 
                            placeholder="Ex: Manutenção do elevador" 
                        />
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Data</label>
                        <input 
                            type="date" 
                            required 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            style={inputStyle} 
                        />
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Valor</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <div style={{ position: 'absolute', left: '12px', color: '#64748b' }}>
                                <DollarSign size={16} />
                            </div>
                            <input 
                                type="text" 
                                required 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                style={{ ...inputStyle, paddingLeft: '36px', width: '100%', boxSizing: 'border-box' }} 
                                placeholder="0,00" 
                            />
                        </div>
                    </div>
                    
                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={loading}>Cancelar</button>
                        <button type="submit" style={submitBtnStyle} disabled={loading}>
                            {loading ? 'Salvando...' : 'Registrar'}
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
    maxWidth: '400px',
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
    backgroundColor: '#10b981', // green default for finance
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer'
};

const errorStyle: React.CSSProperties = {
    padding: '10px',
    borderRadius: '6px',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    fontSize: '0.875rem',
    marginBottom: '16px'
};
