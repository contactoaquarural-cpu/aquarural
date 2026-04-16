import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.service';

const CATEGORIAS = ['GOBIERNO', 'SANIDAD', 'PRECIOS', 'EVENTO', 'INSTITUCIONAL'];

const CATEGORIA_MAP = {
  GOBIERNO:      { label: 'Gobierno',      color: 'text-blue-400',    bg: 'bg-blue-900/30' },
  SANIDAD:       { label: 'Sanidad',       color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  PRECIOS:       { label: 'Precios',       color: 'text-tertiary',    bg: 'bg-tertiary/10' },
  EVENTO:        { label: 'Evento',        color: 'text-purple-400',  bg: 'bg-purple-900/30' },
  INSTITUCIONAL: { label: 'Institucional', color: 'text-primary',     bg: 'bg-primary-container/30' },
};

const EMPTY_FORM = { titulo: '', contenido: '', categoria: 'INSTITUCIONAL', imagen: '', publicado: false };

const NoticiasPage = () => {
  const queryClient = useQueryClient();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing,    setEditing]    = useState(null); // null = nuevo
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [error,      setError]      = useState('');

  // Cargar todas las noticias (admin)
  const { data, isLoading } = useQuery({
    queryKey: ['noticias-admin'],
    queryFn:  () => api.get('/noticias/admin/todas?limit=50').then((r) => r.data),
  });
  const noticias = data?.data ?? [];

  // Crear
  const createMutation = useMutation({
    mutationFn:  (payload) => api.post('/noticias', payload),
    onSuccess:   () => { queryClient.invalidateQueries(['noticias-admin']); cerrarDrawer(); },
    onError:     (err) => setError(err.response?.data?.message || 'Error al crear noticia'),
  });

  // Actualizar
  const updateMutation = useMutation({
    mutationFn:  ({ id, payload }) => api.put(`/noticias/${id}`, payload),
    onSuccess:   () => { queryClient.invalidateQueries(['noticias-admin']); cerrarDrawer(); },
    onError:     (err) => setError(err.response?.data?.message || 'Error al actualizar'),
  });

  // Eliminar
  const deleteMutation = useMutation({
    mutationFn:  (id) => api.delete(`/noticias/${id}`),
    onSuccess:   () => queryClient.invalidateQueries(['noticias-admin']),
  });

  const abrirNuevo = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setDrawerOpen(true);
  };

  const abrirEditar = (noticia) => {
    setEditing(noticia);
    setForm({
      titulo:    noticia.titulo,
      contenido: noticia.contenido,
      categoria: noticia.categoria,
      imagen:    noticia.imagen || '',
      publicado: noticia.publicado,
    });
    setError('');
    setDrawerOpen(true);
  };

  const cerrarDrawer = () => {
    setDrawerOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, imagen: form.imagen || undefined };
    if (editing) {
      updateMutation.mutate({ id: editing._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEliminar = (id) => {
    if (!window.confirm('¿Eliminar esta noticia? Esta acción no se puede deshacer.')) return;
    deleteMutation.mutate(id);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">
            Noticias <span className="text-primary">del Sector</span>
          </h2>
          <p className="text-on-surface-variant font-light text-lg">
            Gestiona las publicaciones visibles para los ganaderos en la app móvil.
          </p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-2 bg-gradient-to-br from-primary-container to-primary-container/70 text-primary font-bold px-6 py-3 rounded-xl shadow-lg hover:brightness-125 transition-all"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nueva Noticia
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: noticias.length },
          { label: 'Publicadas', value: noticias.filter((n) => n.publicado).length },
          { label: 'Borradores', value: noticias.filter((n) => !n.publicado).length },
          { label: 'Con imagen', value: noticias.filter((n) => n.imagen).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-container-low rounded-2xl p-5">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">{label}</p>
            <p className="text-3xl font-bold font-headline text-on-surface">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla de noticias */}
      <div className="bg-surface-container-low rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20">
          <h3 className="text-lg font-bold text-on-surface font-headline">Todas las noticias</h3>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-on-surface-variant">Cargando...</div>
        ) : noticias.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl block mb-3 opacity-30">newspaper</span>
            <p className="text-on-surface-variant">No hay noticias. Crea la primera.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-lowest/50">
                  {['Título', 'Categoría', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                    <th key={h} className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {noticias.map((n) => {
                  const cat = CATEGORIA_MAP[n.categoria] || CATEGORIA_MAP.INSTITUCIONAL;
                  return (
                    <tr key={n._id} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {n.imagen && (
                            <img src={n.imagen} alt="" className="w-10 h-10 rounded-lg object-cover opacity-80" />
                          )}
                          <div>
                            <p className="font-bold text-on-surface text-sm line-clamp-1">{n.titulo}</p>
                            <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">{n.contenido}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${cat.bg} ${cat.color}`}>
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          n.publicado
                            ? 'bg-primary-container/30 text-primary'
                            : 'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {n.publicado ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {n.fechaPublicacion
                          ? new Date(n.fechaPublicacion).toLocaleDateString('es-CO')
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirEditar(n)}
                            className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => handleEliminar(n._id)}
                            className="p-1.5 rounded-lg hover:bg-error/10 transition-colors text-on-surface-variant hover:text-error"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer lateral */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cerrarDrawer} />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-surface-container h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Header del drawer */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/20 sticky top-0 bg-surface-container z-10">
              <h3 className="text-xl font-bold text-on-surface font-headline">
                {editing ? 'Editar noticia' : 'Nueva noticia'}
              </h3>
              <button onClick={cerrarDrawer} className="p-2 rounded-xl hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 flex-1">
              {error && (
                <div className="bg-error-container/20 border border-error/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-lg">error</span>
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}

              {/* Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-widest">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Nuevas medidas sanitarias del ICA"
                  required
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-widest">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{CATEGORIA_MAP[c].label}</option>
                  ))}
                </select>
              </div>

              {/* URL imagen */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-widest">URL de imagen</label>
                <input
                  type="url"
                  value={form.imagen}
                  onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                  placeholder="https://... (opcional)"
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
                />
                {form.imagen && (
                  <img src={form.imagen} alt="preview" className="w-full h-32 object-cover rounded-lg mt-2 opacity-80" />
                )}
              </div>

              {/* Contenido */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary uppercase tracking-widest">Contenido *</label>
                <textarea
                  value={form.contenido}
                  onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  placeholder="Redacta el contenido de la noticia..."
                  required
                  rows={8}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm resize-none"
                />
              </div>

              {/* Publicar */}
              <label className="flex items-center gap-3 cursor-pointer bg-surface-container-low rounded-xl px-4 py-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.publicado}
                    onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.publicado ? 'bg-primary-container' : 'bg-surface-container-highest'}`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform bg-on-surface-variant ${form.publicado ? 'translate-x-5 bg-primary' : ''}`} />
                  </div>
                </div>
                <span className="text-sm font-medium text-on-surface">
                  {form.publicado ? 'Publicar ahora' : 'Guardar como borrador'}
                </span>
              </label>

              {/* Botones */}
              <div className="flex gap-3 mt-auto pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={cerrarDrawer}
                  className="flex-1 py-3 bg-surface-container-high rounded-xl text-sm font-bold text-on-surface hover:brightness-125 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-br from-primary-container to-primary-container/70 text-primary font-bold rounded-xl shadow hover:brightness-125 transition-all disabled:opacity-60 text-sm"
                >
                  {isSubmitting ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear noticia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticiasPage;
