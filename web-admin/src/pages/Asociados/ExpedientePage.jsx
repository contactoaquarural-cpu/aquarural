import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.service';

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] flex-shrink-0">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div>
      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || '—'}</p>
    </div>
  </div>
);

const ESTADO_MAP = {
  AL_DIA: { cls: 'bg-emerald-500 text-white', label: 'Al Día' },
  EN_MORA: { cls: 'bg-amber-500 text-white', label: 'En Mora' },
  INACTIVO: { cls: 'bg-gray-400 text-white', label: 'Inactivo' },
};

const formatMonto = (m) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(m);

const ExpedientePage = () => {
  const { id } = useParams();

  const { data: aData, isLoading } = useQuery({
    queryKey: ['asociado', id],
    queryFn: () => api.get(`/asociados/${id}`).then((r) => r.data),
  });

  const { data: facturasData } = useQuery({
    queryKey: ['facturas-asociado', id],
    queryFn: () => api.get('/facturas', { params: { asociadoId: id, limit: 12 } }).then((r) => r.data),
    enabled: !!id,
  });

  const { data: consumoData } = useQuery({
    queryKey: ['historial-consumo', id],
    queryFn: () => api.get(`/asociados/${id}/historial-consumo`).then((r) => r.data),
    enabled: !!id,
  });

  const asociado = aData?.data;
  const facturas = facturasData?.data?.facturas ?? [];
  const historialConsumo = consumoData?.data ?? [];

  const est = ESTADO_MAP[asociado?.estadoMoratorio] ?? ESTADO_MAP.INACTIVO;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 text-[#1D4ED8]">
        <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!asociado) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
        <span className="material-symbols-outlined text-5xl text-slate-300">person_off</span>
        <p>Asociado no encontrado.</p>
        <Link to="/asociados" className="text-[#1D4ED8] text-sm font-bold hover:underline">
          Volver al directorio
        </Link>
      </div>
    );
  }

  const tieneMedidor = Boolean(asociado.numeroMedidor) && asociado.numeroMedidor !== 'S/N';

  // Resumen financiero derivado de las mismas facturas ya cargadas — sin
  // pedir nada nuevo al backend, solo para no obligar al admin a contar
  // filas de la tabla manualmente para saber cuánto debe el suscriptor.
  const facturasPendientes = facturas.filter((f) => f.estado !== 'PAGADA');
  const deudaTotal = facturasPendientes.reduce((sum, f) => sum + (f.montoTotal || 0), 0);
  const ultimaLectura = historialConsumo[0];

  return (
    <div className="pt-8 pb-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 font-body">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#1D4ED8] text-3xl">person</span>
            </div>
            <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-tighter uppercase border-2 border-white ${est.cls}`}>
              {est.label}
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold tracking-tight font-headline text-slate-800">
              {asociado.nombres} {asociado.apellidos}
            </h2>
            <p className="text-slate-500 text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">badge</span>
              C.C. {asociado.cedula} • Matrícula {asociado.matricula}
            </p>
            <div className="flex gap-2 pt-1 flex-wrap">
              {asociado.telefono && (
                <span className="bg-blue-50 border border-blue-200 text-[#1D4ED8] px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">call</span>
                  {asociado.telefono}
                </span>
              )}
              <span className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {asociado.vereda || 'Centro'}
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/asociados"
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver al Directorio
        </Link>
      </div>

      {/* Resumen financiero — para no obligar al admin a contar filas de la
          tabla de facturas manualmente para saber cuánto debe el suscriptor,
          mismo patrón de tarjetas KPI ya usado en Dashboard/Reportes. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Deuda Total</p>
            <h3 className={`text-2xl font-extrabold font-mono mt-0.5 ${deudaTotal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatMonto(deudaTotal)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">{facturasPendientes.length} facturas pendientes</p>
          </div>
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
            deudaTotal > 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <span className="material-symbols-outlined text-xl">{deudaTotal > 0 ? 'warning' : 'check_circle'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Facturas Registradas</p>
            <h3 className="text-2xl font-extrabold text-slate-800 font-mono mt-0.5">{facturas.length}</h3>
            <p className="text-[11px] text-slate-500 mt-1">{facturas.length - facturasPendientes.length} pagadas en total</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] shrink-0">
            <span className="material-symbols-outlined text-xl">receipt_long</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Última Lectura</p>
            <h3 className="text-2xl font-extrabold text-slate-800 font-mono mt-0.5">
              {tieneMedidor ? (ultimaLectura ? `${ultimaLectura.consumoM3} m³` : '—') : 'Tarifa Fija'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {tieneMedidor ? (ultimaLectura ? `Período ${ultimaLectura.periodo}` : 'Sin lecturas aún') : 'Sin medidor asignado'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] shrink-0">
            <span className="material-symbols-outlined text-xl">water_ec</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Fila 1: identidad del suscriptor — Información General y
            Ubicación de Predio lado a lado, mismo peso visual, porque ambas
            son "quién es y dónde vive" — se consultan juntas al abrir el
            expediente. El historial (Facturas/Consumo) va debajo, en su
            propia fila de ancho completo. */}
        <div className="col-span-12 lg:col-span-6">
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-full">
            <h3 className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest mb-5 font-headline">
              Información General
            </h3>
            <div className="space-y-5">
              <InfoRow icon="call" label="Teléfono" value={asociado.telefono} />
              <InfoRow icon="alternate_email" label="Correo" value={asociado.correo} />
              <InfoRow icon="home_work" label="Dirección" value={asociado.direccion} />
              <InfoRow icon="location_on" label="Vereda / Sector" value={asociado.vereda} />
              <InfoRow
                icon="water_ec"
                label="Medidor"
                value={tieneMedidor ? asociado.numeroMedidor : 'Sin medidor (Tarifa Fija)'}
              />
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-full">
            <div className="p-6">
              <h3 className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest mb-5 font-headline">
                Ubicación de Predio
              </h3>
              {asociado.latitud ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Latitud</span>
                    <span className="text-sm font-mono text-[#1D4ED8]">{asociado.latitud.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-2 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Longitud</span>
                    <span className="text-sm font-mono text-[#1D4ED8]">{asociado.longitud.toFixed(6)}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${asociado.latitud},${asociado.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full mt-1 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Ver en Google Maps
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Sin coordenadas GPS registradas. El asociado puede registrarlas desde la app móvil.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Fila 2: Historial de Facturas — ancho completo */}
        <div className="col-span-12">
          <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center gap-4 mb-5">
              <h3 className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest font-headline whitespace-nowrap">
                Historial de Facturas
              </h3>
              <span className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap">
                TOTAL: {facturas.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <colgroup>
                  <col className="w-24" />
                  <col className="w-44" />
                  <col className="w-24" />
                  <col className="w-28" />
                  <col className="w-28" />
                  <col className="w-28" />
                  <col className="w-36" />
                  <col className="w-32" />
                </colgroup>
                <thead>
                  <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-200">
                    <th className="pb-3 pr-6 font-bold">Periodo</th>
                    <th className="pb-3 pr-6 font-bold">Código</th>
                    <th className="pb-3 pr-6 font-bold">Consumo</th>
                    <th className="pb-3 pr-6 font-bold">Monto</th>
                    <th className="pb-3 pr-6 font-bold">Vencimiento</th>
                    <th className="pb-3 pr-6 font-bold">Fecha de Pago</th>
                    <th className="pb-3 pr-6 font-bold">Método de Pago</th>
                    <th className="pb-3 font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {facturas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        Sin facturas registradas aún.
                      </td>
                    </tr>
                  ) : (
                    facturas.map((f) => (
                      <tr key={f._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 pr-6 font-medium text-slate-800 font-mono whitespace-nowrap">{f.periodo}</td>
                        <td className="py-3.5 pr-6 text-slate-500 font-mono text-xs whitespace-nowrap">{f.codigoFactura}</td>
                        <td className="py-3.5 pr-6 text-slate-600 font-mono whitespace-nowrap">
                          {tieneMedidor ? `${f.consumoM3} m³` : '—'}
                        </td>
                        <td className="py-3.5 pr-6 text-[#1D4ED8] font-mono whitespace-nowrap">{formatMonto(f.montoTotal)}</td>
                        <td className="py-3.5 pr-6 text-slate-500 font-mono text-xs whitespace-nowrap">
                          {new Date(f.fechaVencimiento).toLocaleDateString('es-CO')}
                        </td>
                        <td className="py-3.5 pr-6 text-slate-500 font-mono text-xs whitespace-nowrap">
                          {f.fechaPago ? new Date(f.fechaPago).toLocaleDateString('es-CO') : '—'}
                        </td>
                        <td className="py-3.5 pr-6 text-slate-500 text-xs whitespace-nowrap">
                          {f.metodoPago === 'WOMPI' ? 'Wompi' : f.metodoPago === 'EFECTIVO_OFICINA' ? 'Efectivo Oficina' : '—'}
                        </td>
                        <td className="py-3.5 whitespace-nowrap">
                          {f.estado === 'PAGADA' ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Pagada
                            </span>
                          ) : f.estado === 'VENCIDA' ? (
                            <span className="inline-flex items-center gap-1.5 text-red-600 font-bold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Vencida
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
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

        {/* Fila 3: Historial de Consumo (solo si tiene medidor) — ancho completo */}
        {tieneMedidor && (
          <div className="col-span-12">
            <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest font-headline">
                  Historial de Consumo (Medidor {asociado.numeroMedidor})
                </h3>
                <span className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                  {historialConsumo.length} lecturas registradas
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <colgroup>
                    <col className="w-28" />
                    <col />
                    <col />
                    <col />
                    <col className="w-36" />
                  </colgroup>
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <th className="pb-3 font-bold">Periodo</th>
                      <th className="pb-3 font-bold">Lectura Anterior</th>
                      <th className="pb-3 font-bold">Lectura Actual</th>
                      <th className="pb-3 font-bold">Consumo</th>
                      <th className="pb-3 font-bold">Fecha de Registro</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {historialConsumo.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          Sin lecturas registradas aún para este medidor.
                        </td>
                      </tr>
                    ) : (
                      historialConsumo.map((h) => (
                        <tr key={h._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 font-medium text-slate-800 font-mono whitespace-nowrap">{h.periodo}</td>
                          <td className="py-3.5 text-slate-500 font-mono whitespace-nowrap">{h.lecturaAnterior} m³</td>
                          <td className="py-3.5 text-slate-800 font-mono whitespace-nowrap">{h.lecturaActual} m³</td>
                          <td className="py-3.5 text-[#1D4ED8] font-mono font-bold whitespace-nowrap">{h.consumoM3} m³</td>
                          <td className="py-3.5 text-slate-500 font-mono text-xs whitespace-nowrap">
                            {new Date(h.fechaRegistro).toLocaleDateString('es-CO')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpedientePage;
