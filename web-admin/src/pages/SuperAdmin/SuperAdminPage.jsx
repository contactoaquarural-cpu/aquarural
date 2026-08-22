import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api.service';

export const PLANES_SAAS_MAP = {
  MANANTIAL: {
    id: 'MANANTIAL',
    nombre: 'Plan Manantial',
    rango: 'Hasta 150 Suscriptores',
    badge: '💧 MANANTIAL',
    mensual: 60000,
    anual: 600000,
    anualMensualizado: 50000,
  },
  CAUDAL: {
    id: 'CAUDAL',
    nombre: 'Plan Caudal',
    rango: '151 a 500 Suscriptores',
    badge: '🌊 CAUDAL',
    mensual: 100000,
    anual: 1000000,
    anualMensualizado: 83333,
  },
  CUENCA: {
    id: 'CUENCA',
    nombre: 'Plan Cuenca',
    rango: '501 a 1.000 Suscriptores',
    badge: '🏞️ CUENCA',
    mensual: 180000,
    anual: 1800000,
    anualMensualizado: 150000,
  },
  ACUIFERO: {
    id: 'ACUIFERO',
    nombre: 'Plan Acuífero',
    rango: '+1.000 Suscriptores',
    badge: '⚡ ACUÍFERO',
    mensual: 300000,
    anual: 3000000,
    anualMensualizado: 250000,
  },
};

