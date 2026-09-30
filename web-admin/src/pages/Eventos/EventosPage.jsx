import { useState, useEffect } from 'react';
import api from '../../services/api.service';
import Dropdown from '../../components/Dropdown';

const EventosPage = () => {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [eventoExpandidoId, setEventoExpandidoId] = useState(null);

  const cargarEventosApi = async () => {
    setCargando(true);
    try {
      const { data } = await api.get('/eventos');
      if (data && data.success && Array.isArray(data.data)) {
        setEventos(data.data);
      }
    } catch (e) {
      // Silencioso: si falla, la lista queda vacía y el estado vacío lo indica.
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEventosApi();
  }, []);

  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Modales
  const [mostrarModalForm, setMostrarModalForm] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [eventoAEliminar, setEventoAEliminar] = useState(null);

  const [form, setForm] = useState({
    titulo: '',
    tipo: 'ASAMBLEA_GENERAL',
    fecha: '',
    hora: '09:00 AM',
    lugar: '',
    descripcion: '',
  });

  const abrirModalCrear = () => {
    setEventoEditando(null);
    const hoyStr = new Date().toISOString().split('T')[0];
    setForm({
      titulo: '',
      tipo: 'ASAMBLEA_GENERAL',
      fecha: hoyStr,
      hora: '09:00 AM',
      lugar: '',
      descripcion: '',
    });
    setError('');
    setMostrarModalForm(true);
  };

  const abrirModalEditar = (ev) => {
    setEventoEditando(ev);
    setForm({
      titulo: ev.titulo,
      tipo: ev.tipo,
      fecha: ev.fecha,
      hora: ev.hora,
      lugar: ev.lugar,
      descripcion: ev.descripcion,
    });
    setError('');
    setMostrarModalForm(true);
  };

  const handleGuardarEvento = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.titulo.trim() || !form.fecha || !form.hora.trim() || !form.lugar.trim()) {
      setError('Completa título, fecha, hora y lugar para continuar.');
      return;
    }

    setGuardando(true);
    try {
      if (eventoEditando) {
        await api.put(`/eventos/${eventoEditando._id}`, form);
        setMensaje({ tipo: 'ok', texto: `¡Convocatoria "${form.titulo}" actualizada con éxito!` });
      } else {
        await api.post('/eventos', form);
        setMensaje({ tipo: 'ok', texto: `¡Convocatoria "${form.titulo}" publicada en la agenda!` });
      }
      setMostrarModalForm(false);
      await cargarEventosApi();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la convocatoria.');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!eventoAEliminar) return;
    try {
      await api.delete(`/eventos/${eventoAEliminar._id}`);
      setMensaje({ tipo: 'ok', texto: `¡Convocatoria "${eventoAEliminar.titulo}" cancelada y eliminada de la agenda!` });
      await cargarEventosApi();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.message || 'No se pudo eliminar la convocatoria.' });
    } finally {
      setEventoAEliminar(null);
    }
  };

  const eventosFiltrados = eventos.filter(
    (ev) => filtroTipo === 'TODOS' || ev.tipo === filtroTipo
  );

  // El backend devuelve los eventos ordenados por fecha DESCENDENTE
  // (más reciente/lejana primero) — tomar solo el primero con find() daría
  // el evento programado más LEJANO, no el más próximo. Se ordena aquí en
  // ascendente antes de elegir, para que "Próxima Convocatoria" muestre
  // de verdad la fecha más cercana.
  const proximoEvento = eventos
    .filter((ev) => ev.estado === 'PROGRAMADO')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#1D4ED8] text-3xl">event</span>
          <h1 className="text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
            Eventos & Convocatorias
          </h1>
        </div>

        <button
          onClick={abrirModalCrear}
          style={{ color: '#ffffff' }}
          className="relative z-10 bg-[#1D4ED8] hover:bg-[#1E3A8A] font-headline font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-lg font-bold">add_circle</span>
          <span>Convocar Nueva Reunión / Asamblea</span>
        </button>
      </div>

      {/* FEEDBACK MENSAJE */}
      {mensaje && (
        <div className={`rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs font-headline shadow-sm animate-fade-in ${
          mensaje.tipo === 'error'
            ? 'bg-red-50 border border-red-200 text-red-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg">
              {mensaje.tipo === 'error' ? 'error' : 'check_circle'}
            </span>
            <p className="font-semibold">{mensaje.texto}</p>
          </div>
          <button onClick={() => setMensaje(null)} className="hover:opacity-70">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* TARJETAS RESUMEN DE CONVOCATORIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Reuniones Programadas</p>
            <h3 className="text-2xl font-extrabold text-[#1D4ED8] font-mono mt-0.5">{eventos.length} Eventos</h3>
            <p className="text-[11px] text-slate-500 mt-1">Convocatorias activas en agenda</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8]">
            <span className="material-symbols-outlined text-xl">event_available</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Próxima Convocatoria</p>
            <h3 className="text-base font-extrabold text-slate-800 font-headline mt-0.5 truncate max-w-[200px]">
              {proximoEvento ? proximoEvento.fecha : 'Sin asambleas agendadas'}
            </h3>
            <p className="text-[11px] text-[#1D4ED8] mt-1 font-mono">
              {proximoEvento ? `${proximoEvento.hora} • ${proximoEvento.lugar}` : 'No hay convocatorias pendientes'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <span className="material-symbols-outlined text-xl">groups</span>
          </div>
        </div>
      </div>

      {/* FILTROS POR TIPO DE EVENTO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-headline">Filtrar Convocatorias:</span>
        <div className="flex flex-wrap items-center gap-2 text-xs font-headline">
          <button
            onClick={() => setFiltroTipo('TODOS')}
            className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              filtroTipo === 'TODOS'
                ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({eventos.length})
          </button>
          <button
            onClick={() => setFiltroTipo('ASAMBLEA_GENERAL')}
            className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all inline-flex items-center gap-1 ${
              filtroTipo === 'ASAMBLEA_GENERAL'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">account_balance</span>
            Asamblea General
          </button>
          <button
            onClick={() => setFiltroTipo('MANTENIMIENTO_BOCATOMA')}
            className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all inline-flex items-center gap-1 ${
              filtroTipo === 'MANTENIMIENTO_BOCATOMA'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">plumbing</span>
            Mantenimiento / Minga
          </button>
          <button
            onClick={() => setFiltroTipo('REUNION_JUNTA')}
            className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all inline-flex items-center gap-1 ${
              filtroTipo === 'REUNION_JUNTA'
                ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">groups</span>
            Reunión de Junta
          </button>
        </div>
      </div>

      {/* LISTADO DE EVENTOS O ESTADO VACÍO */}
      {cargando ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs font-headline">
          Cargando convocatorias...
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8] mx-auto">
            <span className="material-symbols-outlined text-3xl">event_busy</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 font-headline">
              No hay convocatorias o reuniones agendadas
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 font-body">
              Presiona el botón de la parte superior para crear una nueva asamblea general, reunión de la junta o jornada de mantenimiento.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventosFiltrados.map((ev) => (
            <div
              key={ev._id}
              className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm relative overflow-hidden hover:border-[#1D4ED8]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span
                    className={`text-[10px] font-extrabold px-3 py-1 rounded-full font-headline uppercase inline-flex items-center gap-1 ${
                      ev.tipo === 'ASAMBLEA_GENERAL'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ev.tipo === 'MANTENIMIENTO_BOCATOMA'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xs">
                      {ev.tipo === 'ASAMBLEA_GENERAL' ? 'account_balance' : ev.tipo === 'MANTENIMIENTO_BOCATOMA' ? 'plumbing' : 'groups'}
                    </span>
                    {ev.tipo === 'ASAMBLEA_GENERAL'
                      ? 'Asamblea General'
                      : ev.tipo === 'MANTENIMIENTO_BOCATOMA'
                      ? 'Mantenimiento / Minga'
                      : 'Reunión de Junta'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirModalEditar(ev)}
                      className="text-slate-400 hover:text-[#1D4ED8] p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      title="Editar Evento"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      onClick={() => setEventoAEliminar(ev)}
                      className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Cancelar / Eliminar Reunión"
                    >
                      <span className="material-symbols-outlined text-lg text-red-500">delete</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 font-headline leading-snug">
                    {ev.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-body">
                    {ev.descripcion}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs font-headline">
                  <div className="flex items-center gap-2 text-[#1D4ED8] font-semibold">
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    <span>{ev.fecha} • {ev.hora}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
                    <span>{ev.lugar}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-3">
                {(() => {
                  const asistentes = ev.asistentes || [];
                  const confirmados = asistentes.filter((a) => a.respuesta === 'SI');
                  const declinados = asistentes.filter((a) => a.respuesta === 'NO');
                  const expandido = eventoExpandidoId === ev._id;

                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setEventoExpandidoId(expandido ? null : ev._id)}
                        disabled={asistentes.length === 0}
                        className="w-full flex items-center justify-between gap-4 text-[11px] font-headline cursor-pointer disabled:cursor-default"
                      >
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {confirmados.length} asistirán
                          </span>
                          <span className="flex items-center gap-1.5 text-red-600 font-bold">
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            {declinados.length} no asistirán
                          </span>
                        </div>
                        {asistentes.length > 0 && (
                          <span className="material-symbols-outlined text-slate-400 text-lg">
                            {expandido ? 'expand_less' : 'expand_more'}
                          </span>
                        )}
                      </button>

                      {expandido && asistentes.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-[10px] text-slate-400 uppercase tracking-wider">
                                <th className="py-2 px-3 font-bold">Suscriptor</th>
                                <th className="py-2 px-3 font-bold">Matrícula</th>
                                <th className="py-2 px-3 font-bold text-right">Respuesta</th>
                              </tr>
                            </thead>
                            <tbody className="text-xs">
                              {asistentes.map((a) => (
                                <tr key={a.asociadoId} className="border-t border-slate-200">
                                  <td className="py-2 px-3 font-semibold text-slate-700">{a.nombre}</td>
                                  <td className="py-2 px-3 font-mono text-slate-500">{a.matricula}</td>
                                  <td className="py-2 px-3 text-right">
                                    <span
                                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                        a.respuesta === 'SI'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-red-50 text-red-600 border border-red-200'
                                      }`}
                                    >
                                      {a.respuesta === 'SI' ? 'Asistirá' : 'No asistirá'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR / EDITAR REUNIÓN */}
      {mostrarModalForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8]">
                  <span className="material-symbols-outlined text-xl">event</span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 font-headline">
                    {eventoEditando ? 'Editar Convocatoria' : 'Convocar Nueva Reunión / Asamblea'}
                  </h3>
                  <p className="text-xs text-slate-500 font-body">Ingresa los detalles del evento veredal</p>
                </div>
              </div>
              <button onClick={() => setMostrarModalForm(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGuardarEvento} className="space-y-4 text-xs font-body">
              <div>
                <label className="text-slate-700 font-bold block mb-1.5 font-headline">Título de la Convocatoria</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="ej. Asamblea General Ordinaria de Usuarios del Agua"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-headline text-xs focus:border-[#1D4ED8] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1.5 font-headline">Tipo de Convocatoria / Categoría</label>
                <Dropdown
                  value={form.tipo}
                  onChange={(tipo) => setForm({ ...form, tipo })}
                  options={[
                    { value: 'ASAMBLEA_GENERAL', label: 'Asamblea General de Usuarios del Agua' },
                    { value: 'MANTENIMIENTO_BOCATOMA', label: 'Mantenimiento / Limpieza Comunitaria (Minga)' },
                    { value: 'REUNION_JUNTA', label: 'Reunión Extraordinaria de la Junta Directiva' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-bold block mb-1.5 font-headline">Fecha del Evento</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-headline text-xs focus:border-[#1D4ED8] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1.5 font-headline">Hora de Inicio</label>
                  <input
                    type="text"
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-headline text-xs focus:border-[#1D4ED8] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1.5 font-headline">Lugar / Sede de la Reunión</label>
                <input
                  type="text"
                  value={form.lugar}
                  onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                  placeholder="ej. Caseta Comunal Vereda La Argentina"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-headline text-xs focus:border-[#1D4ED8] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1.5 font-headline">Descripción / Orden del Día</label>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalla los puntos a tratar en la reunión..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-body text-xs focus:border-[#1D4ED8] focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalForm(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-3.5 rounded-2xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{ color: '#ffffff' }}
                  className="w-1/2 bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline py-3.5 rounded-2xl shadow-sm hover:shadow-md text-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {guardando ? 'Guardando...' : eventoEditando ? 'Guardar Cambios' : 'Publicar Convocatoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR REUNIÓN */}
      {eventoAEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">warning</span>
                <h3 className="text-base font-extrabold text-slate-800 font-headline">
                  Cancelar Reunión / Convocatoria
                </h3>
              </div>
              <button onClick={() => setEventoAEliminar(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-body">
              <p className="text-slate-700">
                ¿Estás seguro de que deseas cancelar y eliminar esta convocatoria de la agenda del acueducto veredal?
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs">
                <p className="text-slate-500">Título: <strong className="text-slate-800">{eventoAEliminar.titulo}</strong></p>
                <p className="text-slate-500">Fecha: <strong className="text-[#1D4ED8] font-headline">{eventoAEliminar.fecha} ({eventoAEliminar.hora})</strong></p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventoAEliminar(null)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                style={{ color: '#ffffff' }}
                className="w-1/2 bg-red-600 hover:bg-red-500 font-extrabold font-headline py-3 rounded-2xl shadow-sm hover:shadow-md text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Cancelar Reunión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosPage;
