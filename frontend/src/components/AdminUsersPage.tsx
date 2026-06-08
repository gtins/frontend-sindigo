import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Search, Shield, ShieldCheck, User, Users } from 'lucide-react';
import UserService from '../services/userService';
import api from '../services/api';
import '../styles/dashboard.css';

export const AdminUsersPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'SINDICO' | 'MORADOR'>('MORADOR');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/user/all');
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.id && u.id.includes(searchTerm))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setMessage({ type: 'error', text: 'Selecione um usuário para alterar o papel.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await UserService.changeUserRole(userId, selectedRole);
      setMessage({ type: 'success', text: `Papel de ${selectedUser?.name || 'usuário'} atualizado com sucesso para ${response.role}!` });
      
      // Atualiza o estado local para refletir nos indicadores e listas imediatamente
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, role: response.role } : u
      ));
      
      setSelectedUser(selectedUser ? { ...selectedUser, role: response.role } : null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Ocorreu um erro ao tentar atualizar o papel do usuário.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    setUserId(u.id);
    setSelectedRole(u.role as any);
    setMessage(null);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setUserId('');
    setMessage(null);
  };

  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <div className="page-header" style={{ marginBottom: 'var(--space-24)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Shield size={22} color="var(--color-accent)" />
              </div>
              <h2 className="page-title" style={{ margin: 0 }}>Controle de Acessos</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Gerencie permissões e papéis dos usuários cadastrados no sistema.
            </p>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-20)', marginBottom: 'var(--space-24)' }}>
          <div className="building-card" style={{ padding: 'var(--space-16) var(--space-20)', gap: 'var(--space-8)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 'auto' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>Total de Usuários</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{users.length}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Usuários cadastrados</span>
            </div>
            <div className="stat-icon-violet" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="currentColor" />
            </div>
          </div>
          
          <div className="building-card" style={{ padding: 'var(--space-16) var(--space-20)', gap: 'var(--space-8)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 'auto' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>Administradores</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{users.filter(u => u.role === 'ADMIN').length}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Acesso total</span>
            </div>
            <div className="stat-icon-blue" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={20} color="currentColor" />
            </div>
          </div>

          <div className="building-card" style={{ padding: 'var(--space-16) var(--space-20)', gap: 'var(--space-8)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 'auto' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>Síndicos</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{users.filter(u => u.role === 'SINDICO').length}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>Gestores de condomínio</span>
            </div>
            <div className="stat-icon-cyan" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="currentColor" />
            </div>
          </div>
        </div>

        {/* Grid Principal do Redesenho */}
        <div className="access-control-grid">
          
          {/* Coluna Esquerda: Busca e Lista */}
          <div className="users-list-card">
            <h3 className="users-column-title">
              <Users size={18} color="var(--color-accent)" />
              Usuários do Sistema
            </h3>
            
            <div className="search-box-container">
              <label className="input-label">Buscar usuário</label>
              <div className="custom-search-wrapper">
                <Search size={18} className="custom-search-icon" />
                <input
                  type="text"
                  className="custom-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou ID..."
                />
              </div>
            </div>

            <div className="users-scroll-list">
              {filteredUsers.map(u => {
                const isSelected = selectedUser && selectedUser.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`user-list-item ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="user-avatar">
                      {u.name ? u.name.substring(0, 2).toUpperCase() : 'US'}
                    </div>
                    <div className="user-info">
                      <div className="user-name" title={u.name}>{u.name}</div>
                      <div className="user-email" title={u.email}>{u.email}</div>
                    </div>
                    <span className={`user-role-badge ${u.role.toLowerCase()}`}>
                      {u.role === 'ADMIN' ? 'Admin' : u.role === 'SINDICO' ? 'Síndico' : 'Morador'}
                    </span>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="empty-search-results">
                  Nenhum usuário encontrado para "{searchTerm}"
                </div>
              )}
            </div>
          </div>

          {/* Coluna Direita: Atribuição de Papéis */}
          <div className="right-panel-container">
            {message && (
              <div className={`message-banner ${message.type}`}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
                <span>{message.text}</span>
              </div>
            )}

            {!selectedUser ? (
              <div className="empty-state-card">
                <Shield size={48} className="empty-shield-icon" />
                <h3>Nenhum usuário selecionado</h3>
                <p>Selecione um usuário na lista à esquerda para visualizar seu perfil e alterar suas permissões de acesso no sistema.</p>
              </div>
            ) : (
              <div className="action-panel-card">
                <div className="card-section-title">Usuário Selecionado</div>
                
                <div className="selected-user-profile">
                  <div className="user-avatar large">
                    {selectedUser.name ? selectedUser.name.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="selected-user-meta">
                    <h4>{selectedUser.name}</h4>
                    <p>{selectedUser.email}</p>
                    <div className="current-role-info">
                      Papel atual:{' '}
                      <span className={`user-role-badge ${selectedUser.role.toLowerCase()}`}>
                        {selectedUser.role === 'ADMIN' ? 'Admin' : selectedUser.role === 'SINDICO' ? 'Síndico' : 'Morador'}
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="clear-selection-btn"
                    onClick={handleClearSelection}
                  >
                    Desmarcar
                  </button>
                </div>

                <div className="card-section-title" style={{ marginTop: 'var(--space-24)' }}>Novo papel de acesso</div>
                
                <form onSubmit={handleSubmit}>
                  <div className="radio-cards-container">
                    
                    {/* Administrador */}
                    <label className={`radio-card ${selectedRole === 'ADMIN' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="ADMIN" 
                        checked={selectedRole === 'ADMIN'} 
                        onChange={() => setSelectedRole('ADMIN')} 
                      />
                      <div className="radio-indicator">
                        <div className="radio-dot" />
                      </div>
                      <div className="radio-content">
                        <div className="radio-title">
                          <ShieldAlert size={16} className="role-icon admin" />
                          Administrador
                        </div>
                        <div className="radio-description">Acesso total ao sistema.</div>
                      </div>
                    </label>

                    {/* Síndico */}
                    <label className={`radio-card ${selectedRole === 'SINDICO' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="SINDICO" 
                        checked={selectedRole === 'SINDICO'} 
                        onChange={() => setSelectedRole('SINDICO')} 
                      />
                      <div className="radio-indicator">
                        <div className="radio-dot" />
                      </div>
                      <div className="radio-content">
                        <div className="radio-title">
                          <ShieldCheck size={16} className="role-icon sindico" />
                          Síndico
                        </div>
                        <div className="radio-description">Gerencia prédios e métricas.</div>
                      </div>
                    </label>

                    {/* Morador */}
                    <label className={`radio-card ${selectedRole === 'MORADOR' ? 'active' : ''}`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="MORADOR" 
                        checked={selectedRole === 'MORADOR'} 
                        onChange={() => setSelectedRole('MORADOR')} 
                      />
                      <div className="radio-indicator">
                        <div className="radio-dot" />
                      </div>
                      <div className="radio-content">
                        <div className="radio-title">
                          <User size={16} className="role-icon morador" />
                          Morador
                        </div>
                        <div className="radio-description">Acesso básico a comunicados, reservas e chamados.</div>
                      </div>
                    </label>
                  </div>

                  {/* Confirmação de Segurança */}
                  {selectedRole !== selectedUser.role && (
                    <div className="safety-warning-banner">
                      <span>
                        ⚠️ Você está alterando o papel de <strong>{selectedUser.name}</strong> de <strong>{selectedUser.role === 'ADMIN' ? 'Administrador' : selectedUser.role === 'SINDICO' ? 'Síndico' : 'Morador'}</strong> para <strong>{selectedRole === 'ADMIN' ? 'Administrador' : selectedRole === 'SINDICO' ? 'Síndico' : 'Morador'}</strong>.
                      </span>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="primary-btn submit-role-btn" 
                    disabled={loading || selectedRole === selectedUser.role}
                  >
                    <Shield size={18} />
                    {loading ? 'Salvando...' : 'Salvar alteração'}
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        /* Grid Layout */
        .access-control-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-24);
          align-items: start;
          margin-top: var(--space-8);
        }

        @media (min-width: 992px) {
          .access-control-grid {
            grid-template-columns: 360px 1fr;
          }
        }

        /* Left Column: Users List */
        .users-list-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-20);
          box-shadow: var(--shadow-sm);
        }

        .users-column-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: var(--space-16);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Search Input Custom */
        .search-box-container {
          margin-bottom: var(--space-16);
        }

        .input-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .custom-search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .custom-search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-light);
          pointer-events: none;
        }

        .custom-search-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 38px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background-color: var(--bg-surface) !important;
          color: var(--text-main) !important;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s ease-in-out;
        }

        .custom-search-input::placeholder {
          color: #94a3b8;
        }

        .custom-search-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
        }

        /* Scrollable List */
        .users-scroll-list {
          max-height: 460px;
          overflow-y: auto;
          margin-top: var(--space-12);
          padding-right: 4px;
        }

        .users-scroll-list::-webkit-scrollbar {
          width: 6px;
        }
        .users-scroll-list::-webkit-scrollbar-track {
          background: transparent;
        }
        .users-scroll-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: var(--radius-full);
        }
        .users-scroll-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .user-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          margin-bottom: 8px;
          cursor: pointer;
          background-color: var(--bg-surface);
          transition: all 0.2s ease;
        }

        .user-list-item:hover {
          background-color: var(--bg-hover);
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .user-list-item.selected {
          background-color: #f5f3ff;
          border-color: var(--color-accent);
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.08);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #e0e7ff;
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .user-list-item.selected .user-avatar {
          background-color: var(--color-accent);
          color: white;
        }

        .user-info {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 1px;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Role badges */
        .user-role-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .user-role-badge.admin {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .user-role-badge.sindico {
          background-color: #dcfce7;
          color: #166534;
        }

        .user-role-badge.morador {
          background-color: #f1f5f9;
          color: #475569;
        }

        .empty-search-results {
          padding: var(--space-24) var(--space-16);
          text-align: center;
          color: var(--text-light);
          font-size: 0.85rem;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-sm);
        }

        /* Right Column: Panel */
        .right-panel-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }

        /* Empty State Card */
        .empty-state-card {
          background: var(--bg-surface);
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-48) var(--space-24);
          text-align: center;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 380px;
        }

        .empty-shield-icon {
          color: var(--text-light);
          opacity: 0.4;
        }

        .empty-state-card h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0;
        }

        .empty-state-card p {
          font-size: 0.85rem;
          color: var(--text-light);
          max-width: 320px;
          line-height: 1.5;
          margin: 0;
        }

        /* User Selected & Form Styles */
        .action-panel-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--space-24);
          box-shadow: var(--shadow-sm);
        }

        .card-section-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-12);
        }

        .selected-user-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: var(--space-12) var(--space-16);
          background-color: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-20);
        }

        .user-avatar.large {
          width: 44px;
          height: 44px;
          font-size: 1rem;
          background-color: var(--color-accent);
          color: white;
        }

        .selected-user-meta {
          flex: 1;
          min-width: 0;
        }

        .selected-user-meta h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 2px 0;
        }

        .selected-user-meta p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0 0 4px 0;
        }

        .current-role-info {
          font-size: 0.75rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .clear-selection-btn {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          padding: 5px 10px;
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }

        .clear-selection-btn:hover {
          background-color: #f1f5f9;
          color: var(--text-main);
          border-color: #94a3b8;
        }

        /* Radio Cards */
        .radio-cards-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
          margin-bottom: var(--space-20);
        }

        .radio-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          background-color: var(--bg-surface);
          transition: all 0.2s ease;
          position: relative;
        }

        .radio-card input[type="radio"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .radio-indicator {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .radio-card:hover .radio-indicator {
          border-color: #94a3b8;
        }

        .radio-card.active .radio-indicator {
          border-color: var(--color-accent);
        }

        .radio-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--color-accent);
          transform: scale(0);
          transition: transform 0.2s ease;
        }

        .radio-card.active .radio-dot {
          transform: scale(1);
        }

        .radio-card.active {
          border-color: var(--color-accent);
          background-color: #f5f3ff;
        }

        .radio-content {
          flex: 1;
        }

        .radio-title {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-main);
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .radio-card.active .radio-title {
          color: var(--color-accent-hover);
        }

        .role-icon {
          flex-shrink: 0;
        }

        .role-icon.admin {
          color: #ef4444;
        }
        .role-icon.sindico {
          color: #10b981;
        }
        .role-icon.morador {
          color: #64748b;
        }

        .radio-description {
          font-size: 0.775rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        /* Safety Banner */
        .safety-warning-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background-color: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: var(--radius-sm);
          color: #b45309;
          font-size: 0.8rem;
          margin-bottom: var(--space-20);
          line-height: 1.4;
        }

        /* Message Banner */
        .message-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.825rem;
          font-weight: 500;
          margin-bottom: var(--space-8);
        }

        .message-banner.success {
          background-color: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .message-banner.error {
          background-color: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        /* Submit btn */
        .submit-role-btn {
          width: 100%;
          height: 40px;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .submit-role-btn:disabled {
          background-color: #f1f5f9;
          color: #94a3b8;
          border-color: #e2e8f0;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Estilos específicos das estatísticas de Acesso */
        .stat-icon-violet {
          background-color: #f5f3ff;
          color: #7c3aed;
        }
        .stat-icon-blue {
          background-color: #dbeafe;
          color: #1d4ed8;
        }
        .stat-icon-cyan {
          background-color: #ecfeff;
          color: #0891b2;
        }

        /* Dark Mode Overrides */
        .dark .stat-icon-violet {
          background-color: rgba(124, 58, 237, 0.15) !important;
          color: #a78bfa !important;
        }
        .dark .stat-icon-blue {
          background-color: rgba(29, 78, 216, 0.15) !important;
          color: #60a5fa !important;
        }
        .dark .stat-icon-cyan {
          background-color: rgba(8, 145, 178, 0.15) !important;
          color: #67e8f9 !important;
        }
        .dark .user-role-badge.admin {
          background-color: rgba(239, 68, 68, 0.15) !important;
          color: #f87171 !important;
        }
        .dark .user-role-badge.sindico {
          background-color: rgba(16, 185, 129, 0.15) !important;
          color: #34d399 !important;
        }
        .dark .user-role-badge.morador {
          background-color: rgba(148, 163, 184, 0.15) !important;
          color: #94a3b8 !important;
        }
        .dark .selected-user-profile {
          background-color: var(--bg-surface-2) !important;
          border-color: var(--border-color) !important;
        }
        .dark .safety-warning-banner {
          background-color: rgba(245, 158, 11, 0.1) !important;
          border-color: rgba(245, 158, 11, 0.2) !important;
          color: #fbbf24 !important;
        }
        .dark .user-avatar {
          background-color: rgba(99, 102, 241, 0.15) !important;
          color: var(--color-primary) !important;
        }
        .dark .user-avatar.large {
          background-color: var(--color-primary) !important;
          color: white !important;
        }
        .dark .user-list-item.selected {
          background-color: rgba(99, 102, 241, 0.15) !important;
          border-color: var(--color-accent) !important;
        }
        .dark .radio-card.active {
          background-color: rgba(99, 102, 241, 0.1) !important;
          border-color: var(--color-accent) !important;
        }
      `}</style>
    </div>
  );
};

export default AdminUsersPage;
