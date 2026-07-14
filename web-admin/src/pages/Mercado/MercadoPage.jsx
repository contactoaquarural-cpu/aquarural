import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.service';

const ESTADOS = ['PENDIENTE', 'APROBADO', 'RECHAZADO'];

const ESTADO_MAP = {
  PENDIENTE:  { label: 'Pendiente',  color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  APROBADO:   { label: 'Aprobado',   color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  RECHAZADO:  { label: 'Rechazado',  color: 'text-red-400',    bg: 'bg-red-900/30' },
};

const CATEGORIA_MAP = {
  ANIMAL:  { label: 'Animal',  icon: '🐄' },
  TERRENO: { label: 'Terreno', icon: '🌱' },
  FINCA:   { label: 'Finca',   icon: '🏡' },
  INSUMO:  { label: 'Insumo',  icon: '🧪' },
  OTRO:    { label: 'Otro',    icon: '📦' },
};

const MercadoPage = () => {
  const queryClient = useQueryClient();
  const [filtroEstado, setFiltroEstado] = useState('PENDIENTE');
  const [modalRechazar, setModalRechazar] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [verFotos, setVerFotos] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['publicaciones-admin', filtroEstado],
    queryFn: () =>
      api.get(`/publicaciones/admin/todas?estado=${filtroEstado}&limit=50`).then((r) => r.data),
  });
  const publicaciones = data?.data ?? [];

  const aprobarMutation = useMutation({
    mutationFn: (id) => api.patch(`/publicaciones/${id}/aprobar`),
    onSuccess: () => queryClient.invalidateQueries(['publicaciones-admin']),
  });

  const rechazarMutation = useMutation({
    mutationFn: ({ id, motivo }) => api.patch(`/publicaciones/${id}/rechazar`, { motivo }),
    onSuccess: () => {
      queryClient.invalidateQueries(['publicaciones-admin']);
      setModalRechazar(null);
      setMotivo('');
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id) => api.delete(`/publicaciones/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['publicaciones-admin']),
  });

  const handleRechazar = () => {
    if (!motivo.trim()) return;
    rechazarMutation.mutate({ id: modalRechazar._id, motivo });
  };

  const pendientes = publicaciones.filter((p) => p.estado === 'PENDIENTE').length;

  return (
    <div className="p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Mercado Ganadero</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Modera las publicaciones de compraventa de los asociados
          </p>
        </div>
        {pendientes > 0 && (
          <span className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full">
            {pendientes} pendiente{pendientes > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tabs de estado */}
      <div className="flex gap-2">
        {ESTADOS.map((e) => (
          <button
            key={e}
            onClick={() => setFiltroEstado(e)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filtroEstado === e
                ? 'btn-cta shadow-lg active:scale-95'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {ESTADO_MAP[e].label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : publicaciones.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          No hay publicaciones {ESTADO_MAP[filtroEstado].label.toLowerCase()}s
        </div>
      ) : (
        <div className="space-y-3">
          {publicaciones.map((pub) => (
            <div
              key={pub._id}
              className="bg-surface-container rounded-xl p-4 flex gap-4 items-start"
            >
              {/* Foto principal */}
              <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-surface-container-high">
                {pub.fotos?.length > 0 ? (
                  <img
                    src={pub.fotos[0]}
                    alt={pub.titulo}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setVerFotos(pub)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {CATEGORIA_MAP[pub.categoria]?.icon ?? '📦'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-on-surface-variant">
                    {CATEGORIA_MAP[pub.categoria]?.icon} {CATEGORIA_MAP[pub.categoria]?.label}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_MAP[pub.estado].bg} ${ESTADO_MAP[pub.estado].color}`}>
                    {ESTADO_MAP[pub.estado].label}
                  </span>
                  {pub.fotos?.length > 1 && (
                    <span className="text-xs text-on-surface-variant">
                      {pub.fotos.length} fotos
                    </span>
                  )}
                </div>
                <p className="font-semibold text-on-surface mt-1 truncate">{pub.titulo}</p>
                <p className="text-sm text-on-surface-variant line-clamp-2 mt-0.5">{pub.descripcion}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant">
                  <span>👤 {pub.asociadoId?.nombre ?? '—'}</span>
                  {pub.precio && <span>💰 ${pub.precio.toLocaleString('es-CO')}</span>}
                  <span>📍 {pub.municipio}</span>
                  <span>{new Date(pub.createdAt).toLocaleDateString('es-CO')}</span>
                </div>
                {pub.motivoRechazo && (
                  <p className="text-xs text-red-400 mt-1">Motivo: {pub.motivoRechazo}</p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex-shrink-0 flex flex-col gap-2">
                {pub.estado === 'PENDIENTE' && (
                  <>
                    <button
                      onClick={() => aprobarMutation.mutate(pub._id)}
                      disabled={aprobarMutation.isPending}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => { setModalRechazar(pub); setMotivo(''); }}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                <button
                  onClick={() => { if (confirm('¿Eliminar esta publicación?')) eliminarMutation.mutate(pub._id); }}
                  className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-xs font-semibold rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal rechazar */}
      {modalRechazar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-on-surface">Rechazar publicación</h2>
            <p className="text-sm text-on-surface-variant">
              <strong>{modalRechazar.titulo}</strong> — el asociado verá este motivo.
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: La publicación no corresponde a productos agropecuarios..."
              rows={3}
              className="w-full bg-surface-container-high text-on-surface rounded-xl p-3 text-sm resize-none outline-none border border-outline-variant focus:border-primary"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setModalRechazar(null)}
                className="flex-1 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={!motivo.trim() || rechazarMutation.isPending}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {rechazarMutation.isPending ? 'Rechazando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ver fotos */}
      {verFotos && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setVerFotos(null)}
        >
          <div className="flex gap-3 flex-wrap justify-center max-w-3xl">
            {verFotos.fotos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`foto ${i + 1}`}
                className="w-60 h-60 object-cover rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MercadoPage;
