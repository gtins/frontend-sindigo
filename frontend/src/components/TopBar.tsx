import React, { useState, useEffect } from 'react';
import { LogOut, Building2, ChevronDown, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

interface TopBarProps {
    onHomeClick: () => void;
    onCreateBuildingClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onHomeClick }) => {
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark') || localStorage.getItem('sindigo-theme') === 'dark';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('sindigo-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('sindigo-theme', 'light');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/login');
    };

    return (
        <header style={{
            height: '64px',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)', /* Soft sutil shadow */
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            width: '100%',
        }}>
            <div onClick={onHomeClick} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                cursor: 'pointer' 
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    backgroundColor: 'var(--color-accent-light)',
                    boxShadow: '0 1px 2px rgba(79, 70, 229, 0.1)'
                }}>
                    <Building2 size={20} color="var(--color-accent)" strokeWidth={2.2} />
                </div>
                <h1 style={{ 
                    margin: 0, 
                    fontSize: '19px', 
                    fontWeight: 750, 
                    color: 'var(--text-main)',
                    letterSpacing: '-0.025em'
                }}>
                    SindiGo
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={toggleDarkMode}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-btn-neutral)',
                        backgroundColor: 'var(--bg-btn-neutral)',
                        cursor: 'pointer',
                        color: 'var(--text-main)',
                        transition: 'all 0.2s',
                        padding: 0,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                        e.currentTarget.style.borderColor = 'var(--color-accent)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-btn-neutral)';
                        e.currentTarget.style.borderColor = 'var(--border-btn-neutral)';
                    }}
                    title={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
                >
                    {isDarkMode ? (
                        <Sun size={18} color="var(--text-main)" />
                    ) : (
                        <Moon size={18} color="var(--text-main)" />
                    )}
                </button>

                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '10px',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>Administrador</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-light)', lineHeight: 1.2, marginTop: '2px' }}>
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
                            fontSize: '13px',
                            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.15)'
                        }}>
                            AD
                        </div>
                        <ChevronDown size={16} color="#94a3b8" style={{ transition: 'transform 0.2s', transform: showUserMenu ? 'rotate(180deg)' : 'none' }} />
                    </button>


                    {showUserMenu && (
                        <div style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                            zIndex: 100,
                            minWidth: '220px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-2)' }}>
                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Administrador</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>admin@sindigo.com</div>
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
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.15)'}
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
