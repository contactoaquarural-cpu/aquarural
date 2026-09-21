import { useState, useEffect } from 'react';

const Navbar = () => {
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173';
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Transparente sobre la foto del hero (como la referencia); sólido en
  // blanco al pasar el borde del hero, para no perder la navegación al
  // hacer scroll (justo lo que arreglamos para móvil).
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // El Hero mide 640px (móvil) / 700px (desktop) y su contenido está
    // pegado a la parte inferior (justify-end) — si el header se vuelve
    // sólido antes de que el Hero termine de salir de la vista, tapa el
    // texto/botones de esa sección. 560 es justo antes de los 640px del
    // Hero más angosto, así el cambio ocurre cuando ya no queda nada del
    // Hero visible detrás del header, sin importar el tamaño de pantalla.
    const handleScroll = () => setScrolled(window.scrollY > 560);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NAV_LINKS = [
    { href: '#caracteristicas', label: 'Características' },
    { href: '#planes',          label: 'Planes SaaS' },
    { href: '#contacto',        label: 'Contacto' },
  ];

  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(Boolean);
    if (!sections.length) return;

    const handleActive = () => {
      const fromTop = window.scrollY + 96;
      let current = '';
      for (const section of sections) {
        if (section.offsetTop <= fromTop) current = `#${section.id}`;
      }
      setActiveSection(current);
    };

    handleActive();
    window.addEventListener('scroll', handleActive, { passive: true });
    return () => window.removeEventListener('scroll', handleActive);
  }, []);

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

  const linkColor = scrolled ? 'text-slate-600' : 'text-white';
  const iconColor = scrolled ? 'text-slate-500 border-slate-200 hover:bg-slate-100' : 'text-white border-white/30 hover:bg-white/10';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-200' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Wordmark bicolor — "Aqua" en el color de contraste según el fondo
            del header, "Rural" siempre en el azul de marca (trust). */}
        <a href="#" className="text-xl md:text-2xl font-extrabold font-headline tracking-tight hover:opacity-80 transition-opacity">
          <span className={scrolled ? 'text-slate-900' : 'text-white'}>Aqua</span>
          <span className="text-trust">Rural</span>
        </a>

        {/* Links — el activo se resalta con una píldora azul de marca,
            igual al patrón de la referencia (item seleccionado = fondo sólido). */}
        <nav className={`hidden md:flex items-center gap-1 text-sm font-headline font-semibold transition-colors duration-300 ${linkColor}`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeSection === link.href
                  ? 'bg-trust text-white'
                  : scrolled
                    ? 'hover:bg-trust hover:text-white'
                    : 'hover:bg-white/15 hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {/* CTA Iniciar Sesión — píldora blanca sólida, igual que "Contact Us"
              en la referencia; con borde sutil cuando el header ya es blanco
              para que no se pierda contra su propio fondo. */}
          <a
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-extrabold font-headline text-xs px-4 sm:px-5 py-2.5 rounded-full transition-colors items-center gap-2 cursor-pointer hidden sm:flex bg-white hover:bg-slate-100 text-slate-900 ${
              scrolled ? 'border border-slate-300' : 'shadow-md'
            }`}
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Iniciar Sesión</span>
          </a>

          {/* Botón menú móvil */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            className={`md:hidden p-2.5 rounded-full transition-all flex items-center justify-center border ${iconColor}`}
          >
            <span className="material-symbols-outlined text-xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Panel de navegación móvil — siempre sólido, se lea sobre lo que haya debajo */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-6 py-4 flex flex-col gap-1 text-sm font-headline font-semibold text-slate-600">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`py-3 px-3 rounded-full transition-colors border-b border-slate-100 last:border-b-0 ${
                activeSection === link.href ? 'bg-trust text-white' : 'hover:text-trust'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href={adminUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="mt-3 bg-white border border-slate-300 text-slate-900 font-extrabold py-3 rounded-full flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Iniciar Sesión</span>
          </a>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
