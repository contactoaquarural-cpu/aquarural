import { useLocation } from 'react-router-dom';
import { useTheme } from '../../utils/ThemeContext';

const TITLES = {
  '/dashboard':  'Dashboard',
  '/asociados':  'Gestión de Asociados',
  '/convenios':  'Configuración de Convenios',
  '/reportes':   'Reportes y Análisis',
  '/noticias':   'Noticias',
  '/precios':    'Precios del Sector',
};

const TopBar = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isExpediente = location.pathname.startsWith('/asociados/') && location.pathname !== '/asociados';
  const subtitle = isExpediente
    ? 'Expediente del Asociado'
    : TITLES[location.pathname] ?? '';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 glass-effect flex justify-between items-center px-8 border-b border-emerald-900/20">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-on-surface font-headline">Panel Administrativo</span>
        {subtitle && (
          <>
            <span className="text-outline">/</span>
            <span className="text-sm font-medium text-primary font-body">{subtitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Búsqueda global */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar asociado o predio..."
            className="bg-surface-container-high border-none rounded-full pl-10 pr-4 py-1.5 text-xs text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary/30 w-64 transition-all"
          />
        </div>

        {/* Toggle modo claro/oscuro */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full p-2 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full p-2 transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full p-2 transition-all">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="h-8 w-px bg-outline-variant mx-1" />
        <span className="text-sm font-body font-medium text-on-surface">
          Estado:{' '}
          <span className="text-primary">En Línea</span>
        </span>
      </div>
    </header>
  );
};

export default TopBar;
