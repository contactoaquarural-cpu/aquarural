import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api.service';
import Toast from '../../components/Toast';

export const PLANES_SAAS_MAP = {
  MANANTIAL: {
    id: 'MANANTIAL',
    nombre: 'Plan Manantial',
    rango: 'Hasta 150 Suscriptores',
    badge: 'MANANTIAL',
    icon: 'water_drop',
    mensual: 60000,
    anual: 600000,
    anualMensualizado: 50000,
  },
  CAUDAL: {
    id: 'CAUDAL',
    nombre: 'Plan Caudal',
    rango: '151 a 500 Suscriptores',
    badge: 'CAUDAL',
    icon: 'water',
    mensual: 100000,
    anual: 1000000,
    anualMensualizado: 83333,
  },
  CUENCA: {
    id: 'CUENCA',
    nombre: 'Plan Cuenca',
    rango: '501 a 1.000 Suscriptores',
    badge: 'CUENCA',
    icon: 'water_ec',
    mensual: 180000,
    anual: 1800000,
    anualMensualizado: 150000,
  },
  ACUIFERO: {
    id: 'ACUIFERO',
    nombre: 'Plan Acuífero',
    rango: '+1.000 Suscriptores',
    badge: 'ACUÍFERO',
    icon: 'bolt',
    mensual: 300000,
    anual: 3000000,
    anualMensualizado: 250000,
  },
};

const AcueductosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [acueductos, setAcueductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState(location.state?.mensajeExito || '');

  // Modales
  const [mostrarModalLlaves, setMostrarModalLlaves] = useState(false);
  const [mostrarModalCobroSaaS, setMostrarModalCobroSaaS] = useState(false);
  const [acueductoAEliminar, setAcueductoAEliminar] = useState(null);
  const [acueductoSeleccionado, setAcueductoSeleccionado] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos oficiales de acueductos desde la API del backend
  const cargarDatos = async () => {
    setLoading(true);
    setError('');

    try {
      const resAcueductos = await api.get('/superadmin/acueductos');

      let lista = [];
      if (Array.isArray(resAcueductos?.data?.data)) {
        lista = resAcueductos.data.data;
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
    } catch (err) {
      console.error('Error cargando superadmin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

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
      setMensajeExito(`¡Acueducto ${acueductoAEliminar.nombre} eliminado exitosamente!`);
      setAcueductoAEliminar(null);
    } catch (err) {
      console.error('Error eliminando acueducto:', err);
      // El backend rechaza el borrado (409) si el acueducto ya tiene
      // suscriptores o facturas reales — ese mensaje explica por qué y qué
      // hacer en su lugar (suspender), así que se muestra tal cual.
      setError(err.response?.data?.message || 'No se pudo eliminar el acueducto.');
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
    setError('');
    try {
      const { data } = await api.post('/superadmin/pago-saas/iniciar', {
        acueductoId: acueductoSeleccionado._id || acueductoSeleccionado.id,
      });

      const { wompiUrl } = data.data || {};
      if (!wompiUrl) throw new Error('El servidor no devolvió una URL de pago.');

      window.open(wompiUrl, '_blank');
      setMensajeExito(`¡Pasarela de recaudo Wompi abierta para ${acueductoSeleccionado.nombre}!`);
    } catch (err) {
      console.error('Error iniciando pago SaaS con Wompi:', err);
      setError(err.response?.data?.message || 'No se pudo generar el checkout de Wompi. Usa WhatsApp o marca el pago como manual mientras tanto.');
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

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="space-y-6 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-headline tracking-tight">
            Acueductos Veredales Afiliados
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Gestión centralizada de organizaciones comunitarias afiliadas, cobranza de mensualidades del software y cifrado Wompi.
          </p>
        </div>

        <button
          onClick={() => navigate('/superadmin/acueductos/nuevo')}
          style={{ color: '#ffffff' }}
          className="bg-[#1D4ED8] hover:bg-[#1E3A8A] px-6 py-3 rounded-2xl font-headline font-bold text-xs tracking-wide uppercase flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add_business</span>
          <span>Registrar Nuevo Acueducto</span>
        </button>
      </div>

      <Toast mensaje={mensajeExito} tipo="exito" onClose={() => setMensajeExito('')} />
      <Toast mensaje={error} tipo="error" onClose={() => setError('')} />

      {/* 🏛️ TABLA UNIFICADA DE GESTIÓN, EDICIÓN, CIFRADO Y ELIMINACIÓN DE ACUEDUCTOS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 border-b border-gray-100">
          <p className="text-xs text-gray-400">Gestión de datos de la organización, suscripciones SaaS, llaves Wompi y acciones de edición</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">Total Afiliados: {acueductos.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <span className="material-symbols-outlined text-3xl animate-spin text-[#1D4ED8]">sync</span>
            <p className="text-xs font-headline">Cargando acueductos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* <colgroup> es la única forma confiable de fijar el ancho de
                  una columna en una tabla border-collapse con table-layout
                  automático — un width en <th>/<td> se ignora ahí, dejando
                  que la última columna absorba el espacio sobrante. */}
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col />
                <col className="w-px" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-headline uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-6">Acueducto Veredal</th>
                  <th className="py-3.5 px-4">Representante Legal</th>
                  <th className="py-3.5 px-4">Plan SaaS</th>
                  <th className="py-3.5 px-4">Suscripción</th>
                  <th className="py-3.5 px-4">Estado Pago</th>
                  <th className="py-3.5 px-4">Acceso</th>
                  <th className="py-3.5 px-6 text-left whitespace-nowrap tracking-normal">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs font-body text-gray-700">
                {acueductos.map((a, i) => (
                  <tr
                    key={a._id || a.id}
                    className={`hover:bg-gray-50/50 transition-colors border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}
                  >
                    <td className="py-5 px-6 font-bold text-gray-900">
                      <div>
                        <p>{a.nombre}</p>
                        <p className="text-[10px] text-gray-400 font-mono">NIT: {a.nit} • {a.municipio}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-gray-700">
                      {a.representanteLegal ? (
                        <>
                          <p className="font-bold">{a.representanteLegal}</p>
                          {a.telefono && <p className="text-[10px] text-[#1D4ED8] font-mono">📱 {a.telefono}</p>}
                        </>
                      ) : (
                        <p className="text-gray-400">Sin registrar</p>
                      )}
                    </td>
                    <td className="py-5 px-4 font-semibold text-[#1D4ED8] font-headline">
                      {(() => {
                        let key = a.planSaaS || 'CAUDAL';
                        if (key === 'BASICO') key = 'MANANTIAL';
                        if (key === 'ESTANDAR') key = 'CAUDAL';
                        if (key === 'EMPRESARIAL') key = 'CUENCA';
                        const planInfo = PLANES_SAAS_MAP[key] || PLANES_SAAS_MAP.CAUDAL;
                        return (
                          <span className="bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">{planInfo.icon}</span>
                            {planInfo.badge}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-5 px-4 font-extrabold text-gray-900 font-mono">
                      ${(a.costoSaaSVigente ?? 0).toLocaleString()} COP /{(a.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL' ? 'año' : 'mes'}
                    </td>
                    <td className="py-5 px-4">
                      {(() => {
                        const hoyStr = new Date().toISOString().split('T')[0];
                        // Una vez que el acueducto ya pagó al menos una vez, fechaVencimientoGratis
                        // queda obsoleta para siempre (fue la fecha del mes gratis inicial) — el
                        // vencimiento real a partir de ahí es fechaVencimientoMembresia. Usar solo
                        // fechaVencimientoGratis aquí marcaba "PENDIENTE" a cualquier acueducto que
                        // ya hubiera pagado, sin importar estadoPagoSaaS.
                        const fechaVigente = a.estadoPagoSaaS === 'AL_DIA' && a.fechaVencimientoMembresia
                          ? a.fechaVencimientoMembresia
                          : a.fechaVencimientoGratis;
                        let vencStr = '';
                        if (fechaVigente) {
                          vencStr = String(fechaVigente).split('T')[0];
                        }

                        // Un acueducto está VENCIDO solo si la fecha de vencimiento es estrictamente menor a la fecha actual YYYY-MM-DD
                        const estaVencido = vencStr ? vencStr < hoyStr : false;

                        let texto = '✓ AL DÍA';
                        let estilo = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                        let tooltip = '';

                        if (estaVencido || a.estadoPagoSaaS === 'VENCIDO' || a.estadoPagoSaaS === 'POR_COBRAR') {
                          texto = '⏳ PENDIENTE';
                          estilo = 'bg-amber-50 text-amber-600 border-amber-200';
                          tooltip = vencStr ? `Venció el ${vencStr}. Debe pagar para reactivar el acceso.` : 'Debe pagar para reactivar el acceso.';
                        } else if (a.estadoPagoSaaS === 'MES_GRATIS_PRUEBA' || a.estadoPagoSaaS === 'GRATIS_PRIMER_ANO') {
                          texto = '🎁 1ER MES GRATIS';
                          estilo = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                          tooltip = vencStr ? `Sin pago de entrada. Gratis hasta el ${vencStr}; después se cobra la suscripción ${(a.frecuenciaPagoSaaS || 'ANUAL') === 'ANUAL' ? 'anual' : 'mensual'}.` : '';
                        } else if (a.estadoPagoSaaS === 'AL_DIA') {
                          texto = '✓ AL DÍA';
                          estilo = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                          tooltip = vencStr ? `Suscripción vigente hasta el ${vencStr}.` : '';
                        }

                        return (
                          <span title={tooltip} className={`px-3 py-1 rounded-full text-[10px] font-headline font-extrabold flex items-center gap-1 w-fit border cursor-default ${estilo}`}>
                            {texto}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-5 px-4">
                      <button
                        onClick={() => toggleEstadoAcueducto(a)}
                        title={a.estado === 'ACTIVO' ? 'Desactivar acceso al panel' : 'Activar acceso al panel'}
                        style={{
                          backgroundColor: a.estado === 'ACTIVO' ? '#10b981' : '#d1d5db',
                          transition: 'background-color 200ms ease',
                        }}
                        className="relative inline-block w-11 h-6 rounded-full shrink-0 align-middle cursor-pointer"
                      >
                        <span
                          style={{
                            backgroundColor: '#ffffff',
                            transform: a.estado === 'ACTIVO' ? 'translateX(22px)' : 'translateX(2px)',
                            transition: 'transform 200ms ease',
                          }}
                          className="absolute top-0.5 w-5 h-5 rounded-full shadow block"
                        />
                      </button>
                    </td>
                    <td className="py-5 px-6 text-left space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => abrirModalCobroSaaS(a)}
                        title="Cobrar Mensualidad SaaS (Wompi / Online)"
                        className="text-gray-400 hover:text-[#1D4ED8] p-2 hover:bg-gray-50 rounded-xl transition-colors inline-flex"
                      >
                        <span className="material-symbols-outlined text-base">credit_card</span>
                      </button>

                      <button
                        onClick={() => abrirModalLlaves(a)}
                        title="Ver Llaves Wompi Cifradas (AES-256)"
                        className="text-gray-400 hover:text-[#1D4ED8] p-2 hover:bg-gray-50 rounded-xl transition-colors inline-flex"
                      >
                        <span className="material-symbols-outlined text-base">vpn_key</span>
                      </button>

                      <button
                        onClick={() => navigate(`/superadmin/acueductos/${a._id || a.id}/editar`)}
                        title="Editar / Actualizar Acueducto"
                        className="text-gray-400 hover:text-[#1D4ED8] p-2 hover:bg-gray-50 rounded-xl transition-colors inline-flex"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>

                      {/* Eliminar es destructivo — color de advertencia propio, no solo hover distinto */}
                      <button
                        onClick={() => setAcueductoAEliminar(a)}
                        title="Eliminar Acueducto del Sistema"
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors inline-flex"
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
                style={{ color: '#ffffff' }}
                className="w-full bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-60"
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

export default AcueductosPage;
