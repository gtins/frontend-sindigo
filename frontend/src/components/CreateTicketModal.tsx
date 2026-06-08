import React, { useState } from 'react';
import { X, Plus, Image } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import AttachmentService from '../services/attachmentService';
import type { CreateTicketPayload } from '../types';
import { CustomSelect } from './CustomSelect';


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
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            if (selectedFiles.length + filesArray.length > 3) {
                alert('Você só pode anexar até 3 fotos de evidência.');
                return;
            }
            setSelectedFiles((prev) => [...prev, ...filesArray]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload: CreateTicketPayload = { title, description, category, priority, location };
            const createdTicket = await CondominiumService.createTicket(condominiumId, payload);
            
            const ticketId = createdTicket?.id || (createdTicket as any)?.data?.id;
            if (selectedFiles.length > 0 && ticketId) {
                for (const file of selectedFiles) {
                    try {
                        await AttachmentService.uploadTicketAttachment(ticketId, file);
                    } catch (uploadErr) {
                        console.error('Failed to upload file:', file.name, uploadErr);
                    }
                }
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error creating ticket:', err);
            setError('Falha ao abrir o chamado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = title.trim() && description.trim() && location.trim();

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-title">Novo chamado</h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                
                {error && <div className="modal-error">{error}</div>}
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-input-group">
                        <label className="modal-label">Título</label>
                        <input 
                            type="text" 
                            required 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="modal-input" 
                            placeholder="Ex: Lâmpada queimada na garagem" 
                        />
                    </div>
                    
                    <div className="modal-input-group">
                        <label className="modal-label">Descrição</label>
                        <textarea 
                            required 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            className="modal-textarea" 
                            placeholder="Ex: A lâmpada da vaga 42 no subsolo 1 está piscando e apagou." 
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="modal-input-group" style={{ flex: 1 }}>
                            <label className="modal-label">Categoria</label>
                            <CustomSelect
                                value={category}
                                onChange={(val) => setCategory(val)}
                                options={[
                                    { value: 'SOLICITACAO', label: 'Solicitação' },
                                    { value: 'RECLAMACAO', label: 'Reclamação' },
                                    { value: 'ESTRUTURA', label: 'Estrutura' },
                                    { value: 'ELETRICA', label: 'Elétrica' },
                                    { value: 'LIMPEZA', label: 'Limpeza' },
                                    { value: 'SEGURANCA', label: 'Segurança' },
                                    { value: 'HIDRAULICA', label: 'Hidráulica' },
                                    { value: 'MANUTENCAO', label: 'Manutenção' },
                                    { value: 'OUTRO', label: 'Outros' }
                                ]}
                            />
                        </div>

                        <div className="modal-input-group" style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label className="modal-label" style={{ margin: 0 }}>Prioridade</label>
                                <span style={{
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: priority === 'BAIXA' ? '#3b82f6' : priority === 'MEDIA' ? '#f59e0b' : '#ef4444'
                                }} />
                            </div>
                            <CustomSelect
                                value={priority}
                                onChange={(val) => setPriority(val as any)}
                                options={[
                                    { value: 'BAIXA', label: 'Baixa' },
                                    { value: 'MEDIA', label: 'Média' },
                                    { value: 'ALTA', label: 'Alta' },
                                    { value: 'URGENTE', label: 'Urgente' },
                                    { value: 'CRITICA', label: 'Crítica' }
                                ]}
                            />
                        </div>
                    </div>

                    <div className="modal-input-group">
                        <label className="modal-label">Localização</label>
                        <input 
                            type="text" 
                            required 
                            value={location} 
                            onChange={(e) => setLocation(e.target.value)} 
                            className="modal-input" 
                            placeholder="Ex: Subsolo 1, Vaga 42" 
                        />
                    </div>

                    <div className="modal-input-group">
                        <label className="modal-label">Fotos de evidência (Máx. 3 fotos)</label>
                        <label className="dropzone-container">
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                style={{ display: 'none' }}
                                disabled={loading}
                            />
                            <Image size={24} color="var(--text-light)" style={{ marginBottom: '4px' }} />
                            <p className="dropzone-title">Arraste imagens aqui ou clique para selecionar</p>
                            <p className="dropzone-subtitle">PNG, JPG ou JPEG • até 3 fotos</p>
                        </label>
                        
                        {selectedFiles.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px', fontWeight: 500, color: 'var(--text-main)' }}>{file.name}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => removeFile(idx)} 
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                            disabled={loading}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
                            {loading ? 'Salvando...' : 'Abrir chamado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
