import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';

const LIMITE_POR_PAGINA = 20;

// Página propia (no embebida en /mapa) para la lista de suscriptores sin GPS
// — con acueductos grandes (ej. 2000 suscriptores, 1000 sin GPS) esa lista
// necesita su propio scroll, buscador y paginación real del backend, igual
// que Suscriptores. Traer los 1000 de una vez rompería el mapa y esta lista.
const SinUbicacionPage = () => {
  const navigate = useNavigate();
  const [suscriptores, setSuscriptores] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/asociados', {
          params: { tieneGPS: 'false', page: pagina, limit: LIMITE_POR_PAGINA, q: busqueda || undefined },
        });
        setSuscriptores(Array.isArray(data?.data?.asociados) ? data.data.asociados : []);
        setTotal(data?.data?.total || 0);
      } catch (e) {
        setSuscriptores([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [pagina, busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 font-body">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <button
          onClick={() => navigate('/mapa')}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-xl transition-colors"
          title="Volver al Mapa"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-2xl">location_off</span>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
            Suscriptores Sin Ubicación
          </h1>
          <p className="text-xs text-slate-500">Predios que aún no han registrado su GPS — {total} en total.</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o matrícula..."
            value={busqueda}
            onChange={(e) => { setPagina(1); setBusqueda(e.target.value); }}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>
      </div>

      {/* Tabla — mismo patrón visual que SuperAdmin/Suscriptores */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">location_off</span>
            <h2 className="text-base font-extrabold text-gray-800 font-headline">Pendientes de Georreferenciar</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              Mostrando {suscriptores.length} de {total}
            </span>
            <button
              type="button"
              disabled
              title="Requiere que el suscriptor tenga la app móvil instalada con sesión iniciada (login por cédula, aún pendiente de construir)."
              className="bg-gray-50 text-gray-400 border border-gray-200 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 cursor-not-allowed shrink-0"
            >
              <span className="material-symbols-outlined text-base">notifications</span>
              <span>Notificar a Todos ({total})</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <span className="material-symbols-outlined text-3xl animate-spin text-[#1D4ED8]">sync</span>
            <p className="text-xs font-headline">Cargando suscriptores...</p>
          </div>
        ) : suscriptores.length === 0 ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <span className="material-symbols-outlined text-4xl text-gray-300">check_circle</span>
            <p className="text-sm font-headline font-bold text-gray-700">
              {busqueda ? 'No se encontraron suscriptores con esa búsqueda.' : 'Todos los suscriptores ya tienen ubicación registrada.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <colgroup>
                <col />
                <col />
                <col />
                <col className="w-px" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-headline uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-6">Suscriptor</th>
                  <th className="py-3.5 px-4">Matrícula</th>
                  <th className="py-3.5 px-4">Vereda</th>
                  <th className="py-3.5 px-6 whitespace-nowrap text-left">Acción</th>
                </tr>
              </thead>
              <tbody className="text-xs font-body text-gray-700">
                {suscriptores.map((s, i) => (
                  <tr
                    key={s._id}
                    className={`hover:bg-gray-50/50 transition-colors border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}
                  >
                    <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">{s.nombres} {s.apellidos}</td>
                    <td className="py-4 px-4 text-[#1D4ED8] font-mono font-semibold">{s.matricula}</td>
                    <td className="py-4 px-4 text-gray-500">{s.vereda || 'Centro'}</td>
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        disabled
                        title="Requiere que el suscriptor tenga la app móvil instalada con sesión iniciada (login por cédula, aún pendiente de construir)."
                        className="bg-gray-50 text-gray-400 border border-gray-200 px-3 py-1.5 rounded-xl font-headline font-bold text-xs inline-flex items-center gap-1 cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-sm">notifications</span>
                        <span>Notificar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPaginas > 1 && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">Página {pagina} de {totalPaginas}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinUbicacionPage;
