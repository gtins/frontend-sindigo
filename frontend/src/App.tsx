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
import './styles/global.css';

type View = 'dashboard' | 'details' | 'finances';

function AppLayout() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);

  const handleBuildingClick = (id: number) => {
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
        <TopBar onHomeClick={handleBack} />

        {view === 'dashboard' && <Dashboard onBuildingClick={handleBuildingClick} />}

        {view === 'details' && selectedBuildingId && (
          <BuildingDetails
            data={buildingDetailsData[selectedBuildingId] || buildingDetailsData[1]}
            onBack={handleBack}
            onFinancesClick={handleFinancesClick}
          />
        )}

        {view === 'finances' && selectedBuildingId && (
          <BuildingFinances
            data={buildingDetailsData[selectedBuildingId] || buildingDetailsData[1]}
            onBack={handleBack}
            onOverviewClick={handleOverviewClick}
          />
        )}
      </main>
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
