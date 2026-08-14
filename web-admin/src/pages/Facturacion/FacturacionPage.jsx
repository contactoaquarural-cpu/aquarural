import { useState } from 'react';

const FacturacionPage = () => {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('2026-08');

  const facturas = [
    {
      id: '1',
      codigoFactura: 'FAC-202608-ACU-0101',
      suscriptor: 'José Donaldo Gómez Murcia',
      matricula: 'ACU-0101',
      periodo: '2026-08',
      montoTotal: 25000,
      vencimiento: '2026-08-30',
      estado: 'PAGADA',
      metodoPago: 'WOMPI_PSE',
    },
    {
      id: '2',
      codigoFactura: 'FAC-202608-ACU-0102',
      suscriptor: 'María Eudoxia Rojas de Trujillo',
      matricula: 'ACU-0102',
      periodo: '2026-08',
      montoTotal: 30000,
      vencimiento: '2026-08-30',
      estado: 'PENDIENTE',
      metodoPago: null,
    },
    {
      id: '3',
      codigoFactura: 'FAC-202608-ACU-0103',
      suscriptor: 'Hernando Parra Lasso',
      matricula: 'ACU-0103',
      periodo: '2026-08',
      montoTotal: 25000,
      vencimiento: '2026-08-30',
      estado: 'PAGADA',
      metodoPago: 'EFECTIVO_OFICINA',
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Banner Generador Masivo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold px-3 py-1 rounded-full font-headline">
            Asistente de Facturación
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100 font-headline mt-2">
            Facturación Masiva & Recaudo Digital
          </h1>
          <p className="text-slate-400 text-sm font-body mt-1">
            Genera automáticamente las cuentas de cobro para todos los suscriptores activos del periodo seleccionado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-100 font-headline rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500"
          />
          <button className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 px-6 py-2.5 rounded-2xl font-headline font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">bolt</span>
            <span>Generar Periodo {periodoSeleccionado}</span>
          </button>
        </div>
      </div>

      {/* Tabla Cuentas de Cobro */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-100 font-headline">Cuentas de Cobro Emitidas</h2>
          <span className="text-xs text-slate-400 font-headline">Periodo: {periodoSeleccionado}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-headline uppercase tracking-wider text-slate-400">
                <th className="py-4 px-4">Código Factura</th>
                <th className="py-4 px-4">Suscriptor / Matrícula</th>
                <th className="py-4 px-4">Periodo</th>
                <th className="py-4 px-4">Valor Total</th>
                <th className="py-4 px-4">Vencimiento</th>
                <th className="py-4 px-4">Medio de Pago</th>
                <th className="py-4 px-4">Estado</th>
                <th className="py-4 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-body text-slate-200">
              {facturas.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-cyan-400">{f.codigoFactura}</td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-100">{f.suscriptor}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{f.matricula}</p>
                  </td>
                  <td className="py-4 px-4 text-slate-300 font-headline">{f.periodo}</td>
                  <td className="py-4 px-4 font-bold text-slate-100">${f.montoTotal.toLocaleString()} COP</td>
                  <td className="py-4 px-4 text-slate-400">{f.vencimiento}</td>
                  <td className="py-4 px-4">
                    {f.metodoPago ? (
                      <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                        {f.metodoPago}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-headline font-bold ${
                        f.estado === 'PAGADA'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {f.estado}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {f.estado === 'PENDIENTE' ? (
                      <button className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-headline font-semibold text-xs flex items-center gap-1 ml-auto">
                        <span className="material-symbols-outlined text-sm">point_of_sale</span>
                        <span>Cobrar Efectivo</span>
                      </button>
                    ) : (
                      <button className="text-slate-400 hover:text-cyan-400 p-1.5 hover:bg-slate-800 rounded-lg">
                        <span className="material-symbols-outlined text-lg">download</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacturacionPage;
