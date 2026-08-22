import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import { useConfigStore } from './store/config.store';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SuscriptoresPage from './pages/Suscriptores/SuscriptoresPage';
import FacturacionPage from './pages/Facturacion/FacturacionPage';
import EventosPage from './pages/Eventos/EventosPage';
import MapaPage from './pages/Mapa/MapaPage';
import SuperAdminPage from './pages/SuperAdmin/SuperAdminPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';
import LecturasPage from './pages/Lecturas/LecturasPage';
import LicenciaSoftwarePage from './pages/Licencia/LicenciaSoftwarePage';

import api from './services/api.service';

const App = () => {
  const cargarConfig     = useConfigStore((s) => s.cargarConfig);
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    cargarConfig();
  }, []);

  useEffect(() => {
    if (nombreAcueducto) {
      document.title = `${nombreAcueducto} — Panel Administrativo`;
    }
  }, [nombreAcueducto]);

  const user = useAuthStore((s) => s.user);
  const esSuperAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.correo === 'contactoaquarural@gmail.com';

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to={esSuperAdmin ? "/superadmin" : "/dashboard"} replace />} />
          <Route path="dashboard"     element={<DashboardPage />} />
          <Route path="suscriptores"  element={<SuscriptoresPage />} />
          <Route path="lecturas"      element={<LecturasPage />} />
          <Route path="facturacion"   element={<FacturacionPage />} />
          <Route path="eventos"       element={<EventosPage />} />
          <Route path="mapa"          element={<MapaPage />} />
          <Route path="licencia"      element={<LicenciaSoftwarePage />} />
          <Route path="superadmin"    element={<SuperAdminPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? (esSuperAdmin ? "/superadmin" : "/dashboard") : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
