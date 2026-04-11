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
                <div className="brand-logo">
                    <Building2 size={24} color="#0f172a" />
                </div>
                <h1 className="brand-name">Sindigo</h1>
                <span className="user-greeting">Olá, Gustavo!</span>
            </div>

            <div className="top-actions">
                <button className="secondary-btn" onClick={onCreateBuildingClick}>
                    <Plus size={16} />
                    <span>Adicionar prédio</span>
                </button>
                <div style={{ position: 'relative' }}>
                    <button
                        className="profile-btn"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <User size={20} />
                    </button>
                    {showUserMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            marginTop: '5px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            zIndex: 100
                        }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    width: '100%',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#d32f2f',
                                    fontSize: '14px'
                                }}
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
