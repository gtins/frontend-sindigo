import React, { useState } from 'react';
import { X } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateTicketPayload } from '../types';

interface CreateTicketModalProps {
    condominiumId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ condominiumId, onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('MANUTENCAO');
    const [priority, setPriority] = useState<'ALTA' | 'BAIXA' | 'MEDIA' | 'CRITICA' | 'URGENTE'>('BAIXA');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload: CreateTicketPayload = { title, description, category, priority, location };
            await CondominiumService.createTicket(condominiumId, payload);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating ticket:', err);
            setError('Falha ao abrir o chamado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Novo Chamado</h2>
                    <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
                </div>
                
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Título</label>
                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Ex: Lâmpada queimada na garagem" />
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Descrição</label>
                        <textarea required value={description} onChange={(e) => setDescription(e.target.value)} style={inputStyle} placeholder="Ex: A lâmpada da vaga 42 no subsolo 1 está piscando e apagou." />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ ...inputGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Categoria</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                                <option value="SOLICITACAO">Solicitação</option>
                                <option value="RECLAMACAO">Reclamação</option>
                                <option value="ESTRUTURA">Estrutura</option>
                                <option value="ELETRICA">Elétrica</option>
                                <option value="LIMPEZA">Limpeza</option>
                                <option value="SEGURANCA">Segurança</option>
                                <option value="HIDRAULICA">Hidráulica</option>
                                <option value="MANUTENCAO">Manutenção</option>
                                <option value="OUTRO">Outros</option>
                            </select>
                        </div>

                        <div style={{ ...inputGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Prioridade</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value as 'ALTA' | 'BAIXA' | 'MEDIA' | 'CRITICA' | 'URGENTE')} style={inputStyle}>
                                <option value="BAIXA">Baixa</option>
                                <option value="MEDIA">Média</option>
                                <option value="ALTA">Alta</option>
                                <option value="URGENTE">Urgente</option>
                                <option value="CRITICA">Crítica</option>
                            </select>
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Localização</label>
                        <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} placeholder="Ex: Subsolo 1, Vaga 42" />
                    </div>

                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={loading}>Cancelar</button>
                        <button type="submit" style={submitBtnStyle} disabled={loading}>
                            {loading ? 'Salvando...' : 'Abrir chamado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Styles
const overlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const closeBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' };
const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '16px' };
const inputGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle: React.CSSProperties = { fontSize: '0.875rem', fontWeight: 500, color: '#334155' };
const inputStyle: React.CSSProperties = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' };
const footerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' };
const cancelBtnStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: 500, cursor: 'pointer' };
const submitBtnStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#1e40af', color: '#fff', fontWeight: 500, cursor: 'pointer' };
const errorStyle: React.CSSProperties = { padding: '10px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.875rem', marginBottom: '16px' };
