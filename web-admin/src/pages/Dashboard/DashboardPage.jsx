const DashboardPage = () => {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner Hydro-Tech */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full font-headline">
                Acueducto Veredal La Argentina
              </span>
              <span className="text-slate-500 text-xs font-headline">• Garzón, Huila</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 font-headline tracking-tight">
              Panel de Recaudo & Facturación Digital
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl font-body">
              Gestión centralizada de suscriptores, cobro de servicios de agua y monitoreo de la cartera en tiempo real.
            </p>
          </div>
          <button className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold font-headline px-6 py-3 rounded-2xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">bolt</span>
            <span>Generar Facturación del Mes</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Recaudo Total */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <span className="text-xs font-headline font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              +12.4% este mes
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Recaudo Total Mes
          </p>
          <h3 className="text-3xl font-extrabold text-slate-100 font-headline mt-1 tracking-tight">
            $3.750.000 <span className="text-sm font-normal text-slate-400">COP</span>
          </h3>
        </div>

        {/* Suscriptores */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <span className="text-xs font-headline font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">
              150 Registrados
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Suscriptores Activos
          </p>
          <h3 className="text-3xl font-extrabold text-slate-100 font-headline mt-1 tracking-tight">
            142 <span className="text-sm font-normal text-slate-400">Al día</span>
          </h3>
        </div>

        {/* Cartera Morosa */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <span className="text-xs font-headline font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full">
              8 En mora
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Cartera en Mora
          </p>
          <h3 className="text-3xl font-extrabold text-amber-400 font-headline mt-1 tracking-tight">
            $240.000 <span className="text-sm font-normal text-slate-400">COP</span>
          </h3>
        </div>

        {/* Efectividad Wompi */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-sky-500/40 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <span className="material-symbols-outlined text-2xl">credit_card</span>
            </div>
            <span className="text-xs font-headline font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
              Wompi API v2
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Pagos Digitales
          </p>
          <h3 className="text-3xl font-extrabold text-slate-100 font-headline mt-1 tracking-tight">
            94.6% <span className="text-sm font-normal text-slate-400">Efectividad</span>
          </h3>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla Transacciones Recientes (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-headline">Transacciones de Recaudo Recientes</h2>
              <p className="text-xs text-slate-400 font-body">Últimos pagos procesados en línea (Wompi) y efectivo</p>
            </div>
            <button className="text-xs font-headline font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              <span>Ver todas</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-headline uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-3">Suscriptor</th>
                  <th className="pb-3 px-3">Matrícula</th>
                  <th className="pb-3 px-3">Periodo</th>
                  <th className="pb-3 px-3">Valor</th>
                  <th className="pb-3 px-3">Método</th>
                  <th className="pb-3 px-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-body text-slate-200">
                <tr>
                  <td className="py-3.5 px-3 font-semibold text-slate-100">José Donaldo Gómez</td>
                  <td className="py-3.5 px-3 text-slate-400 font-mono">ACU-0101</td>
                  <td className="py-3.5 px-3">2026-08</td>
                  <td className="py-3.5 px-3 font-semibold text-emerald-400">$25.000</td>
                  <td className="py-3.5 px-3">
                    <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      Wompi PSE
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      PAGADA
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-semibold text-slate-100">Hernando Parra Lasso</td>
                  <td className="py-3.5 px-3 text-slate-400 font-mono">ACU-0103</td>
                  <td className="py-3.5 px-3">2026-08</td>
                  <td className="py-3.5 px-3 font-semibold text-emerald-400">$25.000</td>
                  <td className="py-3.5 px-3">
                    <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      Efectivo Oficina
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      PAGADA
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3 font-semibold text-slate-100">María Eudoxia Rojas</td>
                  <td className="py-3.5 px-3 text-slate-400 font-mono">ACU-0102</td>
                  <td className="py-3.5 px-3">2026-08</td>
                  <td className="py-3.5 px-3 font-semibold text-amber-400">$30.000</td>
                  <td className="py-3.5 px-3 text-slate-500">—</td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      PENDIENTE
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de Acciones Rápidas (1 Col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-100 font-headline">Accesos Rápidos</h2>
          <div className="space-y-3">
            <button className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-100 font-headline">Cargar Excel de Suscriptores</p>
                <p className="text-xs text-slate-400">Importar archivo .xlsx</p>
              </div>
            </button>

            <button className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">point_of_sale</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-100 font-headline">Registrar Pago en Efectivo</p>
                <p className="text-xs text-slate-400">Recaudo presencial en oficina</p>
              </div>
            </button>

            <button className="w-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">map</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-100 font-headline">Mapa GPS de Predios</p>
                <p className="text-xs text-slate-400">Ver viviendas en Google Maps</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
