import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateProviderPayload } from '../types';
import { CustomSelect } from './CustomSelect';


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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        // Mapeia apenas dígitos
        val = val.replace(/\D/g, '');
        if (val.length > 11) {
            val = val.slice(0, 11);
        }
        
        // Aplica a máscara brasileira: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
        if (val.length > 10) {
            val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
        } else if (val.length > 6) {
            val = `(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`;
        } else if (val.length > 2) {
            val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
        } else if (val.length > 0) {
            val = `(${val}`;
        }
        setPhone(val);
    };

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

    const isFormValid = name.trim() && phone.replace(/\D/g, '').length >= 10;

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-title">Novo prestador</h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                
                {error && <div className="modal-error">{error}</div>}
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-input-group">
                        <label className="modal-label">Nome</label>
                        <input 
                            type="text" 
                            required 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="modal-input" 
                            placeholder="Ex: João da Hidra" 
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="modal-input-group" style={{ flex: 1 }}>
                            <label className="modal-label">Tipo de serviço</label>
                            <CustomSelect
                                value={serviceType}
                                onChange={(val) => setServiceType(val as any)}
                                options={[
                                    { value: 'PLUMBER', label: 'Encanador' },
                                    { value: 'ELECTRICIAN', label: 'Eletricista' },
                                    { value: 'GARDENER', label: 'Jardineiro' },
                                    { value: 'CARPENTER', label: 'Carpinteiro / Marceneiro' },
                                    { value: 'OTHER', label: 'Outros' }
                                ]}
                            />
                        </div>
                        <div className="modal-input-group" style={{ flex: 1 }}>
                            <label className="modal-label">Telefone</label>
                            <input 
                                type="text" 
                                required 
                                value={phone} 
                                onChange={handlePhoneChange} 
                                className="modal-input" 
                                placeholder="(11) 99999-1234" 
                            />
                        </div>
                    </div>

                    <div className="modal-input-group">
                        <label className="modal-label">E-mail (opcional)</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="modal-input" 
                            placeholder="Ex: joao@provedor.com" 
                        />
                    </div>
                    
                    <div className="modal-input-group">
                        <label className="modal-label">Observações</label>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)} 
                            className="modal-textarea" 
                            placeholder="Ex: especialista em vazamentos, atende emergências" 
                        />
                    </div>

                    <div className="modal-footer">
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
                            disabled={loading || !isFormValid}
                        >
                            <Check size={16} />
                            {loading ? 'Salvando...' : 'Cadastrar prestador'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
