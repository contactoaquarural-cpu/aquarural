import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api.service';
import { PLANES_SAAS_MAP } from './AcueductosPage';

const EditarAcueductoPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const formRef = useRef(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados de API Colombia (https://api-colombia.com/)
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [departamentoSeleccionadoId, setDepartamentoSeleccionadoId] = useState(null);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(false);

  const [form, setForm] = useState(null);

  useEffect(() => {
    const cargarDepartamentos = async () => {
      setCargandoUbicaciones(true);
      try {
        const res = await fetch('https://api-colombia.com/api/v1/Department');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setDepartamentos(data.sort((a, b) => a.name.localeCompare(b.name)));
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
      } finally {
        setCargandoUbicaciones(false);
      }
    };
    cargarDepartamentos();
  }, []);

  // Carga el acueducto real y, una vez conocido su departamento, sincroniza
  // el selector de municipios de la API de Colombia con el municipio guardado.
  useEffect(() => {
    const cargarAcueducto = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/superadmin/acueductos/${id}`);
        const acueducto = data?.data;
        if (!acueducto) {
          setError('No se pudo cargar el acueducto solicitado.');
          return;
        }

        const rawPlan = String(acueducto.planSaaS || 'CAUDAL').toUpperCase();
        let plan = 'CAUDAL';
        if (rawPlan.includes('MANANTIAL') || rawPlan.includes('BASICO')) plan = 'MANANTIAL';
        else if (rawPlan.includes('CAUDAL') || rawPlan.includes('ESTANDAR')) plan = 'CAUDAL';
        else if (rawPlan.includes('CUENCA') || rawPlan.includes('EMPRESARIAL')) plan = 'CUENCA';
        else if (rawPlan.includes('ACUIFERO') || rawPlan.includes('CORPORATIVO') || rawPlan.includes('ENTERPRISE')) plan = 'ACUIFERO';

        setForm({
          nombre: acueducto.nombre || '',
          nit: acueducto.nit || '',
          departamento: acueducto.departamento || 'Huila',
          municipio: acueducto.municipio || 'Garzón',
          vereda: acueducto.vereda || '',
          direccion: acueducto.direccion || '',
          telefono: acueducto.telefono || '',
          email: acueducto.email || '',
          representanteLegal: acueducto.representanteLegal || '',
          planSaaS: plan,
          frecuenciaPagoSaaS: acueducto.frecuenciaPagoSaaS || 'ANUAL',
          costoSaaSVigente: acueducto.costoSaaSVigente || 0,
          fechaVencimientoGratis: acueducto.fechaVencimientoGratis ? String(acueducto.fechaVencimientoGratis).split('T')[0] : '',
          fechaVencimientoMembresia: acueducto.fechaVencimientoMembresia ? String(acueducto.fechaVencimientoMembresia).split('T')[0] : '',
          estadoPagoSaaS: acueducto.estadoPagoSaaS || 'AL_DIA',
        });
      } catch (err) {
        console.error('Error cargando acueducto:', err);
        setError('No se pudo cargar el acueducto solicitado.');
      } finally {
        setLoading(false);
      }
    };
    cargarAcueducto();
  }, [id]);

  // Una vez cargado el form con el departamento real, sincroniza el selector
  // de departamento (por id numérico) contra la lista de la API de Colombia.
  useEffect(() => {
    if (!form || departamentos.length === 0) return;
    const deptObj = departamentos.find((d) => d.name === form.departamento);
    if (deptObj) {
      setDepartamentoSeleccionadoId(deptObj.id);
      fetchMunicipiosAPI(deptObj.id, form.municipio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.departamento, departamentos]);

  const fetchMunicipiosAPI = async (deptId, municipioActual) => {
    if (!deptId) return;
    setCargandoUbicaciones(true);
    try {
      const res = await fetch(`https://api-colombia.com/api/v1/Department/${deptId}/cities`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setMunicipios(sorted);
        // Conserva el municipio real del acueducto si existe en la lista;
        // solo cae al primero de la lista si de verdad no coincide con nada.
        const existe = sorted.some((m) => m.name === municipioActual);
        if (!existe && sorted.length > 0) {
          setForm((prev) => (prev ? { ...prev, municipio: sorted[0].name } : prev));
        }
      }
    } catch (err) {
      console.error('Error cargando municipios desde API Colombia', err);
    } finally {
      setCargandoUbicaciones(false);
    }
  };

  const handleCambiarDepartamento = (e) => {
    const deptId = Number(e.target.value);
    const deptObj = departamentos.find((d) => d.id === deptId);
    setDepartamentoSeleccionadoId(deptId);
    setForm((prev) => ({ ...prev, departamento: deptObj ? deptObj.name : 'Huila' }));
    fetchMunicipiosAPI(deptId, null);
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

    // Payload parcial alineado al contrato PUT del backend: solo los campos que el
    // schema de edición acepta (sin credenciales de admin, que no son editables
    // por este endpoint).
    const payload = {
      nombre: form.nombre,
      nit: form.nit,
      departamento: form.departamento,
      municipio: form.municipio,
      vereda: form.vereda,
      direccion: form.direccion,
      telefono: form.telefono,
      email: form.email,
      representanteLegal: form.representanteLegal,
      frecuenciaPagoSaaS: form.frecuenciaPagoSaaS,
    };

    try {
      const res = await api.put(`/superadmin/acueductos/${id}`, payload);
      const data = res?.data;
      if (data && data.success && data.data) {
        navigate('/superadmin/acueductos', {
          state: { mensajeExito: `¡Datos de "${form.nombre}" actualizados correctamente!` },
        });
      } else {
        setError(data?.message || 'No se pudo actualizar el acueducto.');
      }
    } catch (err) {
      console.error('Error actualizando acueducto:', err);
      setError(err.response?.data?.message || 'Error de conexión al servidor backend MongoDB.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center text-gray-400 space-y-3">
          <span className="material-symbols-outlined text-3xl animate-spin text-[#1D4ED8]">sync</span>
          <p className="text-xs font-headline">Cargando acueducto...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3 font-headline font-bold text-xs">
            <span className="material-symbols-outlined text-xl text-red-500 shrink-0">error</span>
            <p className="flex-1 font-normal">{error || 'Acueducto no encontrado.'}</p>
          </div>
          <button
            onClick={() => navigate('/superadmin/acueductos')}
            className="mt-4 text-xs font-headline font-bold text-[#1D4ED8] hover:underline"
          >
            ← Volver a Acueductos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#f8f9fa' }}>
      <div ref={formRef} className="space-y-6 max-w-3xl mx-auto font-body">
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
              Actualizar Datos del Acueducto Veredal
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {form.nombre} — datos generales y plan SaaS.
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Nombre del Acueducto Veredal</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Departamento</label>
                <div className="relative">
                  <select
                    value={departamentoSeleccionadoId || ''}
                    onChange={handleCambiarDepartamento}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-3.5 pr-10 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8] cursor-pointer appearance-none"
                  >
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] pointer-events-none text-base">
                    unfold_more
                  </span>
                </div>
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline flex items-center justify-between">
                  <span>Municipio</span>
                  {cargandoUbicaciones && <span className="text-[10px] text-[#1D4ED8] animate-pulse">Cargando...</span>}
                </label>
                <div className="relative">
                  <select
                    value={form.municipio}
                    onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-3.5 pr-10 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8] cursor-pointer appearance-none"
                  >
                    {municipios.map((m) => (
                      <option key={m.id || m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] pointer-events-none text-base">
                    unfold_more
                  </span>
                </div>
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Representante Legal</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.representanteLegal}
                  onChange={(e) => setForm({ ...form, representanteLegal: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Teléfono WhatsApp</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-700 font-bold mb-1.5 block font-headline">Correo de Contacto</label>
                <input
                  type="email"
                  autoComplete="off"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-gray-900 font-headline focus:outline-none focus:border-[#1D4ED8]"
                />
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
                <p className="text-[10px] text-gray-400 mt-0.5">
                  El plan en sí se recalcula automáticamente según el número de suscriptores; aquí solo se ajusta la frecuencia de pago.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-1 rounded-xl flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, frecuenciaPagoSaaS: 'MENSUAL' })}
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
                  onClick={() => setForm({ ...form, frecuenciaPagoSaaS: 'ANUAL' })}
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

            <div className="p-3 rounded-2xl border bg-blue-50 border-[#1D4ED8] ring-2 ring-blue-100 flex items-center justify-between">
              <span className="text-xs font-headline font-bold text-gray-600 inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">{PLANES_SAAS_MAP[form.planSaaS]?.icon}</span>
                {PLANES_SAAS_MAP[form.planSaaS]?.nombre} — {PLANES_SAAS_MAP[form.planSaaS]?.rango}
              </span>
            </div>
          </div>

          {/* Estado real de pago — basado en los datos ya guardados del
              acueducto, no recalculado: aquí ya pudo haberse pagado antes,
              vencido, o seguir en el mes gratis original. */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
            <p className="text-xs font-bold text-[#1D4ED8] font-headline flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">card_giftcard</span>
              <span>Estado de la Suscripción SaaS</span>
            </p>
            {(() => {
              const hoyStr = new Date().toISOString().split('T')[0];
              // Una vez que el acueducto ya pagó al menos una vez, fechaVencimientoGratis
              // queda obsoleta para siempre (fue la fecha del mes gratis inicial) — el
              // vencimiento real a partir de ahí es fechaVencimientoMembresia.
              const vencStr = (form.estadoPagoSaaS === 'AL_DIA' && form.fechaVencimientoMembresia)
                ? form.fechaVencimientoMembresia
                : (form.fechaVencimientoGratis || '');
              const estaVencido = vencStr ? vencStr < hoyStr : false;
              const esAnual = (form.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL';

              if (form.estadoPagoSaaS === 'MES_GRATIS_PRUEBA' && !estaVencido) {
                return (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-2 text-xs text-gray-700">
                    <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                    <span>
                      Sin pago realizado todavía. Sigue en su <strong>mes gratis</strong>, activo hasta el{' '}
                      <strong className="text-emerald-700">{vencStr || '—'}</strong>; después se cobra la suscripción{' '}
                      <strong>{esAnual ? 'anual' : 'mensual'}</strong> (${(form.costoSaaSVigente || 0).toLocaleString()} COP).
                    </span>
                  </div>
                );
              }

              if (estaVencido || form.estadoPagoSaaS === 'VENCIDO' || form.estadoPagoSaaS === 'POR_COBRAR') {
                return (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-2 text-xs text-gray-700">
                    <span className="material-symbols-outlined text-base text-amber-600">payments</span>
                    <span>
                      Pago <strong>pendiente</strong>{vencStr ? <> desde el <strong className="text-amber-700">{vencStr}</strong></> : ''}.
                      Debe pagar la suscripción <strong>{esAnual ? 'anual' : 'mensual'}</strong> (${(form.costoSaaSVigente || 0).toLocaleString()} COP)
                      para reactivar el acceso.
                    </span>
                  </div>
                );
              }

              return (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-2 text-xs text-gray-700">
                  <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                  <span>
                    Suscripción <strong>{esAnual ? 'anual' : 'mensual'}</strong> al día
                    {vencStr ? <>, vigente hasta el <strong className="text-emerald-700">{vencStr}</strong></> : ''}.
                  </span>
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
              <span className="material-symbols-outlined text-base">save</span>
              <span>{submitting ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarAcueductoPage;
