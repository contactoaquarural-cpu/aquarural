import React, { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

// Mismo catálogo de planes que SuperAdmin/AcueductosPage.jsx (mapa propio,
// no compartido por import — mismos valores, misma convención de badge sin
// emoji + campo icon con el Material Symbol correspondiente).
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

const LicenciaSoftwarePage = () => {
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const nitAcueducto = useConfigStore((s) => s.nit || 'S/N');
  const planSaaSCode = useConfigStore((s) => s.planSaaS || 'MANANTIAL');
  const costoSaaSVigenteDB = useConfigStore((s) => s.costoSaaSVigente || 0);
  const frecuenciaPagoDB = useConfigStore((s) => s.frecuenciaPagoSaaS || 'ANUAL');
  const fechaInicioMembresiaDB = useConfigStore((s) => s.fechaInicioMembresia);
  const fechaFinCicloVigenteDB = useConfigStore((s) => s.fechaFinCicloVigente);
  const fechaVencimientoGratisDB = useConfigStore((s) => s.fechaVencimientoGratis);
  const estadoPagoSaaSDB = useConfigStore((s) => s.estadoPagoSaaS);
  const historialPagosSaaSDB = useConfigStore((s) => s.historialPagosSaaS);
  const cargarConfig = useConfigStore((s) => s.cargarConfig);

  const frecuencia = frecuenciaPagoDB || 'ANUAL';
  const [generando, setGenerando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');
  const [licenciaAImprimir, setLicenciaAImprimir] = useState(null);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);

  const activePlan = PLANES_SAAS_MAP[planSaaSCode] || PLANES_SAAS_MAP.MANANTIAL;
  const licencias = Array.isArray(historialPagosSaaSDB) ? historialPagosSaaSDB : [];

  useEffect(() => {
    cargarConfig();
  }, []);

  const montoActualCalculado = costoSaaSVigenteDB || (frecuencia === 'ANUAL' ? activePlan.anual : activePlan.mensual);

  // La firma de integridad de Wompi se genera en el backend
  // (POST /configuracion/iniciar-pago-saas), nunca en el cliente — la llave
  // privada de la plataforma no debe existir en el código que se descarga al
  // navegador. El backend resuelve el acueducto del propio admin autenticado
  // (req.acueductoId, del token), nunca de un valor que mande el frontend.
  const handleIniciarPagoWompiSaaS = async () => {
    setError('');
    try {
      const { data } = await api.post('/configuracion/iniciar-pago-saas');
      window.open(data.data.wompiUrl, '_blank');
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo iniciar el pago con Wompi.');
    }
  };

  const hoyStr = new Date().toISOString().split('T')[0];
  // Cuándo terminó/termina el mes gratis = cuándo inicia la licencia paga.
  const fechaInicioMembresiaStr = fechaInicioMembresiaDB
    ? String(fechaInicioMembresiaDB).split('T')[0]
    : (fechaVencimientoGratisDB ? String(fechaVencimientoGratisDB).split('T')[0] : '');
  // Hasta cuándo cubre el ciclo vigente (gratis o pago, el que esté activo).
  const fechaFinCicloStr = fechaFinCicloVigenteDB ? String(fechaFinCicloVigenteDB).split('T')[0] : '';

  const enMesGratis = estadoPagoSaaSDB === 'MES_GRATIS_PRUEBA';
  const estaPorVencer = estadoPagoSaaSDB === 'POR_COBRAR';
  const estaVencida = estadoPagoSaaSDB === 'VENCIDO';
  const requiereAtencion = estaPorVencer || estaVencida;

  const handleConfirmarPagoAprobado = async () => {
    try {
      setGenerando(true);
      setError('');
      const res = await api.post('/configuracion/confirmar-pago-saas');
      const data = res?.data;
      if (data && data.success) {
        await cargarConfig();
        setMensajeExito(
          `¡Pago de renovación por $${(data.data?.factura?.montoTotal || montoActualCalculado).toLocaleString()} COP registrado exitosamente! Se emitió la cuenta de cobro ${data.data?.factura?.codigoFactura || ''}.`
        );
      } else {
        setError(data?.message || 'No se pudo confirmar el pago.');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Error al confirmar pago.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1D4ED8] text-3xl">card_membership</span>
            <h1 className="text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
              Licencia & Cobro del Sistema SaaS
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-body">
            Facturación oficial de licenciamiento, mantenimiento y soporte técnico expedida por la plataforma a la Junta Directiva de {nombreAcueducto}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 whitespace-nowrap shrink-0 flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 font-headline whitespace-nowrap">Plan Sincronizado:</span>
            <span className="text-xs font-black text-[#1D4ED8] font-headline whitespace-nowrap inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">{activePlan.icon}</span>
              {activePlan.badge}
            </span>
          </div>
        </div>
      </div>

      {/* Banner de Alerta de Licencia: por vencer o ya vencida */}
      {requiereAtencion && (
        <div
          className={`border rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 ${
            estaVencida ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-3xl ${estaVencida ? 'text-red-500' : 'text-amber-500'}`}>
              {estaVencida ? 'error' : 'schedule'}
            </span>
            <div>
              <h3 className={`font-extrabold text-sm font-headline flex items-center gap-2 ${estaVencida ? 'text-red-700' : 'text-amber-700'}`}>
                <span>
                  {estaVencida
                    ? `Licencia SaaS Vencida (${fechaFinCicloStr || 'sin fecha'})`
                    : enMesGratis
                    ? `Tu mes gratis termina el ${fechaFinCicloStr || 'pronto'}`
                    : `Tu licencia vence el ${fechaFinCicloStr || 'pronto'}`}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${estaVencida ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                  Cobro Pendiente
                </span>
              </h3>
              <p className="text-slate-600 text-xs font-body mt-0.5">
                {estaVencida
                  ? <>La vigencia de la licencia del software para <strong className="text-slate-800">{nombreAcueducto}</strong> ya finalizó. Realiza el pago de renovación cuando puedas — el servicio sigue activo hasta que el SuperAdmin decida suspenderlo.</>
                  : <>Realiza el pago para que tu licencia no se interrumpa al vencer. El servicio de <strong className="text-slate-800">{nombreAcueducto}</strong> sigue activo mientras tanto.</>}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleIniciarPagoWompiSaaS}
              style={{ color: '#ffffff' }}
              className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold px-5 py-3 rounded-2xl text-xs font-headline shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-base">credit_card</span>
              <span>Pagar Wompi / PSE (${montoActualCalculado.toLocaleString()} COP)</span>
            </button>
            <button
              onClick={handleConfirmarPagoAprobado}
              disabled={generando}
              style={{ color: '#ffffff' }}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 font-extrabold px-4 py-3 rounded-2xl text-xs font-headline shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{generando ? 'Confirmando...' : 'Confirmar Pago Aprobado'}</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-headline font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="hover:opacity-70">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl text-xs font-headline font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito('')} className="hover:opacity-70">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Tarjeta de Plan Sincronizado en Tiempo Real desde SuperAdmin */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-[#1D4ED8]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-800 font-headline">{activePlan.nombre}</h3>
                <span className="bg-blue-50 text-[#1D4ED8] text-[11px] font-black px-3 py-0.5 rounded-full border border-blue-200 font-headline">
                  {activePlan.rango}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Acueducto: <strong className="text-slate-800">{nombreAcueducto}</strong> • NIT: <strong className="text-slate-800">{nitAcueducto}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-headline block">Tarifa Oficial Licencia</span>
            <p className="text-xl font-black text-slate-800 font-mono">
              ${montoActualCalculado.toLocaleString()} <span className="text-xs text-slate-500 font-normal">COP</span>
            </p>
            <p className="text-[11px] text-slate-500">Modalidad: <strong className="text-slate-800">{frecuencia}</strong></p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 font-headline block">
              {enMesGratis ? 'Tu Mes Gratis Termina El' : 'Tu Licencia Paga Inició El'}
            </span>
            <p className="text-base font-black text-emerald-800 font-mono">{fechaInicioMembresiaStr || '—'}</p>
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              {enMesGratis ? 'Desde aquí inicia tu licencia paga' : 'Fin del mes gratis de prueba'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#1D4ED8] font-headline block">
              {enMesGratis ? 'Cobertura del Mes Gratis Hasta' : 'Tu Licencia Vence El'}
            </span>
            <p className="text-base font-black text-[#1E3A8A] font-mono">{fechaFinCicloStr || '—'}</p>
            <p className="text-[11px] text-[#1D4ED8] font-bold">
              {frecuencia === 'ANUAL' ? 'Ciclo de cobertura: 12 meses' : 'Ciclo de cobertura: 1 mes'}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-[11px] text-slate-600 leading-relaxed flex items-start gap-1.5">
          <span className="material-symbols-outlined text-sm text-[#1D4ED8] shrink-0">info</span>
          <span>Todo plan (mensual o anual) incluye un primer mes gratis. Tu licencia paga arranca automáticamente al finalizar ese mes, sin importar la modalidad que elijas.</span>
        </div>
      </div>

      {/* Tabla de Facturas de Licencia Expedidas a la Junta — mismo patrón visual que SuperAdmin/AcueductosPage */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-5 border-b border-gray-100">
          <h3 className="font-extrabold text-gray-800 text-base font-headline">
            Historial de Cuentas de Cobro de Software (Junta Directiva)
          </h3>
          <span className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            Mostrando {licencias.length} comprobantes expedidos
          </span>
        </div>

        {licencias.length === 0 ? (
          <div className="py-12 text-center space-y-2 text-gray-400">
            <span className="material-symbols-outlined text-4xl text-gray-300">receipt_long</span>
            <p className="text-xs font-bold font-headline">No hay cuentas de cobro de software expedidas aún.</p>
            <p className="text-[11px]">Se generarán automáticamente al confirmar el primer pago de tu licencia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <colgroup>
                <col />
                <col />
                <col />
                <col />
                <col />
                <col className="w-px" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-headline uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-6">Código Factura</th>
                  <th className="py-3.5 px-4">Periodo</th>
                  <th className="py-3.5 px-4">Plan / Cobertura</th>
                  <th className="py-3.5 px-4">Monto Total</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 whitespace-nowrap text-left">Acción</th>
                </tr>
              </thead>
              <tbody className="text-xs font-body text-gray-700">
                {licencias.map((item, i) => (
                  <tr
                    key={item._id || item.id}
                    className={`hover:bg-gray-50/50 transition-colors border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}
                  >
                    <td className="py-4 px-6 font-mono font-bold text-[#1D4ED8] whitespace-nowrap">{item.codigoFactura}</td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-900">{item.periodo}</td>
                    <td className="py-4 px-4">{item.plan} ({item.frecuencia})</td>
                    <td className="py-4 px-4 font-mono font-black text-gray-900 whitespace-nowrap">${item.montoTotal.toLocaleString()} COP</td>
                    <td className="py-4 px-4">
                      {(item.estado === 'PAGADO' || item.estado === 'PAGADA') ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase font-headline whitespace-nowrap inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Pagada por la Junta
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase font-headline whitespace-nowrap inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          Pendiente de Pago
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap space-x-1.5">
                      {item.estado === 'PENDIENTE' ? (
                        <button
                          type="button"
                          onClick={handleIniciarPagoWompiSaaS}
                          style={{ color: '#ffffff' }}
                          className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">credit_card</span>
                          <span>Pagar con Wompi</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-extrabold inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Verificado
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setLicenciaAImprimir(item);
                          setMostrarModalImpresion(true);
                        }}
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                        <span>Comprobante</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Comprobante Comercial de Licenciamiento */}
      {mostrarModalImpresion && licenciaAImprimir && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl font-headline">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-800 text-sm">Comprobante Oficial de Licenciamiento</h4>
              <button onClick={() => setMostrarModalImpresion(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-700 font-mono">
              <p className="font-black text-center text-sm text-slate-900 border-b border-slate-200 pb-2">AquaRural Pro SaaS</p>
              <p>• Comprobante: <strong>{licenciaAImprimir.codigoFactura}</strong></p>
              <p>• Acueducto: <strong>{nombreAcueducto}</strong></p>
              <p>• NIT: <strong>{nitAcueducto}</strong></p>
              <p>• Plan: <strong>{licenciaAImprimir.plan}</strong></p>
              <p>• Periodo: <strong>{licenciaAImprimir.periodo}</strong></p>
              <p className="text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                TOTAL: ${licenciaAImprimir.montoTotal.toLocaleString()} COP
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMostrarModalImpresion(false)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                style={{ color: '#ffffff' }}
                className="w-2/3 bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold text-xs py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                <span>Imprimir Recibo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenciaSoftwarePage;
