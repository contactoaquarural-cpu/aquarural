import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

const DashboardPage = () => {
  const navigate = useNavigate();

  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const planSaaS = useConfigStore((s) => s.planSaaS || 'CAUDAL');
  const costoMensualSaaSDB = useConfigStore((s) => s.costoMensualSaaS || 100000);
  const fechaFinCicloVigenteDB = useConfigStore((s) => s.fechaFinCicloVigente);
  const estadoPagoSaaSDB = useConfigStore((s) => s.estadoPagoSaaS);
  const cargarConfig = useConfigStore((s) => s.cargarConfig);

  const [recaudoTotal, setRecaudoTotal] = useState(0);
  const [suscriptoresCount, setSuscriptoresCount] = useState(0);
  const [alDiaCount, setAlDiaCount] = useState(0);
  const [enMoraCount, setEnMoraCount] = useState(0);
  const [carteraPendiente, setCarteraPendiente] = useState(0);
  const [efectividad, setEfectividad] = useState(0);
  const [facturasRecientes, setFacturasRecientes] = useState([]);

  useEffect(() => {
    cargarConfig();
    cargarMetricas();
  }, []);

  // El estado real de la licencia (mes gratis vs. ciclo pago vigente vs.
  // vencido) ya lo calcula el backend en estadoPagoSaaS — no se debe inferir
  // comparando fechaVencimientoGratis a mano, porque esa fecha corresponde
  // solo al periodo de prueba y queda "vencida" para siempre una vez pasa,
  // aunque el acueducto ya esté pagando su licencia al día.
  const estaLicenciaVencida = estadoPagoSaaSDB === 'VENCIDO' || estadoPagoSaaSDB === 'POR_COBRAR';

  const generarFirmaIntegridadWompi = async (referencia, montoEnCentavos, secreto) => {
    try {
      const cadena = `${referencia}${montoEnCentavos}COP${secreto}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(cadena);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return '';
    }
  };

  const handleIniciarPagoWompiSaaS = async () => {
    const montoCents = (costoMensualSaaSDB || 100000) * 100;
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const ref = `SAAS-DASH-${uniqueId}`;
    const pubKey = 'pub_test_TYld0TKr4chIS8TbArF0lDp85rLkyX35';
    const integritySecret = 'test_integrity_Ck1W1N3nS3YwdpitCdiPBFrz0Zabvlnn';

    const signature = await generarFirmaIntegridadWompi(ref, montoCents, integritySecret);

    const wompiUrl = `https://checkout.wompi.co/p/?public-key=${pubKey}&currency=COP&amount-in-cents=${montoCents}&reference=${ref}&signature:integrity=${signature}`;
    window.open(wompiUrl, '_blank');
  };

  const cargarMetricas = async () => {
    let suscs = [];
    let facts = [];

    // 1. Suscriptores exclusivamente desde la API backend por acueductoId
    try {
      const resS = await api.get('/asociados').catch(() => null);
      if (resS && resS.data) {
        suscs = resS.data.data?.asociados || resS.data.suscriptores || resS.data.data || [];
        if (!Array.isArray(suscs)) suscs = [];
      }
    } catch (e) {
      console.warn('Error cargando suscriptores:', e);
    }

    // 2. Facturas exclusivamente desde la API backend por acueductoId
    // GET /facturas devuelve { success, data: { facturas, total, page, limit } }
    // — las facturas viven en data.data.facturas, no en data.facturas directo.
    try {
      const resF = await api.get('/facturas').catch(() => null);
      if (resF && resF.data) {
        facts = resF.data.data?.facturas || [];
        if (!Array.isArray(facts)) facts = [];
      }
    } catch (e) {
      console.warn('Error cargando facturas:', e);
    }

    setSuscriptoresCount(suscs.length);
    setFacturasRecientes(facts);

    // Cálculos
    let recaudo = 0;
    let cartera = 0;
    let pagadas = 0;
    let mora = 0;

    facts.forEach((f) => {
      const monto = f.montoTotal || f.totalPagar || 0;
      if (f.estado === 'PAGADA') {
        recaudo += monto;
        pagadas++;
      } else {
        cartera += monto;
        mora++;
      }
    });

    setRecaudoTotal(recaudo);
    setCarteraPendiente(cartera);
    setEnMoraCount(mora);
    setAlDiaCount(Math.max(0, suscs.length - mora));

    const totalF = facts.length;
    const efec = totalF > 0 ? Math.round((pagadas / totalF) * 100) : 0;
    setEfectividad(efec);
  };

  useEffect(() => {
    cargarMetricas();
  }, []);
  const handleConfirmarPagoAprobado = async () => {
    try {
      await api.post('/configuracion/confirmar-pago-saas').catch(() => null);
      await cargarConfig();
    } catch (e) {}
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#1D4ED8] text-3xl">space_dashboard</span>
          <h1 className="text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
            Hola, {nombreAcueducto}
          </h1>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-headline font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistema Veredal Operativo</span>
        </div>
      </div>

      {/* Banner de Licencia SaaS (Alerta Vencida vs Operativa) */}
      {/* La licencia solo se muestra en el Dashboard cuando requiere acción
          (vencida) — si está al día, no compite con las métricas del día a
          día; el admin puede revisarla en /licencia cuando quiera. */}
      {estaLicenciaVencida && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shrink-0">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-amber-700 font-headline">
                  Licencia SaaS Expirada ({fechaFinCicloVigenteDB ? String(fechaFinCicloVigenteDB).split('T')[0] : 'Vencida'})
                </h3>
                <span className="bg-amber-100 text-amber-700 border border-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Cobro Pendiente
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-body leading-relaxed">
                La suscripción del software para <strong className="text-slate-800">{nombreAcueducto}</strong> ha finalizado. Realiza el pago de renovación para garantizar la continuidad del servicio veredal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleIniciarPagoWompiSaaS}
              style={{ color: '#ffffff' }}
              className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-headline font-extrabold text-xs px-5 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">credit_card</span>
              <span>Pagar Wompi / PSE (${costoMensualSaaSDB.toLocaleString()} COP)</span>
            </button>
            <button
              onClick={handleConfirmarPagoAprobado}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-headline font-extrabold px-4 py-3 rounded-2xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Confirmar Pago Aprobado</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid Conectado en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Recaudo Total */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden group hover:border-[#1D4ED8]/40 transition-all duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8]">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <span className="text-xs font-headline font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Recaudado
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Recaudo Total Mes
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 font-headline mt-1 tracking-tight font-mono">
            ${recaudoTotal.toLocaleString()} <span className="text-sm font-normal text-slate-500 font-body">COP</span>
          </h3>
        </div>

        {/* Suscriptores */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <span className="text-xs font-headline font-semibold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {suscriptoresCount} Registrados
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Suscriptores Activos
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 font-headline mt-1 tracking-tight font-mono">
            {alDiaCount} <span className="text-sm font-normal text-emerald-600 font-body">Al día ({alDiaCount}/{suscriptoresCount})</span>
          </h3>
        </div>

        {/* Cartera Pendiente */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <span className="text-xs font-headline font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {enMoraCount} En mora
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Cartera por Cobrar
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 font-headline mt-1 tracking-tight font-mono">
            ${carteraPendiente.toLocaleString()} <span className="text-sm font-normal text-slate-500 font-body">COP</span>
          </h3>
        </div>

        {/* Efectividad Recaudo */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden group hover:border-[#1D4ED8]/40 transition-all duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8]">
              <span className="material-symbols-outlined text-2xl">credit_card</span>
            </div>
            <span className="text-xs font-headline font-semibold text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Wompi PSE
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Efectividad Recaudo
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 font-headline mt-1 tracking-tight font-mono">
            {efectividad}% <span className="text-sm font-normal text-slate-500 font-body">Efectividad</span>
          </h3>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla Transacciones Recientes (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 font-headline">
                Transacciones & Facturación Reciente
              </h2>
              <p className="text-xs text-slate-500 font-body mt-0.5">
                Últimos cobros procesados y emitidos en el periodo actual.
              </p>
            </div>
            <button
              onClick={() => navigate('/facturacion')}
              className="text-xs font-headline font-bold text-[#1D4ED8] hover:text-[#1E3A8A] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas las facturas</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {facturasRecientes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3 border border-dashed border-slate-200 rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-slate-400">receipt_long</span>
                <p className="text-xs font-headline text-slate-500">No hay recaudos o facturas emitidas en este periodo aún.</p>
                <button
                  onClick={() => navigate('/facturacion')}
                  className="bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] border border-blue-200 text-xs font-headline font-bold px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>Ir a Emitir Facturación</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-headline font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Suscriptor</th>
                    <th className="py-3 px-3">Monto</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 whitespace-nowrap">Método</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-body text-slate-800">
                  {facturasRecientes.slice(0, 5).map((f) => (
                    <tr key={f.id || f._id || f.codigoFactura} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#1D4ED8]">{f.codigoFactura}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-800">{f.asociadoId?.nombres} {f.asociadoId?.apellidos}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800">${(f.montoTotal || 25000).toLocaleString()} COP</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold ${
                            f.estado === 'PAGADA'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {f.estado === 'PAGADA' ? '✓ PAGADA' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                        {f.metodoPago === 'EFECTIVO_OFICINA' ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            Efectivo
                          </span>
                        ) : f.metodoPago === 'WOMPI' ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">credit_card</span>
                            Wompi
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel Accesos Rápidos (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 font-headline mb-1">
              Accesos Rápidos
            </h2>
            <p className="text-xs text-slate-500 font-body mb-6">
              Operaciones frecuentes para la administración del acueducto.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/asociados')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#1D4ED8]/40 p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 font-headline group-hover:text-[#1D4ED8]">
                    Gestionar Suscriptores
                  </h4>
                  <p className="text-[11px] text-slate-500 font-body">Crear, editar o eliminar usuarios</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/facturacion')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500/40 p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 font-headline group-hover:text-emerald-600">
                    Registrar Pago en Ventanilla
                  </h4>
                  <p className="text-[11px] text-slate-500 font-body">Cobros presenciales en efectivo</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/mapa')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-[#1D4ED8]/40 p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">map</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 font-headline group-hover:text-[#1D4ED8]">
                    Mapa GPS de Predios
                  </h4>
                  <p className="text-[11px] text-slate-500 font-body">Ubicaciones satelitales en vivo</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-headline">
            <span>Servidor Backend API</span>
            <span className="text-emerald-600 font-mono flex items-center gap-1 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
