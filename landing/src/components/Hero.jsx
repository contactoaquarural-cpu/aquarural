const Hero = () => {
  const abrirWhatsAppDemo = () => {
    const num = '3166160377';
    const msg = encodeURIComponent('Hola! Me interesa solicitar una demostración de AquaRural Pro para nuestro Acueducto Veredal.');
    window.open(`https://wa.me/57${num}?text=${msg}`, '_blank');
  };

  return (
    <section className="relative pt-36 md:pt-40 pb-20 overflow-hidden bg-slate-950">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Columna Izquierda — Textos & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold px-4 py-2 rounded-full font-headline">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Plataforma SaaS para Acueductos Veredales de Colombia 🇨🇴
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-100 font-headline tracking-tight leading-tight">
              AquaRural — <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Gestión y Recaudo Digital</span> para Acueductos Veredales
            </h1>

            <p className="text-slate-400 text-base md:text-lg font-body leading-relaxed max-w-2xl">
              Transforma el cobro del agua en tu comunidad rural: Recaudo por Wompi (Nequi, PSE, Tarjetas), facturación masiva en 1-clic, geolocalización GPS de predios y App móvil para suscriptores.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <button
                onClick={abrirWhatsAppDemo}
                className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline px-8 py-4 rounded-2xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-2xl">chat</span>
                <span>Solicitar Demo para mi Acueducto</span>
              </button>

              <a
                href="#simulador"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold font-headline px-8 py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-xl">calculate</span>
                <span>Simulador de Recaudo</span>
              </a>
            </div>

            {/* Badges de Confianza */}
            <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 font-headline">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">verified</span>
                <span>Wompi Pagos Seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">upload_file</span>
                <span>Carga Masiva Excel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-400">phone_iphone</span>
                <span>App iOS & Android</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha — Glassmorphism Mockup Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl space-y-6">
              {/* Header Mockup */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 p-2 flex items-center justify-center">
                    <img src="/favicon.svg" alt="AquaRural" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100 font-headline">Acueducto La Argentina</p>
                    <p className="text-[10px] text-slate-400">Garzón, Huila</p>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full font-headline">
                  RECAUDO 88%
                </span>
              </div>

              {/* KPI Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-headline uppercase">Recaudo Este Mes</p>
                  <p className="text-lg font-extrabold text-slate-100 font-headline mt-1">$3.750.000</p>
                  <p className="text-[10px] text-emerald-400 mt-1">+14% vs mes anterior</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-headline uppercase">Suscriptores</p>
                  <p className="text-lg font-extrabold text-cyan-400 font-headline mt-1">150 Activos</p>
                  <p className="text-[10px] text-slate-400 mt-1">Padrón veredal</p>
                </div>
              </div>

              {/* App QR Card Preview */}
              <div className="bg-gradient-to-r from-sky-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-100 font-headline">José Donaldo Gómez</p>
                  <p className="text-[10px] text-cyan-400 font-mono">Matrícula: ACU-0101</p>
                </div>
                <span className="material-symbols-outlined text-3xl text-cyan-400">qr_code_2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
