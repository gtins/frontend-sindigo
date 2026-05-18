import React from 'react';
import {
    Calendar,
    Users,
    CheckSquare,
    Wallet,
    Hotel,
    ChevronLeft,
    ChevronRight,
    Activity,
    LayoutDashboard
} from 'lucide-react';
import { useState } from 'react';
import '../styles/dashboard.css'; // We'll add sidebar styles here or in a new file, staying simpler with dashboard.css for now

interface SidebarProps {
    // Props if needed for active state management in a real app
}

export const Sidebar: React.FC<SidebarProps> = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-group">
                <h4 className="sidebar-header">Navegação</h4>

                <nav className="nav-menu">
                    <a href="/" className="nav-item">
                        <LayoutDashboard className="nav-icon" size={20} />
                        <span>Dashboard</span>
                    </a>

                    <a href="/buildings" className="nav-item">
                        <Hotel className="nav-icon" size={20} />
                        <span>Prédios</span>
                    </a>

                    <a href="/calendar" className="nav-item">
                        <Calendar className="nav-icon" size={20} />
                        <span>Calendário</span>
                    </a>

                    {localStorage.getItem('role')?.includes('ADMIN') && (
                        <>
                            <a href="/admin/acessos" className="nav-item">
                                <Users className="nav-icon" size={20} />
                                <span>Acessos</span>
                            </a>
                            <a href="/admin/auditoria" className="nav-item">
                                <Activity className="nav-icon" size={20} />
                                <span>Auditoria</span>
                            </a>
                        </>
                    )}


                    <a href="/tickets" className="nav-item">
                        <CheckSquare className="nav-icon" size={20} />
                        <span>Chamados</span>
                    </a>
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
