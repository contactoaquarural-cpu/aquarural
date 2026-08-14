import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import { useConfigStore } from './store/config.store';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SuscriptoresPage from './pages/Suscriptores/SuscriptoresPage';
import FacturacionPage from './pages/Facturacion/FacturacionPage';
import MapaPage from './pages/Mapa/MapaPage';
import SuperAdminPage from './pages/SuperAdmin/SuperAdminPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';

// Protege rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const cargarConfig     = useConfigStore((s) => s.cargarConfig);
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');

  useEffect(() => { cargarConfig(); }, []);

  useEffect(() => {
    if (nombreAcueducto) {
      document.title = `${nombreAcueducto} — Panel Administrativo`;
    }
  }, [nombreAcueducto]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<DashboardPage />} />
          <Route path="suscriptores"  element={<SuscriptoresPage />} />
          <Route path="facturacion"   element={<FacturacionPage />} />
          <Route path="mapa"          element={<MapaPage />} />
          <Route path="superadmin"    element={<SuperAdminPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
