import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.service';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary flex-shrink-0">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">{label}</p>
      <p className="text-sm font-medium text-on-surface">{value || '—'}</p>
    </div>
  </div>
);

const ESTADO_MAP = {
  AL_DIA:   { cls: 'bg-emerald-500 text-emerald-950', label: 'Activo' },
  EN_MORA:  { cls: 'bg-tertiary text-on-tertiary',    label: 'En Mora' },
  INACTIVO: { cls: 'bg-outline text-surface',         label: 'Inactivo' },
};

const ExpedientePage = () => {
  const { id } = useParams();

  const { data: aData, isLoading } = useQuery({
    queryKey: ['asociado', id],
    queryFn: () => api.get(`/asociados/${id}`).then((r) => r.data),
  });

  const { data: aportesData } = useQuery({
    queryKey: ['aportes', id],
    queryFn: () => api.get(`/asociados/${id}/aportes`).then((r) => r.data),
  });

  const { data: fincaData } = useQuery({
    queryKey: ['finca', id],
    queryFn: () => api.get(`/asociados/${id}/fincas`).then((r) => r.data),
  });

  const asociado = aData?.data;
  const aportes  = aportesData?.data ?? [];
  const finca    = fincaData?.data?.[0] ?? null;

  const est = ESTADO_MAP[asociado?.estado] ?? ESTADO_MAP.INACTIVO;

  const formatMonto = (m) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(m);

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!asociado) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl opacity-30">person_off</span>
        <p>Asociado no encontrado.</p>
        <Link to="/asociados" className="text-primary text-sm font-bold hover:underline">
          Volver al directorio
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-4 border-surface-container-low bg-surface-container-highest flex items-center justify-center">
              {asociado.fotoPerfil
                ? <img src={asociado.fotoPerfil} alt={asociado.nombre} className="w-full h-full object-cover" />
                : <span className="material-symbols-outlined text-primary text-5xl">person</span>
              }
            </div>
            <span className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter uppercase border-2 border-surface-container-lowest ${est.cls}`}>
              {est.label}
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">
              {asociado.nombre}
            </h2>
            <p className="text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">badge</span>
              C.C. {asociado.cedula}
            </p>
            <div className="flex gap-3 pt-2 flex-wrap">
              <span className="bg-surface-container-low text-secondary px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">alternate_email</span>
                {asociado.correo}
              </span>
              {asociado.telefono && (
                <span className="bg-surface-container-low text-secondary px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">call</span>
                  {asociado.telefono}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="bg-surface-container-highest text-on-surface px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-surface-bright transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg">edit</span>
            Editar Socio
          </button>
          <button className="btn-cta px-6 py-2.5 rounded-lg text-sm font-extrabold flex items-center gap-2 shadow-lg transition-all active:scale-95 font-headline">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              description
            </span>
            Generar Paz y Salvo
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Columna info */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-surface-container-low rounded-3xl p-6">
            <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-6 font-headline">
              Información General
            </h3>
            <div className="space-y-5">
              <InfoRow icon="call"           label="Teléfono Principal"  value={asociado.telefono} />
              <InfoRow icon="alternate_email" label="Correo Electrónico" value={asociado.correo} />
              <InfoRow icon="home_work"      label="Nombre de la Finca"  value={finca?.nombre} />
              <InfoRow icon="location_on"    label="Vereda"              value={finca?.vereda} />
              <InfoRow icon="location_city"  label="Municipio"           value={asociado.municipio} />
              <InfoRow icon="grass"          label="Hectáreas"           value={finca?.hectareas != null ? `${finca.hectareas} ha` : null} />
              <InfoRow icon="pets"           label="Cabezas de Ganado"   value={finca?.cabezasGanado != null ? `${finca.cabezasGanado} cabezas` : null} />
            </div>
          </section>

          {/* Ubicación GPS */}
          <section className="bg-surface-container-low rounded-3xl overflow-hidden relative">
            <div className="w-full bg-gradient-to-br from-emerald-900/30 to-primary-container/20 flex items-center justify-center h-32">
              <span className="material-symbols-outlined text-primary/20 text-8xl">map</span>
            </div>
            <div className="p-5">
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3 font-headline">
                Ubicación de Predio
              </h3>
              {finca?.latitud ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-surface-container-high rounded-xl px-4 py-2">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Latitud</span>
                    <span className="text-sm font-mono text-primary">{finca.latitud.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-surface-container-high rounded-xl px-4 py-2">
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Longitud</span>
                    <span className="text-sm font-mono text-primary">{finca.longitud.toFixed(6)}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${finca.latitud},${finca.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full mt-1 py-2 rounded-xl bg-primary-container/40 text-primary text-xs font-bold hover:bg-primary-container/60 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Ver en Google Maps
                  </a>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">
                  Sin coordenadas GPS registradas. El asociado puede registrarlas desde la app móvil.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Historial de pagos */}
        <div className="col-span-12 lg:col-span-5">
          <section className="bg-surface-container-low rounded-3xl p-6 h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest font-headline">
                Historial de Pagos
              </h3>
              <span className="text-[10px] font-bold bg-tertiary-container/40 text-on-tertiary-container px-2 py-1 rounded">
                TOTAL: {aportes.length}
              </span>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/20">
                    <th className="pb-3 font-bold">Periodo</th>
                    <th className="pb-3 font-bold">Monto</th>
                    <th className="pb-3 font-bold text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {aportes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-on-surface-variant text-xs">
                        Sin pagos registrados
                      </td>
                    </tr>
                  ) : (
                    aportes.slice(0, 8).map((a) => (
                      <tr key={a._id} className="border-b border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
                        <td className="py-4 font-medium text-on-surface">
                          {MESES[a.mes - 1]} {a.año}
                        </td>
                        <td className="py-4 text-secondary">{formatMonto(a.monto)}</td>
                        <td className="py-4 text-right">
                          {a.estado === 'PAGADO' ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Pagado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-error font-bold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-error" />
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Documentos placeholder */}
        <div className="col-span-12 lg:col-span-3">
          <section className="bg-surface-container-low rounded-3xl p-6 h-full">
            <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-6 font-headline">
              Documentación
            </h3>
            <div className="space-y-4">
              {['Certificado Vacunación', 'Título de Propiedad', 'Registro Ganadero ICA'].map((doc) => (
                <div
                  key={doc}
                  className="bg-surface-container-lowest p-4 rounded-2xl group cursor-pointer hover:bg-surface-container-highest transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-900/20 flex items-center justify-center text-emerald-400">
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                      download
                    </span>
                  </div>
                  <p className="text-xs font-bold text-on-surface truncate">{doc}</p>
                </div>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-outline-variant/30 rounded-2xl text-on-surface-variant flex flex-col items-center justify-center gap-1 hover:border-emerald-500/40 hover:text-emerald-400 transition-all">
                <span className="material-symbols-outlined">add_circle</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Cargar Nuevo</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Footer métricas */}
      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-12 md:col-span-8 bg-surface-container-low rounded-3xl p-6 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
              Actividad Reciente
            </h4>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-medium">
                {aportes[0]
                  ? `Último pago: ${MESES[aportes[0].mes - 1]} ${aportes[0].año}`
                  : 'Sin actividad registrada'}
              </p>
            </div>
          </div>
          <Link
            to="/reportes"
            className="text-xs font-bold text-primary px-4 py-2 bg-primary-container/20 rounded-full hover:bg-primary-container/40 transition-all"
          >
            Ver Reporte
          </Link>
        </div>
        <div className="col-span-12 md:col-span-4 bg-tertiary-container/10 border border-tertiary-container/20 rounded-3xl p-6 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest mb-1">Estado Actual</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-headline ${ESTADO_MAP[asociado.estado]?.cls.split(' ')[1] ?? 'text-on-surface'}`}>
              {ESTADO_MAP[asociado.estado]?.label ?? '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpedientePage;
