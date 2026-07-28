import { useState, useEffect } from 'react';

const Navbar = ({ config }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Nosotros',  href: '#nosotros' },
    { label: 'Módulos',   href: '#modulos' },
    { label: 'Noticias',  href: '#noticias' },
    { label: 'Convenios', href: '#convenios' },
    { label: 'Contacto',  href: '#contacto' },
  ];

  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark/95 backdrop-blur border-b border-dark-border shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3">
          <img src="/images/logo.png" alt="GanaderoPro" className="h-14 w-auto rounded-lg" />
        </a>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
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
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-dark-card border-t border-dark-border px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-300 hover:text-primary transition-colors">
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
