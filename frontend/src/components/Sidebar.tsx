import React, { useState } from 'react';
import {
    Calendar,
    Users,
    CheckSquare,
    Hotel,
    ChevronLeft,
    ChevronRight,
    Activity,
    LayoutDashboard
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/dashboard.css';

interface SidebarProps {
    // Props if needed for active state management in a real app
}

export const Sidebar: React.FC<SidebarProps> = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-group">
                <h4 className="sidebar-header">Navegação</h4>

                <nav className="nav-menu">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
                        <LayoutDashboard className="nav-icon" size={20} />
                        <span>Dashboard</span>
                    </Link>

                    <Link to="/buildings" className={`nav-item ${isActive('/buildings') ? 'active' : ''}`}>
                        <Hotel className="nav-icon" size={20} />
                        <span>Prédios</span>
                    </Link>

                    <Link to="/calendar" className={`nav-item ${isActive('/calendar') ? 'active' : ''}`}>
                        <Calendar className="nav-icon" size={20} />
                        <span>Calendário</span>
                    </Link>

                    {localStorage.getItem('role')?.includes('ADMIN') && (
                        <>
                            <Link to="/admin/acessos" className={`nav-item ${isActive('/admin/acessos') ? 'active' : ''}`}>
                                <Users className="nav-icon" size={20} />
                                <span>Acessos</span>
                            </Link>
                            <Link to="/admin/auditoria" className={`nav-item ${isActive('/admin/auditoria') ? 'active' : ''}`}>
                                <Activity className="nav-icon" size={20} />
                                <span>Auditoria</span>
                            </Link>
                        </>
                    )}

                    <Link to="/tickets" className={`nav-item ${isActive('/tickets') ? 'active' : ''}`}>
                        <CheckSquare className="nav-icon" size={20} />
                        <span>Chamados</span>
                    </Link>
                </nav>
            </div>

            <div className="sidebar-footer">
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expandir" : "Recolher"}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                {!isCollapsed && <span className="version">v1.0</span>}
            </div>
        </aside>
    );
};

