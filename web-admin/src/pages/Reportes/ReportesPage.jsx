import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.service';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatMonto = (m) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(m || 0);

const KpiCard = ({ label, value, sub, accent }) => (
  <div className={`bg-white border border-slate-200 p-6 rounded-3xl relative overflow-hidden shadow-sm ${accent ? 'border-l-4 border-l-amber-400' : ''}`}>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-headline">{label}</p>
    <h3 className={`text-3xl font-extrabold font-headline ${accent ? 'text-amber-600' : 'text-slate-800'}`}>{value}</h3>
    <p className="text-[11px] mt-2 text-slate-500">{sub}</p>
  </div>
);

const ReportesPage = () => {
  const { data: finData, isLoading: finLoading } = useQuery({
    queryKey: ['reporteFinanciero'],
    queryFn: () => api.get('/reportes/financiero').then((r) => r.data),
  });

  const { data: morososData } = useQuery({
    queryKey: ['morosos'],
    queryFn: () => api.get('/reportes/morosos').then((r) => r.data),
  });

  const fin     = finData?.data;
  const morosos = morososData?.data ?? [];

  const recaudacionMensual = fin?.recaudacionMensual ?? [];
  const maxPagado = Math.max(...recaudacionMensual.map((m) => m.pagado), 1);

  const handleExportarExcel = () => {
    if (morosos.length === 0) return;

    const headers = ['SUSCRIPTOR', 'CEDULA', 'ESTADO', 'DEUDA_TOTAL_COP', 'FACTURAS_VENCIDAS'];
    const rows = morosos.map((m) => [
      `"${m.nombre.replace(/"/g, '""')}"`,
      `"${m.cedula}"`,
      `"${m.estado === 'EN_MORA' ? 'En mora' : 'Inactivo'}"`,
      m.deudaTotal,
      m.aportesPendientes ?? 0,
    ].join(';'));

    const csvContent = '﻿' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'REPORTE_MOROSOS_AQUARURAL.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 font-body">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">query_stats</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
              Analítica de Recaudo y Cartera
            </h1>
            <p className="text-xs text-slate-500 font-body">
              Comportamiento financiero y cumplimiento de pago de facturas de agua en tiempo real.
            </p>
          </div>
        </div>
      </div>

      {/* KPIs + Gráfica */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* KPIs */}
        <div className="lg:col-span-3 space-y-6">
          <KpiCard
            label="Recaudación Total"
            value={finLoading ? '...' : formatMonto(fin?.recaudacionTotal)}
            sub="Todas las facturas pagadas"
          />
          <KpiCard
            label="Índice de Morosidad"
            value={finLoading ? '...' : `${fin?.indiceMorosidad ?? 0}%`}
            sub={`${(fin?.enMora ?? 0) + (fin?.inactivos ?? 0)} suscriptores con mora`}
            accent
          />
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <span className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-widest font-headline block mb-4">Distribución</span>
            <div className="space-y-3">
              {[
                { label: 'Al día',   value: fin?.alDia ?? 0,    color: 'bg-[#1D4ED8]', info: 'Sin facturas vencidas.' },
                { label: 'En mora',  value: fin?.enMora ?? 0,   color: 'bg-amber-500', info: '1 o 2 facturas vencidas sin pagar.' },
                { label: 'Inactivo', value: fin?.inactivos ?? 0, color: 'bg-red-500', info: '3 o más facturas vencidas sin pagar. No indica que el servicio de agua esté cortado — eso se gestiona por separado en la ficha del suscriptor.' },
              ].map(({ label, value, color, info }) => {
                const total = fin?.totalAsociados || 1;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-500 font-medium inline-flex items-center gap-1 cursor-help" title={info}>
                        {label}
                        <span className="material-symbols-outlined text-[13px] text-slate-400">info</span>
                      </span>
                      <span className="font-bold text-slate-800">{value}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${(value / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gráfica de barras mensual */}
        <div className="lg:col-span-9 bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h4 className="text-lg font-extrabold text-slate-800 font-headline">Recaudación Mensual {new Date().getFullYear()}</h4>
              <p className="text-xs text-slate-500 font-body">Facturas pagadas por mes</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1D4ED8]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase font-headline">Pagado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase font-headline">Pendiente</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full flex items-end justify-between gap-2 px-2 border-b border-slate-100 pb-2">
            {(recaudacionMensual.length === 0
              ? Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, pagado: 0, pendiente: 0 }))
              : recaudacionMensual
            ).map((item, i) => {
              const hPagado    = item.pagado    > 0 ? Math.max(8, (item.pagado    / maxPagado) * 220) : 4;
              const hPendiente = item.pendiente > 0 ? Math.max(8, (item.pendiente / maxPagado) * 220) : 4;
              const esActual   = i === new Date().getMonth();
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex justify-center gap-1 items-end" style={{ height: 230 }}>
                    <div
                      className={`w-4 sm:w-5 rounded-t-sm transition-all ${esActual ? 'bg-[#1D4ED8]' : 'bg-[#1D4ED8]/40'}`}
                      style={{ height: hPagado }}
                      title={formatMonto(item.pagado)}
                    />
                    <div
                      className="w-4 sm:w-5 bg-amber-400/70 rounded-t-sm"
                      style={{ height: hPendiente }}
                      title={formatMonto(item.pendiente)}
                    />
                  </div>
                  <span className={`text-[9px] font-bold uppercase font-headline ${esActual ? 'text-[#1D4ED8]' : 'text-slate-400'}`}>
                    {MESES[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabla de morosos — mismo patrón visual que SuperAdmin/AcueductosPage */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-extrabold text-gray-800 font-headline">Suscriptores en Mora</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {morosos.length > 0 ? `${morosos.length} suscriptores con facturas vencidas` : 'Sin suscriptores en mora'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportarExcel}
            disabled={morosos.length === 0}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            <span>Exportar (CSV)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-headline uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">Suscriptor</th>
                <th className="py-3.5 px-4">Cédula</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Deuda Total</th>
                <th className="py-3.5 px-6">Facturas Vencidas</th>
              </tr>
            </thead>
            <tbody className="text-xs font-body text-gray-700">
              {morosos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-3xl block mb-2 text-gray-300">check_circle</span>
                    No hay suscriptores en mora actualmente.
                  </td>
                </tr>
              ) : (
                morosos.map((m, i) => (
                  <tr
                    key={m._id}
                    className={`hover:bg-gray-50/50 transition-colors border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}
                  >
                    <td className="py-4 px-6 font-bold text-gray-900">{m.nombre}</td>
                    <td className="py-4 px-4 font-mono text-gray-500">{m.cedula}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full font-headline uppercase ${
                        m.estado === 'EN_MORA' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {m.estado === 'EN_MORA' ? 'En mora' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-extrabold text-amber-600">{formatMonto(m.deudaTotal)}</td>
                    <td className="py-4 px-6 text-gray-500 font-mono">{m.aportesPendientes ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;
