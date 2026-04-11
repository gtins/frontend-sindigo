import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { BuildingDetails } from './components/BuildingDetails';
import { BuildingFinances } from './components/BuildingFinances';
import { buildingDetailsData } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CreateCondominiumModal } from './components/CreateCondominiumModal';
import './styles/global.css';

type View = 'dashboard' | 'details' | 'finances';

function AppLayout() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // Optional: mechanism to force refresh Dashboard when new item created
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBuildingClick = (id: string) => {
    setSelectedBuildingId(id);
    setView('details');
  };

  const handleBack = () => {
    setView('dashboard');
    setSelectedBuildingId(null);
  };

  const handleFinancesClick = () => {
    setView('finances');
  };

  const handleOverviewClick = () => {
    setView('details');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <TopBar 
          onHomeClick={handleBack} 
          onCreateBuildingClick={() => setIsCreateModalOpen(true)}
        />

        {view === 'dashboard' && (
          <Dashboard 
            onBuildingClick={handleBuildingClick} 
            onCreateBuildingClick={() => setIsCreateModalOpen(true)}
            refreshKey={refreshKey}
          />
        )}

        {view === 'details' && selectedBuildingId && (
          <BuildingDetails
            condominiumId={selectedBuildingId}
            onBack={handleBack}
            onFinancesClick={handleFinancesClick}
          />
        )}

        {view === 'finances' && selectedBuildingId && (
          <BuildingFinances
            data={buildingDetailsData[1]} // Placeholder using mock for finances
            onBack={handleBack}
            onOverviewClick={handleOverviewClick}
          />
        )}
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
        <Route path="/" element={<PrivateRoute component={AppLayout} />} />

        {/* Redireciona para dashboard se acessar rota inválida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
