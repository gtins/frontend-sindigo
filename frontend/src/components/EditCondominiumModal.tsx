import React, { useState } from 'react';
import { X } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { Condominium } from '../types';

interface EditCondominiumModalProps {
    condominium: Condominium;
    onClose: () => void;
    onSuccess: () => void;
}

export const EditCondominiumModal: React.FC<EditCondominiumModalProps> = ({ condominium, onClose, onSuccess }) => {
    const [name, setName] = useState(condominium.name || '');
    const [address, setAddress] = useState(condominium.address || '');
    const [unidades, setUnidades] = useState(condominium.unidades !== undefined && condominium.unidades !== null ? String(condominium.unidades) : '');
    const [active, setActive] = useState(condominium.active !== false); // default to true if undefined
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                name,
                address,
                unidades: Number(unidades),
                active
            };
            await CondominiumService.update(condominium.id, payload);
            onSuccess(); // triggers re-fetch and modal close
        } catch (err: any) {
            console.error('Error updating condominium:', err);
            setError('Falha ao atualizar o condomínio. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Editar prédio</h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                
                {error && <div className="modal-error">{error}</div>}
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-input-group">
                        <label className="modal-label">Nome do Condomínio</label>
                        <input 
                            type="text" 
                            required 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="modal-input"
                        />
                    </div>
                    
                    <div className="modal-input-group">
                        <label className="modal-label">Endereço</label>
                        <input 
                            type="text" 
                            required 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)} 
                            className="modal-input"
                        />
                    </div>

                    <div className="modal-input-group">
                        <label className="modal-label">Quantidade de Unidades</label>
                        <input 
                            type="number" 
                            required 
                            min="1"
                            placeholder="Ex: 10"
                            value={unidades} 
                            onChange={(e) => setUnidades(e.target.value)} 
                            className="modal-input"
                        />
                    </div>

                    <div className="modal-input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                        <input 
                            type="checkbox" 
                            id="condo-active"
                            checked={active} 
                            onChange={(e) => setActive(e.target.checked)} 
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        <label htmlFor="condo-active" className="modal-label" style={{ cursor: 'pointer', margin: 0, textTransform: 'none', fontSize: '0.875rem' }}>
                            Condomínio ativo (exibido na plataforma)
                        </label>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="secondary-btn" disabled={loading}>Cancelar</button>
                        <button type="submit" className="primary-btn" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
