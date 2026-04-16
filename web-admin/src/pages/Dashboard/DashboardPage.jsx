import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api.service';

const MetricCard = ({ label, value, sub, subColor = 'text-primary', icon, iconColor = 'text-primary' }) => (
  <div className="bg-surface-container-low p-6 rounded-2xl relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${iconColor}`}>
      <span className="material-symbols-outlined text-6xl">{icon}</span>
    </div>
    <p className="text-on-surface-variant text-sm font-medium mb-1">{label}</p>
    <h3 className="text-3xl font-bold font-headline text-on-surface">{value}</h3>
    <div className={`mt-4 flex items-center gap-2 ${subColor}`}>
      <span className="text-xs font-semibold">{sub}</span>
    </div>
  </div>
);

const DashboardPage = () => {
  const { data: asociadosData } = useQuery({
    queryKey: ['dashboard-asociados'],
    queryFn: () => api.get('/asociados?limit=5').then((r) => r.data),
  });

  const asociados = asociadosData?.data?.asociados ?? [];
  const total = asociadosData?.data?.total ?? 0;

  const estadoBadge = (estado) => {
    const map = {
      AL_DIA:   { cls: 'bg-emerald-950 text-emerald-400 border border-emerald-900/50', label: 'AL DÍA' },
      EN_MORA:  { cls: 'bg-tertiary-container/30 text-tertiary border border-tertiary-container', label: 'EN MORA' },
      INACTIVO: { cls: 'bg-surface-container-highest text-outline border border-outline-variant/30', label: 'INACTIVO' },
    };
    const { cls, label } = map[estado] ?? map.INACTIVO;
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${cls}`}>{label}</span>;
  };

  return (
    <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto space-y-8">

      {/* Métricas */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total de asociados"
          value={total || '—'}
          sub="Plataforma activa"
          icon="groups"
        />
        <MetricCard
          label="Recaudación del mes"
          value="$0 COP"
          sub="Ver reporte completo"
          icon="payments"
        />
        <MetricCard
          label="Estado de mora"
          value="—"
          sub="Revisar morosos"
          subColor="text-error"
          icon="warning"
          iconColor="text-error"
        />
        <MetricCard
          label="Convenios activos"
          value="—"
          sub="Ver convenios"
          subColor="text-tertiary"
          icon="handshake"
          iconColor="text-tertiary"
        />
      </section>

      {/* Gráfica + Card visual */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de barras simple */}
        <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold font-headline text-on-surface">Crecimiento de Asociados</h2>
              <p className="text-sm text-on-surface-variant">Análisis comparativo — Últimos 6 meses</p>
            </div>
            <Link
              to="/reportes"
              className="bg-primary-container px-3 py-1 rounded text-xs text-on-primary-container font-medium hover:brightness-125 transition-all"
            >
              Ver Reporte
            </Link>
          </div>
          <div className="relative h-64 flex items-end justify-between gap-4 pt-4 border-l border-b border-outline-variant/30">
            {['ENE','FEB','MAR','ABR','MAY','JUN'].map((mes, i) => {
              const heights = ['40%','55%','65%','80%','85%','95%'];
              const opacities = ['bg-primary/20','bg-primary/20','bg-primary/30','bg-primary/40','bg-primary/60','bg-primary'];
              return (
                <div key={mes} className="flex-1 flex flex-col items-center group">
                  <div className={`w-full ${opacities[i]} rounded-t-lg transition-all group-hover:brightness-125`} style={{ height: heights[i] }} />
                  <span className={`mt-4 text-[10px] font-medium ${i === 5 ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                    {mes}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card visual */}
        <div className="bg-primary-container rounded-2xl p-8 flex flex-col justify-end relative overflow-hidden min-h-[300px]">
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/80 to-transparent" />
          <div className="relative z-10">
            <span
              className="material-symbols-outlined text-primary mb-4 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <h3 className="text-2xl font-bold font-headline text-primary mb-2">Excelencia Ganadera</h3>
            <p className="text-on-primary-container text-sm leading-relaxed opacity-90">
              Impulsamos la productividad y el bienestar de nuestros asociados a través de tecnología y convenios estratégicos.
            </p>
            <Link
              to="/reportes"
              className="mt-6 inline-block bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform"
            >
              Ver Reporte Regional
            </Link>
          </div>
        </div>
      </section>

      {/* Últimos registros */}
      <section className="bg-surface-container-low rounded-2xl overflow-hidden">
        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-headline text-on-surface">Últimos Registros</h2>
            <p className="text-sm text-on-surface-variant">Ingresos recientes a la asociación</p>
          </div>
          <Link to="/asociados" className="text-primary text-sm font-semibold hover:underline">
            Ver todos los asociados
          </Link>
        </div>

        <div className="divide-y divide-outline-variant/10">
          {asociados.length === 0 ? (
            <div className="p-12 flex flex-col items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-30">groups</span>
              <p className="text-sm">No hay asociados registrados aún.</p>
            </div>
          ) : (
            asociados.map((a) => (
              <div key={a._id} className="p-6 flex items-center justify-between hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center">
                    {a.fotoPerfil ? (
                      <img src={a.fotoPerfil} alt={a.nombre} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-primary">person</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-on-surface font-bold">{a.nombre}</h4>
                    <p className="text-xs text-on-surface-variant">{a.cedula}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {estadoBadge(a.estado)}
                  <Link to={`/asociados/${a._id}`}>
                    <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* FAB */}
      <Link
        to="/asociados"
        className="fixed bottom-8 right-8 bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-primary/20 hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <span className="material-symbols-outlined">add</span>
        <span className="absolute right-full mr-4 bg-surface-container px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Nuevo Registro
        </span>
      </Link>
    </div>
  );
};

export default DashboardPage;
