import React from 'react';
import { X } from 'lucide-react';
import type { Activity, Reservation, Ticket, Provider } from '../types';

interface ItemDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Activity | Reservation | Ticket | Provider | null;
    type: 'activity' | 'reservation' | 'ticket' | 'provider' | null;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ isOpen, onClose, item, type }) => {
    if (!isOpen || !item || !type) return null;

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
                </div>
                
                <div style={footerStyle}>
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
