import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { BuildingDetails } from './components/BuildingDetails';
import { BuildingFinances } from './components/BuildingFinances';
import { BuildingFinancesReal } from './components/BuildingFinancesReal';
import { buildingDetailsData } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CreateCondominiumModal } from './components/CreateCondominiumModal';
import { AdminUsersPage } from './components/AdminUsersPage';
import './styles/global.css';

function AppLayout() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <TopBar 
          onHomeClick={() => navigate('/')} 
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
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas protegidas gerais (Layout com Sidebar) */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            
            {/* Dashboard: Apenas ADMIN e SINDICO criam condomínios, mas todos podem ver algo se o endpoint permitir */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/buildings/:id" element={<BuildingDetails />} />
            
            {/* Finanças: Apenas ADMIN e SINDICO */}
            <Route element={<ProtectedRoute requiredRole={['ADMIN', 'SINDICO']} />}>
              <Route path="/buildings/:id/finances" element={<BuildingFinancesReal />} />
              <Route path="/buildings/:id/finances-mock" element={<BuildingFinances data={buildingDetailsData[1]} />} />
            </Route>
            
            {/* Rota Administrativa */}
            <Route element={<ProtectedRoute requiredRole={['ADMIN']} />}>
              <Route path="/admin/acessos" element={<AdminUsersPage />} />
            </Route>
            
        </Route>

        {/* Redireciona para dashboard se acessar rota inválida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
