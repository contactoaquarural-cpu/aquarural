const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo Oficial (+20% adicional) */}
        <a href="#" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="AquaRural — Gestión y Recaudo para Acueductos Veredales"
            className="h-[76px] md:h-[84px] w-auto object-contain drop-shadow-[0_4px_12px_rgba(6,182,212,0.35)] hover:scale-105 transition-transform duration-300"
          />
        </a>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-headline font-semibold text-slate-300">
          <a href="#caracteristicas" className="hover:text-cyan-400 transition-colors">Características</a>
          <a href="#simulador" className="hover:text-cyan-400 transition-colors">Simulador de Recaudo</a>
          <a href="#planes" className="hover:text-cyan-400 transition-colors">Planes SaaS</a>
          <a href="#contacto" className="hover:text-cyan-400 transition-colors">Contacto</a>
        </nav>

        {/* CTA Demo Button */}
        <a
          href="https://admin.aquarural.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          <span>Panel Web Demo</span>
        </a>
      </div>
    </header>
  );
};

export default Navbar;
