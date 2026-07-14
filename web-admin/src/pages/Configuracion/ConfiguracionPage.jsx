import { useState, useEffect } from 'react';
import api from '../../services/api.service';

const ConfiguracionPage = () => {
  const [config, setConfig]     = useState(null);
  const [form, setForm]         = useState({ montoAporte: '', nombreAsociacion: '', municipio: '', telefonoContacto: '' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [mensaje, setMensaje]   = useState(null);

  useEffect(() => {
    api.get('/configuracion').then((r) => {
      const d = r.data.data;
      setConfig(d);
      setForm({
        montoAporte:      d.montoAporte,
        nombreAsociacion: d.nombreAsociacion,
        municipio:        d.municipio,
        telefonoContacto: d.telefonoContacto || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensaje(null);
    try {
      const r = await api.patch('/configuracion', {
        montoAporte:      Number(form.montoAporte),
        nombreAsociacion: form.nombreAsociacion,
        municipio:        form.municipio,
        telefonoContacto: form.telefonoContacto,
      });
      setConfig(r.data.data);
      setMensaje({ tipo: 'ok', texto: 'Configuración guardada correctamente' });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-2xl space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">⚙️ Configuración</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Ajusta los parámetros generales de la plataforma.
        </p>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        {/* Monto de aporte */}
        <div className="bg-surface-container rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-on-surface">Aporte mensual</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Valor que se cobra a cada asociado por mes. Aplica a los aportes creados a partir del próximo mes.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Monto (COP)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">$</span>
              <input
                type="number"
                min="1000"
                step="1000"
                value={form.montoAporte}
                onChange={(e) => setForm((f) => ({ ...f, montoAporte: e.target.value }))}
                className="w-full bg-surface-container-high rounded-xl pl-8 pr-4 py-3 text-on-surface outline-none border border-outline-variant focus:border-primary text-lg font-semibold"
                required
              />
            </div>
            {config && Number(form.montoAporte) !== config.montoAporte && (
              <p className="text-xs text-yellow-400 mt-1">
                El monto actual es ${config.montoAporte.toLocaleString('es-CO')} COP. Este cambio aplica desde el próximo mes.
              </p>
            )}
          </div>
        </div>

        {/* Datos de la asociación */}
        <div className="bg-surface-container rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-on-surface">Datos de la asociación</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Aparecen en el carné digital y comunicaciones.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Nombre de la asociación
            </label>
            <input
              type="text"
              value={form.nombreAsociacion}
              onChange={(e) => setForm((f) => ({ ...f, nombreAsociacion: e.target.value }))}
              className="mt-1 w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface outline-none border border-outline-variant focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Municipio
            </label>
            <input
              type="text"
              value={form.municipio}
              onChange={(e) => setForm((f) => ({ ...f, municipio: e.target.value }))}
              className="mt-1 w-full bg-surface-container-high rounded-xl px-4 py-3 text-on-surface outline-none border border-outline-variant focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Teléfono de contacto
            </label>
            <p className="text-xs text-on-surface-variant mt-0.5 mb-1">
              Los asociados podrán llamar o escribir por WhatsApp desde la app.
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                <span className="material-symbols-outlined text-base">phone</span>
              </span>
              <input
                type="tel"
                value={form.telefonoContacto}
                onChange={(e) => setForm((f) => ({ ...f, telefonoContacto: e.target.value }))}
                placeholder="3166160377"
                className="mt-1 w-full bg-surface-container-high rounded-xl pl-10 pr-4 py-3 text-on-surface outline-none border border-outline-variant focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-900/30 text-emerald-400'
              : 'bg-red-900/30 text-red-400'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Botón guardar */}
        <button
          type="submit"
          disabled={saving}
          className="btn-cta font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 active:scale-95 transition-all font-headline disabled:opacity-50"
        >
          <span className="material-symbols-outlined">save</span>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
};

export default ConfiguracionPage;
