import { useState, useEffect } from 'react';
import { useTheme } from '../utils/ThemeContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173';
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('📲 Para instalar AquaRural en tu dispositivo:\n\n• En Android / Chrome: Toca los 3 puntos superiores (⋮) y selecciona "Instalar aplicación" o "Agregar a inicio".\n• En iPhone / Safari: Toca el botón Compartir (⎋) y elige "Agregar al inicio".');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo Oficial (Sincronizado con Tema Claro/Oscuro) */}
        <a href="#" className="flex items-center gap-3">
          <img
            src={isDark ? '/logo.png' : '/logo-light.png'}
            alt="AquaRural"
            className="h-[54px] md:h-[60px] w-auto object-contain drop-shadow-[0_4px_12px_rgba(6,182,212,0.35)] hover:scale-105 transition-transform duration-300"
          />
        </a>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-headline font-semibold text-slate-300">
          <a href="#caracteristicas" className="hover:text-cyan-400 transition-colors">Características</a>
          <a href="#simulador" className="hover:text-cyan-400 transition-colors">Simulador de Recaudo</a>
          <a href="#planes" className="hover:text-cyan-400 transition-colors">Planes SaaS</a>
          <a href="#contacto" className="hover:text-cyan-400 transition-colors">Contacto</a>
        </nav>

        <div className="flex items-center gap-2.5">
          {/* Conmutador Modo Claro / Oscuro */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className="p-2.5 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-slate-900/80 transition-all flex items-center justify-center border border-slate-800/60"
          >
            <span className="material-symbols-outlined text-xl">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* CTA Acceder al Panel Admin */}
          <a
            href="http://localhost:5173/login"
            target="_blank"
            rel="noopener noreferrer"
            className="hydro-shimmer-btn bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline text-xs px-4 sm:px-5 py-2.5 rounded-2xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
            <span className="hidden xs:inline">Panel Admin</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
