import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import { useConfigStore } from './store/config.store';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import SuscriptoresPage from './pages/Suscriptores/SuscriptoresPage';
import CargaMasivaPage from './pages/Suscriptores/CargaMasivaPage';
import ExpedientePage from './pages/Asociados/ExpedientePage';
import FacturacionPage from './pages/Facturacion/FacturacionPage';
import EventosPage from './pages/Eventos/EventosPage';
import ReportesPage from './pages/Reportes/ReportesPage';
import MapaPage from './pages/Mapa/MapaPage';
import SinUbicacionPage from './pages/Mapa/SinUbicacionPage';
import SuperAdminDashboardPage from './pages/SuperAdmin/SuperAdminDashboardPage';
import AcueductosPage from './pages/SuperAdmin/AcueductosPage';
import NuevoAcueductoPage from './pages/SuperAdmin/NuevoAcueductoPage';
import EditarAcueductoPage from './pages/SuperAdmin/EditarAcueductoPage';
import AparienciaPage from './pages/SuperAdmin/AparienciaPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';
import MiCuentaPage from './pages/Configuracion/MiCuentaPage';
import PagosWompiPage from './pages/PagosWompi/PagosWompiPage';
import EquipoPage from './pages/Equipo/EquipoPage';
import LecturasPage from './pages/Lecturas/LecturasPage';
import FontaneroDashboardPage from './pages/Lecturas/FontaneroDashboardPage';
import LicenciaSoftwarePage from './pages/Licencia/LicenciaSoftwarePage';

import api from './services/api.service';

const App = () => {
  const cargarConfig     = useConfigStore((s) => s.cargarConfig);
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // /configuracion requiere sesión — sin ella siempre da 401 y no aporta nada.
    if (isAuthenticated) cargarConfig();
  }, [isAuthenticated]);

  useEffect(() => {
    if (nombreAcueducto) {
      document.title = `${nombreAcueducto} — Panel Administrativo`;
    }
  }, [nombreAcueducto]);

  const user = useAuthStore((s) => s.user);
  const esSuperAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.correo === 'contactoaquarural@gmail.com';
  const esFontanero = user?.rol === 'FONTANERO';
  const rutaInicio = esSuperAdmin ? '/superadmin' : esFontanero ? '/lecturas' : '/dashboard';

  // El fontanero solo tiene acceso real a /lecturas. Cualquier otra ruta del
  // panel del acueducto lo redirige de vuelta, aunque la escriba directo en
  // la URL — el sidebar ya la ocultaba, pero eso no bastaba como protección.
  const SoloRuta = ({ permitido, children }) =>
    permitido ? children : <Navigate to={rutaInicio} replace />;

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
          <Route index element={<Navigate to={rutaInicio} replace />} />
          <Route path="dashboard"     element={<SoloRuta permitido={!esFontanero}><DashboardPage /></SoloRuta>} />
          <Route path="asociados"     element={<SoloRuta permitido={!esFontanero}><SuscriptoresPage /></SoloRuta>} />
          <Route path="asociados/carga-masiva" element={<SoloRuta permitido={!esFontanero}><CargaMasivaPage /></SoloRuta>} />
          <Route path="asociados/:id" element={<SoloRuta permitido={!esFontanero}><ExpedientePage /></SoloRuta>} />
          <Route path="lecturas"      element={<LecturasPage />} />
          <Route path="mi-ruta"       element={<SoloRuta permitido={esFontanero}><FontaneroDashboardPage /></SoloRuta>} />
          <Route path="facturacion"   element={<SoloRuta permitido={!esFontanero}><FacturacionPage /></SoloRuta>} />
          <Route path="eventos"       element={<SoloRuta permitido={!esFontanero}><EventosPage /></SoloRuta>} />
          <Route path="reportes"      element={<SoloRuta permitido={!esFontanero}><ReportesPage /></SoloRuta>} />
          <Route path="mapa"          element={<SoloRuta permitido={true}><MapaPage /></SoloRuta>} />
          <Route path="mapa/sin-ubicacion" element={<SoloRuta permitido={true}><SinUbicacionPage /></SoloRuta>} />
          <Route path="licencia"      element={<SoloRuta permitido={!esFontanero}><LicenciaSoftwarePage /></SoloRuta>} />
          <Route path="superadmin"    element={<SoloRuta permitido={esSuperAdmin}><SuperAdminDashboardPage /></SoloRuta>} />
          <Route path="superadmin/acueductos"  element={<SoloRuta permitido={esSuperAdmin}><AcueductosPage /></SoloRuta>} />
          <Route path="superadmin/acueductos/nuevo" element={<SoloRuta permitido={esSuperAdmin}><NuevoAcueductoPage /></SoloRuta>} />
          <Route path="superadmin/acueductos/:id/editar" element={<SoloRuta permitido={esSuperAdmin}><EditarAcueductoPage /></SoloRuta>} />
          <Route path="superadmin/apariencia"  element={<SoloRuta permitido={esSuperAdmin}><AparienciaPage /></SoloRuta>} />
          <Route path="configuracion" element={<SoloRuta permitido={!esFontanero}><ConfiguracionPage /></SoloRuta>} />
          <Route path="mi-cuenta" element={<SoloRuta permitido={!esFontanero}><MiCuentaPage /></SoloRuta>} />
          <Route path="pagos-wompi"   element={<SoloRuta permitido={!esFontanero}><PagosWompiPage /></SoloRuta>} />
          <Route path="equipo"        element={<SoloRuta permitido={!esFontanero}><EquipoPage /></SoloRuta>} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? rutaInicio : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
