import { useState } from 'react';

const PLAN_STYLE = {
  MANANTIAL: { accent: 'cyan',    border: 'border-cyan-500',    text: 'text-cyan-600',    bg: 'bg-cyan-600',    hoverBg: 'hover:bg-cyan-500' },
  CAUDAL:    { accent: 'cyan',    border: 'border-cyan-500',    text: 'text-cyan-600',    bg: 'bg-cyan-600',    hoverBg: 'hover:bg-cyan-500' },
  CUENCA:    { accent: 'teal',    border: 'border-teal-500',    text: 'text-teal-600',    bg: 'bg-teal-600',    hoverBg: 'hover:bg-teal-500' },
  ACUIFERO:  { accent: 'amber',   border: 'border-amber-500',   text: 'text-amber-600',   bg: 'bg-amber-600',   hoverBg: 'hover:bg-amber-500' },
};

// Base común a los 4 planes — nunca se quita al subir de tier, solo se suma.
const BENEFICIOS_BASE = [
  'Panel Web Admin Completo (Lecturas, Facturación y Caja)',
  'App Móvil para Suscriptores (Push y Confirmaciones RSVP)',
  'Recaudo Digital Wompi (PSE, Nequi y Tarjetas) + Efectivo',
  'Mapa GPS Veredal de Viviendas y Medidores',
  'Reportes Financieros y de Cartera exportables a Excel/PDF',
  'Carga Masiva de Usuarios desde Excel',
  'Capacitación e Inducción a la Junta Directiva',
  'Soporte Técnico Prioritario',
].map((label) => ({ icon: 'check_circle', label }));

const EXTRA_FONTANERO = { icon: 'smartphone', label: 'App Móvil para Fontanero (Lecturas en Campo)', destacado: true };
const EXTRA_MIGRACION = { icon: 'check_circle', label: 'Asesoría de Migración masiva de datos' };
const EXTRA_SERVIDOR = { icon: 'dns', label: 'Servidor Dedicado e Ilimitado', destacado: true };

const PLANES = [
  {
    id: 'MANANTIAL',
    nombre: 'Plan Manantial',
    rango: 'Hasta 150 Suscriptores',
    descripcion: 'Ideal para acueductos veredales pequeños.',
    precioAnual: 600000,
    precioMensual: 60000,
    beneficios: BENEFICIOS_BASE,
    tituloBeneficios: 'Todo lo Esencial Incluido',
  },
  {
    id: 'CAUDAL',
    nombre: 'Plan Caudal',
    rango: '151 a 500 Suscriptores',
    descripcion: 'Perfecto para acueductos en crecimiento.',
    precioAnual: 1000000,
    precioMensual: 100000,
    beneficios: BENEFICIOS_BASE,
    tituloBeneficios: 'Todo lo Esencial Incluido',
  },
  {
    id: 'CUENCA',
    nombre: 'Plan Cuenca',
    rango: '501 a 1.000 Suscriptores',
    descripcion: 'Para redes interveredales consolidadas.',
    precioAnual: 1800000,
    precioMensual: 180000,
    beneficios: BENEFICIOS_BASE,
    tituloBeneficios: 'Todo lo Esencial Incluido',
  },
  {
    id: 'ACUIFERO',
    nombre: 'Plan Acuífero',
    rango: '+1.000 Suscriptores',
    descripcion: 'Para redes macro, empresas de servicios y municipios.',
    precioAnual: 3000000,
    precioMensual: 300000,
    beneficios: [EXTRA_SERVIDOR, EXTRA_FONTANERO, EXTRA_MIGRACION, ...BENEFICIOS_BASE],
    tituloBeneficios: 'Todo lo Anterior, Más:',
  },
];

