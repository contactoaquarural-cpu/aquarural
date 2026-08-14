const PlanesSaaS = () => {
  const abrirWhatsAppPlan = (nombrePlan) => {
    const num = '3166160377';
    const msg = encodeURIComponent(`Hola! Me interesa solicitar información sobre el ${nombrePlan} de AquaRural Pro para nuestro acueducto.`);
    window.open(`https://wa.me/57${num}?text=${msg}`, '_blank');
  };

  return (
    <section id="planes" className="py-20 bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-semibold px-4 py-1.5 rounded-full font-headline">
            Suscripción Flexible
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 font-headline">
            Planes Diseñados a la Medida de tu Acueducto
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-body">
            Sin costos ocultos ni cláusulas de permanencia. Escoge el plan adecuado según la cantidad de suscriptores de tu comunidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Plan Básico */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full font-headline">
                PLAN BÁSICO
              </span>
              <h3 className="text-2xl font-bold text-slate-100 font-headline">Hasta 150 Suscriptores</h3>
              <p className="text-slate-400 text-xs font-body">Ideal para acueductos veredales pequeños o veredas individuales.</p>
              <div className="pt-4 border-t border-slate-900">
                <span className="text-4xl font-extrabold text-slate-100 font-headline">$50.000</span>
                <span className="text-xs text-slate-400 font-body"> COP / mes</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 font-headline pt-4">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Panel Web Admin completo</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Carga masiva desde Excel</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Pasarela de pagos Wompi</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>App Móvil para Suscriptores</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => abrirWhatsAppPlan('Plan Básico')}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold font-headline py-3 rounded-2xl transition-all"
            >
              Seleccionar Plan Básico
            </button>
          </div>

          {/* Plan Estándar (Destacado) */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/80 rounded-3xl p-8 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-cyan-500/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full font-headline uppercase tracking-wider">
              ⭐ MÁS POPULAR
            </div>

            <div className="space-y-4">
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold px-3 py-1 rounded-full font-headline">
                PLAN ESTÁNDAR
              </span>
              <h3 className="text-2xl font-bold text-slate-100 font-headline">151 a 500 Suscriptores</h3>
              <p className="text-slate-400 text-xs font-body">Diseñado para asociaciones y juntas comunitarias medianas.</p>
              <div className="pt-4 border-t border-slate-800">
                <span className="text-4xl font-extrabold text-cyan-300 font-headline">$80.000</span>
                <span className="text-xs text-slate-400 font-body"> COP / mes</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-200 font-headline pt-4">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-sm">check_circle</span>
                  <span>Todo lo del Plan Básico</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-sm">check_circle</span>
                  <span>Mapa GPS de predios en alta definición</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-sm">check_circle</span>
                  <span>Módulo de avisos por WhatsApp & Push</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-sm">check_circle</span>
                  <span>Soporte prioritario para el tesorero</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => abrirWhatsAppPlan('Plan Estándar')}
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline py-3 rounded-2xl shadow-lg shadow-cyan-500/20 transition-all"
            >
              Seleccionar Plan Estándar
            </button>
          </div>

          {/* Plan Empresarial */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div className="space-y-4">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full font-headline">
                PLAN EMPRESARIAL
              </span>
              <h3 className="text-2xl font-bold text-slate-100 font-headline">Más de 500 Suscriptores</h3>
              <p className="text-slate-400 text-xs font-body">Para grandes redes interveredales y municipios.</p>
              <div className="pt-4 border-t border-slate-900">
                <span className="text-4xl font-extrabold text-emerald-400 font-headline">$150.000</span>
                <span className="text-xs text-slate-400 font-body"> COP / mes</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 font-headline pt-4">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Suscriptores ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Integración de sensores de micro-medición</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Capacitación presencial a la Junta</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => abrirWhatsAppPlan('Plan Empresarial')}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold font-headline py-3 rounded-2xl transition-all"
            >
              Seleccionar Empresarial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanesSaaS;
