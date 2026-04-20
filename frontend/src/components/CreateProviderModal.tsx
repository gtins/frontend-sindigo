import React, { useState } from 'react';
import { X } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateProviderPayload } from '../types';

interface CreateProviderModalProps {
    condominiumId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateProviderModal: React.FC<CreateProviderModalProps> = ({ condominiumId, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [serviceType, setServiceType] = useState<'ELECTRICIAN' | 'PLUMBER' | 'GARDENER' | 'CARPENTER' | 'OTHER'>('PLUMBER');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload: CreateProviderPayload = { 
                name, 
                serviceType, 
                phone, 
                email: email || undefined, 
                notes: notes || undefined 
            };
            await CondominiumService.createProvider(condominiumId, payload);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating provider:', err);
            setError('Falha ao cadastrar o prestador. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Novo Prestador</h2>
                    <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
                </div>
                
                {error && <div style={errorStyle}>{error}</div>}
                
                <form onSubmit={handleSubmit} style={formStyle}>
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Nome</label>
                        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Ex: João da Hidra" />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ ...inputGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Tipo de Serviço</label>
                            <select value={serviceType} onChange={(e) => setServiceType(e.target.value as any)} style={inputStyle}>
                                <option value="PLUMBER">Encanador</option>
                                <option value="ELECTRICIAN">Eletricista</option>
                                <option value="GARDENER">Jardineiro</option>
                                <option value="CARPENTER">Carpinteiro / Marceneiro</option>
                                <option value="OTHER">Outros</option>
                            </select>
                        </div>
                        <div style={{ ...inputGroupStyle, flex: 1 }}>
                            <label style={labelStyle}>Telefone</label>
                            <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="(11) 99999-1234" />
                        </div>
                    </div>

                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="Opcional" />
                    </div>
                    
                    <div style={inputGroupStyle}>
                        <label style={labelStyle}>Anotações (Notas)</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle} placeholder="Especialista em vazamentos" />
                    </div>

                    <div style={footerStyle}>
                        <button type="button" onClick={onClose} style={cancelBtnStyle} disabled={loading}>Cancelar</button>
                        <button type="submit" style={submitBtnStyle} disabled={loading}>
                            {loading ? 'Salvando...' : 'Cadastrar prestador'}
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
