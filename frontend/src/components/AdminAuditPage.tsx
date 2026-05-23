import React, { useState, useEffect } from 'react';
import { Shield, Filter, Eye, Activity, Calendar, Globe, Server } from 'lucide-react';
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
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Aqui poderíamos ter lógica condicional baseada nos filtros
      // Por exemplo: if (filterAction) await api.get(`/admin/audit/action/${filterAction}`)
      // Mas para a primeira versão, vamos puxar o geral. O backend idealmente
      // aceitaria query parameters como ?action=CREATE&resourceName=USER
      const response = await api.get('/admin/audit');
      // Assume que o backend retorna a lista direto ou dentro de .content se for paginado (Spring Page)
      const data = response.data.content || response.data;
      setLogs(data);
    } catch (error) {
      console.error('Erro ao carregar auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterResource]);

  const getActionColor = (action: string) => {
    switch(action?.toUpperCase()) {
      case 'CREATE': return { bg: '#dcfce7', text: '#166534' };
      case 'UPDATE': return { bg: '#e0e7ff', text: '#3730a3' };
      case 'DELETE': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return '#10b981';
    if (status >= 400 && status < 500) return '#f59e0b';
    if (status >= 500) return '#ef4444';
    return '#64748b';
  };

  const formatAuditValue = (valueStr: string) => {
    if (!valueStr) return null;
    
    try {
      const parsed = JSON.parse(valueStr);
      if (typeof parsed === 'object' && parsed !== null) {
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(parsed).map(([key, val]) => (
              <div key={key} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '12px', borderBottom: '1px dashed currentColor', paddingBottom: '6px', opacity: 0.9 }}>
                <span style={{ fontWeight: 700 }}>{key}:</span>
                <span style={{ wordBreak: 'break-word', fontFamily: 'monospace', fontSize: '0.9em' }}>
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </span>
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {
      // Fallback para texto simples se não for JSON válido
    }
    
    return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace' }}>{valueStr}</div>;
  };

  const formatDateTime = (dateVal: any) => {
    if (!dateVal) return 'Data indisponível';
    
    // Lida com LocalDateTime array do Spring Boot: [year, month, day, hour, minute, second]
    if (Array.isArray(dateVal)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateVal;
      return new Date(year, month - 1, day, hour, minute, second).toLocaleString();
    }
    
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Formato inválido';
    return d.toLocaleString();
  };

  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <div className="page-header">
          <h2 className="page-title">
            <Activity size={28} color="var(--color-accent)" />
            Auditoria de Sistema
          </h2>
        </div>

        <div className="building-card" style={{ marginBottom: 'var(--space-24)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-16)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Filter size={18} />
              <span style={{ fontWeight: 600 }}>Filtros Rápidos:</span>
            </div>
            
            <select 
              value={filterAction} 
              onChange={(e) => setFilterAction(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            >
              <option value="">Todas as Ações</option>
              <option value="CREATE">Criação (CREATE)</option>
              <option value="UPDATE">Atualização (UPDATE)</option>
              <option value="DELETE">Exclusão (DELETE)</option>
            </select>

            <select 
              value={filterResource} 
              onChange={(e) => setFilterResource(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
            >
              <option value="">Todos os Recursos</option>
              <option value="USER">Usuários (User)</option>
              <option value="CONDOMINIUM">Condomínios (Condominium)</option>
              <option value="TICKET">Chamados (Ticket)</option>
              <option value="RESERVATION">Reservas (Reservation)</option>
            </select>

            <button className="secondary-btn" onClick={fetchLogs} style={{ marginLeft: 'auto' }}>
              Atualizar
            </button>
          </div>
        </div>

        <div className="building-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-body)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Data/Hora</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Usuário</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Ação</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Recurso</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Carregando logs de auditoria...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Nenhum registro encontrado com estes filtros.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const actionColors = getActionColor(log.action);
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="var(--text-light)" />
                            {formatDateTime(log.timestamp || (log as any).createdAt || (log as any).dataHora)}
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          <span style={{ fontWeight: 500 }}>{log.userEmail || log.userId || 'Sistema'}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            backgroundColor: actionColors.bg,
                            color: actionColors.text
                          }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          <span style={{ fontWeight: 600 }}>{log.resourceName || '-'}</span>
                          {log.resourceId && <span style={{ color: 'var(--text-light)', marginLeft: '6px', fontSize: '0.75rem' }}>#{log.resourceId}</span>}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: getStatusColor(log.httpStatus) }}>
                            {log.httpStatus === 200 || log.httpStatus === 201 ? <Shield size={16} /> : <Server size={16} />}
                            {log.httpStatus || 200}
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button 
                            className="secondary-btn" 
                            style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye size={16} /> Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE DETALHES */}
      {selectedLog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div className="building-card" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="var(--color-accent)" />
                Detalhes da Operação
              </h3>
              <button onClick={() => setSelectedLog(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'var(--bg-body)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Informações de Rede</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', marginBottom: '8px' }}>
                  <Globe size={16} color="var(--color-accent)" /> <span style={{ fontWeight: 500 }}>IP:</span> {selectedLog.ipAddress || 'Desconhecido'}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>User Agent:</span> {selectedLog.userAgent || 'Desconhecido'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-body)', padding: '16px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Contexto do Recurso</div>
                <div style={{ fontSize: '0.875rem', marginBottom: '4px' }}><span style={{ fontWeight: 500 }}>Recurso:</span> {selectedLog.resourceName}</div>
                <div style={{ fontSize: '0.875rem', marginBottom: '4px' }}><span style={{ fontWeight: 500 }}>ID Local:</span> {selectedLog.resourceId}</div>
                <div style={{ fontSize: '0.875rem' }}><span style={{ fontWeight: 500 }}>Operação:</span> {selectedLog.action}</div>
              </div>
            </div>

            {selectedLog.oldValue && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Valor Anterior (Antes)</div>
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '16px', borderRadius: '8px', fontSize: '0.875rem', overflowX: 'auto' }}>
                  {formatAuditValue(selectedLog.oldValue)}
                </div>
              </div>
            )}

            {selectedLog.newValue && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>Novo Valor (Depois)</div>
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '16px', borderRadius: '8px', fontSize: '0.875rem', overflowX: 'auto' }}>
                  {formatAuditValue(selectedLog.newValue)}
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="primary-btn" onClick={() => setSelectedLog(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAuditPage;
