import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.service';

const formatDuracion = (seg) => {
  if (!seg) return '—';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const GanaderoTVPage = () => {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);

  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [form, setForm]               = useState({ numero: '', titulo: '', descripcion: '', duracion: '' });
  const [videoFile, setVideoFile]     = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError]             = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['capitulos-admin'],
    queryFn: () => api.get('/capitulos/admin/todos').then((r) => r.data),
  });
  const capitulos = data?.data ?? [];

  const toggleMutation = useMutation({
    mutationFn: (id) => api.patch(`/capitulos/${id}/publicar`),
    onSuccess: () => queryClient.invalidateQueries(['capitulos-admin']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/capitulos/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['capitulos-admin']),
  });

  const handleSubir = async (e) => {
    e.preventDefault();
    if (!videoFile) return setError('Selecciona un archivo de video');
    if (!form.numero || !form.titulo) return setError('El número y el título son obligatorios');

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('numero', form.numero);
      formData.append('titulo', form.titulo);
      if (form.descripcion) formData.append('descripcion', form.descripcion);
      if (form.duracion)    formData.append('duracion', form.duracion);

      await api.post('/capitulos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setUploadProgress(Math.round((e.loaded * 100) / e.total));
        },
      });

      queryClient.invalidateQueries(['capitulos-admin']);
      setDrawerOpen(false);
      setForm({ numero: '', titulo: '', descripcion: '', duracion: '' });
      setVideoFile(null);
      setUploadProgress(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir el video');
    } finally {
      setUploading(false);
    }
  };

  const publicados  = capitulos.filter((c) => c.publicado).length;
  const borradores  = capitulos.filter((c) => !c.publicado).length;

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">📺 Ganadero TV</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Gestiona los capítulos de la serie. Los videos se alojan en Cloudinary.
          </p>
        </div>
        <button
          onClick={() => { setDrawerOpen(true); setError(''); }}
          className="btn-cta flex items-center gap-2 font-semibold px-6 py-3 rounded-lg shadow-lg active:scale-95 transition-all font-headline"
        >
          <span className="material-symbols-outlined text-sm">upload_file</span>
          Subir capítulo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total capítulos', value: capitulos.length },
          { label: 'Publicados',      value: publicados },
          { label: 'Borradores',      value: borradores },
        ].map(({ label, value }) => (
          <div key={label} className="bg-surface-container rounded-xl p-4">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-bold text-on-surface">{value}</p>
          </div>
        ))}
      </div>

      {/* Lista de capítulos */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : capitulos.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          No hay capítulos aún. Sube el primero.
        </div>
      ) : (
        <div className="space-y-3">
          {capitulos.map((cap) => (
            <div key={cap._id} className="bg-surface-container rounded-xl flex gap-4 overflow-hidden">
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-32 h-20 bg-surface-container-high relative">
                {cap.thumbnailUrl ? (
                  <img src={cap.thumbnailUrl} alt={cap.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">play_circle</span>
                  </div>
                )}
                <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {formatDuracion(cap.duracion)}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 py-3 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant">Cap. {cap.numero}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    cap.publicado
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {cap.publicado ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <p className="font-semibold text-on-surface mt-1 truncate">{cap.titulo}</p>
                {cap.descripcion && (
                  <p className="text-sm text-on-surface-variant line-clamp-1 mt-0.5">{cap.descripcion}</p>
                )}
                {cap.fechaPublicacion && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    Publicado el {new Date(cap.fechaPublicacion).toLocaleDateString('es-CO')}
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex-shrink-0 flex flex-col gap-2 p-3">
                <button
                  onClick={() => toggleMutation.mutate(cap._id)}
                  disabled={toggleMutation.isPending}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    cap.publicado
                      ? 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {cap.publicado ? 'Ocultar' : 'Publicar'}
                </button>
                <button
                  onClick={() => { if (confirm(`¿Eliminar "${cap.titulo}"?`)) deleteMutation.mutate(cap._id); }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer subir capítulo */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-on-surface">Subir nuevo capítulo</h2>

            <form onSubmit={handleSubir} className="space-y-4">
              {/* Seleccionar video */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  className="hidden"
                  onChange={(e) => setVideoFile(e.target.files[0] || null)}
                />
                {videoFile ? (
                  <div>
                    <p className="text-primary font-semibold">{videoFile.name}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">video_file</span>
                    <p className="text-sm text-on-surface-variant mt-2">Haz clic para seleccionar un video MP4</p>
                    <p className="text-xs text-on-surface-variant">Máximo 100 MB</p>
                  </div>
                )}
              </div>

              {/* Número */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Número *</label>
                  <input
                    type="number"
                    min="1"
                    value={form.numero}
                    onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                    placeholder="1"
                    className="mt-1 w-full bg-surface-container-high rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none border border-outline-variant focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Duración (seg)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.duracion}
                    onChange={(e) => setForm((f) => ({ ...f, duracion: e.target.value }))}
                    placeholder="Auto"
                    className="mt-1 w-full bg-surface-container-high rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none border border-outline-variant focus:border-primary"
                  />
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: El origen de la raza Brahman en el Huila"
                  className="mt-1 w-full bg-surface-container-high rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none border border-outline-variant focus:border-primary"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Descripción</label>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Resumen del capítulo..."
                  className="mt-1 w-full bg-surface-container-high rounded-xl px-3 py-2.5 text-sm text-on-surface outline-none border border-outline-variant focus:border-primary resize-none"
                />
              </div>

              {/* Barra de progreso */}
              {uploading && (
                <div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                    <span>Subiendo video a Cloudinary...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); setVideoFile(null); setForm({ numero: '', titulo: '', descripcion: '', duracion: '' }); }}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant text-sm font-semibold"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || !videoFile}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50"
                >
                  {uploading ? `Subiendo ${uploadProgress}%...` : 'Subir capítulo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GanaderoTVPage;
