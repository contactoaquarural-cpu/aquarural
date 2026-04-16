import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api.service';

const ESTADO_MAP = {
  AL_DIA:   { dot: 'bg-emerald-500', text: 'text-emerald-400', label: 'Al día' },
  EN_MORA:  { dot: 'bg-error',       text: 'text-error',       label: 'En mora' },
  INACTIVO: { dot: 'bg-outline',     text: 'text-outline',     label: 'Inactivo' },
};

const AsociadosPage = () => {
  const [page, setPage]         = useState(1);
  const [estado, setEstado]     = useState('');
  const [busqueda, setBusqueda] = useState('');
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['asociados', page, estado, busqueda],
    queryFn: () =>
      api.get('/asociados', {
        params: { page, limit, estado: estado || undefined, busqueda: busqueda || undefined },
      }).then((r) => r.data),
    keepPreviousData: true,
  });

  const asociados = data?.data?.asociados ?? [];
  const total     = data?.data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const iniciales = (nombre = '') =>
    nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  return (
    <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

      {/* Header editorial */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h3 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
            Directorio de Asociados
          </h3>
          <p className="text-on-surface-variant max-w-xl">
            Gestión integral de los ganaderos afiliados. Monitoree el estado de producción y
            cumplimiento administrativo de cada unidad productiva.
          </p>
        </div>
        <button className="bg-gradient-to-tr from-primary-container to-primary-container/70 text-primary font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 hover:brightness-125 active:scale-95 transition-all font-headline">
          <span className="material-symbols-outlined">person_add</span>
          Nuevo Asociado
        </button>
      </div>

      {/* Filtros */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="col-span-1 bg-surface-container-low p-4 rounded-xl">
          <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
            Estado de Cuenta
          </label>
          <select
            value={estado}
            onChange={(e) => { setEstado(e.target.value); setPage(1); }}
            className="w-full bg-surface-container-highest border-none rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary py-2.5 px-2"
          >
            <option value="">Todos los Estados</option>
            <option value="AL_DIA">Al día</option>
            <option value="EN_MORA">En mora</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>

        <div className="col-span-1 bg-surface-container-low p-4 rounded-xl">
          <label className="block text-xs font-semibold text-primary mb-2 uppercase tracking-wider">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre o cédula..."
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPage(1); }}
            className="w-full bg-surface-container-highest border-none rounded-lg text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary py-2.5 px-3 placeholder:text-outline"
          />
        </div>

        <div className="col-span-2 flex items-end justify-end gap-3 bg-surface-container-low p-4 rounded-xl">
          <button className="bg-surface-container-highest text-on-surface px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-surface-bright transition-colors">
            <span className="material-symbols-outlined text-xl">filter_list</span>
            Más Filtros
          </button>
          <button className="bg-tertiary-container/40 text-on-tertiary-container px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-tertiary-container/60 transition-colors">
            <span className="material-symbols-outlined text-xl">download</span>
            Exportar a Excel
          </button>
        </div>
      </section>

      {/* Tabla */}
      <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high border-b border-outline-variant/20">
                {['Ganadero','Cédula','Finca & Ubicación','Estado','Acciones'].map((h) => (
                  <th key={h} className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-3xl block mb-2">progress_activity</span>
                    Cargando asociados...
                  </td>
                </tr>
              ) : asociados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2 opacity-30">groups</span>
                    No se encontraron asociados.
                  </td>
                </tr>
              ) : (
                asociados.map((a) => {
                  const est = ESTADO_MAP[a.estado] ?? ESTADO_MAP.INACTIVO;
                  return (
                    <tr key={a._id} className="hover:bg-surface-container-highest/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-primary font-bold text-sm font-headline select-none">
                            {a.fotoPerfil
                              ? <img src={a.fotoPerfil} alt={a.nombre} className="w-full h-full rounded-lg object-cover" />
                              : iniciales(a.nombre)
                            }
                          </div>
                          <div>
                            <div className="text-sm font-bold text-on-surface">{a.nombre}</div>
                            <div className="text-xs text-on-surface-variant">{a.correo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-mono text-on-surface-variant">{a.cedula}</td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-on-surface">{a.nombreFinca ?? '—'}</div>
                        <div className="text-xs text-on-surface-variant italic">{a.vereda ?? ''}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${est.dot}`} />
                          <span className={`text-xs font-bold uppercase tracking-tighter ${est.text}`}>
                            {est.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/asociados/${a._id}`}
                            className="p-2 rounded-lg text-on-surface-variant hover:bg-primary-container hover:text-primary transition-all"
                            title="Ver Detalle"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </Link>
                          <button
                            className="p-2 rounded-lg text-on-surface-variant hover:bg-primary-container hover:text-primary transition-all"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="bg-surface-container-high px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-on-surface-variant">
            Mostrando{' '}
            <span className="font-bold text-on-surface">{(page - 1) * limit + 1} – {Math.min(page * limit, total)}</span>
            {' '}de{' '}
            <span className="font-bold text-on-surface">{total}</span> Asociados
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-bright disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  p === page
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-bright'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-bright disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick insights */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-primary-container/40 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-on-surface font-headline">{total}</h4>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
              Total Asociados
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col gap-4">
          <div className="w-12 h-12 bg-error-container/40 rounded-xl flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-on-surface font-headline">—</h4>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
              Asociados en Mora
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low p-6 rounded-2xl flex flex-col gap-4">
          <div className="w-12 h-12 bg-tertiary-container/40 rounded-xl flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-2xl">water_drop</span>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-on-surface font-headline">—</h4>
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">
              Litros / Mes Proyectados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsociadosPage;
