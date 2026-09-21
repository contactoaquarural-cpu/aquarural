import { useState } from 'react';
import api from '../../services/api.service';

// Sección aparte (no dentro de Configuración) porque las llaves Wompi son
// credenciales de dinero: se tocan casi nunca (alta inicial o rotación de
// seguridad), no en el flujo diario de editar tarifas/contacto. El gate de
// contraseña evita que se editen "sin querer" al pasar por un formulario
// largo compartido con datos operativos.
const PagosWompiPage = () => {
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [password, setPassword] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState('');

  const [form, setForm] = useState({
    wompiPublicKey: '',
    wompiPrivateKey: '',
    wompiEventsSecret: '',
    wompiIntegritySecret: '',
    wompiSandbox: true,
  });
  const [cargandoLlaves, setCargandoLlaves] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargarLlavesActuales = async () => {
    setCargandoLlaves(true);
    try {
      const { data } = await api.get('/configuracion');
      if (data?.success && data.data) {
        setForm((prev) => ({
          ...prev,
          wompiPublicKey: data.data.wompiPublicKey || '',
          wompiSandbox: data.data.wompiSandbox !== undefined ? data.data.wompiSandbox : true,
        }));
      }
    } catch (e) {
      // La sección ya está desbloqueada; si esto falla el admin simplemente
      // ve los campos en blanco y puede volver a cargar las llaves.
    } finally {
      setCargandoLlaves(false);
    }
  };

  const handleVerificarPassword = async (e) => {
    e.preventDefault();
    setErrorAcceso('');
    setVerificando(true);
    try {
      await api.post('/auth/verificar-password', { password });
      setDesbloqueado(true);
      setPassword('');
      await cargarLlavesActuales();
    } catch (err) {
      setErrorAcceso(err.response?.data?.message || 'Contraseña incorrecta.');
    } finally {
      setVerificando(false);
    }
  };

  const handleGuardarLlaves = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    const payload = { wompiSandbox: Boolean(form.wompiSandbox) };
    // Las llaves sensibles solo se envían si el admin escribió algo nuevo —
    // dejarlas en blanco conserva la llave ya guardada (no se sobreescribe con '').
    if (form.wompiPublicKey) payload.wompiPublicKey = form.wompiPublicKey;
    if (form.wompiPrivateKey) payload.wompiPrivateKey = form.wompiPrivateKey;
    if (form.wompiEventsSecret) payload.wompiEventsSecret = form.wompiEventsSecret;
    if (form.wompiIntegritySecret) payload.wompiIntegritySecret = form.wompiIntegritySecret;

    try {
      const { data } = await api.patch('/configuracion', payload);
      if (data?.success) {
        setMensaje({ tipo: 'ok', texto: 'Llaves Wompi actualizadas exitosamente.' });
        setForm((prev) => ({ ...prev, wompiPrivateKey: '', wompiEventsSecret: '', wompiIntegritySecret: '' }));
      } else {
        setMensaje({ tipo: 'error', texto: data?.message || 'No se pudo guardar.' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.message || 'Error al guardar las llaves.' });
    } finally {
      setGuardando(false);
    }
  };

  if (!desbloqueado) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-md mx-auto font-body">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <span className="material-symbols-outlined text-[#1D4ED8] text-4xl">lock</span>
            <h1 className="text-xl font-extrabold text-slate-800 font-headline tracking-tight">
              Pasarela de Pagos Wompi
            </h1>
            <p className="text-slate-500 text-xs font-body">
              Sección protegida. Confirma tu contraseña para ver o editar las llaves Wompi de tu acueducto.
            </p>
          </div>

          {errorAcceso && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-xs font-headline font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorAcceso}</span>
            </div>
          )}

          <form onSubmit={handleVerificarPassword} className="space-y-4">
            <div>
              <label className="text-slate-700 font-bold mb-1.5 block font-headline text-xs">Tu contraseña</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>
            <button
              type="submit"
              disabled={verificando}
              style={{ color: '#ffffff' }}
              className="w-full bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline py-3 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-60 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                {verificando ? 'progress_activity' : 'key'}
              </span>
              <span>{verificando ? 'Verificando...' : 'Desbloquear'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6 font-body">
      <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">vpn_key</span>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 font-headline tracking-tight">
            Pasarela de Pagos Wompi
          </h1>
          <p className="text-slate-500 text-xs font-body">
            Tus propias llaves Wompi para recaudar los pagos de agua de tus suscriptores.
          </p>
        </div>
      </div>

      <form onSubmit={handleGuardarLlaves} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
        <p className="text-xs font-bold text-[#1D4ED8] font-headline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">enhanced_encryption</span>
          Cifrado AES-256-GCM {cargandoLlaves && <span className="text-slate-400 font-normal">— cargando...</span>}
        </p>

        <div>
          <label className="text-slate-700 font-bold mb-1.5 block font-headline">Llave Pública Wompi (Public Key)</label>
          <input
            type="text"
            autoComplete="off"
            value={form.wompiPublicKey}
            onChange={(e) => setForm({ ...form, wompiPublicKey: e.target.value })}
            placeholder="pub_test_XXXXXX"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-[#1D4ED8] font-mono focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div>
          <label className="text-slate-700 font-bold mb-1.5 block font-headline">Llave Privada Wompi (dejar en blanco para mantener la actual)</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.wompiPrivateKey}
            onChange={(e) => setForm({ ...form, wompiPrivateKey: e.target.value })}
            placeholder="prv_test_XXXXXX"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-[#1D4ED8] font-mono focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div>
          <label className="text-slate-700 font-bold mb-1.5 block font-headline">Secreto de Eventos (dejar en blanco para mantener el actual)</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.wompiEventsSecret}
            onChange={(e) => setForm({ ...form, wompiEventsSecret: e.target.value })}
            placeholder="test_events_XXXXXX"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-[#1D4ED8] font-mono focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div>
          <label className="text-slate-700 font-bold mb-1.5 block font-headline">Secreto de Integridad (dejar en blanco para mantener el actual)</label>
          <input
            type="password"
            autoComplete="new-password"
            value={form.wompiIntegritySecret}
            onChange={(e) => setForm({ ...form, wompiIntegritySecret: e.target.value })}
            placeholder="test_integrity_XXXXXX"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-[#1D4ED8] font-mono focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={form.wompiSandbox}
            onChange={(e) => setForm({ ...form, wompiSandbox: e.target.checked })}
            className="w-4 h-4 rounded accent-[#1D4ED8]"
          />
          <span className="text-slate-700 text-xs font-headline font-bold">Modo Sandbox (pruebas, sin cobros reales)</span>
        </label>

        {mensaje && (
          <div className={`p-4 rounded-2xl text-xs font-headline font-bold flex items-center gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span className="material-symbols-outlined text-lg">
              {mensaje.tipo === 'ok' ? 'check_circle' : 'error'}
            </span>
            <span>{mensaje.texto}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={guardando}
            style={{ color: '#ffffff' }}
            className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            <span>{guardando ? 'Guardando...' : 'Guardar Llaves Wompi'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PagosWompiPage;
