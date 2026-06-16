import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Search, Users, MoreVertical, CheckCircle2, X, Edit2, Trash2 } from 'lucide-react';
import CondominiumService from '../services/condominiumService';
import UserService from '../services/userService';
import { CustomSelect } from './CustomSelect';
import api from '../services/api';
import '../styles/dashboard.css';
import '../styles/details.css';

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

  // Context dropdown & modals
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'SINDICO' | 'MORADOR'>('MORADOR');
  const [updatingRole, setUpdatingRole] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);

  useEffect(() => {
    if (showRemoveModal || showEditRoleModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showRemoveModal, showEditRoleModal]);

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

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      const target = event.target as HTMLElement;
      if (
        activeDropdownId && 
        !target.closest('.members-action-btn') && 
        !target.closest('.members-dropdown-menu')
      ) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownId]);

  const handleAddMember = async (user: UserData) => {
    if (!condominiumId) return;
    setAddingId(user.id);
    setShowDropdown(false);
    try {
      await CondominiumService.addMember(condominiumId, user.id);
      showToast(`${user.name} vinculado com sucesso`);
      setSearchTerm('');
      await fetchData();
    } catch (error: any) {
      console.error('Erro ao adicionar morador:', error);
      alert(error.response?.data?.message || 'Erro ao adicionar morador.');
    } finally {
      setAddingId(null);
    }
  };

  const handleEditRoleConfirm = async () => {
    if (!condominiumId || !selectedMember) return;
    const realUserId = selectedMember.userId || selectedMember.id;
    if (!realUserId) return;
    
    setUpdatingRole(true);
    try {
      await UserService.changeUserRole(realUserId, selectedRole);
      showToast(`Papel de ${selectedMember.userName || selectedMember.name} alterado para ${getRoleLabel(selectedRole)} com sucesso`);
      setShowEditRoleModal(false);
      setSelectedMember(null);
      await fetchData();
    } catch (error: any) {
      console.error('Erro ao alterar papel do morador:', error);
      alert(error.message || 'Erro ao alterar papel do morador.');
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!condominiumId || !selectedMember) return;
    const realUserId = selectedMember.userId || selectedMember.id;
    if (!realUserId) return;

    setRemovingMember(true);
    try {
      await CondominiumService.removeMember(condominiumId, realUserId);
      showToast(`Morador ${selectedMember.userName || selectedMember.name} removido com sucesso`);
      setShowRemoveModal(false);
      setSelectedMember(null);
      await fetchData();
    } catch (error: any) {
      console.error('Erro ao remover morador:', error);
      alert('Erro ao remover morador. Verifique suas permissões.');
    } finally {
      setRemovingMember(false);
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

  const getInitials = (name: string) => {
    const cleanName = name.trim();
    if (!cleanName) return '?';
    const parts = cleanName.split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getAvatarStyle = (role: string) => {
    if (role === 'ADMIN') {
      return { backgroundColor: 'var(--status-red-bg)', color: 'var(--status-red)' };
    }
    if (role === 'SINDICO') {
      return { backgroundColor: 'var(--status-green-bg)', color: 'var(--status-green)' };
    }
    return { backgroundColor: 'var(--bg-surface-2)', color: 'var(--text-secondary)' };
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
          <button 
            className="members-toast-close" 
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Breadcrumb & Header */}
      <div className="members-breadcrumb">
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Condomínios</span>
        <ChevronRight size={12} />
        <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/buildings/${condominiumId}`)}>{condominiumName || 'Condomínio'}</span>
        <ChevronRight size={12} />
        <span style={{ color: 'var(--text-main)' }}>Moradores</span>
      </div>

      <div className="members-page-header" style={{ padding: '8px 0 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={22} color="var(--color-accent)" />
            </div>
            <h1 className="members-title" style={{ margin: 0 }}>Gerenciar moradores</h1>
          </div>
          <p className="members-subtitle">Adicione, remova e gerencie moradores vinculados ao condomínio.</p>
        </div>
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
                    <th>Papel</th>
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
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 600,
                            flexShrink: 0,
                            ...getAvatarStyle(memberRole)
                          }}>
                            {getInitials(memberName)}
                          </div>
                          <span>{memberName}</span>
                        </div>
                      </td>
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
                                setActiveDropdownId(activeDropdownId === realUserId ? null : realUserId);
                              }}
                              title="Ações"
                            >
                              <MoreVertical size={16} />
                            </button>
                            
                            {activeDropdownId === realUserId && (
                              <div className="members-dropdown-menu">
                                <button 
                                  className="members-dropdown-item"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setSelectedRole(memberRole as 'ADMIN' | 'SINDICO' | 'MORADOR');
                                    setShowEditRoleModal(true);
                                    setActiveDropdownId(null);
                                  }}
                                >
                                  <Edit2 size={14} />
                                  Editar papel
                                </button>
                                <button 
                                  className="members-dropdown-item delete"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setShowRemoveModal(true);
                                    setActiveDropdownId(null);
                                  }}
                                >
                                  <Trash2 size={14} />
                                  Remover morador
                                </button>
                              </div>
                            )}
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
        <div className="members-card">
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
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
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
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => handleAddMember(user)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Avatar genérico */}
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 600
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{user.email}</div>
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

      {/* Modal: Editar Papel */}
      {showEditRoleModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowEditRoleModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Editar papel do morador</h3>
              <button className="modal-close-btn" onClick={() => setShowEditRoleModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                backgroundColor: 'var(--bg-surface-2)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>
                  {selectedMember.userName || selectedMember.name}
                </div>
                <div style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '4px' }}>
                  {selectedMember.userEmail || selectedMember.email}
                </div>
              </div>
              
              <div className="modal-input-group">
                <label className="modal-label">Papel</label>
                <CustomSelect
                  value={selectedRole}
                  onChange={(value) => setSelectedRole(value as 'ADMIN' | 'SINDICO' | 'MORADOR')}
                  options={[
                    { value: 'MORADOR', label: 'Morador' },
                    { value: 'SINDICO', label: 'Síndico' },
                    { value: 'ADMIN', label: 'Administrador' }
                  ]}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="action-btn" 
                onClick={() => setShowEditRoleModal(false)}
                disabled={updatingRole}
              >
                Cancelar
              </button>
              <button 
                className="modern-primary-btn" 
                onClick={handleEditRoleConfirm}
                disabled={updatingRole}
              >
                {updatingRole ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Remover Morador */}
      {showRemoveModal && selectedMember && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Remover morador</h3>
              <button className="modal-close-btn" onClick={() => setShowRemoveModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Tem certeza que deseja remover <strong>{selectedMember.userName || selectedMember.name}</strong> do condomínio?
              </p>
              <div style={{
                backgroundColor: 'var(--status-red-bg)',
                border: '1px solid var(--status-red-border)',
                borderRadius: '12px',
                padding: '12px 16px',
                color: 'var(--status-red)',
                fontSize: '13px',
                lineHeight: 1.4,
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span>Esta ação removerá o acesso do usuário às informações e áreas comuns deste condomínio.</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="action-btn" 
                onClick={() => setShowRemoveModal(false)}
                disabled={removingMember}
              >
                Cancelar
              </button>
              <button 
                className="modern-primary-btn" 
                style={{ backgroundColor: '#dc2626' }}
                onClick={handleRemoveConfirm}
                disabled={removingMember}
              >
                {removingMember ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
