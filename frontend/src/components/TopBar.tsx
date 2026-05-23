import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

interface TopBarProps {
    onHomeClick: () => void;
    onCreateBuildingClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onHomeClick }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/login');
    };

    return (
        <header style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #ECECEC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            width: '100%',
        }}>
            <div onClick={onHomeClick} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--color-accent-light)' 
                }}>
                    <Building2 size={18} color="var(--color-accent)" strokeWidth={2.5} />
                </div>
                <h1 style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: 700, 
                    color: 'var(--text-main)',
                    letterSpacing: '-0.02em'
                }}>
                    Sindigo
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>Administrador</span>
                            <span style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.2 }}>
                                {localStorage.getItem('role')?.includes('ADMIN') ? 'Admin Geral' : localStorage.getItem('role') || 'Morador'}
                            </span>
                        </div>
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '50%', 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '14px',
                            boxShadow: '0 1px 2px rgba(0,0,0,.04)'
                        }}>
                            AD
                        </div>
                    </button>

                    {showUserMenu && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #ECECEC',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                            zIndex: 100,
                            minWidth: '220px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid #ECECEC', backgroundColor: '#F8FAFC' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Administrador</div>
                                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>admin@sindigo.com</div>
                            </div>
                            <div style={{ padding: '8px' }}>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '8px 12px',
                                        width: '100%',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: '#DC2626',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        borderRadius: '8px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={16} />
                                    Sair da conta
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
