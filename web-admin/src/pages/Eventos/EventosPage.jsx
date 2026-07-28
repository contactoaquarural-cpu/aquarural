import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.service';

const TIPOS = ['COMITE', 'REUNION', 'CAPACITACION', 'OTRO'];

const TIPO_MAP = {
  COMITE:       { label: 'Comité',       icon: '🏛️', color: 'text-blue-400',   bg: 'bg-blue-900/30' },
  REUNION:      { label: 'Reunión',      icon: '🤝', color: 'text-primary',    bg: 'bg-primary-container/30' },
  CAPACITACION: { label: 'Capacitación', icon: '📚', color: 'text-amber-400',  bg: 'bg-amber-900/30' },
  OTRO:         { label: 'Otro',         icon: '📅', color: 'text-purple-400', bg: 'bg-purple-900/30' },
};

const EMPTY_FORM = { titulo: '', descripcion: '', fecha: '', lugar: '', tipo: 'REUNION' };

const EventosPage = () => {
  const queryClient = useQueryClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [error,      setError]      = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['eventos-admin'],
    queryFn:  () => api.get('/eventos').then((r) => r.data),
  });
  const eventos = data?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/eventos', payload),
    onSuccess:  () => { queryClient.invalidateQueries(['eventos-admin']); cerrarDrawer(); },
    onError:    (err) => setError(err.response?.data?.message || 'Error al crear evento'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/eventos/${id}`, payload),
    onSuccess:  () => { queryClient.invalidateQueries(['eventos-admin']); cerrarDrawer(); },
    onError:    (err) => setError(err.response?.data?.message || 'Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/eventos/${id}`),
    onSuccess:  () => { queryClient.invalidateQueries(['eventos-admin']); setConfirmDel(null); },
  });

  const abrirNuevo = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setDrawerOpen(true);
  };

  const abrirEditar = (evento) => {
    setEditing(evento);
    setForm({
      titulo:      evento.titulo,
      descripcion: evento.descripcion || '',
      fecha:       evento.fecha ? evento.fecha.slice(0, 16) : '',
      lugar:       evento.lugar || '',
      tipo:        evento.tipo,
    });
    setError('');
    setDrawerOpen(true);
  };

  const cerrarDrawer = () => { setDrawerOpen(false); setEditing(null); setForm(EMPTY_FORM); setError(''); };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing._id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface font-headline">Eventos y Convocatorias</h1>
          <p className="text-on-surface-variant text-sm mt-1">Crea reuniones, comités y capacitaciones. Los asociados reciben notificación push y deben confirmar lectura.</p>
        </div>
        <button onClick={abrirNuevo}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all">
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo evento
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">event</span>
          <p className="font-medium">No hay eventos registrados.</p>
          <p className="text-sm mt-1">Crea el primero con el botón de arriba.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {eventos.map((ev) => {
            const cfg = TIPO_MAP[ev.tipo] || TIPO_MAP.OTRO;
            const fechaDate = new Date(ev.fecha);
            const pasado = fechaDate < new Date();
            return (
              <div key={ev._id} className={`bg-surface-container-low rounded-2xl p-5 border transition-all ${pasado ? 'border-outline-variant opacity-70' : 'border-outline-variant hover:border-primary/50'}`}>
                {/* Tipo + fecha */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                  {pasado && (
                    <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">Pasado</span>
                  )}
                </div>

                <h3 className="font-bold text-on-surface text-base mb-1 line-clamp-2">{ev.titulo}</h3>
                {ev.descripcion && <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{ev.descripcion}</p>}

                <div className="space-y-1.5 text-xs text-on-surface-variant mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {fechaDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}
                    {fechaDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {ev.lugar && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {ev.lugar}
                    </div>
                  )}
                </div>

                {/* Confirmaciones */}
                <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-sm">how_to_reg</span>
                  <span className="text-xs font-semibold text-on-surface">
                    {ev.confirmados} / {ev.totalAsociados} confirmaron lectura
                  </span>
                  <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden ml-1">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: ev.totalAsociados > 0 ? `${Math.round((ev.confirmados / ev.totalAsociados) * 100)}%` : '0%' }}
                    />
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <button onClick={() => abrirEditar(ev)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-surface-container hover:bg-surface-container-high text-on-surface transition-all">
                    <span className="material-symbols-outlined text-sm">edit</span> Editar
                  </button>
                  <button onClick={() => setConfirmDel(ev)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-error-container/20 hover:bg-error-container/40 text-error transition-all">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer crear/editar */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={cerrarDrawer} />
          <div className="w-full max-w-md bg-surface h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface font-headline">
                {editing ? 'Editar evento' : 'Nuevo evento'}
              </h2>
              <button onClick={cerrarDrawer} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">
              {error && (
                <div className="bg-error-container/20 border border-error/30 rounded-xl px-4 py-3 text-error text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">Tipo de evento</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIPOS.map((t) => (
                    <button key={t} type="button"
                      onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        form.tipo === t
                          ? 'bg-primary text-on-primary border-primary'
                          : 'bg-surface-container border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}>
                      {TIPO_MAP[t].icon} {TIPO_MAP[t].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">Título *</label>
                <input name="titulo" value={form.titulo} onChange={handleChange} required
                  placeholder="Ej: Reunión mensual de socios"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
                  placeholder="Agenda, temas a tratar, información adicional..."
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-colors resize-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">Fecha y hora *</label>
                <input name="fecha" type="datetime-local" value={form.fecha} onChange={handleChange} required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">Lugar</label>
                <input name="lugar" value={form.lugar} onChange={handleChange}
                  placeholder="Ej: Sala de juntas, Sede principal"
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface text-sm outline-none focus:border-primary transition-colors" />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={cerrarDrawer}
                  className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {isPending ? (
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">send</span>
                  )}
                  {editing ? 'Guardar' : 'Crear y notificar'}
                </button>
              </div>

              {!editing && (
                <p className="text-xs text-on-surface-variant text-center">
                  Al crear el evento se enviará una notificación push a todos los asociados activos.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <span className="material-symbols-outlined text-error text-4xl mb-3 block">warning</span>
            <h3 className="text-lg font-bold text-on-surface mb-2">¿Eliminar evento?</h3>
            <p className="text-sm text-on-surface-variant mb-6">
              Se eliminará <strong>{confirmDel.titulo}</strong> y todas sus notificaciones. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant font-semibold text-sm">
                Cancelar
              </button>
              <button onClick={() => deleteMutation.mutate(confirmDel._id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-error text-on-error font-bold text-sm disabled:opacity-60">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventosPage;
