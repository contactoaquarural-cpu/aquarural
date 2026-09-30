import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';
import { PLANES_SAAS_MAP } from './AcueductosPage';
import Dropdown from '../../components/Dropdown';

const NuevoAcueductoPage = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Estados de API Colombia (https://api-colombia.com/)
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [departamentoSeleccionadoId, setDepartamentoSeleccionadoId] = useState(null);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  // Mismo cálculo que hace el backend al crear un acueducto: hoy + DIAS_PRUEBA_GRATIS
  // (30 días, ver backend/.env). Es solo informativo — el backend es quien decide.
  const fechaVencimientoPruebaDate = new Date();
  fechaVencimientoPruebaDate.setDate(fechaVencimientoPruebaDate.getDate() + 30);
  const fechaVencimientoPrueba = fechaVencimientoPruebaDate.toISOString().split('T')[0];

  const [form, setForm] = useState({
    nombre: '',
    nit: '',
    departamento: 'Huila',
    municipio: 'Garzón',
    vereda: '',
    direccion: '',
    telefono: '',
    email: '',
    representanteLegal: '',
    // planSaaS/costoMensualSaaS son solo para la vista de tarjetas (UI); el backend
    // siempre calcula planSaaS=MANANTIAL y costoSaaSVigente para un acueducto nuevo,
    // así que NUNCA se envían al crear.
    planSaaS: 'CAUDAL',
    frecuenciaPagoSaaS: 'ANUAL',
    costoMensualSaaS: 1000000,
    fechaInicioLicencia: todayStr,
    fechaVencimientoGratis: fechaVencimientoPrueba,
    adminCorreo: '',
    adminNombres: '',
    adminPassword: 'Admin2026*',
  });

  useEffect(() => {
    const fetchDepartamentosAPI = async () => {
      setCargandoUbicaciones(true);
      try {
        const res = await fetch('https://api-colombia.com/api/v1/Department');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
          setDepartamentos(sorted);
          const huila = sorted.find((d) => d.name.toLowerCase().includes('huila')) || sorted[0];
          if (huila) {
            setDepartamentoSeleccionadoId(huila.id);
            fetchMunicipiosAPI(huila.id);
          }
        }
      } catch (err) {
        console.error('Error al conectar con API Colombia', err);
        setDepartamentos([
          { id: 16, name: 'Huila' },
          { id: 11, name: 'Cundinamarca' },
          { id: 2, name: 'Antioquia' },
          { id: 26, name: 'Valle del Cauca' },
          { id: 22, name: 'Santander' },
        ]);
        setMunicipios([
          { id: 1, name: 'Garzón' },
          { id: 2, name: 'Gigante' },
          { id: 3, name: 'El Agrado' },
          { id: 4, name: 'Pitalito' },
          { id: 5, name: 'Neiva' },
        ]);
      } finally {
        setCargandoUbicaciones(false);
      }
    };
    fetchDepartamentosAPI();
  }, []);

  const fetchMunicipiosAPI = async (deptId) => {
    if (!deptId) return;
    setCargandoUbicaciones(true);
    try {
      const res = await fetch(`https://api-colombia.com/api/v1/Department/${deptId}/cities`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setMunicipios(sorted);
        if (sorted.length > 0) {
          setForm((prev) => ({ ...prev, municipio: sorted[0].name }));
        }
      }
    } catch (err) {
      console.error('Error cargando municipios desde API Colombia', err);
    } finally {
      setCargandoUbicaciones(false);
    }
  };

  const handleCambiarDepartamento = (deptId) => {
    const deptObj = departamentos.find((d) => d.id === deptId);
    setDepartamentoSeleccionadoId(deptId);
    setForm((prev) => ({ ...prev, departamento: deptObj ? deptObj.name : 'Huila' }));
    fetchMunicipiosAPI(deptId);
  };

  const triggerError = (msg) => {
    setError(msg);
    setSubmitting(false);
    formRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!form.nombre || !form.nombre.trim()) return triggerError('El Nombre del Acueducto Veredal es obligatorio.');
    if (!form.nit || !form.nit.trim()) return triggerError('El NIT es obligatorio.');
    if (!form.vereda || !form.vereda.trim()) return triggerError('La Vereda Principal es obligatoria.');
    if (!form.telefono || !form.telefono.trim()) return triggerError('El Teléfono Celular / WhatsApp es obligatorio.');
    if (!form.adminNombres || !form.adminNombres.trim()) return triggerError('El Nombre del Tesorero / Admin es obligatorio.');
    if (!form.adminCorreo || !form.adminCorreo.trim()) return triggerError('El Correo Personal del Administrador es obligatorio.');
    if (!form.adminPassword || !form.adminPassword.trim()) return triggerError('La Contraseña Inicial de Acceso es obligatoria.');

    const representanteLegal = form.adminNombres.trim();
    const email = form.adminCorreo.trim();
    const direccion = `Vereda ${form.vereda.trim()}, ${form.municipio}, ${form.departamento}`;

    // Payload alineado al contrato real del backend: no se envían planSaaS/costoMensualSaaS
    // (el backend siempre calcula plan=MANANTIAL para un acueducto nuevo) ni adminCedula
    // (el backend no tiene ese campo). adminNombres (plural, UI) -> adminNombre (singular, backend).
    const payload = {
      nombre: form.nombre.trim(),
      nit: form.nit.trim(),
      departamento: form.departamento,
      municipio: form.municipio,
      vereda: form.vereda.trim(),
      direccion,
      telefono: form.telefono.trim(),
      email,
      representanteLegal,
      frecuenciaPagoSaaS: form.frecuenciaPagoSaaS || 'ANUAL',
      adminNombre: representanteLegal,
      adminCorreo: email,
      adminPassword: form.adminPassword,
    };

    try {
      const res = await api.post('/superadmin/acueductos', payload);
      const data = res?.data;
      if (data && data.success && data.data?.acueducto) {
        navigate('/superadmin/acueductos', {
          state: { mensajeExito: `¡Acueducto "${form.nombre}" registrado exitosamente!` },
        });
      } else {
        setError(data?.message || 'No se pudo guardar el acueducto.');
      }
    } catch (err) {
      console.error('Error enviando acueducto a backend:', err);
      setError(err.response?.data?.message || 'Error de conexión al servidor backend MongoDB.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#f8f9fa' }}>
      <div ref={formRef} className="space-y-6 max-w-6xl mx-auto font-body">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/superadmin/acueductos')}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-xl transition-colors"
            title="Volver a Acueductos"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-headline tracking-tight">
              Registrar Nuevo Acueducto Veredal
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Datos de la organización, credenciales de acceso y plan SaaS.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3 font-headline font-bold text-xs">
            <span className="material-symbols-outlined text-xl text-red-500 shrink-0">error</span>
            <p className="flex-1 font-normal text-red-600">{error}</p>
            <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} autoComplete="off" className="space-y-5 text-xs font-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Nombre del Acueducto Veredal</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej. Acueducto La Argentina"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:border-[#1D4ED8] font-headline"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">NIT</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.nit}
                  onChange={(e) => setForm({ ...form, nit: e.target.value })}
                  placeholder="ej. 891100999-1"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Vereda Principal</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.vereda}
                  onChange={(e) => setForm({ ...form, vereda: e.target.value })}
                  placeholder="ej. La Argentina"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Departamento</label>
                <Dropdown
                  value={departamentoSeleccionadoId || ''}
                  onChange={handleCambiarDepartamento}
                  options={departamentos.map((d) => ({ value: d.id, label: d.name }))}
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline flex items-center justify-between">
                  <span>Municipio</span>
                  {cargandoUbicaciones && <span className="text-[10px] text-[#1D4ED8] animate-pulse">Cargando...</span>}
                </label>
                <Dropdown
                  value={form.municipio}
                  onChange={(municipio) => setForm({ ...form, municipio })}
                  disabled={cargandoUbicaciones}
                  options={municipios.map((m) => ({ value: m.name, label: m.name }))}
                />
              </div>
            </div>
          </div>

          {/* Credenciales de acceso */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <p className="text-xs font-bold text-[#1D4ED8] font-headline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Credenciales de Acceso del Administrador / Tesorero Local</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Nombre del Tesorero / Admin</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.adminNombres}
                  onChange={(e) => setForm({ ...form, adminNombres: e.target.value })}
                  placeholder="ej. Carlos Alberto Trujillo"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Teléfono Celular / WhatsApp</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  placeholder="ej. 3166160377"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Correo Personal (Recuperar Clave)</label>
                <input
                  type="email"
                  autoComplete="off"
                  value={form.adminCorreo}
                  onChange={(e) => setForm({ ...form, adminCorreo: e.target.value })}
                  placeholder="ej. tesorero@laargentina.org.co"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Contraseña Inicial de Acceso</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.adminPassword}
                  onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                  placeholder="ej. Admin2026*"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-[#1D4ED8] font-mono focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
            </div>
          </div>
          </div>

          {/* Plan SaaS */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <label className="text-gray-700 font-bold block font-headline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1D4ED8] text-base">water_drop</span>
                  <span>Plan SaaS Comercial AquaRural</span>
                </label>
                <p className="text-[10px] text-gray-400 mt-0.5">Selecciona el plan comercial y la modalidad de facturación</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-1 rounded-xl flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const planKey = form.planSaaS || 'CAUDAL';
                    const planObj = PLANES_SAAS_MAP[planKey] || PLANES_SAAS_MAP.CAUDAL;
                    setForm({ ...form, frecuenciaPagoSaaS: 'MENSUAL', costoMensualSaaS: planObj.mensual });
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-headline font-bold transition-colors cursor-pointer ${
                    (form.frecuenciaPagoSaaS || 'ANUAL') === 'MENSUAL'
                      ? 'bg-[#1D4ED8] text-white shadow-sm font-extrabold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  🗓️ Mensual
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const planKey = form.planSaaS || 'CAUDAL';
                    const planObj = PLANES_SAAS_MAP[planKey] || PLANES_SAAS_MAP.CAUDAL;
                    setForm({ ...form, frecuenciaPagoSaaS: 'ANUAL', costoMensualSaaS: planObj.anual });
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-headline font-bold transition-colors cursor-pointer ${
                    (form.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL'
                      ? 'bg-[#1D4ED8] text-white shadow-sm font-extrabold'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  📅 Anual
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {Object.values(PLANES_SAAS_MAP).map((p) => {
                const isSelected = (form.planSaaS || 'CAUDAL') === p.id;
                const esAnual = (form.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL';
                const valor = esAnual ? p.anual : p.mensual;

                return (
                  <div
                    key={p.id}
                    onClick={() => setForm({ ...form, planSaaS: p.id, costoMensualSaaS: valor })}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                      isSelected ? 'bg-blue-50 border-[#1D4ED8] ring-2 ring-blue-100' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-headline font-bold text-gray-600 inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">{p.icon}</span>
                        {p.badge}
                      </span>
                      <span className={`material-symbols-outlined text-sm ${isSelected ? 'text-[#1D4ED8]' : 'text-gray-300'}`}>
                        {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-900 font-headline">{p.nombre}</p>
                      <p className="text-[10px] text-[#1D4ED8] font-headline font-semibold">{p.rango}</p>
                    </div>
                    <div className="pt-1.5 border-t border-gray-200">
                      <p className="text-xs font-extrabold text-[#1D4ED8] font-mono">
                        ${valor.toLocaleString()} COP
                        <span className="text-[9px] text-gray-400 font-body font-normal"> /{esAnual ? 'año' : 'mes'}</span>
                      </p>
                      {esAnual && (
                        <p className="text-[9px] text-gray-400">
                          Eq. <strong>${p.anualMensualizado.toLocaleString()}</strong>/mes
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vigencia de la licencia — informativa, no editable: el backend da
              acceso inmediato con 30 días gratis a un acueducto nuevo, sin
              exigir pago de entrada. El PRIMER cobro (mensual o anual según
              lo elegido) ocurre siempre al terminar esos 30 días, no antes.
              La frecuencia solo cambia hasta cuándo cubre ESE pago: 1 mes o
              1 año a partir de ahí — no cuándo se hace el primer pago. */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <p className="text-xs font-bold text-[#1D4ED8] font-headline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">card_giftcard</span>
              <span>Vigencia de la Licencia & Mes Gratis de Prueba</span>
            </p>
            {(() => {
              const esAnual = (form.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL';
              const fechaSegundoVencimientoDate = new Date(fechaVencimientoPruebaDate);
              if (esAnual) fechaSegundoVencimientoDate.setFullYear(fechaSegundoVencimientoDate.getFullYear() + 1);
              else fechaSegundoVencimientoDate.setMonth(fechaSegundoVencimientoDate.getMonth() + 1);
              const fechaSegundoVencimiento = fechaSegundoVencimientoDate.toISOString().split('T')[0];

              return (
                <div className="space-y-2">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-2 text-xs text-gray-700">
                    <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                    <span>
                      <strong>Sin pago de entrada.</strong> El acceso queda activo hoy (<strong>{todayStr}</strong>) y es
                      gratis hasta el <strong className="text-emerald-700">{fechaVencimientoPrueba}</strong> (30 días).
                    </span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <span className="material-symbols-outlined text-base text-amber-600">payments</span>
                      <span>
                        Debe pagar por primera vez el <strong className="text-amber-700">{fechaVencimientoPrueba}</strong>,
                        la suscripción <strong>{esAnual ? 'anual' : 'mensual'}</strong> elegida. Ese pago cubre hasta el{' '}
                        <strong className="text-amber-700">{fechaSegundoVencimiento}</strong>, cuando vuelve a vencer.
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-headline shrink-0">Calculado automáticamente por el servidor</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/superadmin/acueductos')}
              className="px-5 py-2.5 rounded-2xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 text-xs font-headline font-bold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ color: '#ffffff' }}
              className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold px-6 py-2.5 rounded-2xl text-xs font-headline shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">add_task</span>
              <span>{submitting ? 'Creando Acueducto...' : 'Guardar y Crear Acueducto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevoAcueductoPage;
