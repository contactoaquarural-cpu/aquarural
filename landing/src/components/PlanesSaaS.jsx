import { useState } from 'react';

const PlanesSaaS = () => {
  const [frecuencia, setFrecuencia] = useState('ANUAL'); // 'MENSUAL' | 'ANUAL'
  const [numSuscriptores, setNumSuscriptores] = useState(250);

  const calcularPlanRecomendado = (n, freq) => {
    const count = Math.max(1, Number(n) || 1);
    let planId = 'CAUDAL';
    let planNombre = 'Plan Caudal';
    let planBadge = '🌊 PLAN CAUDAL';
    let precioMensualTotal = 100000;
    let precioAnualTotal = 1000000;
    let rangoText = '151 a 500 Suscriptores';

    if (count <= 150) {
      planId = 'MANANTIAL';
      planNombre = 'Plan Manantial';
      planBadge = '💧 PLAN MANANTIAL';
      precioMensualTotal = 60000;
      precioAnualTotal = 600000;
      rangoText = 'Hasta 150 Suscriptores';
    } else if (count <= 500) {
      planId = 'CAUDAL';
      planNombre = 'Plan Caudal';
      planBadge = '🌊 PLAN CAUDAL';
      precioMensualTotal = 100000;
      precioAnualTotal = 1000000;
      rangoText = '151 a 500 Suscriptores';
    } else if (count <= 1000) {
      planId = 'CUENCA';
      planNombre = 'Plan Cuenca';
      planBadge = '🏞️ PLAN CUENCA';
      precioMensualTotal = 180000;
      precioAnualTotal = 1800000;
      rangoText = '501 a 1.000 Suscriptores';
    } else {
      planId = 'ACUIFERO';
      planNombre = 'Plan Acuífero';
      planBadge = '⚡ PLAN ACUÍFERO';
      precioMensualTotal = 300000;
      precioAnualTotal = 3000000;
      rangoText = '+1.000 Suscriptores';
    }

    const esAnual = freq === 'ANUAL';
    const costoTotalSaaS = esAnual ? precioAnualTotal : precioMensualTotal;
    const costoMensualEquivalente = esAnual ? Math.round(precioAnualTotal / 12) : precioMensualTotal;
    const costoPorSuscriptorMes = Math.round(costoMensualEquivalente / count);
    const costoPorSuscriptorDia = (costoPorSuscriptorMes / 30).toFixed(1);

    return {
      count,
      planId,
      planNombre,
      planBadge,
      rangoText,
      costoTotalSaaS,
      costoMensualEquivalente,
      costoPorSuscriptorMes,
      costoPorSuscriptorDia,
      esAnual
    };
  };

  const calc = calcularPlanRecomendado(numSuscriptores, frecuencia);

  const abrirWhatsAppPlan = (rango, precio) => {
    const num = '3166160377';
    const msg = encodeURIComponent(
      `Hola! Deseamos comenzar la PRUEBA GRATUITA de 1 MES del plan ${rango} (${frecuencia === 'ANUAL' ? 'Modalidad Anual $'+precio+' COP' : 'Modalidad Mensual $'+precio+' COP'}) para nuestro acueducto.`
    );
    window.open(`https://wa.me/57${num}?text=${msg}`, '_blank');
  };

  const beneficiosTodos = [
    'Panel Web Admin Completo (Lecturas, Facturación y Caja)',
    'App Móvil para Suscriptores (Push & Confirmaciones RSVP)',
    'Recaudo Digital Wompi (PSE, Nequi y Tarjetas) + Efectivo',
    'Mapa GPS Veredal de Viviendas y Medidores',
    'Reportes Financieros & Cartera exportables a Excel/PDF',
    'Carga Masiva de Usuarios desde Excel',
    'Capacitación e Inducción a la Junta Directiva',
    'Soporte Técnico Prioritario',
  ];

  return (
    <section id="planes" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* CABECERA CON ALTO CONSTRASTE Y LEGIBILIDAD */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-headline font-extrabold px-4 py-2 rounded-full shadow-sm">
            <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-400">verified</span>
            <span>🎁 ¡PRIMER MES 100% GRATIS DE PRUEBA SIN COMPROMISO!</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-headline tracking-tight">
            Planes Diseñados a la Medida de tu Acueducto
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-body leading-relaxed">
            Prueba la plataforma <strong>gratis el primer mes</strong>. Todos los planes incluyen el <strong>100% de las funciones avanzadas</strong>. Tu tarifa regular sólo dependerá del número de suscriptores.
          </p>
        </div>

        {/* SELECTOR TOGGLE SWITCH CON ANCHO AMPLIADO Y SIN SALTO DE LÍNEA */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-16 select-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-3.5 rounded-full w-full max-w-2xl mx-auto shadow-md dark:shadow-2xl">
          <div
            onClick={() => setFrecuencia('MENSUAL')}
            className={`flex items-center gap-2 text-xs sm:text-sm font-headline font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
              frecuencia === 'MENSUAL' ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-lg text-cyan-600 dark:text-cyan-400">calendar_month</span>
            <span>Pago Mensual</span>
          </div>

          {/* PERILLA DESLIZABLE (TOGGLE SWITCH) */}
          <button
            type="button"
            role="switch"
            aria-checked={frecuencia === 'ANUAL'}
            onClick={() => setFrecuencia((prev) => (prev === 'MENSUAL' ? 'ANUAL' : 'MENSUAL'))}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative cursor-pointer border shrink-0 ${
              frecuencia === 'ANUAL'
                ? 'bg-emerald-500 border-emerald-600'
                : 'bg-cyan-600 border-cyan-700'
            }`}
            title="Alternar entre Pago Mensual y Pago Anual (2 meses gratis)"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white dark:bg-slate-950 shadow-md transition-transform duration-300 transform flex items-center justify-center ${
                frecuencia === 'ANUAL' ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {frecuencia === 'ANUAL' ? (
                <span className="material-symbols-outlined text-[13px] text-emerald-600 font-black">star</span>
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
              )}
            </div>
          </button>

          <div className="flex items-center gap-2.5 shrink-0">
            <div
              onClick={() => setFrecuencia('ANUAL')}
              className={`flex items-center gap-2 text-xs sm:text-sm font-headline font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                frecuencia === 'ANUAL' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-lg text-amber-500">stars</span>
              <span>Pago Anual</span>
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-[10px] font-extrabold px-3 py-1 rounded-full font-headline whitespace-nowrap">
              🎁 2 Meses Gratis
            </span>
          </div>
        </div>

        {/* CONTENEDOR DE TARJETAS DE PLANES CON EFECTO HOVER AL FRENTE (4 COLUMNAS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          
          {/* Plan 1: Plan Manantial (Hasta 150 Suscriptores) */}
          <div className={`group relative overflow-hidden bg-white dark:bg-slate-900 border rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-md transition-all duration-300 transform hover:-translate-y-2.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-500 ${
            calc.planBadge === 'MANANTIAL' 
              ? 'ring-4 ring-cyan-500/60 border-cyan-500 shadow-xl shadow-cyan-500/10 -translate-y-1' 
              : 'border-slate-200 dark:border-slate-800'
          }`}>
            {/* Destello de luz diagonal al pasar el puntero por la tarjeta */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 dark:via-white/5 to-transparent transition-transform duration-1000 pointer-events-none" />

            <div className="space-y-4">
              {/* Título & Rango */}
              <div className="h-16 flex flex-col justify-center">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-headline group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Plan Manantial
                </h3>
                <p className="text-cyan-600 dark:text-cyan-400 text-xs font-headline font-bold mt-0.5">
                  Hasta 150 Suscriptores
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-body leading-tight mt-1">
                  Ideal para acueductos veredales pequeños.
                </p>
              </div>

              {/* PRECIO & COMPARATIVO (Altura Fijada Nivelada) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 h-28 flex flex-col justify-between">
                {frecuencia === 'ANUAL' ? (
                  <>
                    <div className="flex flex-col justify-center h-12">
                      <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                        <span className="text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-headline tracking-tight">$600.000</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body shrink-0">COP / año</span>
                      </div>
                      <span className="text-[10px] font-headline font-extrabold text-emerald-600 dark:text-emerald-400">IVA incluido</span>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2 rounded-xl space-y-0.5 group-hover:border-emerald-400 transition-colors">
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-headline font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-emerald-600 dark:text-emerald-400">bolt</span>
                        <span>Equivale a <strong>$50.000 COP</strong> / mes</span>
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-body">
                        🎁 Ahorras $120.000 COP al año
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col justify-center h-12">
                      <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                        <span className="text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-headline tracking-tight">$60.000</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body shrink-0">COP / mes</span>
                      </div>
                      <span className="text-[10px] font-headline font-extrabold text-emerald-600 dark:text-emerald-400">IVA incluido</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">
                      💡 Anual: <strong className="text-emerald-600 dark:text-emerald-400">$50.000 COP/mes</strong>
                    </p>
                  </>
                )}
              </div>

              {/* LISTA DE BENEFICIOS */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-headline font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                  100% Funciones Incluidas:
                </p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-body">
                  {beneficiosTodos.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 min-h-[22px]">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                      <span className="text-[11px] leading-tight">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => abrirWhatsAppPlan('Plan Manantial (Hasta 150 Suscriptores)', frecuencia === 'ANUAL' ? '600.000 (IVA incl.)' : '60.000 (IVA incl.)')}
              className="relative overflow-hidden group/btn w-full bg-cyan-600 hover:bg-cyan-500 text-white font-headline font-extrabold text-xs py-3.5 rounded-2xl shadow-md shadow-cyan-600/30 hover:shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-6"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 pointer-events-none" />
              <span className="transform group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform duration-300">🚀</span>
              <span>Comenzar 1er Mes Gratis</span>
            </button>
          </div>

          {/* Plan 2: Plan Caudal (151 a 500 Suscriptores) */}
          <div className={`group relative overflow-hidden bg-white dark:bg-slate-900 border rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-md transition-all duration-300 transform hover:-translate-y-2.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-500 ${
            calc.planBadge === 'CAUDAL' 
              ? 'ring-4 ring-cyan-500/60 border-cyan-500 shadow-xl shadow-cyan-500/10 -translate-y-1' 
              : 'border-slate-200 dark:border-slate-800'
          }`}>
            {/* Destello de luz diagonal al pasar el puntero por la tarjeta */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 dark:via-white/5 to-transparent transition-transform duration-1000 pointer-events-none" />

            <div className="space-y-4">
              {/* Título & Rango */}
              <div className="h-16 flex flex-col justify-center">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-headline group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Plan Caudal
                </h3>
                <p className="text-cyan-600 dark:text-cyan-400 text-xs font-headline font-bold mt-0.5">
                  151 a 500 Suscriptores
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-body leading-tight mt-1">
                  Perfecto para acueductos en crecimiento.
                </p>
              </div>

              {/* PRECIO & COMPARATIVO (Altura Fijada Nivelada) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 h-28 flex flex-col justify-between">
                {frecuencia === 'ANUAL' ? (
                  <>
                    <div className="flex flex-col justify-center h-12">
                      <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                        <span className="text-2xl xl:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-headline tracking-tight">$1.000.000</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body shrink-0">COP / año</span>
                      </div>
                      <span className="text-[10px] font-headline font-extrabold text-emerald-600 dark:text-emerald-400">IVA incluido</span>
                    </div>
                    <div className="bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 p-2 rounded-xl space-y-0.5 group-hover:border-cyan-400 transition-colors">
                      <p className="text-[11px] text-cyan-800 dark:text-cyan-300 font-headline font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-cyan-600 dark:text-cyan-400">bolt</span>
                        <span>Equivale a <strong>$83.333 COP</strong> / mes</span>
                      </p>
                      <p className="text-[10px] text-cyan-700 dark:text-cyan-400 font-body">
                        🎁 Ahorras $200.000 COP al año
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col justify-center h-12">
                      <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                        <span className="text-2xl xl:text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-headline tracking-tight">$100.000</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body shrink-0">COP / mes</span>
                      </div>
                      <span className="text-[10px] font-headline font-extrabold text-emerald-600 dark:text-emerald-400">IVA incluido</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">
                      💡 Anual: <strong className="text-cyan-600 dark:text-cyan-400">$83.333 COP/mes</strong>
                    </p>
                  </>
                )}
              </div>

              {/* LISTA DE BENEFICIOS */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-headline font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                  100% Funciones Incluidas:
                </p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-body">
                  {beneficiosTodos.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 min-h-[22px]">
                      <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                      <span className="text-[11px] leading-tight">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => abrirWhatsAppPlan('Plan Caudal (151 a 500 Suscriptores)', frecuencia === 'ANUAL' ? '1.000.000 (IVA incl.)' : '100.000 (IVA incl.)')}
              className="relative overflow-hidden group/btn w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-headline font-extrabold text-xs py-3.5 rounded-2xl shadow-md shadow-cyan-600/30 hover:shadow-xl hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-6"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 pointer-events-none" />
              <span className="transform group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform duration-300">🚀</span>
              <span>Comenzar 1er Mes Gratis</span>
            </button>
          </div>

          {/* Plan 3: Plan Cuenca (501 a 1.000 Suscriptores) */}
          <div className={`group relative overflow-hidden bg-white dark:bg-slate-900 border rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-md transition-all duration-300 transform hover:-translate-y-2.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-teal-500/20 hover:border-teal-500 ${
            calc.planBadge === 'CUENCA' 
              ? 'ring-4 ring-teal-500/60 border-teal-500 shadow-xl shadow-teal-500/10 -translate-y-1' 
              : 'border-slate-200 dark:border-slate-800'
          }`}>
            {/* Destello de luz diagonal al pasar el puntero por la tarjeta */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 dark:via-white/5 to-transparent transition-transform duration-1000 pointer-events-none" />

            <div className="space-y-4">
              {/* Título & Rango */}
              <div className="h-16 flex flex-col justify-center">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-headline group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Plan Cuenca
                </h3>
                <p className="text-teal-600 dark:text-teal-400 text-xs font-headline font-bold mt-0.5">
                  501 a 1.000 Suscriptores
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-body leading-tight mt-1">
                  Para redes interveredales consolidadas.
                </p>
              </div>

              {/* PRECIO & COMPARATIVO (Altura Fijada Nivelada) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 h-28 flex flex-col justify-between">
                {frecuencia === 'ANUAL' ? (
                  <>
                    <div className="flex flex-col justify-center h-12">
                      <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                        <span className="text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-headline tracking-tight">$1.800.000</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body shrink-0">COP / año</span>
                      </div>
                      <span className="text-[10px] font-headline font-extrabold text-emerald-600 dark:text-emerald-400">IVA incluido</span>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2 rounded-xl space-y-0.5 group-hover:border-teal-400 transition-colors">
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-headline font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-emerald-600 dark:text-emerald-400">bolt</span>
                        <span>Equivale a <strong>$150.000 COP</strong> / mes</span>
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-body">
                        🎁 Ahorras $360.000 COP al año
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col justify-center h-12">
                      <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                        <span className="text-2xl xl:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-headline tracking-tight">$180.000</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body shrink-0">COP / mes</span>
                      </div>
                      <span className="text-[10px] font-headline font-extrabold text-emerald-600 dark:text-emerald-400">IVA incluido</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">
                      💡 Anual: <strong className="text-emerald-600 dark:text-emerald-400">$150.000 COP/mes</strong>
                    </p>
                  </>
                )}
              </div>

              {/* LISTA DE BENEFICIOS - PLAN CUENCA (INCLUYE APP FONTANERO) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-headline font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2.5">
                  Funciones Nivel Avanzado:
                </p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-body">
                  <li className="flex items-start gap-1.5 min-h-[22px] font-bold text-teal-700 dark:text-teal-300">
                    <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">smartphone</span>
                    <span className="text-[11px] leading-tight">App Móvil para Fontanero (Lecturas en Campo)</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Panel Web Admin (Lecturas, Facturación y Caja)</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">App Móvil para Suscriptores (Notificaciones Push)</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Recaudo Digital Wompi (PSE, Nequi) + Efectivo</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Mapa GPS Veredal de Viviendas y Medidores</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Reportes Financieros exportables a Excel/PDF</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Carga Masiva de Usuarios desde Excel</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Capacitación a Junta + Soporte Prioritario</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => abrirWhatsAppPlan('Plan Cuenca (501 a 1.000 Suscriptores)', frecuencia === 'ANUAL' ? '1.800.000 (IVA incl.)' : '180.000 (IVA incl.)')}
              className="relative overflow-hidden group/btn w-full bg-teal-600 hover:bg-teal-500 text-white font-headline font-extrabold text-xs py-3.5 rounded-2xl shadow-md shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-500/40 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-6"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 pointer-events-none" />
              <span className="transform group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform duration-300">🚀</span>
              <span>Comenzar 1er Mes Gratis</span>
            </button>
          </div>

          {/* Plan 4: Plan Acuífero (+1.000 Suscriptores) - PREMIUM GOLD */}
          <div className={`group relative overflow-hidden bg-white dark:bg-slate-900 border-2 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-lg transition-all duration-300 transform hover:-translate-y-2.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/25 hover:border-amber-500 ${
            calc.planBadge === 'ACUÍFERO' 
              ? 'ring-4 ring-amber-500/60 border-amber-500 shadow-xl shadow-amber-500/10 -translate-y-1' 
              : 'border-amber-400 dark:border-amber-500/80'
          }`}>
            {/* Destello de luz diagonal al pasar el puntero por la tarjeta */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent transition-transform duration-1000 pointer-events-none" />

            <div className="space-y-4">
              {/* Título & Rango */}
              <div className="h-16 flex flex-col justify-center">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-headline group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <span>Plan Acuífero</span>
                </h3>
                <p className="text-amber-600 dark:text-amber-400 text-xs font-headline font-bold mt-0.5">
                  +1.000 Suscriptores
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-body leading-tight mt-1">
                  Para redes macro, empresas de servicios y municipios.
                </p>
              </div>

              {/* PRECIO & COMPARATIVO (Altura Fijada Nivelada) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 h-28 flex flex-col justify-between">
                {frecuencia === 'ANUAL' ? (
                  <>
                    <div className="flex flex-col justify-center h-12">
                      <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                        <span className="text-2xl xl:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-headline tracking-tight">$3.000.000</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body shrink-0">COP / año</span>
                      </div>
                      <span className="text-[10px] font-headline font-extrabold text-emerald-600 dark:text-emerald-400">IVA incluido</span>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2 rounded-xl space-y-0.5 group-hover:border-amber-400 transition-colors">
                      <p className="text-[11px] text-amber-900 dark:text-amber-300 font-headline font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-amber-600 dark:text-amber-400">bolt</span>
                        <span>Equivale a <strong>$250.000 COP</strong> / mes</span>
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-body">
                        🎁 Ahorras $600.000 COP al año
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col justify-center h-12">
                      <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                        <span className="text-2xl xl:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-headline tracking-tight">$300.000</span>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-body shrink-0">COP / mes</span>
                      </div>
                      <span className="text-[10px] font-headline font-extrabold text-emerald-600 dark:text-emerald-400">IVA incluido</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">
                      💡 Anual: <strong className="text-amber-600 dark:text-amber-400">$250.000 COP/mes</strong>
                    </p>
                  </>
                )}
              </div>

              {/* LISTA DE BENEFICIOS - PLAN ACUÍFERO (INCLUYE APP FONTANERO + DEDICADO) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-headline font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2.5">
                  100% Incluido + Especiales:
                </p>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-body">
                  <li className="flex items-start gap-1.5 text-amber-800 dark:text-amber-300 font-bold min-h-[22px]">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">star</span>
                    <span className="text-[11px] leading-tight">Servidor Dedicado e Ilimitado</span>
                  </li>
                  <li className="flex items-start gap-1.5 text-amber-800 dark:text-amber-300 font-bold min-h-[22px]">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">smartphone</span>
                    <span className="text-[11px] leading-tight">App Móvil para Fontanero (Lecturas en Campo)</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Asesoría de Migración masiva de datos</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Panel Web Admin (Lecturas, Facturación y Caja)</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">App Móvil para Suscriptores (Push Notifications)</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Recaudo Digital Wompi + Efectivo</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Mapa GPS Veredal de Viviendas y Medidores</span>
                  </li>
                  <li className="flex items-start gap-1.5 min-h-[22px]">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-xs shrink-0 mt-0.5 group-hover:scale-125 transition-transform duration-200">check_circle</span>
                    <span className="text-[11px] leading-tight">Reportes Financieros exportables a Excel/PDF</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => abrirWhatsAppPlan('Plan Acuífero (+1.000 Suscriptores)', frecuencia === 'ANUAL' ? '3.000.000 (IVA incl.)' : '300.000 (IVA incl.)')}
              className="relative overflow-hidden group/btn w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-headline font-extrabold text-xs py-3.5 rounded-2xl shadow-md shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/50 transform hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-6"
            >
              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 pointer-events-none" />
              <span className="transform group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform duration-300">🚀</span>
              <span>Comenzar 1er Mes Gratis</span>
            </button>
          </div>

        </div>

        {/* 🧮 CALCULADORA DE INVERSIÓN POR SUSCRIPTOR Y FAMILIA */}
        <div className="mt-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl space-y-8 relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs font-headline font-extrabold px-3 py-1 rounded-full mb-2">
                <span className="material-symbols-outlined text-sm">calculate</span>
                <span>CALCULADORA DE INVERSIÓN POR FAMILIA</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-headline">
                ¿Cuánto le cuesta el software a tu Acueducto por Suscriptor?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-body mt-1">
                Ingresa o desliza la cantidad de viviendas de tu vereda para calcular el costo por usuario.
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">verified_user</span>
              <div className="text-right">
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-headline font-bold uppercase">Costo Transparente</p>
                <p className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 font-headline">Sin cargos ocultos ni sorpresas</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Control Slider & Input */}
            <div className="lg:col-span-6 space-y-6 bg-slate-50 dark:bg-slate-950/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400">group</span>
                  <span>Número de Suscriptores / Familias:</span>
                </label>

                {/* Input de Número Manual */}
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={numSuscriptores}
                    onChange={(e) => setNumSuscriptores(Math.max(1, Number(e.target.value) || 1))}
                    className="w-32 bg-white dark:bg-slate-900 border-2 border-cyan-500 rounded-xl pl-4 pr-8 py-1.5 text-center font-mono font-extrabold text-slate-900 dark:text-slate-100 text-lg focus:outline-none shadow-sm tracking-wide"
                  />
                  <span className="ml-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 font-headline">familias</span>
                </div>
              </div>

              {/* Slider táctil deslizable */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="30"
                  max="2000"
                  step="10"
                  value={numSuscriptores}
                  onChange={(e) => setNumSuscriptores(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>30 Suscriptores</span>
                  <span>500</span>
                  <span>1.000</span>
                  <span>2.000+ Suscriptores</span>
                </div>
              </div>

              {/* Distintivo de Plan Asignado */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-headline font-bold">Plan Aplicable:</span>
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-extrabold text-xs px-3 py-1 rounded-full font-headline">
                  {calc.planBadge} ({calc.rangoText})
                </span>
              </div>
            </div>

            {/* Resultados Numéricos Impactantes */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tarjeta 1: Costo por Familia */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/40 rounded-2xl p-5 space-y-2 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                  <span className="text-[11px] font-extrabold font-headline uppercase tracking-wider">Inversión por Familia</span>
                  <span className="material-symbols-outlined text-2xl">home_pin</span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-headline">
                  ${calc.costoPorSuscriptorMes.toLocaleString()}{' '}
                  <span className="text-xs text-slate-500 font-normal font-body">COP/mes</span>
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-headline font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  <span>¡Solo <strong>${calc.costoPorSuscriptorDia} COP</strong> al día por vivienda!</span>
                </p>
              </div>

              {/* Tarjeta 2: Costo Total Acueducto (Clarificado) */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2 shadow-md">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span className="text-[11px] font-extrabold font-headline uppercase tracking-wider">Costo Plan Acueducto</span>
                  <span className="material-symbols-outlined text-2xl text-cyan-500">water_drop</span>
                </div>
                <p className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 font-headline">
                  ${calc.costoTotalSaaS.toLocaleString()}{' '}
                  <span className="text-xs text-slate-500 font-normal font-body">
                    COP / {calc.esAnual ? 'año' : 'mes'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">
                  {calc.esAnual ? (
                    <>
                      Equivale a <strong>${calc.costoMensualEquivalente.toLocaleString()} COP/mes</strong> (🎁 Ahorras 2 meses)
                    </>
                  ) : (
                    'Sin cláusula de permanencia • Cobro mes a mes'
                  )}
                </p>
              </div>

              {/* Llamado de Cierre */}
              <div className="sm:col-span-2 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-400 text-xl">savings</span>
                  <p className="text-xs text-slate-300 font-body">
                    Se paga solo ahorrando el gasto de papel e imprenta de facturación física.
                  </p>
                </div>
                <button
                  onClick={() => abrirWhatsAppPlan(`${calc.planNombre} (para ${calc.count} suscriptores)`, calc.esAnual ? `${calc.costoTotalSaaS.toLocaleString()} COP/año` : `${calc.costoTotalSaaS.toLocaleString()} COP/mes`)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold font-headline text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <span>🚀 Probar 1er Mes Gratis</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanesSaaS;
