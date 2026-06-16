import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { BuildingsPage } from './components/BuildingsPage';
import { GlobalDashboardPage } from './components/GlobalDashboardPage';
import { GlobalCalendarPage } from './components/GlobalCalendarPage';
import { GlobalTicketsPage } from './components/GlobalTicketsPage';
import { BuildingDetails } from './components/BuildingDetails';
import { BuildingFinances } from './components/BuildingFinances';
import { BuildingFinancesReal } from './components/BuildingFinancesReal';
import { buildingDetailsData } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CreateCondominiumModal } from './components/CreateCondominiumModal';
import { AdminUsersPage } from './components/AdminUsersPage';
import { AdminAuditPage } from './components/AdminAuditPage';
import { CondominiumMembersPage } from './components/CondominiumMembersPage';
import { LandingPage } from './components/LandingPage';
import './styles/global.css';

function AppLayout() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (isCreateModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateModalOpen]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <TopBar
          onHomeClick={() => navigate('/dashboard')}
          onCreateBuildingClick={() => setIsCreateModalOpen(true)}
        />

        <Outlet context={{ refreshKey, setIsCreateModalOpen }} />

      </main>

      {isCreateModalOpen && (
        <CreateCondominiumModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('sindigo-theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas protegidas gerais (Layout com Sidebar) */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>

          {/* Global Pages */}
          <Route path="/dashboard" element={<GlobalDashboardPage />} />
          <Route path="/buildings" element={<BuildingsPage />} />
          <Route path="/calendar" element={<GlobalCalendarPage />} />
          <Route path="/tickets" element={<GlobalTicketsPage />} />

          <Route path="/buildings/:id" element={<BuildingDetails />} />

          {/* Finanças e Moradores: Apenas ADMIN e SINDICO */}
          <Route element={<ProtectedRoute requiredRole={['ADMIN', 'SINDICO']} />}>
            <Route path="/buildings/:id/finances" element={<BuildingFinancesReal />} />
            <Route path="/buildings/:id/finances-mock" element={<BuildingFinances data={buildingDetailsData[1]} />} />
            <Route path="/buildings/:id/members" element={<CondominiumMembersPage />} />
          </Route>

          {/* Rota Administrativa */}
          <Route element={<ProtectedRoute requiredRole={['ADMIN']} />}>
            <Route path="/admin/acessos" element={<AdminUsersPage />} />
            <Route path="/admin/auditoria" element={<AdminAuditPage />} />
          </Route>

        </Route>

        {/* Redireciona para dashboard se acessar rota inválida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
