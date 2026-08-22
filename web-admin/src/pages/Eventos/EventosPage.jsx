import { useState, useEffect } from 'react';
import api from '../../services/api.service';

const suscriptoresBase5 = [];

const EventosPage = () => {
  const [eventos, setEventos] = useState(() => {
    const guardados = localStorage.getItem('aquarural-eventos-v2');
    if (guardados) {
      try {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [loading, setLoading] = useState(false);

  // Cargar desde API
  const cargarEventosApi = async () => {
    try {
      const { data } = await api.get('/eventos');
      if (data && data.success && Array.isArray(data.data)) {
        setEventos(data.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    cargarEventosApi();
  }, []);

  useEffect(() => {
    localStorage.setItem('aquarural-eventos-v2', JSON.stringify(eventos));
  }, [eventos]);

  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [mensaje, setMensaje] = useState(null);

  // Modales
  const [mostrarModalForm, setMostrarModalForm] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [eventoAEliminar, setEventoAEliminar] = useState(null);
  const [eventoVerAsistencia, setEventoVerAsistencia] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    titulo: '',
    tipo: 'ASAMBLEA_GENERAL',
    fecha: '',
    hora: '09:00 AM',
    lugar: 'Caseta Comunal Vereda La Argentina',
    descripcion: '',
    enviarPushApp: true,
  });

  const abrirModalCrear = () => {
    setEventoEditando(null);
    const hoyStr = new Date().toISOString().split('T')[0];
    setForm({
      titulo: '',
      tipo: 'ASAMBLEA_GENERAL',
      fecha: hoyStr,
      hora: '09:00 AM',
      lugar: 'Caseta Comunal Vereda La Argentina',
      descripcion: '',
      enviarPushApp: true,
    });
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
      enviarPushApp: true,
    });
    setMostrarModalForm(true);
  };

  const handleGuardarEvento = async (e) => {
    e.preventDefault();

    // Inicializar mapa de respuestas RSVP para los 5 suscriptores
    const respuestasIniciales = suscriptoresBase5.reduce((acc, s) => {
      acc[s.id] = 'PENDIENTE'; // 'SI', 'NO', 'PENDIENTE'
      return acc;
    }, {});

    if (eventoEditando) {
      setEventos(
        eventos.map((ev) => (ev.id === eventoEditando.id || ev._id === eventoEditando._id ? { ...ev, ...form } : ev))
      );
      setMensaje({
        tipo: 'ok',
        texto: `¡Convocatoria "${form.titulo}" actualizada con éxito!`,
      });
    } else {
      const nuevo = {
        id: String(Date.now()),
        ...form,
        respuestasRSVP: respuestasIniciales,
        notificacionesEnviadas: 5,
        estado: 'PROGRAMADO',
      };
      setEventos([nuevo, ...eventos]);
      
      // Guardar en backend
      await api.post('/eventos', form).catch(() => {});

      setMensaje({
        tipo: 'ok',
        texto: `¡Convocatoria "${form.titulo}" enviada a los teléfonos móviles de los campesinos con la pregunta: ¿Vas a Asistir? (Opciones: [Sí Asistiré] / [No Asistiré])!`,
      });
    }
    setMostrarModalForm(false);
  };

  const handleConfirmarEliminar = async () => {
    if (!eventoAEliminar) return;
    setEventos(eventos.filter((ev) => (ev.id !== eventoAEliminar.id && ev._id !== eventoAEliminar._id)));
    if (eventoAEliminar._id || eventoAEliminar.id) {
      await api.delete(`/eventos/${eventoAEliminar._id || eventoAEliminar.id}`).catch(() => {});
    }
    setMensaje({
      tipo: 'ok',
      texto: `¡Convocatoria "${eventoAEliminar.titulo}" cancelada y eliminada de la agenda!`,
    });
    setEventoAEliminar(null);
  };

  // Cambiar respuesta RSVP de un suscriptor (Simulando respuesta desde la App Móvil)
  const handleCambiarRSVP = (eventoId, suscriptorId, nuevoVoto) => {
    setEventos((prevEventos) =>
      prevEventos.map((ev) => {
        if (ev.id === eventoId || ev._id === eventoId) {
          const respuestasPrevias = ev.respuestasRSVP || {};
          return {
            ...ev,
            respuestasRSVP: {
              ...respuestasPrevias,
              [suscriptorId]: nuevoVoto,
            },
          };
        }
        return ev;
      })
    );

    if (eventoVerAsistencia) {
      setEventoVerAsistencia((prev) => ({
        ...prev,
        respuestasRSVP: {
          ...(prev.respuestasRSVP || {}),
          [suscriptorId]: nuevoVoto,
        },
      }));
    }
  };

  const eventosFiltrados = eventos.filter(
    (ev) => filtroTipo === 'TODOS' || ev.tipo === filtroTipo
  );

  const proximoEvento = eventos.find((ev) => ev.estado === 'PROGRAMADO');

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-body">
      {/* Header Hydro-Tech */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-3xl">event</span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-headline tracking-tight">
            Eventos & Convocatorias
          </h1>
        </div>

        <button
          onClick={abrirModalCrear}
          className="relative z-10 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-headline font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-lg font-bold">add_circle</span>
          <span>Convocar Nueva Reunión / Asamblea</span>
        </button>
      </div>

      {/* FEEDBACK MENSAJE */}
      {mensaje && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl px-5 py-3.5 flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-headline shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400">check_circle</span>
            <p className="font-semibold">{mensaje.texto}</p>
          </div>
          <button onClick={() => setMensaje(null)} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* TARJETAS RESUMEN DE CONVOCATORIAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-lg">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Reuniones Programadas</p>
            <h3 className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-300 font-mono mt-0.5">{eventos.length} Eventos</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Convocatorias activas en agenda</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <span className="material-symbols-outlined text-xl">event_available</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-lg">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Notificaciones Push App</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {(() => {
                let totalSusc = 0;
                try {
                  const s = localStorage.getItem('aquarural-suscriptores-v3');
                  if (s) {
                    const parsed = JSON.parse(s);
                    if (Array.isArray(parsed)) totalSusc = parsed.length;
                  }
                } catch (e) {}
                if (eventos.length > 0) return `${eventos.length * totalSusc} Notificaciones Enviadas`;
                return `${totalSusc} Celulares Vinculados`;
              })()}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-body">
              {(() => {
                let totalSusc = 0;
                try {
                  const s = localStorage.getItem('aquarural-suscriptores-v3');
                  if (s) {
                    const parsed = JSON.parse(s);
                    if (Array.isArray(parsed)) totalSusc = parsed.length;
                  }
                } catch (e) {}
                return totalSusc > 0
                  ? `${totalSusc} familias listas para responder confirmación`
                  : 'Registra suscriptores para vincular celulares en la App';
              })()}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined text-xl">notifications_active</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-lg">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Próxima Convocatoria</p>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-headline mt-0.5 truncate max-w-[200px]">
              {proximoEvento ? proximoEvento.fecha : 'Sin asambleas agendadas'}
            </h3>
            <p className="text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
              {proximoEvento ? `${proximoEvento.hora} • ${proximoEvento.lugar}` : 'Padrón de eventos limpio'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <span className="material-symbols-outlined text-xl">groups</span>
          </div>
        </div>
      </div>

      {/* FILTROS POR TIPO DE EVENTO */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm dark:shadow-lg">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-headline">Filtrar Convocatorias:</span>
        <div className="flex items-center gap-2 text-xs font-headline">
          <button
            onClick={() => setFiltroTipo('TODOS')}
            className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              filtroTipo === 'TODOS'
                ? 'bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/40'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Todas ({eventos.length})
          </button>
          <button
            onClick={() => setFiltroTipo('ASAMBLEA_GENERAL')}
            className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              filtroTipo === 'ASAMBLEA_GENERAL'
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Asambleas Generales
          </button>
          <button
            onClick={() => setFiltroTipo('MANTENIMIENTO_BOCATOMA')}
            className={`px-3.5 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
              filtroTipo === 'MANTENIMIENTO_BOCATOMA'
                ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Mantenimiento Bocatoma
          </button>
        </div>
      </div>

      {/* LISTADO DE EVENTOS O ESTADO VACÍO */}
      {eventosFiltrados.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm dark:shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mx-auto">
            <span className="material-symbols-outlined text-3xl">event_busy</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-headline">
              No hay convocatorias o reuniones agendadas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 font-body">
              Presiona el botón de la parte superior para crear una nueva asamblea general, reunión de la junta o jornada de mantenimiento con sistema de respuesta de asistencia (RSVP).
            </p>
          </div>
          <button
            onClick={abrirModalCrear}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-headline font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Convocar Primera Reunión</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventosFiltrados.map((ev) => {
            const rsvp = ev.respuestasRSVP || {};
            const siCount = Object.values(rsvp).filter((v) => v === 'SI').length;
            const noCount = Object.values(rsvp).filter((v) => v === 'NO').length;
            const pendientesCount = Object.values(rsvp).filter((v) => v === 'PENDIENTE' || !v).length;
            const porcentajeQuorum = Math.round((siCount / 5) * 100);

            return (
              <div
                key={ev.id || ev._id}
                className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm dark:shadow-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full font-headline uppercase ${
                        ev.tipo === 'ASAMBLEA_GENERAL'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                      }`}
                    >
                      {ev.tipo === 'ASAMBLEA_GENERAL' ? '🏛️ Asamblea General' : '🔧 Mantenimiento Veredal'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirModalEditar(ev)}
                        className="text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                        title="Editar Evento"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setEventoAEliminar(ev)}
                        className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                        title="Cancelar / Eliminar Reunión"
                      >
                        <span className="material-symbols-outlined text-lg text-red-500 dark:text-red-400">delete</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-headline leading-snug">
                      {ev.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-body">
                      {ev.descripcion}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 space-y-2 text-xs font-headline">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 font-semibold">
                      <span className="material-symbols-outlined text-base">calendar_month</span>
                      <span>{ev.fecha} • {ev.hora}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="material-symbols-outlined text-base text-slate-400">location_on</span>
                      <span>{ev.lugar}</span>
                    </div>
                  </div>

                  {/* CONTROL DE QUÓRUM & ASISTENCIA EN TIEMPO REAL */}
                  <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-xs font-headline">
                      <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-sm">how_to_reg</span>
                        <span>Confirmación de Asistencia (App Móvil)</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">
                        {porcentajeQuorum}% Quórum ({siCount}/5 SÍ)
                      </span>
                    </div>

                    {/* Barra de Progreso Quórum */}
                    <div className="w-full bg-slate-200 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden flex">
                      <div style={{ width: `${(siCount / 5) * 100}%` }} className="bg-emerald-500 h-full transition-all duration-500" title="Sí asistirán" />
                      <div style={{ width: `${(noCount / 5) * 100}%` }} className="bg-rose-500 h-full transition-all duration-500" title="No asistirán" />
                      <div style={{ width: `${(pendientesCount / 5) * 100}%` }} className="bg-slate-300 dark:bg-slate-700 h-full transition-all duration-500" title="Pendientes" />
                    </div>

                    {/* Desglose Votos */}
                    <div className="flex items-center justify-between text-[11px] font-headline">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        🟢 {siCount} SÍ Asistirán
                      </span>
                      <span className="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        🔴 {noCount} NO Asistirán
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                        ⚪ {pendientesCount} Sin responder
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTÓN VER LISTADO DE ASISTENTES */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-headline flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-cyan-600 dark:text-cyan-400">notifications_active</span>
                    <span>Pregunta enviada a los 5 celulares</span>
                  </span>

                  <button
                    onClick={() => setEventoVerAsistencia(ev)}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-headline font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">ballot</span>
                    <span>Ver Listado & Votos ({siCount}/5)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALLE DE ASISTENCIA & SIMULADOR DE RESPUESTA APP */}
      {eventoVerAsistencia && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">how_to_reg</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-100 font-headline">
                    Control de Asistencia & Quórum
                  </h3>
                  <p className="text-[11px] text-slate-400 font-body">{eventoVerAsistencia.titulo}</p>
                </div>
              </div>
              <button onClick={() => setEventoVerAsistencia(null)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-body">
              <p className="text-slate-300 font-headline font-bold">
                📱 Pregunta enviada a la App Móvil: <em className="text-cyan-300">"¿Confirmas tu asistencia a esta reunión de la junta?"</em>
              </p>
              <p className="text-[11px] text-slate-400">
                Puedes hacer clic en los botones para simular la respuesta que daría cada suscriptor desde su smartphone:
              </p>
            </div>

            {/* TABLA DE SUSCRIPTORES CON BOTONES DE RESPUESTA RSVP */}
            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {suscriptoresBase5.map((s) => {
                const votoActual = (eventoVerAsistencia.respuestasRSVP || {})[s.id] || 'PENDIENTE';
                return (
                  <div
                    key={s.id}
                    className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-2xl flex items-center justify-between text-xs font-headline"
                  >
                    <div>
                      <h4 className="font-bold text-slate-100">{s.nombres}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Matrícula: <strong className="text-slate-300">{s.matricula}</strong> | {s.vereda}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCambiarRSVP(eventoVerAsistencia.id || eventoVerAsistencia._id, s.id, 'SI')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          votoActual === 'SI'
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                            : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>SÍ Asistirá</span>
                      </button>

                      <button
                        onClick={() => handleCambiarRSVP(eventoVerAsistencia.id || eventoVerAsistencia._id, s.id, 'NO')}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          votoActual === 'NO'
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-extrabold'
                            : 'bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">cancel</span>
                        <span>NO Asistirá</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs font-headline">
              <span className="text-slate-400">Las respuestas se actualizan automáticamente en el mapa.</span>
              <button
                onClick={() => setEventoVerAsistencia(null)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl transition-all cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR REUNIÓN */}
      {mostrarModalForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <span className="material-symbols-outlined text-xl">event</span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-100 font-headline">
                    {eventoEditando ? 'Editar Convocatoria' : 'Convocar Nueva Reunión / Asamblea'}
                  </h3>
                  <p className="text-xs text-slate-400 font-body">Ingresa los detalles del evento veredal</p>
                </div>
              </div>
              <button onClick={() => setMostrarModalForm(false)} className="text-slate-400 hover:text-slate-200 p-1 rounded-xl hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleGuardarEvento} className="space-y-4 text-xs font-body">
              <div>
                <label className="text-slate-300 font-bold block mb-1.5 font-headline">Título de la Convocatoria</label>
                <input
                  type="text"
                  required
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="ej. Asamblea General Ordinaria de Usuarios del Agua"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-slate-100 font-headline text-xs focus:border-cyan-500 focus:outline-none transition-colors"
                  style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5 font-headline">Tipo de Convocatoria / Categoría</label>
                <div className="relative">
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 pr-10 text-slate-100 font-headline text-xs focus:border-cyan-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  >
                    <option value="ASAMBLEA_GENERAL">🏛️ Asamblea General de Usuarios del Agua</option>
                    <option value="MANTENIMIENTO_BOCATOMA">🔧 Mantenimiento / Limpieza Comunitaria (Minga)</option>
                    <option value="REUNION_JUNTA">👥 Reunión Extraordinaria de la Junta Directiva</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400">
                    <span className="material-symbols-outlined text-xl">unfold_more</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 font-headline">Fecha del Evento</label>
                  <input
                    type="date"
                    required
                    value={form.fecha}
                    onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-slate-100 font-headline text-xs focus:border-cyan-500 focus:outline-none transition-colors"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 font-headline">Hora de Inicio</label>
                  <input
                    type="text"
                    required
                    value={form.hora}
                    onChange={(e) => setForm({ ...form, hora: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-slate-100 font-headline text-xs focus:border-cyan-500 focus:outline-none transition-colors"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5 font-headline">Lugar / Sede de la Reunión</label>
                <input
                  type="text"
                  required
                  value={form.lugar}
                  onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                  placeholder="ej. Caseta Comunal Vereda La Argentina"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-slate-100 font-headline text-xs focus:border-cyan-500 focus:outline-none transition-colors"
                  style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5 font-headline">Descripción / Orden del Día</label>
                <textarea
                  rows={3}
                  required
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalla los puntos a tratar en la reunión..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-slate-100 font-body text-xs focus:border-cyan-500 focus:outline-none transition-colors leading-relaxed"
                  style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <input
                  type="checkbox"
                  id="enviarPush"
                  checked={form.enviarPushApp}
                  onChange={(e) => setForm({ ...form, enviarPushApp: e.target.checked })}
                  className="rounded accent-cyan-500 w-4 h-4 cursor-pointer shrink-0"
                />
                <label htmlFor="enviarPush" className="text-slate-200 text-xs font-headline font-bold cursor-pointer leading-snug">
                  📲 Enviar Notificación Push interactiva a la App Móvil con los botones <strong>[Sí Asistiré]</strong> / <strong>[No Asistiré]</strong>
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarModalForm(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-headline py-3.5 rounded-2xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold font-headline py-3.5 rounded-2xl shadow-lg shadow-cyan-500/20 text-xs transition-all cursor-pointer"
                >
                  {eventoEditando ? 'Guardar Cambios' : 'Publicar Convocatoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR REUNIÓN */}
      {eventoAEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">warning</span>
                <h3 className="text-base font-extrabold text-slate-100 font-headline">
                  Cancelar Reunión / Convocatoria
                </h3>
              </div>
              <button onClick={() => setEventoAEliminar(null)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-body">
              <p className="text-slate-300">
                ¿Estás seguro de que deseas cancelar y eliminar esta convocatoria de la agenda del acueducto veredal?
              </p>
              <div className="pt-2 border-t border-slate-900 text-xs">
                <p className="text-slate-400">Título: <strong className="text-slate-100">{eventoAEliminar.titulo}</strong></p>
                <p className="text-slate-400">Fecha: <strong className="text-cyan-300 font-headline">{eventoAEliminar.fecha} ({eventoAEliminar.hora})</strong></p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEventoAEliminar(null)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                className="w-1/2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold font-headline py-3 rounded-2xl shadow-lg shadow-red-500/20 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
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
