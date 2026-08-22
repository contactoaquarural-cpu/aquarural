import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

const DashboardPage = () => {
  const navigate = useNavigate();

  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const planSaaS = useConfigStore((s) => s.planSaaS || 'CAUDAL');
  const costoMensualSaaSDB = useConfigStore((s) => s.costoMensualSaaS || 100000);
  const fechaVencimientoGratisDB = useConfigStore((s) => s.fechaVencimientoGratis);
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

  const hoyStr = new Date().toISOString().split('T')[0];
  let fechaVencStr = '';
  if (fechaVencimientoGratisDB) {
    fechaVencStr = String(fechaVencimientoGratisDB).split('T')[0];
  }
  const estaLicenciaVencida = fechaVencStr ? fechaVencStr < hoyStr : (estadoPagoSaaSDB === 'VENCIDO' || estadoPagoSaaSDB === 'POR_COBRAR');

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
    try {
      const resF = await api.get('/facturas').catch(() => null);
      if (resF && resF.data) {
        facts = resF.data.facturas || resF.data.data || [];
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
      {/* Header Banner Hydro-Tech Adaptable */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-3xl">space_dashboard</span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-headline tracking-tight">
            Dashboard General
          </h1>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-headline font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 shrink-0 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistema Veredal Operativo</span>
        </div>
      </div>

      {/* Banner de Licencia SaaS (Alerta Vencida vs Operativa) */}
      {estaLicenciaVencida ? (
        <div className="bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-amber-300 font-headline">
                  ⚠️ Licencia SaaS Expirada ({fechaVencStr || 'Vencida'})
                </h3>
                <span className="bg-amber-500/30 text-amber-300 border border-amber-500/50 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Cobro Pendiente
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 font-body leading-relaxed">
                La suscripción del software para <strong className="text-white">{nombreAcueducto}</strong> ha finalizado. Realiza el pago de renovación para garantizar la continuidad del servicio veredal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleIniciarPagoWompiSaaS}
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-headline font-extrabold text-xs px-5 py-3 rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer transform hover:scale-105"
            >
              <span className="material-symbols-outlined text-base">credit_card</span>
              <span>Pagar Wompi / PSE (${costoMensualSaaSDB.toLocaleString()} COP)</span>
            </button>
            <button
              onClick={handleConfirmarPagoAprobado}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-headline font-extrabold px-4 py-3 rounded-2xl text-xs shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Confirmar Pago Aprobado</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-cyan-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-cyan-200 dark:border-cyan-500/30 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shrink-0">
              <span className="material-symbols-outlined text-2xl">card_membership</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 font-headline">
                  💳 Licencia & Cobro del Sistema AquaRural Pro
                </h3>
                <span className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-headline uppercase tracking-wider">
                  Licencia Operativa
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-body leading-relaxed">
                Consulta las cuentas de cobro oficiales del software SaaS emitidas a la Junta Directiva y gestiona los comprobantes comerciales de licenciamiento.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/licencia')}
            className="whitespace-nowrap bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-headline font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base font-bold">payments</span>
            <span>Gestionar Licencia & Pagos</span>
          </button>
        </div>
      )}

      {/* KPI Cards Grid Conectado en Tiempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Recaudo Total */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300 shadow-sm dark:shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <span className="text-xs font-headline font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              Recaudado
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Recaudo Total Mes
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-headline mt-1 tracking-tight font-mono">
            ${recaudoTotal.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-body">COP</span>
          </h3>
        </div>

        {/* Suscriptores */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300 shadow-sm dark:shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-2xl">groups</span>
            </div>
            <span className="text-xs font-headline font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-200 dark:border-cyan-500/20">
              {suscriptoresCount} Registrados
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Suscriptores Activos
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-headline mt-1 tracking-tight font-mono">
            {alDiaCount} <span className="text-sm font-normal text-emerald-600 dark:text-emerald-400 font-body">Al día ({alDiaCount}/{suscriptoresCount})</span>
          </h3>
        </div>

        {/* Cartera Pendiente */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300 shadow-sm dark:shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <span className="text-xs font-headline font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/20">
              {enMoraCount} En mora
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Cartera por Cobrar
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-headline mt-1 tracking-tight font-mono">
            ${carteraPendiente.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-body">COP</span>
          </h3>
        </div>

        {/* Efectividad Recaudo */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden group hover:border-sky-500/40 transition-all duration-300 shadow-sm dark:shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <span className="material-symbols-outlined text-2xl">credit_card</span>
            </div>
            <span className="text-xs font-headline font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-200 dark:border-sky-500/20">
              Wompi PSE
            </span>
          </div>
          <p className="text-xs font-headline uppercase tracking-wider text-slate-400 font-semibold">
            Efectividad Recaudo
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-headline mt-1 tracking-tight font-mono">
            {efectividad}% <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-body">Efectividad</span>
          </h3>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla Transacciones Recientes (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-headline">
                Transacciones & Facturación Reciente
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-body mt-0.5">
                Últimos cobros procesados y emitidos en el periodo actual.
              </p>
            </div>
            <button
              onClick={() => navigate('/facturacion')}
              className="text-xs font-headline font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todas las facturas</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {facturasRecientes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600">receipt_long</span>
                <p className="text-xs font-headline text-slate-500 dark:text-slate-400">No hay recaudos o facturas emitidas en este periodo aún.</p>
                <button
                  onClick={() => navigate('/facturacion')}
                  className="bg-cyan-50 dark:bg-cyan-500/10 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 text-xs font-headline font-bold px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>Ir a Emitir Facturación</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-headline font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Suscriptor</th>
                    <th className="py-3 px-3">Monto</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right">Método</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-body text-slate-800 dark:text-slate-200">
                  {facturasRecientes.slice(0, 5).map((f) => (
                    <tr key={f.id || f._id || f.codigoFactura} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-cyan-600 dark:text-cyan-400">{f.codigoFactura}</td>
                      <td className="py-3.5 px-3 font-bold text-slate-800 dark:text-slate-100">{f.suscriptor || f.suscriptorId?.nombres}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">${(f.montoTotal || 25000).toLocaleString()} COP</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-headline font-bold ${
                            f.estado === 'PAGADA'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                          }`}
                        >
                          {f.estado === 'PAGADA' ? '✓ PAGADA' : 'PENDIENTE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {f.metodoPago === 'EFECTIVO_OFICINA'
                          ? '💰 Efectivo'
                          : f.metodoPago === 'WOMPI_PSE'
                          ? '💳 Wompi PSE'
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel Accesos Rápidos (1 Col) */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-2xl space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-headline mb-1">
              Accesos Rápidos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-body mb-6">
              Operaciones frecuentes para la administración del acueducto.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/asociados')}
                className="w-full bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-headline group-hover:text-cyan-600 dark:group-hover:text-cyan-300">
                    Gestionar Suscriptores
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">Crear, editar o eliminar usuarios</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/facturacion')}
                className="w-full bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-headline group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                    Registrar Pago en Ventanilla
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">Cobros presenciales en efectivo</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/mapa')}
                className="w-full bg-slate-50 dark:bg-slate-950/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-sky-500/40 p-4 rounded-2xl text-left transition-all duration-200 flex items-center gap-3.5 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-xl">map</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-headline group-hover:text-sky-600 dark:group-hover:text-sky-300">
                    Mapa GPS de Predios
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-body">Ubicaciones satelitales en vivo</p>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-headline">
            <span>Servidor Backend API</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 font-bold">
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
