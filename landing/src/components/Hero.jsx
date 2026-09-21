import { useState, useEffect } from 'react';
import { getConfiguracionGlobal } from '../services/api';

const Hero = () => {
  // Imagen gestionable desde SuperAdmin > Apariencia de la Plataforma. Si no
  // hay ninguna configurada todavía, se usa la de por defecto empaquetada
  // en public/img/.
  const [imagenHero, setImagenHero] = useState('/img/hero-agua.jpg');
  useEffect(() => {
    getConfiguracionGlobal()
      .then(({ data }) => {
        if (data?.data?.heroImagenUrl) setImagenHero(data.data.heroImagenUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative">
      {/* Foto real de portada — "la prueba, no el ambiente".
          El navbar flota transparente encima (ver Navbar.jsx), así que la
          foto arranca en y=0, sin reservar espacio para una barra sólida. */}
      <div className="relative h-[640px] md:h-[700px] overflow-hidden">
        <img
          src={imagenHero}
          alt="Horizonte de agua en calma — el recurso que administra cada acueducto veredal"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* La foto es clara arriba (cielo) y media abajo (agua) — sin este
            tinte uniforme, el navbar y el texto blancos pierden contraste
            contra el cielo pálido. Doble capa: tinte parejo + refuerzo
            hacia abajo donde vive el titular. */}
        <div className="absolute inset-0 bg-slate-950/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/35" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-12 md:pb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full font-headline w-fit mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Plataforma SaaS para Acueductos Veredales de Colombia
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white font-headline tracking-tight leading-tight max-w-3xl">
            Gestión y Recaudo Digital <span className="text-cyan-300">para Acueductos Veredales</span>
          </h1>

          <p className="text-slate-200 text-base md:text-lg font-body leading-relaxed max-w-2xl mt-5">
            Transforma el cobro del agua en tu comunidad rural: Recaudo por Wompi (Nequi, PSE, Tarjetas), facturación masiva en 1-clic, geolocalización GPS de predios y App móvil para suscriptores.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <a
              href="https://wa.me/573166160377?text=Hola!%20Me%20interesa%20solicitar%20una%20demostraci%C3%B3n%20de%20AquaRural%20Pro%20para%20nuestro%20Acueducto%20Veredal."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-trust hover:bg-trust-dark text-white font-extrabold font-headline px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-2xl">chat</span>
              <span>Solicitar Demo para mi Acueducto</span>
            </a>

            <a
              href="#planes"
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold font-headline px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-xl">calculate</span>
              <span>Calcula tu Plan</span>
            </a>
          </div>

          {/* Confianza — sobre la foto, cierre del hero */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-slate-200 font-headline font-semibold pt-8 mt-8 border-t border-white/15">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
              <span>Wompi Pagos Seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-300 text-lg">upload_file</span>
              <span>Carga Masiva Excel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-300 text-lg">phone_iphone</span>
              <span>App iOS & Android</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
