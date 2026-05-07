import React, { useState } from 'react';
import { User, Plus, LogOut } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

interface TopBarProps {
    onHomeClick: () => void;
    onCreateBuildingClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onHomeClick, onCreateBuildingClick }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    return (
        <header className="topbar">
            <div className="brand-section" onClick={onHomeClick} style={{ cursor: 'pointer' }}>
                <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-accent-light)' }}>
                    <Building2 size={24} color="var(--color-accent)" strokeWidth={2.5} />
                </div>
                <h1 className="brand-name" style={{ margin: 0, paddingLeft: '4px' }}>Sindigo</h1>
            </div>

            <div className="top-actions">

                <div style={{ position: 'relative', marginLeft: '16px' }}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '8px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>Administrador</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.2 }}>{localStorage.getItem('role') === 'ADMIN' ? 'Administrador Geral' : localStorage.getItem('role') || 'Morador'}</span>
                        </div>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            backgroundColor: 'var(--color-accent)', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '1rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            AD
                        </div>
                    </button>

                    {showUserMenu && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 100,
                            minWidth: '220px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Administrador</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>admin@sindigo.com</div>
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
                                        color: 'var(--status-red)',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        borderRadius: '6px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
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
