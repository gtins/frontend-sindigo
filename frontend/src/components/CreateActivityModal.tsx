import React, { useState } from 'react';
import { X } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateActivityPayload } from '../types';

interface CreateActivityModalProps {
    condominiumId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ condominiumId, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('PERIODIC');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload: CreateActivityPayload = { title, description, type, startDate, endDate };
            await CondominiumService.createActivity(condominiumId, payload);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating activity:', err);
            setError('Falha ao criar a atividade. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Registrar atividade</h2>
                    <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
                </div>
                
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Título</label>
                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Ex: Limpeza da Piscina" />
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Descrição</label>
                        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} placeholder="Ex: Limpeza com filtragem" />
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Tipo</label>
                        <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                            <option value="PERIODIC">Periódica</option>
                            <option value="MAINTENANCE">Manutenção</option>
                            <option value="INSPECTION">Inspeção</option>
                            <option value="FINANCIAL">Financeiro</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ ...inputGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Data de Início</label>
                            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ ...inputGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Data Final</label>
                            <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                    
                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={loading}>Cancelar</button>
                        <button type="submit" style={submitBtnStyle} disabled={loading}>
                            {loading ? 'Salvando...' : 'Registrar atividade'}
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
    maxWidth: '500px',
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
    backgroundColor: '#1e40af',
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
