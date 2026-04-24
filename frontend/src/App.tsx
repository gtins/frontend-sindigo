import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PrivateRoute from './components/PrivateRoute';
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

        {/* Rotas protegidas */}
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/buildings/:id" element={<BuildingDetails />} />
            <Route path="/buildings/:id/finances" element={<BuildingFinancesReal />} />
            <Route path="/buildings/:id/finances-mock" element={<BuildingFinances data={buildingDetailsData[1]} />} />
        </Route>

        {/* Redireciona para dashboard se acessar rota inválida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
