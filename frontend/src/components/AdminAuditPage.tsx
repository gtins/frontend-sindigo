import React, { useState, useEffect } from 'react';
import { Eye, Activity, Calendar, Globe, Server, RotateCw, User, Copy, Check, ChevronLeft, ChevronRight, X, Search } from 'lucide-react';
import api from '../services/api';
import '../styles/dashboard.css';

interface AuditLog {
  id: number;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceName: string;
  resourceId: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  userAgent: string;
  httpStatus: number;
}

export const AdminAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterResource, setFilterResource] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  
  // Copy to clipboard state
  const [copiedId, setCopiedId] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/audit');
      const data = response.data.content || response.data;
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Reset pagination when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterAction, filterResource, searchTerm]);

  const getActionColor = (action: string) => {
    switch(action?.toUpperCase()) {
      case 'CREATE': 
      case 'CRIADO':
        return { bg: '#dcfce7', text: '#15803d' };
      case 'UPDATE': 
      case 'ATUALIZADO':
        return { bg: '#e0e7ff', text: '#4338ca' };
      case 'DELETE': 
      case 'EXCLUÍDO':
        return { bg: '#fee2e2', text: '#b91c1c' };
      default: 
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const getActionLabel = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'CREATE': return 'Criado';
      case 'UPDATE': return 'Atualizado';
      case 'DELETE': return 'Excluído';
      default: return action || 'Ação';
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return '#10b981'; // green
    if (status >= 400 && status < 500) return '#f97316'; // orange
    if (status >= 500) return '#ef4444'; // red
    return '#64748b'; // slate
  };

  const formatAuditValue = (valueStr: string) => {
    if (!valueStr) return null;
    
    try {
      const parsed = JSON.parse(valueStr);
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(parsed).map(([key, val]) => (
              <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, auto) 1fr', gap: '12px', borderBottom: '1px dashed currentColor', paddingBottom: '4px', opacity: 0.9 }}>
                <span style={{ fontWeight: 700 }}>{key}:</span>
                <span style={{ wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.85em' }}>
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {
      // Fallback
    }
    
    return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>{valueStr}</div>;
  };

  const formatDateTime = (dateVal: any) => {
    if (!dateVal) return 'Data indisponível';
    
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second).toLocaleString();
    }
    
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Formato inválido';
    return d.toLocaleString();
  };

  const getSplitDateTime = (dateVal: any) => {
    const fullStr = formatDateTime(dateVal);
    if (fullStr.includes(', ')) {
      const [date, time] = fullStr.split(', ');
      return { date, time };
    }
    if (fullStr.includes(' ')) {
      const [date, time] = fullStr.split(' ');
      return { date, time };
    }
    return { date: fullStr, time: '' };
  };

  const isSystemUser = (log: AuditLog) => {
    const email = log.userEmail?.toLowerCase() || '';
    const uid = log.userId?.toLowerCase() || '';
    return email === 'sistema' || uid === 'sistema' || (!log.userEmail && !log.userId);
  };

  const handleCopyId = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(''), 2000);
  };

  // Filter logs on client side
  const filteredLogs = logs.filter(log => {
    if (filterAction && log.action?.toUpperCase() !== filterAction.toUpperCase()) {
      return false;
    }
    if (filterResource && log.resourceName?.toUpperCase() !== filterResource.toUpperCase()) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchEmail = log.userEmail?.toLowerCase().includes(term);
      const matchUserId = log.userId?.toLowerCase().includes(term);
      const matchResourceName = log.resourceName?.toLowerCase().includes(term);
      const matchResourceId = log.resourceId?.toLowerCase().includes(term);
      const matchAction = log.action?.toLowerCase().includes(term);
      const matchIp = log.ipAddress?.toLowerCase().includes(term);
      const matchUserAgent = log.userAgent?.toLowerCase().includes(term);
      
      if (!matchEmail && !matchUserId && !matchResourceName && !matchResourceId && !matchAction && !matchIp && !matchUserAgent) {
        return false;
      }
    }
    return true;
  });

  // Pagination indexing
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredLogs.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(Math.ceil(filteredLogs.length / recordsPerPage), 1);

  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <div className="page-header" style={{ marginBottom: 'var(--space-24)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Activity size={22} color="var(--color-accent)" />
              </div>
              <h2 className="page-title" style={{ margin: 0 }}>Auditoria de Sistema</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Acompanhe ações realizadas no sistema, status das operações e detalhes de auditoria.
            </p>
          </div>
        </div>

        {/* Card de Filtros */}
        <div className="building-card" style={{ marginBottom: 'var(--space-24)', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
            
            {/* Search Input */}
            <div style={{ flex: '1 1 280px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por usuário, recurso ou ID..."
                className="audit-filter-input"
              />
            </div>
            
            {/* Select Action */}
            <select 
              value={filterAction} 
              onChange={(e) => setFilterAction(e.target.value)}
              className="audit-filter-select"
            >
              <option value="">Todas as ações</option>
              <option value="CREATE">Criado (CREATE)</option>
              <option value="UPDATE">Atualizado (UPDATE)</option>
              <option value="DELETE">Excluído (DELETE)</option>
            </select>

            {/* Select Resource */}
            <select 
              value={filterResource} 
              onChange={(e) => setFilterResource(e.target.value)}
              className="audit-filter-select"
            >
              <option value="">Todos os recursos</option>
              <option value="USER">Usuários</option>
              <option value="CONDOMINIUM">Condomínios</option>
              <option value="TICKET">Chamados</option>
              <option value="RESERVATION">Reservas</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || filterAction || filterResource) && (
              <button 
                className="secondary-btn" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterAction('');
                  setFilterResource('');
                }}
                style={{ padding: '8px 16px', fontSize: '0.875rem', height: '38px' }}
              >
                Limpar filtros
              </button>
            )}

            {/* Refresh */}
            <button 
              className="primary-btn" 
              onClick={fetchLogs} 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.875rem', height: '38px', marginLeft: 'auto' }}
            >
              <RotateCw size={14} className={loading ? 'spin-animation' : ''} />
              Atualizar logs
            </button>
          </div>

          <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
            Exibindo <strong>{filteredLogs.length}</strong> {filteredLogs.length === 1 ? 'registro encontrado' : 'registros encontrados'}.
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="building-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Data e hora</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Usuário</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Ação</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Recurso</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.825rem' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.825rem', width: '120px' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <RotateCw size={24} className="spin-animation" style={{ display: 'block', margin: '0 auto 12px auto', color: 'var(--color-accent)' }} />
                      Carregando logs de auditoria...
                    </td>
                  </tr>
                ) : currentRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Nenhum registro encontrado com estes filtros.
                    </td>
                  </tr>
                ) : (
                  currentRecords.map((log) => {
                    const actionColors = getActionColor(log.action);
                    const dt = getSplitDateTime(log.timestamp || (log as any).createdAt || (log as any).dataHora);
                    const isSys = isSystemUser(log);
                    return (
                      <tr key={log.id} className="audit-table-row">
                        
                        {/* Data e Hora */}
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <Calendar size={14} color="var(--text-light)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <div>
                              <div style={{ fontWeight: 600, lineHeight: '1.2' }}>{dt.date}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{dt.time}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Usuário */}
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                          {isSys ? (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                              <Server size={14} color="var(--text-light)" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 600, lineHeight: '1.2' }}>Sistema</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '2px' }}>Automático</div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <User size={14} color="var(--color-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)', lineHeight: '1.2' }} title={log.userEmail}>{log.userEmail || 'Usuário'}</div>
                                {log.userId && (
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontFamily: 'monospace', marginTop: '2px' }} title={log.userId}>
                                    #{log.userId.substring(0, 8)}...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Ação */}
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ 
                            padding: '3px 8px', 
                            borderRadius: '20px', 
                            fontSize: '0.7rem', 
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                            backgroundColor: actionColors.bg,
                            color: actionColors.text
                          }}>
                            {getActionLabel(log.action)}
                          </span>
                        </td>

                        {/* Recurso */}
                        <td style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                            {log.resourceName === 'USER' ? 'Usuário' : 
                             log.resourceName === 'CONDOMINIUM' ? 'Condomínio' :
                             log.resourceName === 'TICKET' ? 'Chamado' :
                             log.resourceName === 'RESERVATION' ? 'Reserva' : 
                             log.resourceName || 'Sem recurso'}
                          </div>
                          {log.resourceId ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>
                                #{log.resourceId.substring(0, 8)}...
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleCopyId(e, log.resourceId)}
                                className="audit-copy-btn"
                                title="Copiar ID completo"
                              >
                                {copiedId === log.resourceId ? <Check size={11} color="var(--status-green)" /> : <Copy size={11} />}
                              </button>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                              Sem recurso
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '10px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: getStatusColor(log.httpStatus) }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(log.httpStatus), display: 'inline-block' }}></span>
                            <span>
                              {log.httpStatus >= 200 && log.httpStatus < 300 ? 'Sucesso' : 'Erro'} · {log.httpStatus || 200}
                            </span>
                          </div>
                        </td>

                        {/* Detalhes */}
                        <td style={{ padding: '10px 16px' }}>
                          <button 
                            className="audit-details-btn" 
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye size={13} />
                            Detalhes
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {!loading && filteredLogs.length > 0 && (
            <div className="audit-pagination-container">
              <div className="audit-pagination-info">
                Exibindo <strong>{indexOfFirstRecord + 1}</strong> a{' '}
                <strong>{Math.min(indexOfLastRecord, filteredLogs.length)}</strong> de{' '}
                <strong>{filteredLogs.length}</strong> registros
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Itens por página:</span>
                  <select
                    value={recordsPerPage}
                    onChange={(e) => {
                      setRecordsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="audit-page-size-select"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="audit-pagination-buttons">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="audit-nav-page-btn"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="audit-nav-page-btn"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIDE DRAWER DE DETALHES */}
      <div className={`drawer-overlay ${selectedLog ? 'open' : ''}`} onClick={() => setSelectedLog(null)}>
        <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
          {selectedLog && (
            <>
              {/* Header */}
              <div className="drawer-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={20} color="var(--color-accent)" />
                  <h3 className="drawer-title">Detalhes da Operação</h3>
                </div>
                <button onClick={() => setSelectedLog(null)} className="drawer-close-btn">
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="drawer-body">
                
                {/* Meta Section */}
                <div className="drawer-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      backgroundColor: getActionColor(selectedLog.action).bg,
                      color: getActionColor(selectedLog.action).text
                    }}>
                      {getActionLabel(selectedLog.action)}
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: getStatusColor(selectedLog.httpStatus) }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(selectedLog.httpStatus), display: 'inline-block' }}></span>
                      Status: {selectedLog.httpStatus || 200}
                    </div>
                  </div>

                  <div className="drawer-meta-item">
                    <Calendar size={14} className="drawer-meta-icon" />
                    <div>
                      <div className="drawer-meta-label">Data e hora completa</div>
                      <div className="drawer-meta-val">
                        {formatDateTime(selectedLog.timestamp || (selectedLog as any).createdAt || (selectedLog as any).dataHora)}
                      </div>
                    </div>
                  </div>

                  <div className="drawer-meta-item">
                    <User size={14} className="drawer-meta-icon" />
                    <div>
                      <div className="drawer-meta-label">Usuário</div>
                      <div className="drawer-meta-val" style={{ fontWeight: 600 }}>{selectedLog.userEmail || 'Sistema (Automático)'}</div>
                      {selectedLog.userId && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontFamily: 'monospace', marginTop: '2px' }}>
                          ID: {selectedLog.userId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resource Section */}
                <div className="drawer-section">
                  <h4 className="drawer-section-title">Contexto do Recurso</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Recurso:</span>{' '}
                      <strong>{selectedLog.resourceName}</strong>
                    </div>
                    {selectedLog.resourceId ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>ID do Recurso:</span>{' '}
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                          {selectedLog.resourceId}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, selectedLog.resourceId)}
                          className="audit-copy-btn"
                          style={{ marginLeft: '6px' }}
                          title="Copiar ID completo"
                        >
                          {copiedId === selectedLog.resourceId ? <Check size={12} color="var(--status-green)" /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                        Nenhum recurso ID registrado.
                      </div>
                    )}
                  </div>
                </div>

                {/* Network / Origin Section */}
                <div className="drawer-section">
                  <h4 className="drawer-section-title">Informações de Origem</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <Globe size={14} style={{ color: 'var(--text-light)', marginTop: '2px' }} />
                      <div>
                        <div className="drawer-meta-label">Endereço IP</div>
                        <div className="drawer-meta-val" style={{ fontFamily: 'monospace' }}>
                          {selectedLog.ipAddress || 'Não disponível'}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <Server size={14} style={{ color: 'var(--text-light)', marginTop: '2px' }} />
                      <div>
                        <div className="drawer-meta-label">User Agent (Navegador/Dispositivo)</div>
                        <div className="drawer-meta-val" style={{ fontSize: '0.775rem', lineHeight: 1.4, wordBreak: 'break-all' }}>
                          {selectedLog.userAgent || 'Não disponível'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modified Values */}
                {selectedLog.oldValue && (
                  <div className="drawer-section" style={{ borderBottom: 'none' }}>
                    <h4 className="drawer-section-title" style={{ color: '#b91c1c' }}>Valor Anterior (Antes)</h4>
                    <div className="json-container old">
                      {formatAuditValue(selectedLog.oldValue)}
                    </div>
                  </div>
                )}

                {selectedLog.newValue && (
                  <div className="drawer-section" style={{ borderBottom: 'none' }}>
                    <h4 className="drawer-section-title" style={{ color: '#15803d' }}>Novo Valor (Depois)</h4>
                    <div className="json-container new">
                      {formatAuditValue(selectedLog.newValue)}
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="drawer-footer">
                <button className="primary-btn" onClick={() => setSelectedLog(null)} style={{ width: '100%', justifyContent: 'center' }}>
                  Fechar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        /* Custom Inputs */
        .audit-filter-input {
          width: 100%;
          height: 38px;
          padding: 0 12px 0 38px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: var(--bg-surface) !important;
          color: var(--text-main) !important;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s ease-in-out;
        }
        
        .audit-filter-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }

        .audit-filter-select {
          height: 38px;
          padding: 0 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: var(--bg-surface) !important;
          color: var(--text-main) !important;
          font-size: 0.875rem;
          outline: none;
          min-width: 150px;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .audit-filter-select:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }

        .spin-animation {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Table details styles */
        .audit-table-row {
          border-bottom: 1px solid var(--border-light);
          transition: background-color 0.2s;
        }

        .audit-table-row:hover {
          background-color: var(--bg-hover);
        }

        .audit-copy-btn {
          border: none;
          background: transparent;
          padding: 2px;
          color: var(--text-light);
          cursor: pointer;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .audit-copy-btn:hover {
          background-color: var(--bg-hover);
          color: var(--color-accent);
        }

        .audit-details-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-accent);
          background-color: var(--color-accent-light);
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }
        .audit-details-btn:hover {
          background-color: var(--color-accent);
          color: white;
          transform: translateY(-1px);
        }

        /* Pagination Styling */
        .audit-pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-16) var(--space-24);
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          flex-wrap: wrap;
          gap: 16px;
        }
        .audit-pagination-info {
          font-size: 0.825rem;
          color: var(--text-secondary);
        }
        .audit-page-size-select {
          height: 30px;
          padding: 0 4px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: var(--bg-surface);
          color: var(--text-main);
          font-size: 0.8rem;
          outline: none;
          cursor: pointer;
        }
        .audit-pagination-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .audit-nav-page-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .audit-nav-page-btn:hover:not(:disabled) {
          background-color: var(--bg-hover);
          border-color: #cbd5e1;
        }
        .audit-nav-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Side Drawer Styling */
        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0);
          backdrop-filter: blur(0px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          pointer-events: none;
          transition: all 0.25s ease-in-out;
        }

        .drawer-overlay.open {
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          pointer-events: auto;
        }

        .drawer-content {
          width: 100%;
          max-width: 480px;
          height: 100%;
          background-color: var(--bg-surface);
          box-shadow: -4px 0 24px rgba(15, 23, 42, 0.15);
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.25s ease-in-out;
        }

        .drawer-overlay.open .drawer-content {
          transform: translateX(0);
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-16) var(--space-24);
          border-bottom: 1px solid var(--border-color);
        }

        .drawer-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }

        .drawer-close-btn {
          border: none;
          background: transparent;
          color: var(--text-light);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .drawer-close-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-main);
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-20) var(--space-24);
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
        }

        .drawer-section {
          padding-bottom: var(--space-16);
          border-bottom: 1px solid var(--border-light);
        }

        .drawer-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          margin-top: 0;
        }

        .drawer-meta-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .drawer-meta-icon {
          color: var(--text-light);
          margin-top: 3px;
          flex-shrink: 0;
        }

        .drawer-meta-label {
          font-size: 0.72rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          font-weight: 600;
        }

        .drawer-meta-val {
          font-size: 0.85rem;
          color: var(--text-main);
          margin-top: 1px;
        }

        .json-container {
          padding: var(--space-12);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          overflow-x: auto;
          max-height: 220px;
          overflow-y: auto;
          border: 1px solid;
          margin-top: 8px;
        }

        .json-container.old {
          background-color: #fff5f5;
          border-color: #fee2e2;
          color: #991b1b;
        }

        .json-container.new {
          background-color: #f0fdf4;
          border-color: #dcfce7;
          color: #15803d;
        }

        .drawer-footer {
          padding: var(--space-16) var(--space-24);
          border-top: 1px solid var(--border-color);
          background-color: #f8fafc;
        }
      `}</style>

    </div>
  );
};

export default AdminAuditPage;
