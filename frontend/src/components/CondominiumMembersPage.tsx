import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Users, MoreVertical, CheckCircle2 } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import api from '../services/api';
import '../styles/dashboard.css';

interface Member {
  id: string;
  userId?: string;
  userName?: string;
  name?: string; // fallback
  userEmail?: string;
  email?: string; // fallback
  role?: string;
  joinedAt?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ToastMessage {
  id: number;
  text: string;
}

export const CondominiumMembersPage: React.FC = () => {
  const { id: condominiumId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Table search
  const [tableSearch, setTableSearch] = useState('');
  
  // Add Member search
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  
  const [condominiumName, setCondominiumName] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const userRole = localStorage.getItem('role') || 'MORADOR';
  const isAdmin = userRole === 'ADMIN';

  const showToast = (text: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const fetchData = async () => {
    if (!condominiumId) return;
    setLoading(true);
    try {
      const condo = await CondominiumService.getById(condominiumId);
      setCondominiumName(condo.name);

      const membersData = await CondominiumService.getMembers(condominiumId);
      setMembers(membersData);

      const usersResponse = await api.get('/user/all');
      setAllUsers(usersResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [condominiumId]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddMember = async (user: UserData) => {
    if (!condominiumId) return;
    setAddingId(user.id);
    setShowDropdown(false);
    try {
      await CondominiumService.addMember(condominiumId, user.id);
      showToast(`✓ ${user.name} vinculado com sucesso`);
      setSearchTerm('');
      await fetchData();
    } catch (error: any) {
      console.error('Erro ao adicionar morador:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar morador.');
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!condominiumId) return;
    if (!window.confirm(`Tem certeza que deseja remover ${userName} do condomínio?`)) return;

    try {
      await CondominiumService.removeMember(condominiumId, userId);
      showToast(`✓ Morador removido`);
      await fetchData();
    } catch (error: any) {
      console.error('Erro ao remover morador:', error);
      alert('Erro ao remover morador. Verifique suas permissões.');
    }
  };

  // Filter users for the dropdown
  const availableUsers = allUsers.filter(user => {
    const isAlreadyMember = members.some(m => (m.userId || m.id) === user.id);
    if (isAlreadyMember) return false;
    if (!searchTerm) return false;
    return user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter members for the table
  const filteredMembers = members.filter(member => {
    const memberName = member.userName || member.name || '';
    const memberEmail = member.userEmail || member.email || '';
    return memberName.toLowerCase().includes(tableSearch.toLowerCase()) || 
           memberEmail.toLowerCase().includes(tableSearch.toLowerCase());
  });

  const getRoleBadgeClass = (role: string) => {
    if (role === 'ADMIN') return 'role-badge admin';
    if (role === 'SINDICO') return 'role-badge sindico';
    return 'role-badge morador';
  };

  const getRoleLabel = (role: string) => {
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'SINDICO') return 'Síndico';
    return 'Morador';
  };

  if (loading) {
    return <div className="members-container"><p style={{ color: '#6B7280' }}>Carregando dados...</p></div>;
  }

  return (
    <div className="members-container">
      {/* Toasts */}
      {toasts.map((toast, index) => (
        <div key={toast.id} className="members-toast" style={{ top: `${24 + index * 60}px` }}>
          <CheckCircle2 size={18} color="#10B981" />
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{toast.text}</span>
        </div>
      ))}

      {/* Breadcrumb & Header */}
      <div className="members-breadcrumb">
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Condomínios</span>
        <ChevronRight size={12} />
        <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/buildings/${condominiumId}`)}>{condominiumName || 'Condomínio'}</span>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-main)' }}>Moradores</span>
      </div>

      <div className="members-page-header">
        <h1 className="members-title">Gerenciar moradores</h1>
        <p className="members-subtitle">Adicione, remova e gerencie moradores vinculados ao condomínio.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
        
        {/* Card 1: Moradores Vinculados */}
        <div className="members-card">
          <div className="members-card-header">
            <div className="members-card-title-group">
              <h2 className="members-card-title">Moradores vinculados</h2>
              <span className="members-count-badge">{members.length} {members.length === 1 ? 'morador' : 'moradores'}</span>
            </div>
            
            <div className="members-search-wrapper">
              <Search size={16} className="members-search-icon" />
              <input 
                type="text" 
                className="members-search-input" 
                placeholder="Buscar morador na tabela"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <div className="members-empty-state">
              <div className="members-empty-icon">
                <Users size={24} />
              </div>
              <h3 className="members-empty-title">Nenhum morador encontrado</h3>
              <p className="members-empty-text">A tabela está vazia ou a sua busca não retornou resultados.</p>
            </div>
          ) : (
            <div className="members-table-wrapper">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Role</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(member => {
                    const memberName = member.userName || member.name || 'Sem nome';
                    const memberEmail = member.userEmail || member.email || 'Sem email';
                    const memberRole = member.role || 'MORADOR';
                    const realUserId = member.userId || member.id;

                    return (
                    <tr key={member.id}>
                      <td style={{ fontWeight: 500 }}>{memberName}</td>
                      <td>{memberEmail}</td>
                      <td>
                        <span className={getRoleBadgeClass(memberRole)}>
                          {getRoleLabel(memberRole)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button 
                              className="members-action-btn"
                              onClick={() => {
                                // Simples menu de contexto improvisado para a refatoração.
                                // Em produção idealmente usaríamos um componente Dropdown Menu real (ex: Radix UI)
                                const opt = window.prompt("Digite 1 para Remover ou 2 para Editar Role:");
                                if (opt === '1') {
                                  handleRemoveMember(realUserId, memberName);
                                } else if (opt === '2') {
                                  alert("Ação de Editar Role em breve!");
                                }
                              }}
                              title="Ações"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Card 2: Vincular Novo Morador */}
        <div className="members-card" style={{ maxWidth: '600px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 className="members-card-title" style={{ marginBottom: '4px' }}>Vincular novo morador</h2>
            <p className="members-subtitle">Busque usuários cadastrados para vinculá-los ao condomínio.</p>
          </div>

          <div className="members-search-wrapper" style={{ width: '100%' }} ref={searchRef}>
            <Search size={16} className="members-search-icon" />
            <input 
              type="text" 
              className="members-search-input" 
              placeholder="Buscar morador por nome ou email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />

            {/* Autocomplete Dropdown */}
            {showDropdown && searchTerm && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ECECEC',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 10,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {availableUsers.length > 0 ? (
                  availableUsers.map(user => (
                    <div 
                      key={user.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => handleAddMember(user)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Avatar genérico */}
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          backgroundColor: '#EEF2FF', color: '#4338CA', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 600
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>{user.email}</div>
                        </div>
                      </div>
                      
                      <button 
                        className="modern-primary-btn" 
                        style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
                        disabled={addingId === user.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddMember(user);
                        }}
                      >
                        {addingId === user.id ? 'Vinculando...' : 'Vincular'}
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                    Nenhum usuário encontrado para "{searchTerm}".
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
