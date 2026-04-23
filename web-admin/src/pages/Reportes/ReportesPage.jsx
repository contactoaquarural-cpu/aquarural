import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.service';

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatMonto = (m) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(m || 0);

const KpiCard = ({ label, value, sub, accent }) => (
  <div className={`bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group ${accent ? 'border-l-4 border-tertiary' : ''}`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">{label}</p>
    <h3 className={`text-3xl font-bold font-headline ${accent ? 'text-tertiary' : 'text-on-surface'}`}>{value}</h3>
    <p className="text-[10px] mt-2 italic text-on-surface-variant/60">{sub}</p>
  </div>
);

const ReportesPage = () => {
  const { data: finData, isLoading: finLoading } = useQuery({
    queryKey: ['reporteFinanciero'],
    queryFn: () => api.get('/admin/reportes/financiero').then((r) => r.data),
  });

  const { data: morososData } = useQuery({
    queryKey: ['morosos'],
    queryFn: () => api.get('/admin/reportes/morosos').then((r) => r.data),
  });

  const fin     = finData?.data;
  const morosos = morososData?.data ?? [];

  const recaudacionMensual = fin?.recaudacionMensual ?? [];
  const maxPagado = Math.max(...recaudacionMensual.map((m) => m.pagado), 1);

  return (
    <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            Analítica de Gestión{' '}
            <span className="text-primary">Recaudación y Morosidad</span>
          </h2>
          <p className="text-on-surface-variant font-light text-lg">
            Comportamiento financiero y cumplimiento de aportes en tiempo real.
          </p>
        </div>
      </div>

      {/* KPIs + Gráfica */}
      <div className="grid grid-cols-12 gap-6 mb-8">

        {/* KPIs */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <KpiCard
            label="Recaudación Total"
            value={finLoading ? '...' : formatMonto(fin?.recaudacionTotal)}
            sub="Todos los aportes pagados"
          />
          <KpiCard
            label="Índice de Morosidad"
            value={finLoading ? '...' : `${fin?.indiceMorosidad ?? 0}%`}
            sub={`${(fin?.enMora ?? 0) + (fin?.inactivos ?? 0)} asociados con mora`}
            accent
          />
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Distribución</span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Al día',   value: fin?.alDia ?? 0,    color: 'bg-primary' },
                { label: 'En mora',  value: fin?.enMora ?? 0,   color: 'bg-tertiary' },
                { label: 'Inactivo', value: fin?.inactivos ?? 0, color: 'bg-error' },
              ].map(({ label, value, color }) => {
                const total = fin?.totalAsociados || 1;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-on-surface-variant font-medium">{label}</span>
                      <span className="font-bold text-on-surface">{value}</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${(value / total) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gráfica de barras mensual */}
        <div className="col-span-12 lg:col-span-9 bg-surface-container-low p-8 rounded-2xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="text-xl font-bold text-on-surface font-headline">Recaudación Mensual {new Date().getFullYear()}</h4>
              <p className="text-sm text-on-surface-variant">Aportes pagados por mes</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Pagado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-tertiary" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Pendiente</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full flex items-end justify-between gap-2 px-2 border-b border-outline-variant/30 pb-2">
            {(recaudacionMensual.length === 0
              ? Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, pagado: 0, pendiente: 0 }))
              : recaudacionMensual
            ).map((item, i) => {
              const hPagado   = item.pagado   > 0 ? Math.max(8, (item.pagado   / maxPagado) * 260) : 4;
              const hPendiente = item.pendiente > 0 ? Math.max(8, (item.pendiente / maxPagado) * 260) : 4;
              const esActual  = i === new Date().getMonth();
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex justify-center gap-1 items-end" style={{ height: 270 }}>
                    <div
                      className={`w-5 rounded-t-sm transition-all ${esActual ? 'bg-primary' : 'bg-primary opacity-50'}`}
                      style={{ height: hPagado }}
                      title={formatMonto(item.pagado)}
                    />
                    <div
                      className="w-5 bg-tertiary rounded-t-sm opacity-60"
                      style={{ height: hPendiente }}
                      title={formatMonto(item.pendiente)}
                    />
                  </div>
                  <span className={`text-[9px] font-bold uppercase ${esActual ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {MESES[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabla de morosos */}
      <section className="bg-surface-container-low rounded-3xl overflow-hidden mb-8">
        <div className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20">
          <div>
            <h4 className="text-2xl font-bold text-on-surface font-headline">Reporte de Morosos</h4>
            <p className="text-sm text-on-surface-variant">
              {morosos.length > 0 ? `${morosos.length} asociados con aportes pendientes` : 'Sin asociados en mora'}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface-container-high text-on-surface text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-sm">description</span>
              EXPORTAR PDF
            </button>
            <button className="bg-surface-container-high text-on-surface text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined text-sm">grid_on</span>
              EXPORTAR EXCEL
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest/50">
                {['Asociado','Cédula','Estado','Deuda Total','Meses en Mora'].map((h) => (
                  <th key={h} className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {morosos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-3xl block mb-2 opacity-30">check_circle</span>
                    No hay asociados en mora actualmente.
                  </td>
                </tr>
              ) : (
                morosos.map((m) => (
                  <tr key={m._id} className="hover:bg-surface-container transition-colors">
                    <td className="px-8 py-6 font-bold text-on-surface text-sm">{m.nombre}</td>
                    <td className="px-8 py-6 font-mono text-on-surface-variant text-sm">{m.cedula}</td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                        m.estado === 'EN_MORA' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                      }`}>
                        {m.estado === 'EN_MORA' ? 'En mora' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-tertiary text-sm">{formatMonto(m.deudaTotal)}</td>
                    <td className="px-8 py-6 text-on-surface-variant text-sm">{m.aportesPendientes ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAB */}
      <button className="fixed bottom-10 right-10 bg-primary text-on-primary w-14 h-14 rounded-full shadow-[0_0_20px_rgba(165,208,185,0.3)] flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_chart</span>
      </button>
    </div>
  );
};

export default ReportesPage;
