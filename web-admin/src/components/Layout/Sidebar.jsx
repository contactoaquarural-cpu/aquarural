import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useConfigStore } from '../../store/config.store';

const NAV_ITEMS = [
  { to: '/dashboard',     icon: 'dashboard',             label: 'Dashboard' },
  { to: '/suscriptores',  icon: 'groups',                label: 'Suscriptores' },
  { to: '/facturacion',   icon: 'receipt_long',          label: 'Facturación & Cobro' },
  { to: '/mapa',          icon: 'location_on',           label: 'Mapa GPS Predios' },
  { to: '/superadmin',    icon: 'admin_panel_settings',  label: 'SuperAdmin SaaS' },
  { to: '/configuracion', icon: 'settings',              label: 'Configuración' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-950 border-r border-slate-800/80 flex flex-col py-6 z-50 shadow-2xl">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-cyan-500 to-emerald-500 p-[2px]">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <span className="material-symbols-outlined text-cyan-400 text-2xl">water_drop</span>
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-100 font-headline truncate max-w-[150px]">
            {nombreAcueducto}
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-cyan-400/80 font-semibold">
            Acueductos Veredales
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 px-3">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl font-headline text-sm font-semibold tracking-tight transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500/20 to-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer User Info */}
      <div className="px-3 mt-auto">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold text-base font-headline select-none">
            {user?.nombres?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-100 truncate">
              {user?.nombres ?? 'Administrador'}
            </p>
            <p className="text-xs text-slate-400 truncate">Tesorero / Junta</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-slate-400 hover:text-red-400 transition-colors p-1.5 hover:bg-slate-800 rounded-lg"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
