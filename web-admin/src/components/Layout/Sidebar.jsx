import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard',    label: 'Dashboard' },
  { to: '/asociados', icon: 'groups',       label: 'Asociados' },
  { to: '/convenios', icon: 'handshake',    label: 'Convenios' },
  { to: '/noticias',  icon: 'newspaper',    label: 'Noticias' },
  { to: '/precios',   icon: 'trending_up',  label: 'Precios' },
  { to: '/reportes',  icon: 'query_stats',  label: 'Reportes' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-emerald-950 flex flex-col py-6 z-50 shadow-2xl shadow-emerald-900/20">
      {/* Brand */}
      <div className="px-6 mb-10">
        <h1 className="text-2xl font-bold tracking-tighter text-emerald-50 font-headline">
          ASOGACENTRO
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-emerald-500/60 font-semibold mt-1">
          Administración Central
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg font-headline font-semibold tracking-tight transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-900/50 text-emerald-100'
                  : 'text-emerald-400/60 hover:text-emerald-200 hover:bg-emerald-800/30'
              }`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-4 mt-auto">
        <div className="bg-emerald-900/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm font-headline select-none">
            {user?.nombre?.charAt(0)?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-emerald-50 truncate">
              {user?.nombre ?? 'Administrador'}
            </p>
            <p className="text-xs text-emerald-500/70 truncate">Admin Principal</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-emerald-500/60 hover:text-emerald-200 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
