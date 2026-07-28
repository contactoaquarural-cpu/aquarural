import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import { useConfigStore } from './store/config.store';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import ResetPasswordPage from './pages/Login/ResetPasswordPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AsociadosPage from './pages/Asociados/AsociadosPage';
import ExpedientePage from './pages/Asociados/ExpedientePage';
import ConveniosPage from './pages/Convenios/ConveniosPage';
import ReportesPage from './pages/Reportes/ReportesPage';
import NoticiasPage from './pages/Noticias/NoticiasPage';
import PreciosPage   from './pages/Precios/PreciosPage';
import MercadoPage       from './pages/Mercado/MercadoPage';
import GanaderoTVPage    from './pages/GanaderoTV/GanaderoTVPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';
import EventosPage       from './pages/Eventos/EventosPage';

// Protege rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const cargarConfig    = useConfigStore((s) => s.cargarConfig);
  const nombreAsociacion = useConfigStore((s) => s.nombreAsociacion);

  useEffect(() => { cargarConfig(); }, []);

  useEffect(() => {
    if (nombreAsociacion) {
      document.title = `${nombreAsociacion} — Panel Administrativo`;
    }
  }, [nombreAsociacion]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/reset/:token" element={<ResetPasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<DashboardPage />} />
          <Route path="asociados"    element={<AsociadosPage />} />
          <Route path="asociados/:id" element={<ExpedientePage />} />
          <Route path="convenios"    element={<ConveniosPage />} />
          <Route path="reportes"     element={<ReportesPage />} />
          <Route path="noticias"     element={<NoticiasPage />} />
          <Route path="precios"      element={<PreciosPage />} />
          <Route path="mercado"        element={<MercadoPage />} />
          <Route path="ganadero-tv"   element={<GanaderoTVPage />} />
          <Route path="eventos"       element={<EventosPage />} />
          <Route path="configuracion" element={<ConfiguracionPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
