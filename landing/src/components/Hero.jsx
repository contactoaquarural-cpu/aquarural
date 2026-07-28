const Hero = ({ config }) => {
  const nombre    = config?.nombreAsociacion || 'Tu Asociación Ganadera';
  const municipio = config?.municipio || '';
  const telefono  = config?.telefonoContacto || '';

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Fondo con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-[#0d2018] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#5BB89322,_transparent_60%)] z-0" />

      {/* Patrón de puntos */}
      <div className="absolute inset-0 opacity-5 z-0"
        style={{ backgroundImage: 'radial-gradient(#5BB893 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/images/logo.png" alt="GanaderoPro" className="h-24 w-auto rounded-2xl shadow-xl" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Plataforma digital para asociaciones ganaderas
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          {nombre}
          {municipio && (
            <span className="block text-primary mt-2 text-3xl md:text-4xl">{municipio}</span>
          )}
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Gestiona tu membresía, accede a convenios exclusivos, consulta noticias del sector ganadero y mantente al día con tus aportes — todo desde una sola plataforma.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contacto"
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/25 text-base">
            Quiero asociarme
          </a>
          <a href="#modulos"
            className="w-full sm:w-auto border border-dark-border hover:border-primary text-gray-300 hover:text-primary font-semibold px-8 py-4 rounded-xl transition-all text-base">
            Conocer más
          </a>
        </div>

        {/* App badges */}
        <div className="mt-14 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-xs text-gray-500">Disponible en:</span>
          <span className="flex items-center gap-1.5 bg-dark-card border border-dark-border px-3 py-1.5 rounded-lg text-xs text-gray-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.39.07 2.34.74 3.15.8 1.2-.24 2.35-.93 3.63-.84 1.54.12 2.7.72 3.47 1.84-3.17 1.9-2.42 5.9.75 7.04-.57 1.5-1.3 2.98-3 4.04zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            iOS
          </span>
          <span className="flex items-center gap-1.5 bg-dark-card border border-dark-border px-3 py-1.5 rounded-lg text-xs text-gray-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341l-4.684-4.684 4.684-4.684-1.414-1.414-4.684 4.684-4.684-4.684-1.414 1.414 4.684 4.684-4.684 4.684 1.414 1.414 4.684-4.684 4.684 4.684z"/><path d="M3 2l18 10-18 10V2z"/></svg>
            Android
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
