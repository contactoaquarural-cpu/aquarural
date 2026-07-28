import { useState, useEffect } from 'react';
import { useTheme } from '../utils/ThemeContext';

const Navbar = ({ config }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Módulos',   href: '#modulos' },
    { label: 'Noticias',  href: '#noticias' },
    { label: 'Convenios', href: '#convenios' },
    { label: 'Precios',   href: '#precios' },
    { label: 'Contacto',  href: '#contacto' },
  ];

  const adminBase = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173';
  const adminUrl = `${adminBase}?theme=${isDark ? 'dark' : 'light'}`;

  const navBg = scrolled
    ? isDark
      ? 'bg-dark/95 backdrop-blur border-b border-dark-border shadow-lg'
      : 'bg-white/95 backdrop-blur border-b border-dark-border shadow-lg'
    : 'bg-transparent';

  const linkClass = isDark ? 'text-gray-300 hover:text-primary' : 'text-gray-600 hover:text-primary';
  const mobileMenuBg = isDark ? 'bg-dark-card border-t border-dark-border' : 'bg-white border-t border-dark-border';

  const ThemeIcon = () => isDark ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3">
          <img src="/images/logo.png" alt="GanaderoPro" className="h-10 w-auto" />
        </a>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className={`text-sm font-medium transition-colors ${linkClass}`}>
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA + Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
              isDark
                ? 'border-dark-border text-gray-400 hover:text-primary hover:border-primary'
                : 'border-gray-300 text-gray-500 hover:text-primary hover:border-primary'
            }`}
          >
            <ThemeIcon />
          </button>
          <a href={adminUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all">
            Panel Admin
          </a>
          <a href="#contacto"
            className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-all">
            Asociarme
          </a>
        </div>

        {/* Hamburger mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            <ThemeIcon />
          </button>
          <button className={isDark ? 'text-white' : 'text-gray-700'} onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className={`md:hidden px-6 py-4 flex flex-col gap-4 ${mobileMenuBg}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium transition-colors ${linkClass}`}>
              {l.label}
            </a>
          ))}
          <a href={adminUrl} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold text-primary border border-primary px-4 py-2 rounded-lg text-center">
            Panel Admin
          </a>
          <a href="#contacto" onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-lg text-center">
            Asociarme
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
