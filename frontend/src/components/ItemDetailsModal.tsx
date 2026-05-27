import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Activity, Reservation, Ticket, Provider } from '../types';
import CondominiumService from '../services/condominiumService';
import AttachmentService from '../services/attachmentService';
import type { Attachment } from '../services/attachmentService';

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

    // Attachments states
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [closingFiles, setClosingFiles] = useState<File[]>([]);

    // Providers & activities states
    const [providerActivities, setProviderActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [activityAttachments, setActivityAttachments] = useState<Record<string, Attachment[]>>({});
    const [uploadingActivityId, setUploadingActivityId] = useState<string | null>(null);

    // Reset state when modal opens/closes
    React.useEffect(() => {
        if (!isOpen) {
            setIsClosing(false);
            setCloseStatus('');
            setClosingNotes('');
            setIsSubmitting(false);
            setClosingFiles([]);
            setAttachments([]);
            setAttachmentUrls({});
            setProviderActivities([]);
            setActivityAttachments({});
            setUploadingActivityId(null);
        }
    }, [isOpen]);

    const loadTicketAttachments = async () => {
        if (type === 'ticket' && item?.id) {
            setLoadingAttachments(true);
            try {
                const res = await AttachmentService.getTicketAttachments(item.id);
                setAttachments(res || []);
                
                const urls: Record<string, string> = {};
                for (const att of res) {
                    if (att.contentType?.startsWith('image/')) {
                        try {
                            const url = await AttachmentService.getPresignedUrl(att.id);
                            urls[att.id] = url;
                        } catch (e) {
                            console.error('Failed to get url for thumbnail:', att.id, e);
                        }
                    }
                }
                setAttachmentUrls(urls);
            } catch (err) {
                console.error('Error fetching ticket attachments:', err);
            } finally {
                setLoadingAttachments(false);
            }
        }
    };

    const loadProviderActivitiesAndAttachments = async () => {
        if (type === 'provider' && item?.id) {
            setLoadingActivities(true);
            try {
                const activities = await CondominiumService.getActivities(condominiumId);
                let activitiesData = activities;
                if (activities && !Array.isArray(activities)) {
                    activitiesData = (activities as any).content || (activities as any).data || (activities as any).items || [];
                }
                const linkedActivities = (activitiesData || []).filter((act: any) => 
                    act.providerId === item.id || 
                    act.provider?.id === item.id
                );
                setProviderActivities(linkedActivities);

                const attachmentsMap: Record<string, Attachment[]> = {};
                for (const act of linkedActivities) {
                    const actId = act.id || act.activityId;
                    if (actId) {
                        try {
                            const res = await AttachmentService.getActivityAttachments(actId);
                            attachmentsMap[actId] = res || [];
                        } catch (e) {
                            console.error('Failed to load attachments for activity:', actId, e);
                            attachmentsMap[actId] = [];
                        }
                    }
                }
                setActivityAttachments(attachmentsMap);
            } catch (err) {
                console.error('Error fetching provider activities:', err);
            } finally {
                setLoadingActivities(false);
            }
        }
    };

    React.useEffect(() => {
        if (isOpen && type === 'ticket' && item?.id) {
            loadTicketAttachments();
        }
        if (isOpen && type === 'provider' && item?.id) {
            loadProviderActivitiesAndAttachments();
        }
    }, [isOpen, type, item?.id]);

    const handleViewAttachment = async (attId: string) => {
        try {
            const url = await AttachmentService.getPresignedUrl(attId);
            if (url) window.open(url, '_blank');
        } catch (err) {
            console.error('Error fetching presigned url:', err);
            alert('Erro ao carregar o arquivo.');
        }
    };

    const handleViewActivityInvoice = async (attachmentId: string) => {
        try {
            const url = await AttachmentService.getPresignedUrl(attachmentId);
            if (url) window.open(url, '_blank');
        } catch (err) {
            console.error('Error opening activity invoice:', err);
            alert('Erro ao obter link da nota fiscal.');
        }
    };

    const handleDeleteActivityInvoice = async (activityId: string, attachmentId: string) => {
        if (!confirm('Deseja realmente remover esta nota fiscal?')) return;
        try {
            await AttachmentService.deleteAttachment(attachmentId);
            alert('Nota fiscal removida com sucesso!');
            const res = await AttachmentService.getActivityAttachments(activityId);
            setActivityAttachments(prev => ({
                ...prev,
                [activityId]: res || []
            }));
        } catch (err) {
            console.error('Error deleting activity invoice:', err);
            alert('Erro ao excluir nota fiscal.');
        }
    };

    const handleUploadActivityInvoice = async (activityId: string, file: File) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('A nota fiscal deve ser um arquivo PDF.');
            return;
        }
        setUploadingActivityId(activityId);
        try {
            await AttachmentService.uploadActivityAttachment(activityId, file);
            alert('Nota fiscal enviada com sucesso!');
            const res = await AttachmentService.getActivityAttachments(activityId);
            setActivityAttachments(prev => ({
                ...prev,
                [activityId]: res || []
            }));
        } catch (err) {
            console.error('Error uploading activity invoice:', err);
            alert('Erro ao enviar nota fiscal.');
        } finally {
            setUploadingActivityId(null);
        }
    };

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
                const actId = item.id || (item as any).activityId;
                await CondominiumService.closeActivity(condominiumId, actId, {
                    status: closeStatus as 'COMPLETED' | 'CANCELLED',
                    closingNotes: closingNotes.trim()
                });
            } else if (type === 'ticket') {
                await CondominiumService.closeTicket(condominiumId, item.id, {
                    status: closeStatus as 'RESOLVIDO' | 'FECHADO',
                    closingNotes: closingNotes.trim()
                });

                if (closingFiles.length > 0) {
                    for (const file of closingFiles) {
                        try {
                            await AttachmentService.uploadTicketAttachment(item.id, file);
                        } catch (err) {
                            console.error('Failed to upload closing file:', file.name, err);
                        }
                    }
                }
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
                
                <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Fotos de Evidência</h4>
                    {loadingAttachments ? (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Carregando fotos...</span>
                    ) : attachments.length === 0 ? (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Nenhuma foto anexada.</span>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {attachments.map((att) => (
                                <div 
                                    key={att.id} 
                                    onClick={() => handleViewAttachment(att.id)}
                                    style={{
                                        cursor: 'pointer',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        width: '80px',
                                        height: '80px',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f8fafc'
                                    }}
                                    title="Clique para ampliar"
                                >
                                    {att.contentType?.startsWith('image/') && attachmentUrls[att.id] ? (
                                        <img src={attachmentUrls[att.id]} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '1.5rem' }}>📄</span>
                                    )}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        color: '#fff',
                                        fontSize: '0.6rem',
                                        textAlign: 'center',
                                        padding: '2px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {att.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
                                     
                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>Atividades Vinculadas</h3>
                    {loadingActivities ? (
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Carregando atividades...</div>
                    ) : providerActivities.length === 0 ? (
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Este prestador não está vinculado a nenhuma atividade.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {providerActivities.map(act => {
                                const actId = act.id || act.activityId;
                                const attachments = activityAttachments[actId] || [];
                                const invoice = attachments.find(att => att.contentType === 'application/pdf' || att.name.toLowerCase().endsWith('.pdf'));
                                
                                return (
                                    <div key={actId} style={{ 
                                        padding: '12px', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '8px', 
                                        backgroundColor: '#f8fafc',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>{act.title}</span>
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                padding: '2px 8px', 
                                                borderRadius: '9999px',
                                                backgroundColor: act.status === 'COMPLETED' ? '#d1fae5' : act.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                                                color: act.status === 'COMPLETED' ? '#065f46' : act.status === 'CANCELLED' ? '#991b1b' : '#92400e',
                                                fontWeight: 500
                                            }}>
                                                {act.status === 'COMPLETED' ? 'Concluída' : act.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.825rem', color: '#475569' }}>{act.description}</span>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            Período: {act.startDate} até {act.endDate}
                                        </div>
                                        
                                        <div style={{ 
                                            marginTop: '6px', 
                                            paddingTop: '8px', 
                                            borderTop: '1px dashed #cbd5e1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            minHeight: '36px'
                                        }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>Nota Fiscal:</span>
                                            {uploadingActivityId === actId ? (
                                                <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Enviando PDF...</span>
                                            ) : invoice ? (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }} onClick={() => handleViewActivityInvoice(invoice.id)}>
                                                        📄 {invoice.name}
                                                    </span>
                                                    <button 
                                                        onClick={() => handleDeleteActivityInvoice(actId, invoice.id)}
                                                        style={{ 
                                                            background: 'none', 
                                                            border: 'none', 
                                                            color: '#ef4444', 
                                                            cursor: 'pointer', 
                                                            fontSize: '0.75rem',
                                                            padding: '2px 4px',
                                                            fontWeight: 500
                                                        }}
                                                        title="Excluir Nota Fiscal"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            ) : (
                                                <div>
                                                    <label style={{ 
                                                        fontSize: '0.75rem', 
                                                        color: '#2563eb', 
                                                        cursor: 'pointer',
                                                        fontWeight: 500,
                                                        textDecoration: 'underline'
                                                    }}>
                                                        Anexar Nota Fiscal (PDF)
                                                        <input 
                                                            type="file" 
                                                            accept=".pdf" 
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    handleUploadActivityInvoice(actId, e.target.files[0]);
                                                                }
                                                            }} 
                                                            style={{ display: 'none' }}
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
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

                            {type === 'ticket' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                                    <label style={labelStyle}>Fotos de Evidência de Fechamento (Máx. 3 fotos)</label>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const filesArray = Array.from(e.target.files);
                                                if (closingFiles.length + filesArray.length > 3) {
                                                    alert('Você só pode anexar até 3 fotos de encerramento.');
                                                    return;
                                                }
                                                setClosingFiles(prev => [...prev, ...filesArray]);
                                            }
                                        }} 
                                        style={inputStyle}
                                        disabled={isSubmitting}
                                    />
                                    {closingFiles.length > 0 && (
                                        <div style={previewContainerStyle}>
                                            {closingFiles.map((file, idx) => (
                                                <div key={idx} style={previewItemStyle}>
                                                    <span style={previewNameStyle}>{file.name}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setClosingFiles(prev => prev.filter((_, i) => i !== idx))} 
                                                        style={removeFileBtnStyle}
                                                        disabled={isSubmitting}
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

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

const previewContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
    backgroundColor: '#f8fafc',
    padding: '8px',
    borderRadius: '6px',
    border: '1px dashed #cbd5e1'
};

const previewItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
    color: '#334155',
    backgroundColor: '#fff',
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #e2e8f0'
};

const previewNameStyle: React.CSSProperties = {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '280px'
};

const removeFileBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 500
};
