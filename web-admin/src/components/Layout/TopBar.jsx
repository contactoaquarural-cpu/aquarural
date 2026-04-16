import { useLocation, useNavigate } from 'react-router-dom';

const TITLES = {
  '/dashboard':  'Dashboard',
  '/asociados':  'Gestión de Asociados',
  '/convenios':  'Configuración de Convenios',
  '/reportes':   'Reportes y Análisis',
};

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Detecta si estamos en un expediente (ruta dinámica)
  const isExpediente = location.pathname.startsWith('/asociados/') && location.pathname !== '/asociados';
  const title = isExpediente ? 'Panel Administrativo' : 'Panel Administrativo';
  const subtitle = isExpediente
    ? 'Expediente del Asociado'
    : TITLES[location.pathname] ?? '';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 glass-effect flex justify-between items-center px-8 border-b border-emerald-900/20">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-neutral-100 font-headline">{title}</span>
        {subtitle && (
          <>
            <span className="text-neutral-600">/</span>
            <span className="text-sm font-medium text-emerald-400 font-body">{subtitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Búsqueda global */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar asociado o predio..."
            className="bg-neutral-800/40 border-none rounded-full pl-10 pr-4 py-1.5 text-xs text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-emerald-500/50 w-64 transition-all"
          />
        </div>

        <button className="text-neutral-400 hover:text-emerald-300 hover:bg-neutral-800/50 rounded-full p-2 transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-neutral-400 hover:text-emerald-300 hover:bg-neutral-800/50 rounded-full p-2 transition-all">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="h-8 w-px bg-neutral-800 mx-1" />
        <span className="text-sm font-body font-medium text-neutral-100">
          Estado:{' '}
          <span className="text-emerald-400">En Línea</span>
        </span>
      </div>
    </header>
  );
};

export default TopBar;
