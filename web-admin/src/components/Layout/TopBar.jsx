import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useConfigStore } from '../../store/config.store';

const TITLES = {
  '/dashboard':     'Dashboard General',
  '/asociados':  'Gestión de Suscriptores & Padrón',
  '/lecturas':      'Lecturas & Medidores de Agua (m³)',
  '/facturacion':   'Facturación Masiva & Recaudo Wompi',
  '/licencia':      'Licencia & Cobro del Sistema SaaS',
  '/eventos':       'Eventos & Reuniones Comunales',
  '/mapa':          'Mapa GPS de Viviendas y Predios',
  '/superadmin':             'Dashboard de Control SaaS',
  '/superadmin/acueductos':  'Acueductos Veredales Afiliados',
  '/superadmin/acueductos/nuevo': 'Registrar Nuevo Acueducto',
  '/superadmin/apariencia':  'Apariencia de la Plataforma',
  '/configuracion': 'Configuración del Acueducto',
};

const TopBar = ({ onToggleSidebar, collapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const estadoPagoSaaS = useConfigStore((s) => s.estadoPagoSaaS);
  const fechaFinCicloVigente = useConfigStore((s) => s.fechaFinCicloVigente);

  const esSuperAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.esAdmin === true ||
    user?.correo === 'contactoaquarural@gmail.com';

  const subtitle = TITLES[location.pathname]
    ?? (location.pathname.match(/^\/superadmin\/acueductos\/[^/]+\/editar$/) ? 'Editar Acueducto' : null)
    ?? 'Panel de Control';

  // Días restantes hasta fechaFinCicloVigente (ya calculado por el backend,
  // nunca inferido a mano desde fechaVencimientoGratis — ese campo queda
  // obsoleto para siempre tras el primer pago, ver bug corregido en
  // AcueductosPage.jsx/EditarAcueductoPage.jsx). Umbral de "por vencer": 7 días.
  let diasRestantes = null;
  if (fechaFinCicloVigente) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vencimiento = new Date(fechaFinCicloVigente);
    vencimiento.setHours(0, 0, 0, 0);
    diasRestantes = Math.round((vencimiento - hoy) / (1000 * 60 * 60 * 24));
  }

  const licenciaVencida = estadoPagoSaaS === 'VENCIDO' || estadoPagoSaaS === 'POR_COBRAR' || (diasRestantes !== null && diasRestantes < 0);
  const licenciaPorVencer = !licenciaVencida && diasRestantes !== null && diasRestantes <= 7;

  return (
    <>
      <header className={`fixed top-0 right-0 w-full ${collapsed ? 'lg:w-[calc(100%-5rem)]' : 'lg:w-[calc(100%-16rem)]'} h-16 z-40 bg-white flex justify-between items-center px-4 sm:px-8 border-b border-gray-100 transition-all duration-300`}>
        <div className="flex items-center gap-2 font-headline">
          {/* Botón hamburguesa para abrir Sidebar en móvil */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-xl transition-colors"
            title="Abrir menú de navegación"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <h2 className="text-sm sm:text-base font-extrabold text-gray-800 font-headline truncate max-w-[200px] sm:max-w-none">
            {subtitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Badge discreta de estado de licencia — solo Admin (el SuperAdmin
              cobra licencias, no las paga). Se mantiene sutil cuando está al
              día; solo gana color/urgencia si está por vencer o ya venció. */}
          {!esSuperAdmin && (
            <button
              onClick={() => navigate('/licencia')}
              title="Ver Licencia & Cobro SaaS"
              className={`text-xs font-headline font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 border transition-all cursor-pointer ${
                licenciaVencida
                  ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                  : licenciaPorVencer
                  ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'
                  : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  licenciaVencida ? 'bg-red-500' : licenciaPorVencer ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <span>
                {licenciaVencida
                  ? 'Licencia vencida'
                  : diasRestantes !== null
                  ? `Licencia al día · vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}`
                  : 'Licencia al día'}
              </span>
            </button>
          )}

          {esSuperAdmin && (
            <span className="text-xs font-headline font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Operador Master
            </span>
          )}
        </div>
      </header>
    </>
  );
};

export default TopBar;
