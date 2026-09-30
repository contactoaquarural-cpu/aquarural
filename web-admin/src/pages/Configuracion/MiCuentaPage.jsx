import { useState, useEffect } from 'react';
import api from '../../services/api.service';

// Mismo catálogo de planes que SuperAdmin/AcueductosPage.jsx y
// Licencia/LicenciaSoftwarePage.jsx (mapa propio, no compartido por import) —
// badge como texto plano sin emoji + campo icon con el Material Symbol real.
const PLAN_BADGES = {
  MANANTIAL: { texto: 'PLAN MANANTIAL', icon: 'water_drop' },
  CAUDAL: { texto: 'PLAN CAUDAL', icon: 'water' },
  CUENCA: { texto: 'PLAN CUENCA', icon: 'water_ec' },
  ACUIFERO: { texto: 'PLAN ACUÍFERO', icon: 'bolt' },
};

// Agrupa lo que pertenece a la cuenta/perfil del admin y a los datos
// institucionales de solo lectura del acueducto — separado de
// ConfiguracionPage.jsx, que quedó enfocada solo en tarifas y modalidad de
// cobro. Antes vivían todos juntos en una sola página larga; el usuario pidió
// separarlos porque son cosas de naturaleza distinta (operación del negocio
// vs. identidad institucional vs. cuenta personal del usuario logueado).
const MiCuentaPage = () => {
  const [datosAcueducto, setDatosAcueducto] = useState({
    nombre: '',
    nit: '',
    departamento: '',
    municipio: '',
    vereda: '',
    representanteLegal: '',
    planSaaS: 'MANANTIAL',
    frecuenciaPagoSaaS: 'ANUAL',
    costoSaaSVigente: 0,
  });

  const [contactoForm, setContactoForm] = useState({ telefono: '', email: '' });
  const [guardandoContacto, setGuardandoContacto] = useState(false);
  const [mensajeContacto, setMensajeContacto] = useState(null);

  const [passwordForm, setPasswordForm] = useState({ passwordActual: '', passwordNuevo: '', passwordConfirmar: '' });
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [mensajePassword, setMensajePassword] = useState(null);
  const [errorPassword, setErrorPassword] = useState('');

  useEffect(() => {
    const cargarConfigApi = async () => {
      try {
        const { data } = await api.get('/configuracion');
        if (data?.success && data.data) {
          const apiData = data.data;
          setDatosAcueducto({
            nombre: apiData.nombre || '',
            nit: apiData.nit || '',
            departamento: apiData.departamento || '',
            municipio: apiData.municipio || '',
            vereda: apiData.vereda || '',
            representanteLegal: apiData.representanteLegal || '',
            planSaaS: apiData.planSaaS || 'MANANTIAL',
            frecuenciaPagoSaaS: apiData.frecuenciaPagoSaaS || 'ANUAL',
            costoSaaSVigente: apiData.costoSaaSVigente || 0,
          });
          setContactoForm({ telefono: apiData.telefono || '', email: apiData.email || '' });
        }
      } catch (e) {
        setMensajeContacto({ tipo: 'error', texto: 'No se pudo cargar la información de la cuenta.' });
      }
    };
    cargarConfigApi();
  }, []);

  const handleGuardarContacto = async (e) => {
    e.preventDefault();
    setMensajeContacto(null);

    if (!contactoForm.telefono.trim() || !contactoForm.email.trim()) {
      setMensajeContacto({ tipo: 'error', texto: 'Completa el teléfono y el correo de contacto.' });
      return;
    }

    setGuardandoContacto(true);
    try {
      const { data } = await api.patch('/configuracion', contactoForm);
      if (data?.success) {
        setMensajeContacto({ tipo: 'ok', texto: 'Información de contacto actualizada exitosamente.' });
      } else {
        setMensajeContacto({ tipo: 'error', texto: data?.message || 'No se pudo guardar el contacto.' });
      }
    } catch (err) {
      setMensajeContacto({ tipo: 'error', texto: err.response?.data?.message || 'Error al guardar el contacto.' });
    } finally {
      setGuardandoContacto(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setErrorPassword('');
    setMensajePassword(null);

    if (!passwordForm.passwordActual || !passwordForm.passwordNuevo || !passwordForm.passwordConfirmar) {
      setErrorPassword('Completa los 3 campos para cambiar tu contraseña.');
      return;
    }
    if (passwordForm.passwordNuevo !== passwordForm.passwordConfirmar) {
      setErrorPassword('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    if (passwordForm.passwordNuevo.length < 6) {
      setErrorPassword('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCambiandoPassword(true);
    try {
      await api.put('/auth/cambiar-password', {
        passwordActual: passwordForm.passwordActual,
        passwordNuevo: passwordForm.passwordNuevo,
      });
      setMensajePassword('¡Contraseña actualizada correctamente!');
      setPasswordForm({ passwordActual: '', passwordNuevo: '', passwordConfirmar: '' });
    } catch (err) {
      setErrorPassword(err.response?.data?.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setCambiandoPassword(false);
    }
  };

  const planActivo = PLAN_BADGES[datosAcueducto.planSaaS] || PLAN_BADGES.MANANTIAL;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-body">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">account_circle</span>
          <h1 className="text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
            Mi Cuenta
          </h1>
        </div>
        <p className="text-slate-500 text-xs font-body">
          Información institucional del acueducto, datos de contacto y tu contraseña de acceso.
        </p>
      </div>

      {/* INFORMACIÓN INSTITUCIONAL (SOLO LECTURA) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#1D4ED8]">shield_lock</span>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 font-headline flex items-center gap-2">
                <span>Información Institucional de la Junta de Agua</span>
                <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-headline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[10px]">lock</span>
                  <span>Protegida</span>
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Datos de registro legal configurados en el alta del acueducto por el SuperAdmin SaaS.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-700">
          <span className="material-symbols-outlined text-[#1D4ED8] text-xl shrink-0">info</span>
          <p className="leading-relaxed">
            La razón social, NIT, departamento, municipio y representante legal del acueducto provienen del alta del SuperAdmin SaaS y no pueden ser alterados desde el panel local.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-500 font-bold mb-1.5 font-headline flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-slate-400">lock</span>
              <span>Nombre del Acueducto Veredal</span>
            </label>
            <input
              type="text"
              readOnly
              value={datosAcueducto.nombre}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-600 font-headline font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold mb-1.5 font-headline flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-slate-400">lock</span>
              <span>NIT / Registro RUT</span>
            </label>
            <input
              type="text"
              readOnly
              value={datosAcueducto.nit}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-600 font-mono font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold mb-1.5 font-headline flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-slate-400">lock</span>
              <span>Departamento</span>
            </label>
            <input
              type="text"
              readOnly
              value={datosAcueducto.departamento}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-600 font-headline cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold mb-1.5 font-headline flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-slate-400">lock</span>
              <span>Municipio</span>
            </label>
            <input
              type="text"
              readOnly
              value={datosAcueducto.municipio}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-600 font-headline cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold mb-1.5 font-headline flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-slate-400">lock</span>
              <span>Vereda / Sede Principal</span>
            </label>
            <input
              type="text"
              readOnly
              value={datosAcueducto.vereda}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-600 font-headline cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-slate-500 font-bold mb-1.5 font-headline flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-slate-400">lock</span>
              <span>Representante Legal / Presidente</span>
            </label>
            <input
              type="text"
              readOnly
              value={datosAcueducto.representanteLegal || 'Sin definir'}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-600 font-headline cursor-not-allowed"
            />
          </div>

          {/* Plan SaaS Contratado */}
          <div className="md:col-span-2 pt-2 border-t border-slate-200">
            <label className="text-[#1D4ED8] font-bold mb-2 font-headline flex items-center gap-1 text-xs">
              <span className="material-symbols-outlined text-sm">water_drop</span>
              <span>Plan SaaS Comercial Activo</span>
            </label>
            <div className="bg-slate-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="bg-blue-50 border border-blue-200 text-[#1D4ED8] font-extrabold text-xs px-3 py-1.5 rounded-full font-headline inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">{planActivo.icon}</span>
                  {planActivo.texto}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800 font-headline">
                    Licencia SaaS AquaRural Cloud
                  </p>
                  <p className="text-[11px] text-slate-500 font-body">
                    Facturación {datosAcueducto.frecuenciaPagoSaaS === 'MENSUAL' ? 'Mensual' : 'Anual'} • ${datosAcueducto.costoSaaSVigente.toLocaleString()} COP
                  </p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-3 py-1 rounded-full font-headline inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">check_circle</span>
                Licencia Activa
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DE CONTACTO (EDITABLE) */}
      <form onSubmit={handleGuardarContacto} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 font-headline border-b border-slate-200 pb-3">Información de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 font-bold mb-1.5 block font-headline">Teléfono WhatsApp de Atención</label>
            <input
              type="text"
              value={contactoForm.telefono}
              onChange={(e) => setContactoForm({ ...contactoForm, telefono: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>

          <div>
            <label className="text-slate-700 font-bold mb-1.5 block font-headline">Correo Electrónico para Alertas</label>
            <input
              type="email"
              value={contactoForm.email}
              onChange={(e) => setContactoForm({ ...contactoForm, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-[#1D4ED8]"
            />
          </div>
        </div>

        {mensajeContacto && (
          <div className={`p-3 rounded-2xl text-xs font-headline font-bold flex items-center gap-2 ${
            mensajeContacto.tipo === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <span className="material-symbols-outlined text-base">
              {mensajeContacto.tipo === 'ok' ? 'check_circle' : 'error'}
            </span>
            <span>{mensajeContacto.texto}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardandoContacto}
            style={{ color: '#ffffff' }}
            className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline px-6 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-xs"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>{guardandoContacto ? 'Guardando...' : 'Guardar Contacto'}</span>
          </button>
        </div>
      </form>

      {/* CAMBIAR MI CONTRASEÑA */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
          <span className="material-symbols-outlined text-[#1D4ED8]">lock_reset</span>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 font-headline">Cambiar Mi Contraseña</h2>
            <p className="text-xs text-slate-500">
              Actualiza la contraseña de acceso a tu propia cuenta.
            </p>
          </div>
        </div>

        {errorPassword && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-headline font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorPassword}</span>
          </div>
        )}
        {mensajePassword && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-2xl text-xs font-headline font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{mensajePassword}</span>
          </div>
        )}

        <form onSubmit={handleCambiarPassword} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Contraseña actual"
            value={passwordForm.passwordActual}
            onChange={(e) => setPasswordForm({ ...passwordForm, passwordActual: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Nueva contraseña (mín. 6)"
            value={passwordForm.passwordNuevo}
            onChange={(e) => setPasswordForm({ ...passwordForm, passwordNuevo: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Confirmar nueva contraseña"
            value={passwordForm.passwordConfirmar}
            onChange={(e) => setPasswordForm({ ...passwordForm, passwordConfirmar: e.target.value })}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
          />
          <button
            type="submit"
            disabled={cambiandoPassword}
            style={{ color: '#ffffff' }}
            className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {cambiandoPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MiCuentaPage;
