import { useState, useEffect, useRef } from 'react';
import api from '../../services/api.service';
import Toast from '../../components/Toast';

const CAMPOS = [
  {
    key: 'heroImagenUrl',
    titulo: 'Foto del Hero — Landing',
    descripcion: 'Imagen de fondo a pantalla completa en la página principal (aquarural.co).',
    icono: 'photo_camera',
  },
  {
    key: 'loginImagenUrl',
    titulo: 'Foto del Login — Panel Admin',
    descripcion: 'Imagen del panel derecho en la pantalla de inicio de sesión del panel administrativo.',
    icono: 'lock',
  },
];

const AparienciaPage = () => {
  const [config, setConfig] = useState({ heroImagenUrl: '', loginImagenUrl: '' });
  const [urlsForm, setUrlsForm] = useState({ heroImagenUrl: '', loginImagenUrl: '' });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState('');
  const [subiendo, setSubiendo] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');

  const fileInputRefs = {
    heroImagenUrl: useRef(null),
    loginImagenUrl: useRef(null),
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/superadmin/configuracion-global');
      const c = data?.data || {};
      setConfig(c);
      setUrlsForm({ heroImagenUrl: c.heroImagenUrl || '', loginImagenUrl: c.loginImagenUrl || '' });
    } catch (err) {
      setError('No se pudo cargar la configuración de apariencia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleGuardarUrl = async (campo) => {
    setGuardando(campo);
    setError('');
    setMensajeExito('');
    try {
      const { data } = await api.patch('/superadmin/configuracion-global', {
        [campo]: urlsForm[campo],
      });
      setConfig(data.data);
      setMensajeExito('¡Imagen actualizada correctamente!');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la URL de la imagen.');
    } finally {
      setGuardando('');
    }
  };

  const handleSubirArchivo = async (campo, file) => {
    if (!file) return;
    setSubiendo(campo);
    setError('');
    setMensajeExito('');
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      formData.append('campo', campo);
      const { data } = await api.post('/superadmin/configuracion-global/imagen', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setConfig(data.data);
      setUrlsForm((prev) => ({ ...prev, [campo]: data.data[campo] }));
      setMensajeExito('¡Imagen subida y actualizada correctamente!');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo subir la imagen.');
    } finally {
      setSubiendo('');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="space-y-6 max-w-5xl mx-auto font-body">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 font-headline tracking-tight">
          Apariencia de la Plataforma
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Gestiona las imágenes de marca compartidas por la landing pública y el panel administrativo.
        </p>
      </div>

      <Toast mensaje={mensajeExito} tipo="exito" onClose={() => setMensajeExito('')} />
      <Toast mensaje={error} tipo="error" onClose={() => setError('')} />

      {loading ? (
        <div className="py-12 text-center text-gray-400 space-y-3">
          <span className="material-symbols-outlined text-3xl animate-spin text-[#1D4ED8]">sync</span>
          <p className="text-xs font-headline">Cargando configuración...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {CAMPOS.map((campo) => (
            <div
              key={campo.key}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#1D4ED8] text-xl">{campo.icono}</span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 font-headline">{campo.titulo}</h3>
                  <p className="text-xs text-gray-400">{campo.descripcion}</p>
                </div>
              </div>

              {/* Vista previa */}
              <div className="w-full h-48 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
                {config[campo.key] ? (
                  <img
                    src={config[campo.key]}
                    alt={campo.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-xs text-gray-400 font-headline">Sin imagen configurada — usando la imagen por defecto del código</p>
                )}
              </div>

              {/* Subir archivo */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block font-headline">
                  Subir un archivo (JPG, PNG o WEBP, máx. 5MB)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRefs[campo.key]}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleSubirArchivo(campo.key, e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs[campo.key].current?.click()}
                    disabled={subiendo === campo.key}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold font-headline px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-base">
                      {subiendo === campo.key ? 'progress_activity' : 'upload'}
                    </span>
                    <span>{subiendo === campo.key ? 'Subiendo...' : 'Elegir archivo'}</span>
                  </button>
                </div>
              </div>

              {/* Pegar URL */}
              <div>
                <label className="text-xs font-bold text-gray-600 mb-1.5 block font-headline">
                  O pega la URL de una imagen ya publicada
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={urlsForm[campo.key]}
                    onChange={(e) => setUrlsForm({ ...urlsForm, [campo.key]: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1D4ED8] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleGuardarUrl(campo.key)}
                    disabled={guardando === campo.key || !urlsForm[campo.key]}
                    style={{ color: '#ffffff' }}
                    className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-bold font-headline text-xs px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 shrink-0"
                  >
                    <span className="material-symbols-outlined text-base">
                      {guardando === campo.key ? 'progress_activity' : 'save'}
                    </span>
                    <span>{guardando === campo.key ? 'Guardando...' : 'Guardar URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default AparienciaPage;