const PlanesSaaS = () => {
  const [frecuencia, setFrecuencia] = useState('ANUAL'); // 'MENSUAL' | 'ANUAL'
  const [numSuscriptores, setNumSuscriptores] = useState(250);

  const calcularPlanRecomendado = (n, freq) => {
    const count = Math.max(1, Number(n) || 1);
    let plan = PLANES[1]; // CAUDAL por defecto
    if (count <= 150) plan = PLANES[0];
    else if (count <= 500) plan = PLANES[1];
    else if (count <= 1000) plan = PLANES[2];
    else plan = PLANES[3];

    const esAnual = freq === 'ANUAL';
    const costoTotalSaaS = esAnual ? plan.precioAnual : plan.precioMensual;
    const costoMensualEquivalente = esAnual ? Math.round(plan.precioAnual / 12) : plan.precioMensual;
    const costoPorSuscriptorMes = Math.round(costoMensualEquivalente / count);
    const costoPorSuscriptorDia = (costoPorSuscriptorMes / 30).toFixed(1);

    return {
      count,
      planId: plan.id,
      planNombre: plan.nombre,
      rangoText: plan.rango,
      costoTotalSaaS,
      costoMensualEquivalente,
      costoPorSuscriptorMes,
      costoPorSuscriptorDia,
      esAnual,
    };
  };

  const calc = calcularPlanRecomendado(numSuscriptores, frecuencia);

  const abrirWhatsAppPlan = (rango, precio) => {
    const num = '3166160377';
    const msg = encodeURIComponent(
      `Hola! Deseamos comenzar la PRUEBA GRATUITA de 1 MES del plan ${rango} (${frecuencia === 'ANUAL' ? 'Modalidad Anual $' + precio + ' COP' : 'Modalidad Mensual $' + precio + ' COP'}) para nuestro acueducto.`
    );
    window.open(`https://wa.me/57${num}?text=${msg}`, '_blank');
  };

  return (
    <section id="planes" className="py-24 bg-white transition-colors">
      <div className="max-w-7xl mx-auto px-6">

        {/* Cabecera */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-headline tracking-tight">
            Planes Diseñados a la Medida de tu Acueducto
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-body leading-relaxed">
            Prueba la plataforma <strong>gratis el primer mes</strong>. Todos los planes incluyen la plataforma completa de facturación y recaudo; los niveles superiores suman funciones de campo y soporte dedicado. Tu tarifa regular sólo dependerá del número de suscriptores.
          </p>
        </div>

        {/* Calculadora de inversión — primero, para que la junta sepa qué plan
            le aplica antes de comparar las 4 tarjetas. */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 space-y-8 mb-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-tint-blue text-trust text-xs font-headline font-bold px-3 py-1 rounded-full mb-2">
                <span className="material-symbols-outlined text-sm">calculate</span>
                <span>Calculadora de Inversión por Familia</span>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-headline">
                ¿Cuánto le cuesta el software a tu Acueducto por Suscriptor?
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm font-body mt-1">
                Ingresa o desliza la cantidad de viviendas de tu vereda para ver qué plan te aplica y cuánto cuesta por familia.
              </p>
            </div>

            <div className="flex items-center gap-2 text-emerald-700 text-xs font-headline font-bold shrink-0">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span>Costo transparente — sin cargos ocultos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Control Slider & Input */}
            <div className="lg:col-span-6 space-y-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-trust">group</span>
                  <span>Número de Suscriptores / Familias:</span>
                </label>

                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={numSuscriptores}
                    onChange={(e) => setNumSuscriptores(Math.max(1, Number(e.target.value) || 1))}
                    className="w-28 bg-white border border-slate-300 rounded-lg pl-3 pr-2 py-1.5 text-center font-mono font-bold text-slate-900 text-base focus:outline-none focus:border-trust"
                  />
                  <span className="ml-2 text-xs font-bold text-slate-500 font-headline">familias</span>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="range"
                  min="30"
                  max="2000"
                  step="10"
                  value={numSuscriptores}
                  onChange={(e) => setNumSuscriptores(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-trust"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>30</span>
                  <span>500</span>
                  <span>1.000</span>
                  <span>2.000+</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-headline font-bold">Plan Aplicable:</span>
                <span className="bg-tint-blue text-trust font-bold text-xs px-3 py-1 rounded-full font-headline">
                  {calc.planNombre} ({calc.rangoText})
                </span>
              </div>
            </div>

            {/* Resultados — mismo lenguaje plano de las tarjetas de plan:
                borde fino, sin fondo de color de bloque completo; el color
                vive solo en el ícono y en la cifra destacada. */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-[11px] font-bold font-headline uppercase tracking-wider">Inversión por Familia</span>
                  <span className="material-symbols-outlined text-xl text-emerald-600">home_pin</span>
                </div>
                <p className="text-3xl font-extrabold text-emerald-600 font-mono">
                  ${calc.costoPorSuscriptorMes.toLocaleString()}{' '}
                  <span className="text-xs text-slate-500 font-normal font-body">COP/mes</span>
                </p>
                <p className="text-xs text-slate-500 font-body">
                  Solo ${calc.costoPorSuscriptorDia} COP al día por vivienda
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-[11px] font-bold font-headline uppercase tracking-wider">Costo Plan Acueducto</span>
                  <span className="material-symbols-outlined text-xl text-trust">water_drop</span>
                </div>
                <p className="text-3xl font-extrabold text-trust font-mono whitespace-nowrap">
                  ${calc.costoTotalSaaS.toLocaleString()}{' '}
                  <span className="text-xs text-slate-500 font-normal font-body">
                    COP/{calc.esAnual ? 'año' : 'mes'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 font-body">
                  {calc.esAnual
                    ? <>Equivale a <strong className="text-slate-700">${calc.costoMensualEquivalente.toLocaleString()} COP/mes</strong> (ahorras 2 meses)</>
                    : 'Sin cláusula de permanencia · Cobro mes a mes'}
                </p>
              </div>

              <div className="sm:col-span-2 bg-tint-blue border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-trust text-xl">savings</span>
                  <p className="text-xs text-slate-600 font-body">
                    Se paga solo ahorrando el gasto de papel e imprenta de facturación física.
                  </p>
                </div>
                <button
                  onClick={() => abrirWhatsAppPlan(`${calc.planNombre} (para ${calc.count} suscriptores)`, calc.esAnual ? `${calc.costoTotalSaaS.toLocaleString()} COP/año` : `${calc.costoTotalSaaS.toLocaleString()} COP/mes`)}
                  className="bg-trust hover:bg-trust-dark text-white font-extrabold font-headline text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Probar 1er Mes Gratis
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Mensual / Anual — justo encima de las tarjetas que controla */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8 select-none bg-white border border-slate-200 px-6 sm:px-8 py-3.5 rounded-full w-full max-w-2xl mx-auto">
          <div
            onClick={() => setFrecuencia('MENSUAL')}
            className={`flex items-center gap-2 text-xs sm:text-sm font-headline font-bold cursor-pointer transition-colors whitespace-nowrap ${
              frecuencia === 'MENSUAL' ? 'text-trust' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            <span>Pago Mensual</span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={frecuencia === 'ANUAL'}
            onClick={() => setFrecuencia((prev) => (prev === 'MENSUAL' ? 'ANUAL' : 'MENSUAL'))}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative cursor-pointer shrink-0 ${
              frecuencia === 'ANUAL' ? 'bg-trust' : 'bg-slate-300'
            }`}
            title="Alternar entre Pago Mensual y Pago Anual (2 meses gratis)"
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 transform ${
                frecuencia === 'ANUAL' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>

          <div className="flex items-center gap-2.5 shrink-0">
            <div
              onClick={() => setFrecuencia('ANUAL')}
              className={`flex items-center gap-2 text-xs sm:text-sm font-headline font-bold cursor-pointer transition-colors whitespace-nowrap ${
                frecuencia === 'ANUAL' ? 'text-trust' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="material-symbols-outlined text-lg">stars</span>
              <span>Pago Anual</span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-3 py-1 rounded-full font-headline whitespace-nowrap">
              2 Meses Gratis
            </span>
          </div>
        </div>

        {/* Tarjetas de planes — plano, borde fino, sin sombra ni animación de
            brillo; el plan recomendado se marca con una franja superior de
            color y una etiqueta, no con anillo+sombra+escala. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANES.map((plan) => {
            const style = PLAN_STYLE[plan.id];
            const recomendado = calc.planId === plan.id;
            const precio = frecuencia === 'ANUAL' ? plan.precioAnual : plan.precioMensual;
            const precioMensualEquivalente = frecuencia === 'ANUAL' ? Math.round(plan.precioAnual / 12) : plan.precioMensual;
            const ahorroAnual = plan.precioMensual * 12 - plan.precioAnual;

            return (
              <div
                key={plan.id}
                className={`relative bg-white border rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-colors ${
                  recomendado ? `${style.border} border-2` : 'border-slate-200 hover:border-trust/50'
                }`}
              >
                {recomendado && (
                  <span className={`absolute -top-3 left-6 ${style.bg} text-white text-[10px] font-headline font-bold px-3 py-1 rounded-full`}>
                    Recomendado para ti
                  </span>
                )}

                <div className="space-y-4">
                  <div className="h-16 flex flex-col justify-center">
                    <h3 className="text-xl font-extrabold text-slate-900 font-headline">
                      {plan.nombre}
                    </h3>
                    <p className={`${style.text} text-xs font-headline font-bold mt-0.5`}>
                      {plan.rango}
                    </p>
                    <p className="text-slate-500 text-[11px] font-body leading-tight mt-1">
                      {plan.descripcion}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 h-24 flex flex-col justify-between">
                    <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
                      <span className="text-2xl xl:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                        ${precio.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 font-body shrink-0">
                        COP / {frecuencia === 'ANUAL' ? 'año' : 'mes'}
                      </span>
                    </div>
                    {frecuencia === 'ANUAL' ? (
                      <p className="text-[11px] text-slate-500 font-body">
                        Equivale a <strong className="text-emerald-600">${precioMensualEquivalente.toLocaleString()} COP/mes</strong> — ahorras ${ahorroAnual.toLocaleString()} COP/año
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-body">
                        Anual: <strong className="text-emerald-600">${precioMensualEquivalente.toLocaleString()} COP/mes</strong>
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-headline font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                      {plan.tituloBeneficios}
                    </p>
                    <ul className="space-y-2 text-xs text-slate-600 font-body">
                      {plan.beneficios.map((b, idx) => (
                        <li key={idx} className={`flex items-start gap-1.5 min-h-[22px] ${b.destacado ? `font-bold ${style.text}` : ''}`}>
                          <span className={`material-symbols-outlined text-xs shrink-0 mt-0.5 ${b.destacado ? style.text : 'text-emerald-600'}`}>
                            {b.icon}
                          </span>
                          <span className="text-[11px] leading-tight">{b.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => abrirWhatsAppPlan(`${plan.nombre} (${plan.rango})`, `${precio.toLocaleString()} (IVA incl.)`)}
                  className="w-full bg-trust hover:bg-trust-dark text-white font-headline font-extrabold text-xs py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  <span className="material-symbols-outlined text-base">rocket_launch</span>
                  <span>Comenzar 1er Mes Gratis</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PlanesSaaS;
