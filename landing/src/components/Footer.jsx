const Footer = ({ config }) => {
  const nombre = config?.nombreAsociacion || 'GanaderoPro';

  return (
    <footer className="bg-dark border-t border-dark-border py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img src="/images/logo.png" alt="GanaderoPro" className="h-7 w-auto" />
          <span className="text-sm text-gray-400">{nombre}</span>
        </div>

        <p className="text-xs text-gray-600 text-center">
          © {new Date().getFullYear()} {nombre}. Powered by{' '}
          <a href="https://metadevelopment.co.uk" target="_blank" rel="noopener noreferrer"
            className="text-primary hover:underline">MetaDevelopment Ltd</a>
        </p>

        <div className="flex items-center gap-6 text-xs text-gray-500">
          <a href="#modulos"   className="hover:text-primary transition-colors">Módulos</a>
          <a href="#convenios" className="hover:text-primary transition-colors">Convenios</a>
          <a href="#contacto"  className="hover:text-primary transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
