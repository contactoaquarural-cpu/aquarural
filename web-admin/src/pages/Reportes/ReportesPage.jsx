import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.service';

const KpiCard = ({ label, value, sub, subColor = 'text-on-surface-variant/60', accent }) => (
  <div className={`bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group ${accent ? 'border-l-4 border-tertiary' : ''}`}>
    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">{label}</p>
    <div className="flex items-baseline gap-2">
      <h3 className={`text-3xl font-bold font-headline ${accent ? 'text-tertiary' : 'text-on-surface'}`}>{value}</h3>
    </div>
    <p className={`text-[10px] mt-2 italic ${subColor}`}>{sub}</p>
  </div>
);

const ReportesPage = () => {
  const [municipio, setMunicipio] = useState('');

  const { data: morososData } = useQuery({
    queryKey: ['morosos'],
    queryFn: () => api.get('/admin/morosos').then((r) => r.data),
  });

  const morosos = morososData?.data ?? [];

  const formatMonto = (m) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(m || 0);

  const BAR_HEIGHTS = ['40%', '60%', '85%', '55%', '95%', '70%'];
  const BAR_TERCIARIO = ['20%', '30%', '45%', '25%', '50%', '40%'];
  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];

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
            Visualice el comportamiento financiero y el cumplimiento de aportes en tiempo real.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-primary font-bold ml-1">Municipio</label>
            <select
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              className="bg-surface-container-low border-none rounded-lg text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px] py-2.5 px-3"
            >
              <option value="">Todos los municipios</option>
              <option value="garzon">Garzón</option>
              <option value="gigante">Gigante</option>
              <option value="agrado">El Agrado</option>
            </select>
          </div>
          <button className="mt-auto bg-primary-container text-primary font-bold px-6 py-2.5 rounded-lg text-sm hover:brightness-125 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Aplicar Filtros
          </button>
        </div>
      </div>

      {/* Bento KPIs + Gráfica principal */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* KPIs */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <KpiCard
            label="Recaudación Total"
            value="$0 COP"
            sub="Datos del backend"
          />
          <KpiCard
            label="Índice de Morosidad"
            value={`${morosos.length}`}
            sub="asociados en mora"
            accent
          />
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Meta Anual</span>
              <span className="text-xs font-bold text-on-surface">—%</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full mb-2">
              <div className="bg-primary h-full rounded-full w-0 shadow-[0_0_12px_rgba(165,208,185,0.4)]" />
            </div>
            <p className="text-[10px] text-on-surface-variant text-center">Progreso de recaudación anual</p>
          </div>
        </div>

        {/* Gráfica de barras */}
        <div className="col-span-12 lg:col-span-9 bg-surface-container-low p-8 rounded-2xl">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="text-xl font-bold text-on-surface font-headline">Recaudación Mensual</h4>
              <p className="text-sm text-on-surface-variant">Comparativa de ingresos por cuotas y servicios</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Cuotas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-tertiary" />
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Servicios</span>
              </div>
            </div>
          </div>

          {/* Barras */}
          <div className="h-[300px] w-full relative flex items-end justify-between gap-4 px-4 border-b border-outline-variant/30 pb-2">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-outline" />
              ))}
            </div>
            {MESES.map((mes, i) => (
              <div key={mes} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center gap-1 items-end h-full">
                  <div
                    className={`w-6 bg-primary rounded-t-sm ${i === 4 ? '' : 'opacity-60'}`}
                    style={{ height: BAR_HEIGHTS[i] }}
                  />
                  <div className="w-6 bg-tertiary rounded-t-sm opacity-60" style={{ height: BAR_TERCIARIO[i] }} />
                </div>
                <span className={`text-[10px] font-bold uppercase ${i === 4 ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {mes}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tendencia + Distribución */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Tendencia morosidad */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xl font-bold text-on-surface font-headline">Tendencia de Morosidad</h4>
            {morosos.length > 0 && (
              <div className="bg-surface-container-highest px-3 py-1 rounded-full text-[10px] font-bold text-tertiary border border-tertiary/20">
                ATENCIÓN
              </div>
            )}
          </div>
          <div className="h-[200px] w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200">
              <path d="M0,150 Q150,140 300,100 T600,60 T1000,80 V200 H0 Z" fill="url(#grad)" opacity="0.1" />
              <path d="M0,150 Q150,140 300,100 T600,60 T1000,80" fill="none" stroke="#f7ba8b" strokeLinecap="round" strokeWidth="3" />
              <circle cx="300" cy="100" fill="#f7ba8b" r="4" />
              <circle cx="600" cy="60" fill="#f7ba8b" r="4" />
              <circle cx="1000" cy="80" fill="#f7ba8b" r="4" />
              <defs>
                <linearGradient id="grad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#f7ba8b', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#f7ba8b', stopOpacity: 0 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-2">
            {MESES.map((m) => <span key={m}>{m}</span>)}
          </div>
        </div>

        {/* Distribución */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-low p-8 rounded-2xl">
          <h4 className="text-xl font-bold text-on-surface font-headline mb-6">Distribución por Municipio</h4>
          <div className="space-y-4">
            {[
              { label: 'Garzón', pct: 75 },
              { label: 'Gigante', pct: 45 },
              { label: 'El Agrado', pct: 30 },
              { label: 'Zona Rural', pct: 20 },
            ].map(({ label, pct }) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-xs font-bold text-on-surface-variant w-24">{label}</span>
                <div className="flex-1 h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 border border-outline-variant hover:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface transition-all uppercase tracking-widest">
            Ver Detalle
          </button>
        </div>
      </div>

      {/* Tabla de morosos */}
      <section className="bg-surface-container-low rounded-3xl overflow-hidden mb-8">
        <div className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/20">
          <div>
            <h4 className="text-2xl font-bold text-on-surface font-headline">Reporte de Morosos</h4>
            <p className="text-sm text-on-surface-variant">Asociados con aportes pendientes</p>
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
                {['Asociado', 'Cédula', 'Estado', 'Deuda Total', 'Meses en Mora'].map((h) => (
                  <th key={h} className="px-8 py-5 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {h}
                  </th>
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
                  <tr key={m._id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-8 py-6 font-bold text-on-surface text-sm">{m.nombre}</td>
                    <td className="px-8 py-6 font-mono text-on-surface-variant text-sm">{m.cedula}</td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                        m.estado === 'EN_MORA' ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                      }`}>
                        {m.estado}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-tertiary text-sm">
                      {formatMonto(m.deudaTotal)}
                    </td>
                    <td className="px-8 py-6 text-on-surface-variant text-sm">{m.mesesSinPagar ?? '—'}</td>
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
