const Footer = ({ config }) => {
  const nombre = config?.nombreAcueducto || 'AquaRural Pro';

  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="AquaRural — Gestión y Recaudo para Acueductos Veredales"
            className="h-12 w-auto object-contain drop-shadow-[0_4px_12px_rgba(6,182,212,0.3)]"
          />
        </div>

        <p className="text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} {nombre}. Desarrollado por{' '}
          <a href="https://metadevelopment.co.uk" target="_blank" rel="noopener noreferrer"
            className="text-cyan-400 hover:underline font-semibold">MetaDevelopment Ltd</a>
        </p>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <a href="#modulos"   className="hover:text-cyan-400 transition-colors">Módulos</a>
          <a href="#contacto"  className="hover:text-cyan-400 transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
