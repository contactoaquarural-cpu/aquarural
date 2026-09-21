const Footer = ({ config }) => {
  const nombre = config?.nombreAcueducto || 'AquaRural Pro';

  return (
    <footer className="relative bg-white border-t border-slate-200 pt-10 pb-6 px-6 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-2xl font-extrabold font-headline tracking-tight">
          <span className="text-slate-900">Aqua</span>
          <span className="text-trust">Rural</span>
        </div>

        <p className="text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} {nombre}. Desarrollado por{' '}
          <a href="https://metadevelopment.co.uk" target="_blank" rel="noopener noreferrer"
            className="text-trust hover:underline font-semibold">MetaDevelopment Ltd</a>
        </p>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <a href="#caracteristicas" className="hover:text-trust transition-colors">Módulos</a>
          <a href="#contacto"  className="hover:text-trust transition-colors">Contacto</a>
        </div>
      </div>

      {/* Wordmark de fondo — firma de cierre (ref. CropSync). Tamaño acotado
          con clamp() para que "AQUARURAL" quepa siempre completo, sin
          depender de recortarlo con overflow-hidden. */}
      <p
        aria-hidden="true"
        className="relative z-0 select-none pointer-events-none text-center font-headline font-black leading-none text-slate-900/[0.05] mt-6 whitespace-nowrap"
        style={{ fontSize: 'clamp(2.5rem, 9vw, 7rem)' }}
      >
        AQUARURAL
      </p>
    </footer>
  );
};

export default Footer;
