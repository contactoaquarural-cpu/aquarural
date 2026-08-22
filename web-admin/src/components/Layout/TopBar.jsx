import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../utils/ThemeContext';
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
  '/superadmin':    'Gestión Multi-Acueducto SaaS',
  '/configuracion': 'Configuración del Acueducto',
};

const TopBar = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const planSaaSCode = useConfigStore((s) => s.planSaaS || 'MANANTIAL');

  const esSuperAdmin =
    user?.rol === 'SUPERADMIN' ||
    user?.esAdmin === true ||
    user?.correo === 'contactoaquarural@gmail.com';

  const subtitle = TITLES[location.pathname] ?? 'Panel de Control';

  return (
    <>
      <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md flex justify-between items-center px-4 sm:px-8 border-b border-slate-200 dark:border-slate-800/80 transition-all">
        <div className="flex items-center gap-2 font-headline">
          {/* Botón hamburguesa para abrir Sidebar en móvil */}
          <button
            onClick={onToggleSidebar}
            className="lg:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 p-2 rounded-xl transition-colors"
            title="Abrir menú de navegación"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100 font-headline truncate max-w-[200px] sm:max-w-none">
            {subtitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Búsqueda global */}
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar suscriptor, cédula o matrícula..."
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50 w-72 transition-all"
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

          {/* Botón de Notificación de Membresía SaaS */}
          <button
            onClick={() => navigate('/licencia')}
            title="Licencia SaaS & Cobro del Sistema"
            className="text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded-full p-2 transition-all relative"
          >
            <span className="material-symbols-outlined">card_membership</span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          {/* Badge de Estado de Licencia SaaS */}
          {!esSuperAdmin ? (
            <button
              onClick={() => navigate('/licencia')}
              className="text-xs font-headline font-extrabold text-cyan-300 bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-cyan-400">verified</span>
              <span>Licencia SaaS ({planSaaSCode})</span>
            </button>
          ) : (
            <span className="text-xs font-headline font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Operador Master
            </span>
          )}
        </div>
      </header>
    </>
  );
};

export default TopBar;
