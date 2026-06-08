import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Activity, Reservation, Ticket, Provider } from '../types';
import CondominiumService from '../services/condominiumService';
import AttachmentService from '../services/attachmentService';
import type { Attachment } from '../services/attachmentService';
import { CustomSelect } from './CustomSelect';


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
                    const actId = act.activityId || act.id;
                    if (actId) {
                        try {
                            const res = act.origin === 'CHAMADO' && act.ticketId
                                ? await AttachmentService.getTicketAttachments(act.ticketId)
                                : await AttachmentService.getActivityAttachments(actId);
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
            const act = providerActivities.find(a => (a.activityId || a.id) === activityId);
            const res = act && act.origin === 'CHAMADO' && act.ticketId
                ? await AttachmentService.getTicketAttachments(act.ticketId)
                : await AttachmentService.getActivityAttachments(activityId);
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
        const act = providerActivities.find(a => (a.activityId || a.id) === activityId);
        setUploadingActivityId(activityId);
        try {
            if (act && act.origin === 'CHAMADO' && act.ticketId) {
                await AttachmentService.uploadTicketAttachment(act.ticketId, file);
            } else {
                await AttachmentService.uploadActivityAttachment(activityId, file);
            }
            alert('Nota fiscal enviada com sucesso!');
            const res = act && act.origin === 'CHAMADO' && act.ticketId
                ? await AttachmentService.getTicketAttachments(act.ticketId)
                : await AttachmentService.getActivityAttachments(activityId);
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
                const actId = (item as any).activityId || item.id;
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

    // Translation and mapping helpers
    const translateTicketPriority = (p?: string) => {
        switch (p?.toUpperCase()) {
            case 'URGENTE': case 'CRITICA': case 'CRITICAL': return 'Crítica';
            case 'ALTA': case 'HIGH': return 'Alta';
            case 'MEDIA': case 'MEDIUM': return 'Média';
            case 'BAIXA': case 'LOW': return 'Baixa';
            default: return p || '-';
        }
    };

    const translateTicketStatus = (s?: string) => {
        switch (s?.toUpperCase()) {
            case 'OPEN': case 'ABERTO': return 'Aberto';
            case 'IN_PROGRESS': case 'EM_ANDAMENTO': return 'Em andamento';
            case 'RESOLVED': case 'RESOLVIDO': return 'Resolvido';
            case 'CLOSED': case 'FECHADO': return 'Fechado';
            default: return s || '-';
        }
    };

    const translateTicketCategory = (c?: string) => {
        switch (c?.toUpperCase()) {
            case 'SOLICITACAO': return 'Solicitação';
            case 'RECLAMACAO': return 'Reclamação';
            case 'ESTRUTURA': return 'Estrutura';
            case 'ELETRICA': return 'Elétrica';
            case 'LIMPEZA': return 'Limpeza';
            case 'SEGURANCA': return 'Segurança';
            case 'HIDRAULICA': return 'Hidráulica';
            case 'MANUTENCAO': return 'Manutenção';
            case 'OUTRO': case 'OUTROS': return 'Outros';
            default: return c || '-';
        }
    };

    // Helper for rendering key-value rows
    const renderRow = (label: string, value: React.ReactNode) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9', gap: '16px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>{value || '-'}</span>
        </div>
    );

    if (type === 'activity') {
        const activity = item as Activity;
        title = 'Detalhes da atividade';
        content = (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderRow('Título', activity.title)}
                {renderRow('Descrição', activity.description)}
                {renderRow('Tipo', activity.type === 'ONCE' ? 'Única' : 'Periódica')}
                {renderRow('Data de início', activity.startDate)}
                {renderRow('Data final', activity.endDate)}
                {activity.status && renderRow('Status', activity.status === 'COMPLETED' ? 'Concluída' : activity.status === 'CANCELLED' ? 'Cancelada' : 'Pendente')}
                {activity.closedAt && renderRow('Encerramento', new Date(activity.closedAt).toLocaleString('pt-BR'))}
                {activity.closingNotes && renderRow('Observações de encerramento', activity.closingNotes)}
            </div>
        );
    } else if (type === 'reservation') {
        const reservation = item as Reservation;
        title = 'Detalhes da reserva';
        const getStatusLabel = (s?: string) => {
            if (s === 'CONFIRMED') return 'Confirmada';
            if (s === 'PENDING') return 'Pendente';
            if (s === 'CANCELLED') return 'Cancelada';
            return s || '-';
        };
        content = (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderRow('ID da reserva', reservation.id)}
                {renderRow('Área', reservation.area)}
                {reservation.requestedByName && renderRow('Solicitado por', reservation.requestedByName)}
                {reservation.requestedByUnit && renderRow('Unidade solicitante', reservation.requestedByUnit)}
                {renderRow('Criado em', reservation.createdAt ? new Date(reservation.createdAt).toLocaleString('pt-BR') : '')}
                {renderRow('Início da reserva', reservation.startTime ? new Date(reservation.startTime).toLocaleString('pt-BR') : '')}
                {renderRow('Fim da reserva', reservation.endTime ? new Date(reservation.endTime).toLocaleString('pt-BR') : '')}
                {renderRow('Status', getStatusLabel(reservation.status))}
            </div>
        );
    } else if (type === 'ticket') {
        const ticket = item as Ticket;
        title = 'Detalhes do chamado';
        content = (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderRow('Título', ticket.title)}
                {renderRow('Descrição', ticket.description)}
                {renderRow('Status', translateTicketStatus(ticket.status))}
                {renderRow('Prioridade', translateTicketPriority(ticket.priority))}
                {renderRow('Categoria', translateTicketCategory(ticket.category))}
                {ticket.closedAt && renderRow('Encerramento', new Date(ticket.closedAt).toLocaleString('pt-BR'))}
                {ticket.closingNotes && renderRow('Observações de encerramento', ticket.closingNotes)}
                
                <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fotos de evidência</h4>
                    {loadingAttachments ? (
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-light)' }}>Carregando fotos...</span>
                    ) : attachments.length === 0 ? (
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-light)' }}>Nenhuma foto anexada.</span>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {attachments.map((att) => (
                                <div 
                                    key={att.id} 
                                    onClick={() => handleViewAttachment(att.id)}
                                    style={{
                                        cursor: 'pointer',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        width: '80px',
                                        height: '80px',
                                        position: 'relative',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f8fafc',
                                        transition: 'all 0.2s'
                                    }}
                                    className="clickable-item"
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
                                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
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
        title = 'Detalhes do prestador';
        content = (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {renderRow('Nome', provider.name)}
                {renderRow('Telefone', provider.phone)}
                {renderRow('Serviço', provider.serviceType === 'ELECTRICIAN' ? 'Eletricista' : 
                                     provider.serviceType === 'PLUMBER' ? 'Encanador' : 
                                     provider.serviceType === 'GARDENER' ? 'Jardineiro' : 
                                     provider.serviceType === 'CARPENTER' ? 'Carpinteiro' : 'Outros')}
                                     
                <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Atividades vinculadas</h3>
                    {loadingActivities ? (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Carregando atividades...</div>
                    ) : providerActivities.length === 0 ? (
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Este prestador não está vinculado a nenhuma atividade.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {providerActivities.map(act => {
                                const actId = act.activityId || act.id;
                                const attachments = activityAttachments[actId] || [];
                                
                                return (
                                    <div key={actId} style={{ 
                                        padding: '16px', 
                                        border: '1px solid #e2e8f0', 
                                        borderRadius: '16px', 
                                        backgroundColor: '#f8fafc',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{act.title}</span>
                                            <span style={{ 
                                                fontSize: '0.75rem', 
                                                padding: '4px 10px', 
                                                borderRadius: '12px',
                                                backgroundColor: act.status === 'COMPLETED' ? '#d1fae5' : act.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                                                color: act.status === 'COMPLETED' ? '#065f46' : act.status === 'CANCELLED' ? '#991b1b' : '#92400e',
                                                fontWeight: 600
                                            }}>
                                                {act.status === 'COMPLETED' ? 'Concluída' : act.status === 'CANCELLED' ? 'Cancelada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{act.description}</span>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                            Período: {act.startDate} até {act.endDate}
                                        </div>
                                        
                                        <div style={{ 
                                            marginTop: '8px', 
                                            paddingTop: '8px', 
                                            borderTop: '1px dashed #cbd5e1',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Anexos / Nota Fiscal:</span>
                                                <label style={{ 
                                                    fontSize: '0.75rem', 
                                                    color: 'var(--color-primary)', 
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    textDecoration: 'underline'
                                                }}>
                                                    Anexar arquivo
                                                    <input 
                                                        type="file" 
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                    handleUploadActivityInvoice(actId, e.target.files[0]);
                                                            }
                                                        }} 
                                                        style={{ display: 'none' }}
                                                    />
                                                </label>
                                            </div>
                                            
                                            {uploadingActivityId === actId ? (
                                                <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Enviando arquivo...</span>
                                            ) : attachments.length === 0 ? (
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Nenhum anexo encontrado.</span>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {attachments.map(att => (
                                                        <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }} onClick={() => handleViewActivityInvoice(att.id)}>
                                                                📄 {att.name || `Anexo-${att.id.substring(0, 8)}`}
                                                            </span>
                                                            <button 
                                                                onClick={() => handleDeleteActivityInvoice(actId, att.id)}
                                                                style={{ 
                                                                    background: 'none', 
                                                                    border: 'none', 
                                                                    color: '#ef4444', 
                                                                    cursor: 'pointer', 
                                                                    fontSize: '0.75rem',
                                                                    padding: '2px 4px',
                                                                    fontWeight: 600
                                                                }}
                                                                title="Excluir anexo"
                                                            >
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    ))}
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
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button onClick={onClose} className="modal-close-btn"><X size={20} /></button>
                </div>
                
                <div className="modal-body" style={{ gap: '4px' }}>
                    {content}
                    
                    {isClosing && (
                        <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0, marginBottom: 0 }}>Encerrar {type === 'ticket' ? 'chamado' : 'atividade'}</h3>
                            
                            <div className="modal-input-group">
                                <label className="modal-label">Status de encerramento *</label>
                                <CustomSelect
                                    value={closeStatus}
                                    onChange={(val) => setCloseStatus(val)}
                                    placeholder="Selecione um status..."
                                    options={type === 'ticket' ? [
                                        { value: 'RESOLVIDO', label: 'Resolvido' },
                                        { value: 'FECHADO', label: 'Fechado' }
                                    ] : [
                                        { value: 'COMPLETED', label: 'Concluída' },
                                        { value: 'CANCELLED', label: 'Cancelada' }
                                    ]}
                                />
                            </div>

                            <div className="modal-input-group">
                                <label className="modal-label">Notas de encerramento *</label>
                                <textarea 
                                    value={closingNotes} 
                                    onChange={(e) => setClosingNotes(e.target.value)}
                                    className="modal-textarea"
                                    style={{ minHeight: '80px' }}
                                    placeholder="Descreva os detalhes do encerramento..."
                                />
                            </div>

                            {type === 'ticket' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label className="modal-label">Fotos de evidência de fechamento (Máx. 3 fotos)</label>
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
                                        className="modal-input"
                                        style={{ padding: '8px 12px' }}
                                        disabled={isSubmitting}
                                    />
                                    {closingFiles.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                            {closingFiles.map((file, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px', fontWeight: 500, color: 'var(--text-main)' }}>{file.name}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setClosingFiles(prev => prev.filter((_, i) => i !== idx))} 
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
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

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsClosing(false)} className="secondary-btn" style={{ height: '36px', borderRadius: '10px' }} disabled={isSubmitting}>Cancelar</button>
                                <button onClick={handleCloseSubmit} className="primary-btn" style={{ height: '36px', borderRadius: '10px', backgroundColor: '#10b981' }} disabled={isSubmitting || !closeStatus || !closingNotes.trim()}>
                                    {isSubmitting ? 'Enviando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    {isAdminOrSindico && (type === 'activity' || type === 'ticket') && !isClosing && 
                     !['COMPLETED', 'CANCELLED', 'RESOLVED', 'CLOSED', 'RESOLVIDO', 'FECHADO'].includes((item as any).status) && (
                        <button onClick={() => setIsClosing(true)} className="secondary-btn" style={{ height: '42px', borderRadius: '12px', border: '1px solid #ef4444', color: '#ef4444', marginRight: 'auto' }}>Encerrar</button>
                    )}
                    <button onClick={onClose} className="primary-btn" style={{ height: '42px', borderRadius: '12px' }}>Fechar</button>
                </div>
            </div>
        </div>
    );
};