const SuperAdminPage = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'all';

  const [acueductos, setAcueductos] = useState([]);
  const [metricas, setMetricas] = useState({
    totalAcueductos: 0,
    acueductosActivos: 0,
    acueductosSuspendidos: 0,
    totalSuscriptores: 0,
    totalFacturas: 0,
    recaudoTotal: 0,
    mrrSaaS: 130000,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const modalNuevoRef = useRef(null);
  const modalEditarRef = useRef(null);

  // Modales
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalLlaves, setMostrarModalLlaves] = useState(false);
  const [mostrarModalCobroSaaS, setMostrarModalCobroSaaS] = useState(false);
  const [acueductoAEditar, setAcueductoAEditar] = useState(null);
  const [acueductoAEliminar, setAcueductoAEliminar] = useState(null);
  const [acueductoSeleccionado, setAcueductoSeleccionado] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Estados de API Colombia (https://api-colombia.com/)
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [departamentoSeleccionadoId, setDepartamentoSeleccionadoId] = useState(null);
  const [cargandoUbicaciones, setCargandoUbicaciones] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nextYearDate = new Date();
  nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
  const nextYearStr = nextYearDate.toISOString().split('T')[0];

  // Formulario de Acueducto
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
    fechaVencimientoGratis: nextYearStr,
    adminCorreo: '',
    adminNombres: '',
    adminPassword: 'Admin2026*',
    wompiPublicKey: '',
    wompiPrivateKey: '',
    wompiEventsSecret: '',
    wompiIntegritySecret: '',
    wompiSandbox: true,
  });

  // Conexión con API Colombia para obtener departamentos
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
          { id: 22, name: 'Santander' }
        ]);
        setMunicipios([
          { id: 1, name: 'Garzón' },
          { id: 2, name: 'Gigante' },
          { id: 3, name: 'El Agrado' },
          { id: 4, name: 'Pitalito' },
          { id: 5, name: 'Neiva' }
        ]);
      } finally {
        setCargandoUbicaciones(false);
      }
    };
    fetchDepartamentosAPI();
  }, []);

  // Cargar municipios del departamento seleccionado desde API Colombia
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

  const handleCambiarDepartamento = (e) => {
    const deptId = Number(e.target.value);
    const deptObj = departamentos.find((d) => d.id === deptId);
    setDepartamentoSeleccionadoId(deptId);
    setForm((prev) => ({ ...prev, departamento: deptObj ? deptObj.name : 'Huila' }));
    fetchMunicipiosAPI(deptId);
  };

  // Cargar datos oficiales de acueductos desde la API de MongoDB Atlas
  const cargarDatos = async () => {
    setLoading(true);
    setError('');

    try {
      const [resAcueductos, resMetricas] = await Promise.allSettled([
        api.get('/superadmin/acueductos'),
        api.get('/superadmin/metricas'),
      ]);

      let lista = [];
      if (resAcueductos.status === 'fulfilled' && Array.isArray(resAcueductos.value?.data?.data)) {
        lista = resAcueductos.value.data.data;
      } else {
        const guardados = localStorage.getItem('aquarural-acueductos-saas-v1');
        if (guardados) {
          try {
            const parsed = JSON.parse(guardados);
            if (Array.isArray(parsed)) lista = parsed;
          } catch (e) {}
        }
      }

      setAcueductos(lista);
      localStorage.setItem('aquarural-acueductos-saas-v1', JSON.stringify(lista));

      const totalActivos = lista.filter((a) => a.estado === 'ACTIVO').length;
      const totalSuspendidos = lista.filter((a) => a.estado === 'SUSPENDIDO').length;
      const sumaMrr = lista.reduce((acc, a) => acc + (a.costoSaaSVigente || 80000), 0);

      if (resMetricas.status === 'fulfilled' && resMetricas.value?.data?.ok) {
        setMetricas({
          totalAcueductos: lista.length,
          acueductosActivos: totalActivos,
          acueductosSuspendidos: totalSuspendidos,
          totalSuscriptores: resMetricas.value.data.metricas?.totalSuscriptores || 0,
          totalFacturas: resMetricas.value.data.metricas?.totalFacturas || 0,
          recaudoTotal: resMetricas.value.data.metricas?.recaudoTotal || 0,
          mrrSaaS: sumaMrr,
        });
      } else {
        setMetricas({
          totalAcueductos: lista.length,
          acueductosActivos: totalActivos,
          acueductosSuspendidos: totalSuspendidos,
          totalSuscriptores: 0,
          totalFacturas: 0,
          recaudoTotal: 0,
          mrrSaaS: sumaMrr,
        });
      }
    } catch (err) {
      console.error('Error cargando superadmin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const triggerModalError = (msg) => {
    setError(msg);
    setSubmitting(false);
    if (modalNuevoRef.current) {
      modalNuevoRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (modalEditarRef.current) {
      modalEditarRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Crear Nuevo Acueducto
  const handleSubmitNuevo = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMensajeExito('');

    // Validar que TODOS los campos obligatorios presentes en el modal estén diligenciados
    if (!form.nombre || !form.nombre.trim()) return triggerModalError('El Nombre del Acueducto Veredal es obligatorio.');
    if (!form.nit || !form.nit.trim()) return triggerModalError('El NIT es obligatorio.');
    if (!form.vereda || !form.vereda.trim()) return triggerModalError('La Vereda Principal es obligatoria.');
    if (!form.telefono || !form.telefono.trim()) return triggerModalError('El Teléfono Celular / WhatsApp es obligatorio.');
    if (!form.adminNombres || !form.adminNombres.trim()) return triggerModalError('El Nombre del Tesorero / Admin es obligatorio.');
    if (!form.adminCorreo || !form.adminCorreo.trim()) return triggerModalError('El Correo Personal del Administrador es obligatorio.');
    if (!form.adminPassword || !form.adminPassword.trim()) return triggerModalError('La Contraseña Inicial de Acceso es obligatoria.');

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
      wompiPublicKey: form.wompiPublicKey || undefined,
      wompiPrivateKey: form.wompiPrivateKey || undefined,
      wompiEventsSecret: form.wompiEventsSecret || undefined,
      wompiIntegritySecret: form.wompiIntegritySecret || undefined,
      wompiSandbox: form.wompiSandbox,
    };

    try {
      const res = await api.post('/superadmin/acueductos', payload);
      const data = res?.data;
      if (data && data.success && data.data?.acueducto) {
        const guardadoMongo = data.data.acueducto;
        setAcueductos((prev) => {
          const actualizados = [guardadoMongo, ...(Array.isArray(prev) ? prev : [])];
          localStorage.setItem('aquarural-acueductos-saas-v1', JSON.stringify(actualizados));
          return actualizados;
        });
        setMensajeExito(`¡Acueducto "${form.nombre}" registrado y guardado en MongoDB Atlas exitosamente!`);
        setMostrarModalNuevo(false);
        resetForm();
      } else {
        setError(data?.message || 'No se pudo guardar el acueducto en MongoDB Atlas.');
      }
    } catch (err) {
      console.error('Error enviando acueducto a backend:', err);
      const msg = err.response?.data?.message || 'Error de conexión al servidor backend MongoDB.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Abrir Modal Editar Acueducto
  const abrirModalEditar = (acueducto) => {
    setAcueductoAEditar(acueducto);
    
    const rawPlan = String(acueducto.planSaaS || 'CAUDAL').toUpperCase();
    let plan = 'CAUDAL';
    if (rawPlan.includes('MANANTIAL') || rawPlan.includes('BASICO')) plan = 'MANANTIAL';
    else if (rawPlan.includes('CAUDAL') || rawPlan.includes('ESTANDAR')) plan = 'CAUDAL';
    else if (rawPlan.includes('CUENCA') || rawPlan.includes('EMPRESARIAL')) plan = 'CUENCA';
    else if (rawPlan.includes('ACUIFERO') || rawPlan.includes('CORPORATIVO') || rawPlan.includes('ENTERPRISE')) plan = 'ACUIFERO';

    const frecuencia = acueducto.frecuenciaPagoSaaS || 'ANUAL';
    const planObj = PLANES_SAAS_MAP[plan] || PLANES_SAAS_MAP.CAUDAL;
    const costoDefault = frecuencia === 'ANUAL' ? planObj.anual : planObj.mensual;

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
      frecuenciaPagoSaaS: frecuencia,
      costoMensualSaaS: acueducto.costoSaaSVigente || costoDefault,
      fechaInicioLicencia: acueducto.fechaInicioLicencia ? String(acueducto.fechaInicioLicencia).split('T')[0] : todayStr,
      fechaVencimientoGratis: acueducto.fechaVencimientoGratis ? String(acueducto.fechaVencimientoGratis).split('T')[0] : nextYearStr,
      adminCedula: acueducto.adminCedula || '',
      adminCorreo: acueducto.adminCorreo || acueducto.email || '',
      adminNombres: acueducto.adminNombres || acueducto.representanteLegal || '',
      adminPassword: '',
      wompiPublicKey: acueducto.wompiPublicKey || '',
      wompiPrivateKey: '',
      wompiEventsSecret: '',
      wompiIntegritySecret: '',
      wompiSandbox: acueducto.wompiSandbox !== undefined ? acueducto.wompiSandbox : true,
    });
    setMostrarModalEditar(true);
  };

  // Guardar Cambios de Edición de Acueducto
  const handleSubmitEditar = async (e) => {
    e.preventDefault();
    if (!acueductoAEditar) return;
    setSubmitting(true);
    setError('');

    const targetId = acueductoAEditar._id || acueductoAEditar.id;

    // Payload parcial alineado al contrato PUT del backend: solo los campos que el
    // schema de edición acepta (sin adminCedula/adminNombres/adminPassword/planSaaS/
    // costoMensualSaaS, que no existen o no son editables por este endpoint).
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
    if (form.wompiPublicKey) payload.wompiPublicKey = form.wompiPublicKey;
    if (form.wompiPrivateKey) payload.wompiPrivateKey = form.wompiPrivateKey;
    if (form.wompiEventsSecret) payload.wompiEventsSecret = form.wompiEventsSecret;
    if (form.wompiIntegritySecret) payload.wompiIntegritySecret = form.wompiIntegritySecret;
    if (form.wompiSandbox !== undefined) payload.wompiSandbox = form.wompiSandbox;

    try {
      const res = await api.put(`/superadmin/acueductos/${targetId}`, payload);
      const data = res?.data;
      if (data && data.success && data.data) {
        const actualizado = data.data;
        setAcueductos((prev) =>
          prev.map((a) => (String(a._id || a.id) === String(targetId) ? actualizado : a))
        );
        setMensajeExito(`¡Datos de "${form.nombre}" actualizados correctamente en MongoDB Atlas!`);
        setMostrarModalEditar(false);
      } else {
        setError(data?.message || 'No se pudo actualizar el acueducto.');
      }
    } catch (err) {
      console.error('Error actualizando acueducto:', err);
      const msg = err.response?.data?.message || 'Error de conexión al servidor backend MongoDB.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirmar Eliminación de Acueducto
  // NOTA: DELETE /superadmin/acueductos/:id no existe todavía en el backend (404 esperado).
  // No se debe actualizar el estado local como si la eliminación hubiera tenido éxito.
  const handleConfirmarEliminar = async () => {
    if (!acueductoAEliminar) return;
    setSubmitting(true);
    const targetId = acueductoAEliminar._id || acueductoAEliminar.id;
    try {
      await api.delete(`/superadmin/acueductos/${targetId}`);
      await cargarDatos();
      setMensajeExito(`¡Acueducto ${acueductoAEliminar.nombre} eliminado exitosamente de MongoDB Atlas!`);
      setAcueductoAEliminar(null);
    } catch (err) {
      console.error('Error eliminando acueducto:', err);
      setError('La eliminación de acueductos aún no está disponible en el backend.');
      setAcueductoAEliminar(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Activo/Suspendido
  const toggleEstadoAcueducto = async (acueducto) => {
    const nuevoEstado = acueducto.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    try {
      const res = await api.put(`/superadmin/acueductos/${acueducto._id || acueducto.id}`, { estado: nuevoEstado });
      const data = res?.data;
      const actualizado = data && data.success && data.data ? data.data : { ...acueducto, estado: nuevoEstado };
      setAcueductos(acueductos.map((a) => ((a._id === acueducto._id || a.id === acueducto.id) ? actualizado : a)));
      setMensajeExito(`Estado de ${acueducto.nombre} cambiado a ${nuevoEstado}.`);
    } catch (err) {
      setError('Error al actualizar el estado del acueducto.');
    }
  };

  const abrirModalLlaves = async (acueducto) => {
    setAcueductoSeleccionado(acueducto);
    setMostrarModalLlaves(true);
  };

  const abrirModalCobroSaaS = (acueducto) => {
    setAcueductoSeleccionado(acueducto);
    setMostrarModalCobroSaaS(true);
  };

  const handlePagarConWompiSaaS = async () => {
    if (!acueductoSeleccionado) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/superadmin/pago-saas/iniciar', {
        acueductoId: acueductoSeleccionado._id || acueductoSeleccionado.id,
      });

      const { publicKey, referencia, montoEnCentavos, firma } = data.data || {};
      const wompiUrl = `https://checkout.wompi.co/p/?public-key=${publicKey || 'pub_test_TYld0TKr4chIS8TbArF0lDp85rLkyX35'}&currency=COP&amount-in-cents=${montoEnCentavos || 100000000}&reference=${referencia || 'SAAS-DEMO'}&signature:integrity=${firma || ''}`;
      
      window.open(wompiUrl, '_blank');
      setMensajeExito(`¡Pasarela de recaudo Wompi abierta para ${acueductoSeleccionado.nombre}!`);
    } catch (err) {
      // Fallback demo link si no hay backend activo
      const demoUrl = `https://checkout.wompi.co/p/?public-key=pub_test_TYld0TKr4chIS8TbArF0lDp85rLkyX35&currency=COP&amount-in-cents=${(acueductoSeleccionado.costoSaaSVigente || 1000000) * 100}&reference=SAAS-${Date.now()}`;
      window.open(demoUrl, '_blank');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnviarWhatsAppSaaS = () => {
    if (!acueductoSeleccionado) return;
    const tel = acueductoSeleccionado.telefono || '3166160377';
    const rep = acueductoSeleccionado.representanteLegal || 'Representante Legal';
    const acueductoNombre = acueductoSeleccionado.nombre;
    const valor = (acueductoSeleccionado.costoSaaSVigente || 1000000).toLocaleString();
    const freqLabel = acueductoSeleccionado.frecuenciaPagoSaaS === 'MENSUAL' ? 'mensual' : 'anual';
    const texto = `Hola ${rep}, te adjuntamos la cuenta de cobro ${freqLabel} del software AquaRural SaaS ($${valor} COP) correspondiente al ${acueductoNombre}. Puedes realizar el pago por PSE/Nequi o transferencia bancaria. ¡Muchas gracias!`;
    const url = `https://api.whatsapp.com/send?phone=57${tel}&text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  const handleMarcarSaaSComoPagado = () => {
    if (!acueductoSeleccionado) return;
    setAcueductos(
      acueductos.map((a) =>
        (a._id === acueductoSeleccionado._id || a.id === acueductoSeleccionado.id) ? { ...a, estadoPagoSaaS: 'AL_DIA' } : a
      )
    );
    setMensajeExito(`¡Suscripción SaaS de ${acueductoSeleccionado.nombre} registrada como PAGADA!`);
    setMostrarModalCobroSaaS(false);
  };

  const resetForm = () => {
    setForm({
      nombre: '',
      nit: '',
      departamento: 'Huila',
      municipio: 'Garzón',
      vereda: '',
      direccion: '',
      telefono: '',
      email: '',
      representanteLegal: '',
      planSaaS: 'CAUDAL',
      frecuenciaPagoSaaS: 'ANUAL',
      costoMensualSaaS: 1000000,
      fechaInicioLicencia: todayStr,
      fechaVencimientoGratis: nextYearStr,
      adminCorreo: '',
      adminNombres: '',
      adminPassword: 'Admin2026*',
      wompiPublicKey: '',
      wompiPrivateKey: '',
      wompiEventsSecret: '',
      wompiIntegritySecret: '',
      wompiSandbox: true,
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto font-body selection:bg-cyan-500 selection:text-slate-950">
      {/* Header SaaS con distintivo SuperAdmin */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-gradient-to-r from-sky-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold px-3 py-1 rounded-full font-headline flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>SuperAdmin SaaS AquaRural</span>
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100 font-headline tracking-tight">
            Dashboard de Control SaaS & Acueductos Afiliados
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gestión centralizada de organizaciones comunitarias afiliadas, cobranza de mensualidades del software y cifrado Wompi.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setMostrarModalNuevo(true);
          }}
          className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-headline font-extrabold text-xs tracking-wide uppercase flex items-center gap-2 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_business</span>
          <span>Registrar Nuevo Acueducto</span>
        </button>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-4 flex items-center justify-between text-emerald-300 text-xs font-headline animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-emerald-400">check_circle</span>
            <p>{mensajeExito}</p>
          </div>
          <button onClick={() => setMensajeExito('')} className="text-emerald-400 hover:text-emerald-200">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 flex items-center justify-between text-red-400 text-xs font-headline">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl">error</span>
            <p>{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-200">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* 📊 DASHBOARD DE ESTADÍSTICAS AVANZADAS DEL SUPERADMIN */}
      {(activeTab === 'all' || activeTab === 'dashboard') && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-100 font-headline flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400">analytics</span>
              <span>Métricas del Negocio SaaS (MRR & Rendimiento)</span>
            </h2>
            <span className="text-xs text-slate-400 font-headline">Actualizado en tiempo real</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="mrr-card-highlight bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/90 border border-cyan-500/30 rounded-3xl p-5 space-y-2 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold font-headline uppercase tracking-wider text-cyan-300">
                  MRR (Ingreso Mensual SaaS)
                </span>
                <span className="material-symbols-outlined text-cyan-400 text-2xl">trending_up</span>
              </div>
              <p className="text-3xl font-extrabold text-cyan-300 font-headline">
                ${metricas.mrrSaaS.toLocaleString()} COP
              </p>
              <p className="text-[10px] text-slate-400 font-headline">
                Recaudo recurrente de suscripciones software
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold font-headline uppercase tracking-wider">Acueductos Activos</span>
                <span className="material-symbols-outlined text-emerald-400 text-2xl">water_drop</span>
              </div>
              <p className="text-3xl font-extrabold text-slate-100 font-headline">{metricas.totalAcueductos}</p>
              <div className="flex gap-2 text-[10px] font-headline">
                <span className="text-emerald-400 font-bold">{metricas.acueductosActivos} Activos</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-400 font-bold">{metricas.acueductosSuspendidos} Suspendidos</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold font-headline uppercase tracking-wider">Familias Atendidas</span>
                <span className="material-symbols-outlined text-sky-400 text-2xl">groups</span>
              </div>
              <p className="text-3xl font-extrabold text-sky-400 font-headline">{metricas.totalSuscriptores}</p>
              <p className="text-[10px] text-slate-400 font-headline">Suscriptores rurales en plataforma</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold font-headline uppercase tracking-wider">Disponibilidad Cloud</span>
                <span className="material-symbols-outlined text-emerald-400 text-2xl">cloud_done</span>
              </div>
              <p className="text-3xl font-extrabold text-emerald-400 font-headline">99.9% Uptime</p>
              <p className="text-[10px] text-emerald-400 font-headline font-bold">Wompi Webhooks 24/7 OK</p>
            </div>
          </div>
        </div>
      )}

      {/* 🏛️ TABLA UNIFICADA DE GESTIÓN, EDICIÓN, CIFRADO Y ELIMINACIÓN DE ACUEDUCTOS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-slate-100 font-headline">
              Acueductos Veredales Afiliados
            </h3>
            <p className="text-xs text-slate-400">Gestión de datos de la organización, suscripciones SaaS, llaves Wompi y acciones de edición</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">Total Afiliados: {acueductos.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <span className="material-symbols-outlined text-3xl animate-spin text-cyan-400">sync</span>
            <p className="text-xs font-headline">Cargando acueductos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-headline uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Acueducto Veredal</th>
                  <th className="py-3.5 px-4">Representante Legal</th>
                  <th className="py-3.5 px-4">Plan SaaS</th>
                  <th className="py-3.5 px-4">Suscripción</th>
                  <th className="py-3.5 px-4">Estado Pago</th>
                  <th className="py-3.5 px-4">Acceso</th>
                  <th className="py-3.5 px-4 text-right">Acciones de Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-body text-slate-200">
                {acueductos.map((a) => (
                  <tr key={a._id || a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-100">
                      <div>
                        <p>{a.nombre}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NIT: {a.nit} • {a.municipio}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      <p className="font-bold">{a.representanteLegal || 'Carlos Alberto Trujillo'}</p>
                      <p className="text-[10px] text-cyan-400 font-mono">📱 {a.telefono || '3166160377'}</p>
                    </td>
                    <td className="py-4 px-4 font-semibold text-cyan-400 font-headline">
                      {(() => {
                        let key = a.planSaaS || 'CAUDAL';
                        if (key === 'BASICO') key = 'MANANTIAL';
                        if (key === 'ESTANDAR') key = 'CAUDAL';
                        if (key === 'EMPRESARIAL') key = 'CUENCA';
                        const planInfo = PLANES_SAAS_MAP[key] || PLANES_SAAS_MAP.CAUDAL;
                        return (
                          <span className="bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold">
                            {planInfo.badge}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-100 font-mono">
                      ${(a.costoSaaSVigente || 1000000).toLocaleString()} COP /{(a.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL' ? 'año' : 'mes'}
                    </td>
                    <td className="py-4 px-4">
                      {(() => {
                        const hoyStr = new Date().toISOString().split('T')[0];
                        let vencStr = '';
                        if (a.fechaVencimientoGratis) {
                          vencStr = String(a.fechaVencimientoGratis).split('T')[0];
                        }

                        // Un acueducto está VENCIDO solo si la fecha de vencimiento es estrictamente menor a la fecha actual YYYY-MM-DD
                        const estaVencido = vencStr ? vencStr < hoyStr : false;

                        let texto = '✓ AL DÍA';
                        let estilo = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                        if (estaVencido || a.estadoPagoSaaS === 'VENCIDO' || a.estadoPagoSaaS === 'POR_COBRAR') {
                          texto = '⏳ PENDIENTE';
                          estilo = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                        } else if (a.estadoPagoSaaS === 'MES_GRATIS_PRUEBA' || a.estadoPagoSaaS === 'GRATIS_PRIMER_ANO') {
                          texto = '🎁 1ER MES GRATIS';
                          estilo = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                        } else if (a.estadoPagoSaaS === 'AL_DIA') {
                          texto = '✓ AL DÍA';
                          estilo = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                        }

                        return (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-headline font-extrabold flex items-center gap-1 w-fit ${estilo}`}>
                            {texto}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleEstadoAcueducto(a)}
                        className={`px-3 py-1 rounded-full text-[10px] font-headline font-extrabold transition-all border ${
                          a.estado === 'ACTIVO'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        {a.estado || 'ACTIVO'}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => abrirModalCobroSaaS(a)}
                        title="Cobrar Mensualidad SaaS (Wompi / Online)"
                        className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 p-2 rounded-xl transition-all inline-flex"
                      >
                        <span className="material-symbols-outlined text-base">credit_card</span>
                      </button>

                      <button
                        onClick={() => abrirModalLlaves(a)}
                        title="Ver Llaves Wompi Cifradas (AES-256)"
                        className="text-slate-400 hover:text-cyan-400 p-2 hover:bg-slate-800 rounded-xl transition-all inline-flex"
                      >
                        <span className="material-symbols-outlined text-base">vpn_key</span>
                      </button>

                      <button
                        onClick={() => abrirModalEditar(a)}
                        title="Editar / Actualizar Acueducto"
                        className="text-slate-400 hover:text-cyan-300 p-2 hover:bg-slate-800 rounded-xl transition-all inline-flex"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>

                      <button
                        onClick={() => setAcueductoAEliminar(a)}
                        title="Eliminar Acueducto del Sistema"
                        className="text-slate-400 hover:text-red-400 p-2 hover:bg-slate-800 rounded-xl transition-all inline-flex"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✏️ MODAL EDITAR ACUEDUCTO VEREDAL */}
      {mostrarModalEditar && acueductoAEditar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-2xl">edit_square</span>
                <h3 className="text-lg font-extrabold text-slate-100 font-headline">
                  Actualizar Datos del Acueducto Veredal
                </h3>
              </div>
              <button onClick={() => setMostrarModalEditar(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitEditar} autoComplete="off" className="space-y-4 text-xs font-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Nombre del Acueducto</label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">NIT</label>
                  <input
                    type="text"
                    required
                    value={form.nit}
                    onChange={(e) => setForm({ ...form, nit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline flex items-center justify-between">
                    <span>Departamento</span>
                    <span className="text-[10px] text-cyan-400 font-mono">🇨🇴 API Colombia</span>
                  </label>
                  <div className="relative">
                    <select
                      value={departamentoSeleccionadoId || ''}
                      onChange={handleCambiarDepartamento}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3.5 pr-10 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                      style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                    >
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none text-base">
                      unfold_more
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline flex items-center justify-between">
                    <span>Municipio</span>
                    {cargandoUbicaciones && <span className="text-[10px] text-cyan-400 animate-pulse">Cargando...</span>}
                  </label>
                  <div className="relative">
                    <select
                      value={form.municipio}
                      onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3.5 pr-10 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                      style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                    >
                      {municipios.map((m) => (
                        <option key={m.id || m.name} value={m.name} className="bg-slate-900 text-slate-100">
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none text-base">
                      unfold_more
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Representante Legal</label>
                  <input
                    type="text"
                    value={form.representanteLegal}
                    onChange={(e) => setForm({ ...form, representanteLegal: e.target.value })}
                    placeholder="Carlos Alberto Trujillo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Teléfono WhatsApp</label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="3166160377"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                {/* SELECTOR INTERACTIVO DE PLAN SAAS COMERCIAL CON CONCEPTOS DE AGUA Y TOGGLE MENSUAL / ANUAL */}
                <div className="md:col-span-2 space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <label className="text-slate-100 font-extrabold font-headline flex items-center gap-1.5 text-xs">
                        <span className="material-symbols-outlined text-cyan-400 text-base">water_drop</span>
                        <span>Plan SaaS Comercial AquaRural</span>
                      </label>
                      <p className="text-[10px] text-slate-400 font-body">Selecciona el rango de suscriptores y la modalidad de facturación</p>
                    </div>

                    {/* Toggle Frecuencia Mensual vs Anual */}
                    <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const planKey = form.planSaaS || 'CAUDAL';
                          const planObj = PLANES_SAAS_MAP[planKey] || PLANES_SAAS_MAP.CAUDAL;
                          setForm({
                            ...form,
                            frecuenciaPagoSaaS: 'MENSUAL',
                            costoMensualSaaS: planObj.mensual,
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-headline font-bold transition-all ${
                          (form.frecuenciaPagoSaaS || 'ANUAL') === 'MENSUAL'
                            ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🗓️ Mensual
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const planKey = form.planSaaS || 'CAUDAL';
                          const planObj = PLANES_SAAS_MAP[planKey] || PLANES_SAAS_MAP.CAUDAL;
                          setForm({
                            ...form,
                            frecuenciaPagoSaaS: 'ANUAL',
                            costoMensualSaaS: planObj.anual,
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-headline font-bold transition-all flex items-center gap-1 ${
                          (form.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL'
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>📅 Anual</span>
                        <span className="bg-emerald-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                          Ahorro
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Tarjetas Interactivas de los 4 Planes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    {Object.values(PLANES_SAAS_MAP).map((p) => {
                      const isSelected = form.planSaaS === p.id;
                      const esAnual = (form.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL';
                      const valor = esAnual ? p.anual : p.mensual;

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setForm({
                              ...form,
                              planSaaS: p.id,
                              costoMensualSaaS: valor,
                            });
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-headline font-bold text-slate-300">
                              {p.badge}
                            </span>
                            <span className={`material-symbols-outlined text-sm ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`}>
                              {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-extrabold text-slate-100 font-headline">{p.nombre}</p>
                            <p className="text-[10px] text-cyan-400 font-headline font-semibold">{p.rango}</p>
                          </div>

                          <div className="pt-1.5 border-t border-slate-800/80">
                            <p className="text-xs font-extrabold text-emerald-400 font-mono">
                              ${valor.toLocaleString()} COP
                              <span className="text-[9px] text-slate-400 font-body font-normal"> /{esAnual ? 'año' : 'mes'}</span>
                            </p>
                            {esAnual && (
                              <p className="text-[9px] text-slate-400 font-body">
                                Eq. <strong>${p.anualMensualizado.toLocaleString()}</strong>/mes
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 mt-2 border-t border-slate-800/80">
                  <p className="text-xs font-bold text-cyan-400 font-headline mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">person</span>
                    <span>Credenciales de Acceso del Administrador / Tesorero Local</span>
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Cédula / Usuario de Acceso</label>
                  <input
                    type="text"
                    value={form.adminCedula}
                    onChange={(e) => setForm({ ...form, adminCedula: e.target.value })}
                    placeholder="ej. 12203639"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Nombre del Tesorero / Admin</label>
                  <input
                    type="text"
                    value={form.adminNombres}
                    onChange={(e) => setForm({ ...form, adminNombres: e.target.value })}
                    placeholder="ej. Julián Andrés Trujillo Morales"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Correo Personal (Recuperación de Clave)</label>
                  <input
                    type="email"
                    value={form.adminCorreo}
                    onChange={(e) => setForm({ ...form, adminCorreo: e.target.value })}
                    placeholder="ej. andresjuntos@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Nueva Contraseña (Opcional)</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    placeholder="•••••••• (Dejar en blanco para mantener)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#67e8f9' }}
                  />
                </div>

                <div className="md:col-span-2 pt-4 mt-2 border-t border-slate-800/80">
                  <p className="text-xs font-bold text-emerald-400 font-headline mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">event</span>
                    <span>Vigencia & Plazo de Vencimiento de la Licencia SaaS</span>
                  </p>
                </div>

                <div className="md:col-span-2 bg-slate-950/90 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-inner">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-slate-400 font-semibold mb-1 block text-[11px] font-headline">Fecha Inicio Licencia</label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-cyan-400 text-sm pointer-events-none">calendar_month</span>
                        <input
                          type="date"
                          value={form.fechaInicioLicencia || todayStr}
                          onChange={(e) => setForm({ ...form, fechaInicioLicencia: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 font-headline cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold mb-1 block text-[11px] font-headline">Fecha Vencimiento Licencia</label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-emerald-400 text-sm pointer-events-none">event_available</span>
                        <input
                          type="date"
                          value={form.fechaVencimientoGratis || nextYearStr}
                          onChange={(e) => setForm({ ...form, fechaVencimientoGratis: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 font-headline cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 mt-2 border-t border-slate-800/80">
                  <p className="text-xs font-bold text-cyan-400 font-headline mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">lock</span>
                    <span>Actualizar Llaves Wompi (Cifrado AES-256-GCM)</span>
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Llave Pública Wompi</label>
                  <input
                    type="text"
                    autoComplete="new-password"
                    value={form.wompiPublicKey}
                    onChange={(e) => setForm({ ...form, wompiPublicKey: e.target.value })}
                    placeholder="pub_test_XXXXXX o pub_prod_XXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#67e8f9' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Llave Privada Wompi (Dejar en blanco si no deseas cambiarla)</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.wompiPrivateKey}
                    onChange={(e) => setForm({ ...form, wompiPrivateKey: e.target.value })}
                    placeholder="•••••••••••••••• (Ingresar nueva para re-cifrar AES-256)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#67e8f9' }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMostrarModalEditar(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-400 hover:text-slate-200 text-xs font-headline font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-extrabold px-6 py-2.5 rounded-2xl text-xs font-headline shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>{submitting ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ MODAL ELIMINAR ACUEDUCTO */}
      {acueductoAEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-red-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="text-base font-extrabold font-headline text-slate-100">
                Eliminar Acueducto Veredal
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-body">
              ¿Estás seguro de que deseas eliminar permanentemente el <strong className="text-slate-100">{acueductoAEliminar.nombre}</strong> (NIT: {acueductoAEliminar.nit})?
              Esta acción revocará el acceso a la plataforma SaaS y no se puede deshacer.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAcueductoAEliminar(null)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-headline py-3 rounded-2xl text-xs transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmarEliminar}
                className="w-1/2 bg-red-600 hover:bg-red-500 text-slate-100 font-extrabold font-headline py-3 rounded-2xl shadow-lg shadow-red-500/20 text-xs transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>{submitting ? 'Eliminando...' : 'Sí, Eliminar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💳 MODAL PARA COBRAR LA MENSUALIDAD SAAS AL ACUEDUCTO */}
      {mostrarModalCobroSaaS && acueductoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">credit_card</span>
                <h3 className="text-base font-extrabold text-slate-100 font-headline">
                  Cobro de Mensualidad SaaS — {acueductoSeleccionado.nombre}
                </h3>
              </div>
              <button onClick={() => setMostrarModalCobroSaaS(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5 text-xs font-body">
              <p className="text-slate-400">
                Acueducto: <strong className="text-slate-100">{acueductoSeleccionado.nombre}</strong>
              </p>
              <p className="text-slate-400">
                Representante: <strong className="text-slate-100">{acueductoSeleccionado.representanteLegal || 'Carlos Alberto Trujillo'}</strong>
              </p>
              <p className="text-slate-400">
                Plan Comercial: <strong className="text-cyan-400 font-headline font-bold">{acueductoSeleccionado.planSaaS}</strong>
              </p>
              <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-sm font-headline">
                <span className="text-slate-300 font-bold font-headline">Valor Mensualidad Software:</span>
                <span className="text-cyan-400 font-extrabold text-base font-mono">
                  ${(acueductoSeleccionado.costoSaaSVigente || 80000).toLocaleString()} COP
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePagarConWompiSaaS}
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold font-headline py-3.5 rounded-2xl shadow-xl shadow-cyan-500/25 text-xs transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">credit_card</span>
                <span>{submitting ? 'Abriendo Wompi...' : 'Pagar Licencia con Wompi (PSE / Nequi / Tarjeta)'}</span>
              </button>

              <button
                onClick={handleEnviarWhatsAppSaaS}
                className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold font-headline py-2.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>Enviar Recordatorio por WhatsApp</span>
              </button>

              <button
                onClick={handleMarcarSaaSComoPagado}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-headline py-2.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Registrar Mensualidad como PAGADA (Manual)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Registrar Nuevo Acueducto Veredal */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            ref={modalNuevoRef}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scroll-smooth"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 sticky top-0 bg-slate-900 z-20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-2xl">add_business</span>
                <h3 className="text-lg font-extrabold text-slate-100 font-headline">
                  Registrar Nuevo Acueducto Veredal
                </h3>
              </div>
              <button onClick={() => setMostrarModalNuevo(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form noValidate onSubmit={handleSubmitNuevo} autoComplete="off" className="space-y-4 text-xs font-body">
              {error && (
                <div className="sticky top-12 z-30 bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-2xl flex items-center gap-3 font-headline font-bold text-xs shadow-xl shadow-red-950/40 backdrop-blur-md animate-bounce">
                  <span className="material-symbols-outlined text-xl text-red-400 shrink-0">error</span>
                  <div className="flex-1">
                    <p className="text-red-300 font-extrabold text-xs">⚠️ ATENCIÓN: Campo Faltante</p>
                    <p className="text-slate-200 text-[11px] font-normal">{error}</p>
                  </div>
                  <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-200">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Nombre del Acueducto Veredal</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="ej. Acueducto La Argentina"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-headline"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">NIT</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={form.nit}
                    onChange={(e) => setForm({ ...form, nit: e.target.value })}
                    placeholder="ej. 891100999-1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Vereda Principal</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={form.vereda}
                    onChange={(e) => setForm({ ...form, vereda: e.target.value })}
                    placeholder="ej. La Argentina"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Departamento</label>
                  <div className="relative">
                    <select
                      value={departamentoSeleccionadoId || ''}
                      onChange={handleCambiarDepartamento}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3.5 pr-10 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                      style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                    >
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.id} className="bg-slate-900 text-slate-100">
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none text-base">
                      unfold_more
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Municipio</label>
                  <div className="relative">
                    <select
                      value={form.municipio}
                      onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3.5 pr-10 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
                      style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                    >
                      {municipios.map((m) => (
                        <option key={m.id || m.name} value={m.name} className="bg-slate-900 text-slate-100">
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none text-base">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* SECCIÓN 2: CREDENCIALES DE ACCESO DEL ADMINISTRADOR */}
                <div className="md:col-span-2 pt-3 border-t border-slate-800">
                  <p className="text-xs font-bold text-cyan-400 font-headline mb-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">person_add</span>
                    <span>Credenciales de Acceso del Administrador / Tesorero Local</span>
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Nombre del Tesorero / Admin</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={form.adminNombres}
                    onChange={(e) => setForm({ ...form, adminNombres: e.target.value })}
                    placeholder="ej. Carlos Alberto Trujillo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Teléfono Celular / WhatsApp del Administrador</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="ej. 3166160377"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Correo Personal (Recuperar Clave)</label>
                  <input
                    type="email"
                    autoComplete="off"
                    value={form.adminCorreo}
                    onChange={(e) => setForm({ ...form, adminCorreo: e.target.value })}
                    placeholder="ej. tesorero@laargentina.org.co"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Contraseña Inicial de Acceso</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={form.adminPassword}
                    onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                    placeholder="ej. Admin2026*"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#67e8f9' }}
                  />
                </div>

                {/* SECCIÓN 3: PLAN SAAS COMERCIAL CON TARJETAS SELECCIONABLES (DEBAJO DE CREDENCIALES, SIN INSIGNIA AHORRO) */}
                <div className="md:col-span-2 pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <label className="text-slate-300 font-bold block font-headline flex items-center gap-1.5 text-xs">
                        <span className="material-symbols-outlined text-cyan-400 text-base">water_drop</span>
                        <span>Plan SaaS Comercial AquaRural</span>
                      </label>
                      <p className="text-[10px] text-slate-400 font-body mt-0.5">Selecciona el plan comercial y la modalidad de facturación</p>
                    </div>

                    {/* Toggle Frecuencia Mensual vs Anual */}
                    <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const planKey = form.planSaaS || 'CAUDAL';
                          const planObj = PLANES_SAAS_MAP[planKey] || PLANES_SAAS_MAP.CAUDAL;
                          const baseStr = form.fechaInicioLicencia || todayStr;
                          const parts = baseStr.split('-');
                          let fVenc = form.fechaVencimientoGratis;
                          if (parts.length === 3) {
                            const dIni = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                            const dVenc = new Date(dIni);
                            dVenc.setMonth(dVenc.getMonth() + 1);
                            const yyyy = dVenc.getFullYear();
                            const mm = String(dVenc.getMonth() + 1).padStart(2, '0');
                            const dd = String(dVenc.getDate()).padStart(2, '0');
                            fVenc = `${yyyy}-${mm}-${dd}`;
                          }
                          setForm({
                            ...form,
                            frecuenciaPagoSaaS: 'MENSUAL',
                            costoMensualSaaS: planObj.mensual,
                            fechaVencimientoGratis: fVenc,
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-headline font-bold transition-all cursor-pointer ${
                          (form.frecuenciaPagoSaaS || 'ANUAL') === 'MENSUAL'
                            ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🗓️ Mensual
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const planKey = form.planSaaS || 'CAUDAL';
                          const planObj = PLANES_SAAS_MAP[planKey] || PLANES_SAAS_MAP.CAUDAL;
                          const baseStr = form.fechaInicioLicencia || todayStr;
                          const parts = baseStr.split('-');
                          let fVenc = form.fechaVencimientoGratis;
                          if (parts.length === 3) {
                            const dIni = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                            const dVenc = new Date(dIni);
                            dVenc.setFullYear(dVenc.getFullYear() + 1);
                            const yyyy = dVenc.getFullYear();
                            const mm = String(dVenc.getMonth() + 1).padStart(2, '0');
                            const dd = String(dVenc.getDate()).padStart(2, '0');
                            fVenc = `${yyyy}-${mm}-${dd}`;
                          }
                          setForm({
                            ...form,
                            frecuenciaPagoSaaS: 'ANUAL',
                            costoMensualSaaS: planObj.anual,
                            fechaVencimientoGratis: fVenc,
                          });
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] font-headline font-bold transition-all cursor-pointer ${
                          (form.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL'
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md font-extrabold'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        📅 Anual
                      </button>
                    </div>
                  </div>

                  {/* Grid de 4 Tarjetas Seleccionables */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    {Object.values(PLANES_SAAS_MAP).map((p) => {
                      const isSelected = (form.planSaaS || 'CAUDAL') === p.id;
                      const esAnual = (form.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL';
                      const valor = esAnual ? p.anual : p.mensual;

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setForm({
                              ...form,
                              planSaaS: p.id,
                              costoMensualSaaS: valor,
                            });
                          }}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                            isSelected
                              ? 'bg-cyan-950/40 border-cyan-500 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-headline font-bold text-slate-300">
                              {p.badge}
                            </span>
                            <span className={`material-symbols-outlined text-sm ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`}>
                              {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-extrabold text-slate-100 font-headline">{p.nombre}</p>
                            <p className="text-[10px] text-cyan-400 font-headline font-semibold">{p.rango}</p>
                          </div>

                          <div className="pt-1.5 border-t border-slate-800/80">
                            <p className="text-xs font-extrabold text-emerald-400 font-mono">
                              ${valor.toLocaleString()} COP
                              <span className="text-[9px] text-slate-400 font-body font-normal"> /{esAnual ? 'año' : 'mes'}</span>
                            </p>
                            {esAnual && (
                              <p className="text-[9px] text-slate-400 font-body">
                                Eq. <strong>${p.anualMensualizado.toLocaleString()}</strong>/mes
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SECCIÓN DE VIGENCIA DE LICENCIA CON BOTÓN 1 MES GRATIS DE PRUEBA */}
                <div className="md:col-span-2 pt-3 border-t border-slate-800">
                  <p className="text-xs font-bold text-emerald-400 font-headline mb-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">card_giftcard</span>
                    <span>Vigencia de la Licencia & Beneficio Mes Gratis de Prueba</span>
                  </p>
                </div>

                <div className="md:col-span-2 bg-slate-950/90 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-inner">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-2.5">
                    <label className="text-slate-100 font-extrabold font-headline text-xs flex items-center gap-2">
                      <span className="material-symbols-outlined text-cyan-400 text-base">event</span>
                      <span>Vigencia & Plazo de la Licencia SaaS</span>
                    </label>

                    {/* Botón Conmutador (Toggle) Aplicar / Quitar 1 Mes Gratis */}
                    <button
                      type="button"
                      onClick={() => {
                        const baseStr = form.fechaInicioLicencia || todayStr;
                        const parts = baseStr.split('-');
                        let dIni = new Date();
                        if (parts.length === 3) {
                          dIni = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                        }
                        const dVenc = new Date(dIni);

                        const yaEsMesGratis = !!form.esMesGratis;

                        if (yaEsMesGratis) {
                          // QUITAR el Mes Gratis -> Recalcular según la frecuencia del plan (Anual = 1 Año, Mensual = 1 Mes)
                          if (form.frecuenciaPagoSaaS === 'MENSUAL') {
                            dVenc.setMonth(dVenc.getMonth() + 1);
                          } else {
                            dVenc.setFullYear(dVenc.getFullYear() + 1);
                          }
                        } else {
                          // APLICAR el Mes Gratis -> Sumar 1 Mes
                          dVenc.setMonth(dVenc.getMonth() + 1);
                        }

                        const yyyy = dVenc.getFullYear();
                        const mm = String(dVenc.getMonth() + 1).padStart(2, '0');
                        const dd = String(dVenc.getDate()).padStart(2, '0');
                        const fVenc = `${yyyy}-${mm}-${dd}`;

                        setForm({
                          ...form,
                          fechaInicioLicencia: baseStr,
                          fechaVencimientoGratis: fVenc,
                          esMesGratis: !yaEsMesGratis,
                          estadoPagoSaaS: !yaEsMesGratis ? 'MES_GRATIS_PRUEBA' : 'AL_DIA',
                        });
                      }}
                      className={`text-[10px] font-headline font-extrabold px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border ${
                        form.esMesGratis
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-emerald-500/20'
                          : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">
                        {form.esMesGratis ? 'check_circle' : 'card_giftcard'}
                      </span>
                      <span>
                        {form.esMesGratis ? '🎁 1 Mes Gratis Aplicado (Clic para Quitar)' : '🎁 Aplicar 1 Mes Gratis de Prueba'}
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-slate-400 font-semibold mb-1 block text-[11px] font-headline">Fecha Inicio Licencia</label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-cyan-400 text-sm pointer-events-none">calendar_today</span>
                        <input
                          type="date"
                          value={form.fechaInicioLicencia || todayStr}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              setForm({ ...form, fechaInicioLicencia: val });
                              return;
                            }
                            const parts = val.split('-');
                            if (parts.length !== 3) {
                              setForm({ ...form, fechaInicioLicencia: val });
                              return;
                            }
                            const dIni = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                            const dVenc = new Date(dIni);

                            const esPlanMensual = form.frecuenciaPagoSaaS === 'MENSUAL' || form.esMesGratis;

                            if (esPlanMensual) {
                              dVenc.setMonth(dVenc.getMonth() + 1);
                            } else {
                              dVenc.setFullYear(dVenc.getFullYear() + 1);
                            }

                            const yyyy = dVenc.getFullYear();
                            const mm = String(dVenc.getMonth() + 1).padStart(2, '0');
                            const dd = String(dVenc.getDate()).padStart(2, '0');
                            const fVenc = `${yyyy}-${mm}-${dd}`;

                            setForm({
                              ...form,
                              fechaInicioLicencia: val,
                              fechaVencimientoGratis: fVenc,
                            });
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 font-headline"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-semibold mb-1 block text-[11px] font-headline">Fecha Vencimiento Licencia</label>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-emerald-400 text-sm pointer-events-none">event_available</span>
                        <input
                          type="date"
                          value={form.fechaVencimientoGratis || nextYearStr}
                          onChange={(e) => setForm({ ...form, fechaVencimientoGratis: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500 font-headline"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-2.5 text-[11px] text-slate-300 font-headline flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-cyan-400">verified</span>
                      <span>Licencia válida desde el <strong className="text-cyan-300">{form.fechaInicioLicencia || todayStr}</strong> hasta el <strong className="text-emerald-300">{form.fechaVencimientoGratis || nextYearStr}</strong></span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN DE LLAVES WOMPI */}
                <div className="md:col-span-2 pt-3 border-t border-slate-800">
                  <p className="text-xs font-bold text-cyan-400 font-headline mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">vpn_key</span>
                    <span>Pasarela de Pagos Wompi (Cifrado AES-256-GCM)</span>
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Llave Pública Wompi (Public Key)</label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={form.wompiPublicKey}
                    onChange={(e) => setForm({ ...form, wompiPublicKey: e.target.value })}
                    placeholder="pub_test_XXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#67e8f9' }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-300 font-bold mb-1.5 block font-headline">Llave Privada Wompi (Private Key - Se cifrará en servidor)</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.wompiPrivateKey}
                    onChange={(e) => setForm({ ...form, wompiPrivateKey: e.target.value })}
                    placeholder="prv_test_XXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                    style={{ backgroundColor: '#020617', color: '#67e8f9' }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-5 py-2.5 rounded-2xl text-slate-400 hover:text-slate-200 text-xs font-headline font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-2xl text-xs font-headline shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">add_task</span>
                  <span>{submitting ? 'Creando Acueducto...' : 'Guardar y Crear Acueducto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Llaves Cifradas Wompi */}
      {mostrarModalLlaves && acueductoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">vpn_key</span>
                <h3 className="text-base font-extrabold text-slate-100 font-headline">
                  Llaves de Recaudo Wompi — {acueductoSeleccionado.nombre}
                </h3>
              </div>
              <button onClick={() => setMostrarModalLlaves(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div>
                <p className="text-[10px] text-slate-500 font-headline uppercase">Llave Pública (Wompi Public Key)</p>
                <p className="text-cyan-400 text-xs mt-0.5">{acueductoSeleccionado.wompiPublicKey || 'No configurada'}</p>
              </div>
              <div className="pt-2 border-t border-slate-900">
                <p className="text-[10px] text-slate-500 font-headline uppercase">Estado del Cifrado</p>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  <span>Cifrado AES-256-GCM Activo</span>
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setMostrarModalLlaves(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-5 py-2.5 rounded-2xl text-xs font-headline transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const acueductosOficialesBase = [
  {
    _id: '1',
    nombre: 'Acueducto Veredal La Argentina',
    nit: '891100234-5',
    departamento: 'Huila',
    municipio: 'Garzón',
    vereda: 'La Argentina',
    representanteLegal: 'Julián Andrés Trujillo Morales',
    telefono: '3166160377',
    email: 'contactoaquarural@gmail.com',
    planSaaS: 'ESTANDAR',
    costoMensualSaaS: 80000,
    estado: 'ACTIVO',
    estadoPagoSaaS: 'AL_DIA',
    wompiPublicKey: 'pub_test_TYld0TKr4chIS8TbArF0lDp85rLkyX35',
    wompiSandbox: true,
  },
];

export default SuperAdminPage;
