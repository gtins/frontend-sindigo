import React, { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import type { CreateActivityPayload, Ticket, Provider } from '../types';
import { CustomSelect } from './CustomSelect';


interface CreateActivityModalProps {
    condominiumId: string;
    tickets?: Ticket[];
    providers?: Provider[];
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ condominiumId, tickets = [], providers = [], onClose, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('ONCE');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [ticketId, setTicketId] = useState('');
    const [providerId, setProviderId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (new Date(startDate) > new Date(endDate)) {
            setError('A data de início não pode ser depois da data final.');
            setLoading(false);
            return;
        }

        try {
            const payload: CreateActivityPayload = { 
                title, description, type, startDate, endDate,
                ticketId: ticketId ? ticketId : undefined,
                providerId: providerId ? providerId : undefined,
                origin: ticketId ? 'CHAMADO' : undefined
            };
            await CondominiumService.createActivity(condominiumId, payload);
            onSuccess();
        } catch (err: any) {
            console.error('Error creating activity:', err);
            setError('Falha ao criar a atividade. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = title.trim() && description.trim() && startDate && endDate;

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-title">Registrar atividade</h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                
                {error && <div className="modal-error">{error}</div>}
                
                <form onSubmit={handleSubmit} className="modal-form">
                    
                    {/* Bloco 1: Informações da atividade */}
                    <div>
                        <div className="modal-section-title">Informações da atividade</div>
                        <hr className="modal-section-divider" />
                        
                        <div className="modal-form" style={{ gap: '16px', marginTop: '12px' }}>
                            <div className="modal-input-group">
                                <label className="modal-label">Título</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    className="modal-input" 
                                    placeholder="Ex: Limpeza da piscina" 
                                />
                            </div>
                            
                            <div className="modal-input-group">
                                <label className="modal-label">Descrição</label>
                                <textarea 
                                    required 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    className="modal-textarea" 
                                    placeholder="Ex: Limpeza com filtragem e aplicação de produtos químicos" 
                                />
                            </div>

                            <div className="modal-input-group">
                                <label className="modal-label">Tipo de atividade</label>
                                <CustomSelect
                                    value={type}
                                    onChange={(val) => setType(val)}
                                    options={[
                                        { value: 'ONCE', label: 'Única (atividade pontual única)' },
                                        { value: 'PERIODIC', label: 'Periódica (rotina ou manutenção recorrente)' }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bloco 2: Período */}
                    <div style={{ marginTop: '8px' }}>
                        <div className="modal-section-title">Período</div>
                        <hr className="modal-section-divider" />
                        
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                            <div className="modal-input-group" style={{ flex: 1 }}>
                                <label className="modal-label">Data de início</label>
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
                                <label className="modal-label">Data final</label>
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
                    </div>

                    {/* Bloco 3: Vínculos opcionais */}
                    <div style={{ marginTop: '8px' }}>
                        <div className="modal-section-title">Vínculos opcionais</div>
                        <hr className="modal-section-divider" />
                        
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                            <div className="modal-input-group" style={{ flex: 1 }}>
                                <label className="modal-label">Vincular chamado</label>
                                <CustomSelect
                                    value={ticketId}
                                    onChange={(val) => setTicketId(val)}
                                    placeholder="Não vincular"
                                    options={[
                                        { value: '', label: 'Não vincular' },
                                        ...tickets.map(t => {
                                            const statusMap: Record<string, string> = {
                                                ABERTO: 'Aberto',
                                                EM_ANDAMENTO: 'Em andamento',
                                                RESOLVIDO: 'Resolvido',
                                                FECHADO: 'Fechado'
                                            };
                                            const statusLabel = statusMap[t.status] || t.status;
                                            return { value: t.id, label: `${t.title} (${statusLabel})` };
                                        })
                                    ]}
                                />
                            </div>
                            <div className="modal-input-group" style={{ flex: 1 }}>
                                <label className="modal-label">Vincular prestador</label>
                                <CustomSelect
                                    value={providerId}
                                    onChange={(val) => setProviderId(val)}
                                    placeholder="Não vincular"
                                    options={[
                                        { value: '', label: 'Não vincular' },
                                        ...providers.map(p => {
                                            const typeMap: Record<string, string> = {
                                                PLUMBER: 'Encanador',
                                                ELECTRICIAN: 'Eletricista',
                                                GARDENER: 'Jardineiro',
                                                CARPENTER: 'Marceneiro',
                                                OTHER: 'Outros'
                                            };
                                            const typeLabel = typeMap[p.serviceType] || p.serviceType;
                                            return { value: p.id, label: `${p.name} (${typeLabel})` };
                                        })
                                    ]}
                                />
                            </div>
                        </div>
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
                            <Plus size={16} />
                            {loading ? 'Salvando...' : 'Registrar atividade'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
