import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Search, Shield, ShieldCheck, User, Users } from 'lucide-react';
import UserService from '../services/userService';
import api from '../services/api';
import '../styles/dashboard.css';

export const AdminUsersPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
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
      setMessage({ type: 'error', text: 'Informe o ID do usuário.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await UserService.changeUserRole(userId, selectedRole);
      setMessage({ type: 'success', text: `Papel do usuário atualizado com sucesso para ${response.role}!` });
      
      // Atualiza o estado local para refletir nos indicadores imediatamente
      setUsers(prevUsers => prevUsers.map(u => 
        u.id === userId ? { ...u, role: response.role } : u
      ));
      
      setUserId('');
      setSearchTerm('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Ocorreu um erro ao tentar atualizar o papel do usuário.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <div className="page-header">
          <h2 className="page-title">Controle de Acessos</h2>
        </div>

        {/* Estatísticas Rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-24)', marginBottom: 'var(--space-32)' }}>
            <div className="building-card" style={{ padding: 'var(--space-24)', gap: 'var(--space-8)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Total de Usuários</span>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{users.length}</span>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="#4f46e5" />
                </div>
            </div>
            
            <div className="building-card" style={{ padding: 'var(--space-24)', gap: 'var(--space-8)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Administradores</span>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{users.filter(u => u.role === 'ADMIN').length}</span>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={24} color="#ef4444" />
                </div>
            </div>

            <div className="building-card" style={{ padding: 'var(--space-24)', gap: 'var(--space-8)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>Síndicos</span>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1 }}>{users.filter(u => u.role === 'SINDICO').length}</span>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={24} color="#10b981" />
                </div>
            </div>
        </div>

        {/* Área de Gerenciamento */}
        <div style={{ maxWidth: '860px', margin: '0 auto', width: '100%' }}>
          <div className="building-card" style={{ margin: 0 }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-16)', marginBottom: 'var(--space-24)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={22} color="var(--color-accent)" />
                Atribuição de Papéis
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Busque um usuário pelo nome, e-mail ou ID e altere seu nível de permissão no sistema.
              </p>
            </div>

            {message && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: message.type === 'success' ? '#166534' : '#991b1b',
              }}>
                {message.type === 'success' ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Buscar Usuário (Nome, Email ou ID)
                </label>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setUserId(e.target.value);
                    }}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    placeholder="Digite para buscar..."
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 38px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.875rem',
                      transition: 'border-color 0.2s',
                    }}
                  />
                  
                  {isSearchFocused && users.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      maxHeight: '260px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      boxShadow: 'var(--shadow-lg)'
                    }}>
                      {filteredUsers.map(u => (
                        <div 
                          key={u.id}
                          onClick={() => {
                            setUserId(u.id);
                            setSearchTerm(u.name);
                            if (u.role === 'ADMIN' || u.role === 'SINDICO' || u.role === 'MORADOR') {
                              setSelectedRole(u.role);
                            }
                            setIsSearchFocused(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border-light)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: userId === u.id ? 'var(--bg-hover)' : 'transparent',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = userId === u.id ? 'var(--bg-hover)' : 'transparent'}
                        >
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                            {u.name ? u.name.substring(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '2px' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: u.role === 'ADMIN' ? 'var(--color-accent-light)' : u.role === 'SINDICO' ? 'var(--status-green-bg)' : 'var(--bg-hover)',
                            color: u.role === 'ADMIN' ? 'var(--color-accent-hover)' : u.role === 'SINDICO' ? 'var(--status-green)' : 'var(--text-secondary)'
                          }}>
                            {u.role}
                          </div>
                        </div>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          Nenhum usuário encontrado para "<span style={{fontWeight: 600}}>{searchTerm}</span>"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {userId && userId !== searchTerm && (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    ID Selecionado: <span style={{ fontFamily: 'monospace' }}>{userId}</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', marginTop: '8px' }}>
                  Novo Papel (Role)
                </label>
                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                  
                  {/* ADMIN Radio */}
                  <label 
                    style={{ 
                      display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', 
                      border: `2px solid ${selectedRole === 'ADMIN' ? 'var(--color-accent)' : 'var(--border-color)'}`, 
                      borderRadius: '12px', cursor: 'pointer', 
                      backgroundColor: selectedRole === 'ADMIN' ? 'var(--color-accent-light)' : 'var(--bg-surface)',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedRole === 'ADMIN' ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none'
                    }}
                    onMouseEnter={(e) => { if(selectedRole !== 'ADMIN') { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; } }}
                    onMouseLeave={(e) => { if(selectedRole !== 'ADMIN') { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; } }}
                  >
                    <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedRole === 'ADMIN' ? 'var(--color-accent)' : '#94a3b8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', transition: 'all 0.2s' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', opacity: selectedRole === 'ADMIN' ? 1 : 0, transition: 'opacity 0.2s' }} />
                    </div>
                    <input type="radio" name="role" value="ADMIN" checked={selectedRole === 'ADMIN'} onChange={() => setSelectedRole('ADMIN')} style={{ display: 'none' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <ShieldAlert size={18} color={selectedRole === 'ADMIN' ? 'var(--color-accent)' : '#64748b'} />
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: selectedRole === 'ADMIN' ? 'var(--color-accent-hover)' : 'var(--text-main)' }}>Administrador</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: selectedRole === 'ADMIN' ? '#4338ca' : 'var(--text-secondary)', lineHeight: 1.5 }}>Acesso irrestrito. Pode criar condomínios e gerenciar permissões de todos os usuários.</div>
                    </div>
                  </label>

                  {/* SINDICO Radio */}
                  <label 
                    style={{ 
                      display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', 
                      border: `2px solid ${selectedRole === 'SINDICO' ? 'var(--color-accent)' : 'var(--border-color)'}`, 
                      borderRadius: '12px', cursor: 'pointer', 
                      backgroundColor: selectedRole === 'SINDICO' ? 'var(--color-accent-light)' : 'var(--bg-surface)',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedRole === 'SINDICO' ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none'
                    }}
                    onMouseEnter={(e) => { if(selectedRole !== 'SINDICO') { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; } }}
                    onMouseLeave={(e) => { if(selectedRole !== 'SINDICO') { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; } }}
                  >
                    <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedRole === 'SINDICO' ? 'var(--color-accent)' : '#94a3b8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', transition: 'all 0.2s' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', opacity: selectedRole === 'SINDICO' ? 1 : 0, transition: 'opacity 0.2s' }} />
                    </div>
                    <input type="radio" name="role" value="SINDICO" checked={selectedRole === 'SINDICO'} onChange={() => setSelectedRole('SINDICO')} style={{ display: 'none' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <ShieldCheck size={18} color={selectedRole === 'SINDICO' ? 'var(--color-accent)' : '#64748b'} />
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: selectedRole === 'SINDICO' ? 'var(--color-accent-hover)' : 'var(--text-main)' }}>Síndico</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: selectedRole === 'SINDICO' ? '#4338ca' : 'var(--text-secondary)', lineHeight: 1.5 }}>Pode gerenciar prédios e visualizar métricas financeiras. Não gerencia outros administradores.</div>
                    </div>
                  </label>

                  {/* MORADOR Radio */}
                  <label 
                    style={{ 
                      display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', 
                      border: `2px solid ${selectedRole === 'MORADOR' ? 'var(--color-accent)' : 'var(--border-color)'}`, 
                      borderRadius: '12px', cursor: 'pointer', 
                      backgroundColor: selectedRole === 'MORADOR' ? 'var(--color-accent-light)' : 'var(--bg-surface)',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedRole === 'MORADOR' ? '0 4px 12px rgba(79, 70, 229, 0.15)' : 'none'
                    }}
                    onMouseEnter={(e) => { if(selectedRole !== 'MORADOR') { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; } }}
                    onMouseLeave={(e) => { if(selectedRole !== 'MORADOR') { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; } }}
                  >
                    <div style={{ position: 'relative', width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${selectedRole === 'MORADOR' ? 'var(--color-accent)' : '#94a3b8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', transition: 'all 0.2s' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', opacity: selectedRole === 'MORADOR' ? 1 : 0, transition: 'opacity 0.2s' }} />
                    </div>
                    <input type="radio" name="role" value="MORADOR" checked={selectedRole === 'MORADOR'} onChange={() => setSelectedRole('MORADOR')} style={{ display: 'none' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <User size={18} color={selectedRole === 'MORADOR' ? 'var(--color-accent)' : '#64748b'} />
                        <span style={{ fontWeight: 600, fontSize: '1rem', color: selectedRole === 'MORADOR' ? 'var(--color-accent-hover)' : 'var(--text-main)' }}>Morador</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: selectedRole === 'MORADOR' ? '#4338ca' : 'var(--text-secondary)', lineHeight: 1.5 }}>Acesso básico. Visualiza comunicados, reservas e pode abrir chamados para a administração.</div>
                    </div>
                  </label>

                </div>
              </div>

              <button 
                type="submit" 
                className="primary-btn" 
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}
              >
                <Shield size={18} />
                {loading ? 'Atualizando...' : 'Atualizar Papel de Usuário'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
