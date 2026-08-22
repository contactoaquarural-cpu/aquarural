import { useState } from 'react';

const SimuladorRecaudo = () => {
  const [suscriptores, setSuscriptores] = useState(150);
  const [tarifaPromedio, setTarifaPromedio] = useState(25000);

  const recaudoTotalMes = suscriptores * tarifaPromedio;
  const incrementoEfectividad = recaudoTotalMes * 0.25; // 25% más recaudo con pagos digitales
  const horasAhorradas = Math.round(suscriptores * 0.15); // Ahorro de horas de cobranza manual

  return (
    <section id="simulador" className="py-20 bg-slate-900/60 border-y border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold px-4 py-1.5 rounded-full font-headline">
            Calculadora Interactiva B2B
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 font-headline">
            Simula el Recaudo de tu Acueducto Veredal
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-body">
            Ajusta los datos de tu acueducto y descubre el impacto económico de digitalizar la facturación y la cobranza por Wompi (Nequi/PSE).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Sliders de Ajuste */}
          <div className="lg:col-span-6 hydro-shimmer-card rounded-3xl p-8 space-y-8 shadow-xl">
            {/* Slider Suscriptores */}
            <div className="space-y-3">
              <div className="flex justify-between items-center font-headline">
                <label className="text-sm font-bold text-slate-200">Número de Suscriptores:</label>
                <span className="text-xl font-extrabold text-cyan-400 font-mono">{suscriptores} usuarios</span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={suscriptores}
                onChange={(e) => setSuscriptores(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50 usuarios</span>
                <span>500 usuarios</span>
                <span>1.000 usuarios</span>
              </div>
            </div>

            {/* Slider Tarifa Promedio */}
            <div className="space-y-3">
              <div className="flex justify-between items-center font-headline">
                <label className="text-sm font-bold text-slate-200">Tarifa Mensual Promedio:</label>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">${tarifaPromedio.toLocaleString()} COP</span>
              </div>
              <input
                type="range"
                min="10000"
                max="60000"
                step="1000"
                value={tarifaPromedio}
                onChange={(e) => setTarifaPromedio(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$10.000 COP</span>
                <span>$35.000 COP</span>
                <span>$60.000 COP</span>
              </div>
            </div>
          </div>

          {/* Resultado de la Simulación */}
          <div className="lg:col-span-6 space-y-6">
            <div className="hydro-shimmer-card rounded-3xl p-8 space-y-6 shadow-2xl">
              <div>
                <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
                  Recaudo Mensual Estimado
                </p>
                <h3 className="text-4xl font-extrabold text-slate-100 font-headline mt-1 tracking-tight">
                  ${recaudoTotalMes.toLocaleString()} <span className="text-sm font-normal text-slate-400">COP/mes</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <span className="material-symbols-outlined text-emerald-400 text-2xl">trending_up</span>
                  <p className="text-xs font-headline text-slate-400 mt-2 font-semibold">+25% Recaudo Digital</p>
                  <p className="text-lg font-bold text-emerald-400 font-headline mt-0.5">
                    +${incrementoEfectividad.toLocaleString()} COP
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Recuperación de mora por Nequi/PSE</p>
                </div>

                <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                  <span className="material-symbols-outlined text-cyan-400 text-2xl">schedule</span>
                  <p className="text-xs font-headline text-slate-400 mt-2 font-semibold">Tiempo Ahorrado Junta</p>
                  <p className="text-lg font-bold text-cyan-400 font-headline mt-0.5">
                    ~{horasAhorradas} horas/mes
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Menos cobro manual puerta a puerta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimuladorRecaudo;
