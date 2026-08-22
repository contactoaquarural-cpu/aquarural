import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useConfigStore } from '../../store/config.store';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');

  const esSuperAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.correo === 'contactoaquarural@gmail.com';

  // Menú exclusivo según el rol del usuario autenticado
  const menuItems = esSuperAdmin
    ? [
        { to: '/superadmin', icon: 'dashboard', label: 'Dashboard SaaS', key: 'dashboard' },
        { to: '/superadmin?tab=acueductos', icon: 'water_drop', label: 'Acueductos Afiliados', key: 'acueductos' },
      ]
    : [
        { to: '/dashboard',     icon: 'dashboard',       label: 'Dashboard' },
        { to: '/asociados',  icon: 'groups',          label: 'Suscriptores Veredales' },
        // Ocultos temporalmente hasta que su backend exista (Fase C-D):
        // Lecturas & Medidores, Facturación & Recaudo, Mapa GPS Predios,
        // Configuración Acueducto, Licencia & Cobro SaaS, Eventos & Reuniones.
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isItemActive = (item) => {
    if (esSuperAdmin) {
      if (item.key === 'acueductos') {
        return location.pathname === '/superadmin' && currentTab === 'acueductos';
      }
      return location.pathname === '/superadmin' && currentTab !== 'acueductos';
    }
    return location.pathname === item.to;
  };

  return (
    <>
      {/* Backdrop Overlay para Móviles */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside className={`h-screen w-64 fixed left-0 top-0 bg-slate-950 border-r border-slate-800/80 flex flex-col py-6 z-50 shadow-2xl transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="px-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-emerald-500 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-400 text-2xl">
                  {esSuperAdmin ? 'verified_user' : 'water_drop'}
                </span>
              </div>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base font-extrabold tracking-tight text-slate-100 font-headline">
                AquaRural Pro
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-headline truncate max-w-[130px]">
                {esSuperAdmin ? 'Plataforma SaaS' : nombreAcueducto}
              </p>
            </div>
          </div>

          {/* Botón cerrar en móvil */}
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-900"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Nav List */}
        <nav className="flex-1 space-y-1.5 px-3 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-headline text-sm font-semibold tracking-tight transition-colors duration-150 outline-none select-none ${
                  active
                    ? 'bg-gradient-to-r from-sky-500/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info */}
        <div className="px-3 mt-auto">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold text-base font-headline select-none shrink-0">
              {user?.nombres?.charAt(0)?.toUpperCase() ?? (esSuperAdmin ? 'S' : 'A')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-slate-100 truncate">
                {user?.nombres ?? (esSuperAdmin ? 'SuperAdmin SaaS' : 'Administrador')}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {esSuperAdmin ? 'Operador Global' : 'Tesorero / Junta'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded-lg shrink-0"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
