import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';
import Toast from '../../components/Toast';

const PLAN_LABEL = {
  MANANTIAL: 'Manantial',
  CAUDAL: 'Caudal',
  CUENCA: 'Cuenca',
  ACUIFERO: 'Acuífero',
};

const SuperAdminDashboardPage = () => {
  const navigate = useNavigate();
  const [acueductos, setAcueductos] = useState([]);
  const [metricas, setMetricas] = useState({
    totalAcueductos: 0,
    acueductosActivos: 0,
    acueductosSuspendidos: 0,
    totalSuscriptores: 0,
    mrrSaaS: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const [resAcueductos, resMetricas] = await Promise.allSettled([
          api.get('/superadmin/acueductos'),
          api.get('/superadmin/metricas'),
        ]);

        if (resAcueductos.status === 'rejected') {
          setError('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
        }

        const lista = resAcueductos.status === 'fulfilled' && Array.isArray(resAcueductos.value?.data?.data)
          ? resAcueductos.value.data.data
          : [];

        const totalActivos = lista.filter((a) => a.estado === 'ACTIVO').length;
        const totalSuspendidos = lista.filter((a) => a.estado === 'SUSPENDIDO').length;
        // MRR = ingreso mensualizado real: si el acueducto paga anual, se divide
        // entre 12 para comparar en la misma unidad que uno que paga mensual.
        const sumaMrr = lista.reduce((acc, a) => {
          const costo = a.costoSaaSVigente ?? 0;
          const mensualizado = a.frecuenciaPagoSaaS === 'MENSUAL' ? costo : costo / 12;
          return acc + mensualizado;
        }, 0);

        const totalSuscriptores = resMetricas.status === 'fulfilled' && resMetricas.value?.data?.success
          ? (resMetricas.value.data.data?.totalSuscriptores || 0)
          : 0;

        setAcueductos(lista);
        setMetricas({
          totalAcueductos: lista.length,
          acueductosActivos: totalActivos,
          acueductosSuspendidos: totalSuspendidos,
          totalSuscriptores,
          mrrSaaS: sumaMrr,
        });
      } catch (err) {
        console.error('Error cargando métricas del SuperAdmin', err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // Distribución real de acueductos por plan SaaS.
  const distribucionPlanes = ['MANANTIAL', 'CAUDAL', 'CUENCA', 'ACUIFERO'].map((plan) => ({
    plan,
    cantidad: acueductos.filter((a) => (a.planSaaS || 'MANANTIAL') === plan).length,
  }));
  const maxPlan = Math.max(1, ...distribucionPlanes.map((p) => p.cantidad));

  const hoyStr = new Date().toISOString().split('T')[0];
  const acueductosPendientes = acueductos.filter((a) => {
    const vencStr = a.fechaVencimientoGratis ? String(a.fechaVencimientoGratis).split('T')[0] : '';
    const estaVencido = vencStr ? vencStr < hoyStr : false;
    return estaVencido || a.estadoPagoSaaS === 'VENCIDO' || a.estadoPagoSaaS === 'POR_COBRAR';
  });
  // Distinto de "pendientes": estos no deben nada todavía, están dentro de
  // su mes gratis vigente — no hay que cobrarles, solo informarlo.
  const acueductosEnMesGratis = acueductos.filter((a) => {
    const vencStr = a.fechaVencimientoGratis ? String(a.fechaVencimientoGratis).split('T')[0] : '';
    const estaVencido = vencStr ? vencStr < hoyStr : false;
    return !estaVencido && a.estadoPagoSaaS === 'MES_GRATIS_PRUEBA';
  });

  const ultimosAfiliados = [...acueductos]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  const kpis = [
    {
      key: 'mrr',
      label: 'MRR Mensual',
      value: `$${metricas.mrrSaaS.toLocaleString()}`,
      icon: 'trending_up',
      bg: 'bg-blue-50',
      iconColor: 'text-[#1D4ED8]',
    },
    {
      key: 'acueductos',
      label: 'Acueductos Activos',
      value: String(metricas.totalAcueductos),
      icon: 'water_drop',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      key: 'familias',
      label: 'Familias Atendidas',
      value: String(metricas.totalSuscriptores),
      icon: 'groups',
      bg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      key: 'pendientes',
      label: 'Pagos Pendientes',
      value: String(acueductosPendientes.length),
      icon: 'schedule',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="space-y-6 max-w-7xl mx-auto font-body">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-headline tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Crecimiento de acueductos afiliados, ingreso recurrente y estado de la plataforma.
          </p>
        </div>

        <Toast mensaje={error} tipo="error" onClose={() => setError('')} />

        {loading ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <span className="material-symbols-outlined text-3xl animate-spin text-[#1D4ED8]">sync</span>
            <p className="text-xs font-headline">Cargando métricas...</p>
          </div>
        ) : (
          <>
            {/* KPI cards — mismo patrón que el resto del producto: icono en cápsula
                de color pastel + valor grande, tarjeta blanca con borde fino y
                sombra sutil (no bloques oscuros ni degradados). */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => (
                <div
                  key={kpi.key}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
                >
                  <div className={`w-12 h-12 ${kpi.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-xl ${kpi.iconColor}`}>{kpi.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 font-medium mb-0.5 truncate">{kpi.label}</p>
                    <p className="text-xl font-extrabold text-gray-900 font-headline leading-tight truncate">{kpi.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Widgets — distribución de planes, últimos afiliados, cobros pendientes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="font-headline font-bold text-gray-900 text-base mb-5">Distribución por Plan SaaS</h2>
                <div className="space-y-3.5">
                  {distribucionPlanes.map((p) => (
                    <div key={p.plan} className="space-y-1">
                      <div className="flex justify-between text-xs font-headline">
                        <span className="text-gray-600 font-semibold">{PLAN_LABEL[p.plan]}</span>
                        <span className="text-gray-400 font-mono">{p.cantidad}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1D4ED8] rounded-full transition-all"
                          style={{ width: `${(p.cantidad / maxPlan) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-headline font-bold text-gray-900 text-base">Últimos Afiliados</h2>
                  <button
                    onClick={() => navigate('/superadmin/acueductos')}
                    className="text-xs text-[#1D4ED8] hover:underline font-semibold"
                  >
                    Ver todos →
                  </button>
                </div>
                <div className="space-y-3.5">
                  {ultimosAfiliados.length === 0 ? (
                    <p className="text-xs text-gray-400">Aún no hay acueductos registrados.</p>
                  ) : (
                    ultimosAfiliados.map((a) => (
                      <div key={a._id || a.id} className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{a.nombre}</p>
                          <p className="text-[10px] text-gray-400">{a.municipio}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#1D4ED8] font-headline shrink-0">
                          {PLAN_LABEL[a.planSaaS] || PLAN_LABEL.MANANTIAL}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-headline font-bold text-gray-900 text-base">Cobros por Gestionar</h2>
                  {acueductosEnMesGratis.length > 0 && (
                    <span
                      title="En mes gratis — no deben nada todavía"
                      className="text-[10px] font-bold font-headline text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full"
                    >
                      {acueductosEnMesGratis.length} en mes gratis
                    </span>
                  )}
                </div>
                {acueductosPendientes.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    Nadie debe pagar todavía{acueductosEnMesGratis.length > 0 ? ' — los nuevos siguen en su mes gratis.' : '.'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {acueductosPendientes.slice(0, 4).map((a) => (
                      <div key={a._id || a.id} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 truncate">{a.nombre}</span>
                        <span className="font-bold font-mono text-amber-600 shrink-0">
                          ${(a.costoSaaSVigente ?? 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => navigate('/superadmin/acueductos')}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold font-headline py-2.5 rounded-xl transition-colors mt-4"
                >
                  Ir a Cobros
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboardPage;
