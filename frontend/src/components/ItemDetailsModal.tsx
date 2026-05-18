import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Activity, Reservation, Ticket, Provider } from '../types';
import CondominiumService from '../services/condominiumService';

interface ItemDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Activity | Reservation | Ticket | Provider | null;
    type: 'activity' | 'reservation' | 'ticket' | 'provider' | null;
    condominiumId: string;
    onItemClosed?: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ isOpen, onClose, item, type, condominiumId, onItemClosed }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [closeStatus, setCloseStatus] = useState('');
    const [closingNotes, setClosingNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setCloseStatus('');
            setClosingNotes('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const userRole = localStorage.getItem('role') || 'MORADOR';
    const isAdminOrSindico = userRole === 'ADMIN' || userRole === 'SINDICO';

    if (!isOpen || !item || !type) return null;

    const handleCloseSubmit = async () => {
        if (!closeStatus || !closingNotes.trim()) {
            alert('Por favor, preencha o status e as notas de encerramento.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (type === 'activity') {
                await CondominiumService.closeActivity(condominiumId, item.id, {
                    status: closeStatus as 'COMPLETED' | 'CANCELLED',
                    closingNotes: closingNotes.trim()
                });
            } else if (type === 'ticket') {
                await CondominiumService.closeTicket(condominiumId, item.id, {
                    status: closeStatus as 'RESOLVIDO' | 'FECHADO',
                    closingNotes: closingNotes.trim()
                });
            }
            alert('Item encerrado com sucesso!');
            setIsClosing(false);
            if (onItemClosed) onItemClosed();
            onClose();
        } catch (error) {
            console.error('Failed to close item:', error);
            alert('Erro ao tentar encerrar o item. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    let title = '';
    let content: React.ReactNode = null;

    // Helper for rendering key-value rows
    const renderRow = (label: string, value: React.ReactNode) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>{label}</span>
            <span style={{ fontSize: '1rem', color: '#0f172a' }}>{value || '-'}</span>
        </div>
    );

    if (type === 'activity') {
        const activity = item as Activity;
        title = 'Detalhes da Atividade';
        content = (
            <div>
                {renderRow('Título', activity.title)}
                {renderRow('Descrição', activity.description)}
                {renderRow('Tipo', activity.type === 'ONCE' ? 'Única' : 'Periódica')}
                {renderRow('Data de Início', activity.startDate)}
                {renderRow('Data de Fim', activity.endDate)}
                {activity.status && renderRow('Status', activity.status)}
                {activity.closedAt && renderRow('Data de Encerramento', new Date(activity.closedAt).toLocaleString('pt-BR'))}
                {activity.closingNotes && renderRow('Notas de Encerramento', activity.closingNotes)}
            </div>
        );
    } else if (type === 'reservation') {
        const reservation = item as Reservation;
        title = 'Detalhes da Reserva';
        content = (
            <div>
                {renderRow('ID da Reserva', reservation.id)}
                {renderRow('Área', reservation.area)}
                {renderRow('Criado em', reservation.createdAt ? new Date(reservation.createdAt).toLocaleString('pt-BR') : '')}
                {renderRow('Início', reservation.startTime ? new Date(reservation.startTime).toLocaleString('pt-BR') : '')}
                {renderRow('Fim', reservation.endTime ? new Date(reservation.endTime).toLocaleString('pt-BR') : '')}
                {renderRow('Status', reservation.status)}
            </div>
        );
    } else if (type === 'ticket') {
        const ticket = item as Ticket;
        title = 'Detalhes do Chamado';
        content = (
            <div>
                {renderRow('Título', ticket.title)}
                {renderRow('Descrição', ticket.description)}
                {renderRow('Status', ticket.status)}
                {renderRow('Prioridade', ticket.priority)}
                {renderRow('Categoria', ticket.category)}
                {ticket.closedAt && renderRow('Data de Encerramento', new Date(ticket.closedAt).toLocaleString('pt-BR'))}
                {ticket.closingNotes && renderRow('Notas de Encerramento', ticket.closingNotes)}
            </div>
        );
    } else if (type === 'provider') {
        const provider = item as Provider;
        title = 'Detalhes do Prestador de Serviço';
        content = (
            <div>
                {renderRow('Nome', provider.name)}
                {renderRow('Telefone', provider.phone)}
                {renderRow('Serviço', provider.serviceType === 'ELECTRICIAN' ? 'Eletricista' : 
                                     provider.serviceType === 'PLUMBER' ? 'Encanador' : 
                                     provider.serviceType === 'GARDENER' ? 'Jardineiro' : 
                                     provider.serviceType === 'CARPENTER' ? 'Carpinteiro' : 'Outros')}
            </div>
        );
    }

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>{title}</h2>
                    <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
                </div>
                
                <div style={contentStyle}>
                    {content}
                    
                    {isClosing && (
                        <div style={closeFormStyle}>
                            <h3 style={{ fontSize: '1rem', marginTop: 0, marginBottom: '12px' }}>Encerrar {type === 'ticket' ? 'Chamado' : 'Atividade'}</h3>
                            
                            <label style={labelStyle}>Status de Encerramento *</label>
                            <select 
                                value={closeStatus} 
                                onChange={(e) => setCloseStatus(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="">Selecione um status...</option>
                                {type === 'ticket' ? (
                                    <>
                                        <option value="RESOLVIDO">Resolvido</option>
                                        <option value="FECHADO">Fechado</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="COMPLETED">Concluída</option>
                                        <option value="CANCELLED">Cancelada</option>
                                    </>
                                )}
                            </select>

                            <label style={labelStyle}>Notas de Encerramento *</label>
                            <textarea 
                                value={closingNotes} 
                                onChange={(e) => setClosingNotes(e.target.value)}
                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                placeholder="Descreva os detalhes do encerramento..."
                            />

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <button onClick={() => setIsClosing(false)} style={cancelBtnStyle} disabled={isSubmitting}>Cancelar</button>
                                <button onClick={handleCloseSubmit} style={submitBtnStyle} disabled={isSubmitting}>
                                    {isSubmitting ? 'Enviando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div style={footerStyle}>
                    {isAdminOrSindico && (type === 'activity' || type === 'ticket') && !isClosing && 
                     !['COMPLETED', 'CANCELLED', 'RESOLVED', 'CLOSED', 'RESOLVIDO', 'FECHADO'].includes((item as any).status) && (
                        <button onClick={() => setIsClosing(true)} style={closeItemBtnStyle}>Encerrar</button>
                    )}
                    <button onClick={onClose} style={closeActionBtnStyle}>Fechar</button>
                </div>
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
    zIndex: 1100
};

const modalStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '500px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxHeight: '90vh',
    overflowY: 'auto'
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e2e8f0'
};

const closeBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px'
};

const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
};

const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0'
};

const closeActionBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer'
};

const closeItemBtnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #ef4444',
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontWeight: 500,
    cursor: 'pointer',
    marginRight: 'auto'
};

const closeFormStyle: React.CSSProperties = {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '4px'
};

const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box'
};

const cancelBtnStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#475569',
    fontWeight: 500,
    cursor: 'pointer'
};

const submitBtnStyle: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer'
};
