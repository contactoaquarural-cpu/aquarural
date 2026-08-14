import { useLocation } from 'react-router-dom';
import { useTheme } from '../../utils/ThemeContext';

const TITLES = {
  '/dashboard':     'Dashboard General',
  '/suscriptores':  'Gestión de Suscriptores & Padrón',
  '/facturacion':   'Facturación Masiva & Recaudo Wompi',
  '/mapa':          'Mapa GPS de Viviendas y Predios',
  '/superadmin':    'Gestión Multi-Acueducto SaaS',
  '/configuracion': 'Parámetros del Acueducto & Pasarela Wompi',
};

const TopBar = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const subtitle = TITLES[location.pathname] ?? 'Panel de Control';

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 z-40 bg-slate-950/80 backdrop-blur-md flex justify-between items-center px-8 border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        <span className="text-base font-bold text-slate-100 font-headline">AquaRural Pro</span>
        <span className="text-slate-600">/</span>
        <span className="text-sm font-semibold text-cyan-400 font-headline">{subtitle}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Búsqueda global */}
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar suscriptor, cédula o matrícula..."
            className="bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 w-72 transition-all"
          />
        </div>

        {/* Toggle modo claro/oscuro */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded-full p-2 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button className="text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded-full p-2 transition-all relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1" />
        <span className="text-xs font-headline font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Servicio Activo
        </span>
      </div>
    </header>
  );
};

export default TopBar;
