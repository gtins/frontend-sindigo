import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Search, Shield, ShieldCheck, User } from 'lucide-react';
import UserService from '../services/userService';
import '../styles/dashboard.css'; // reaproveitar os estilos base

export const AdminUsersPage: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'SINDICO' | 'MORADOR'>('MORADOR');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
      setUserId('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Ocorreu um erro ao tentar atualizar o papel do usuário.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="content-wrapper">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Gerenciar Acessos</h1>
            <p className="dashboard-subtitle">Promova ou rebaixe o nível de acesso dos usuários (Apenas Administradores).</p>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto' }}>
          <div className="card">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="var(--primary-main)" />
              Alterar Papel de Usuário
            </h2>

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
                  ID do Usuário (UUID)
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Ex: 550e8400-e29b-41d4-a716-446655440001"
                    style={{
                      width: '100%',
                      padding: '10px 10px 10px 38px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Novo Papel (Role)
                </label>
                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: `1px solid ${selectedRole === 'ADMIN' ? 'var(--primary-main)' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedRole === 'ADMIN' ? '#eff6ff' : 'white' }}>
                    <input type="radio" name="role" value="ADMIN" checked={selectedRole === 'ADMIN'} onChange={() => setSelectedRole('ADMIN')} style={{ accentColor: 'var(--primary-main)' }} />
                    <ShieldAlert size={20} color={selectedRole === 'ADMIN' ? 'var(--primary-main)' : '#64748b'} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>ADMIN</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Acesso total ao sistema, pode criar condomínios e gerenciar usuários.</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: `1px solid ${selectedRole === 'SINDICO' ? '#10b981' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedRole === 'SINDICO' ? '#ecfdf5' : 'white' }}>
                    <input type="radio" name="role" value="SINDICO" checked={selectedRole === 'SINDICO'} onChange={() => setSelectedRole('SINDICO')} style={{ accentColor: '#10b981' }} />
                    <ShieldCheck size={20} color={selectedRole === 'SINDICO' ? '#10b981' : '#64748b'} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>SINDICO</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Pode criar condomínios e ver finanças, mas não pode gerenciar usuários.</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: `1px solid ${selectedRole === 'MORADOR' ? '#64748b' : 'var(--border-color)'}`, borderRadius: '8px', cursor: 'pointer', backgroundColor: selectedRole === 'MORADOR' ? '#f8fafc' : 'white' }}>
                    <input type="radio" name="role" value="MORADOR" checked={selectedRole === 'MORADOR'} onChange={() => setSelectedRole('MORADOR')} style={{ accentColor: '#64748b' }} />
                    <User size={20} color={selectedRole === 'MORADOR' ? '#475569' : '#64748b'} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>MORADOR</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Apenas consulta reservas e abre chamados. Padrão para novos usuários.</div>
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
