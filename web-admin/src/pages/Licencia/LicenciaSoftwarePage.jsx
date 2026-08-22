import React, { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

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

const LicenciaSoftwarePage = () => {
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const nitAcueducto = useConfigStore((s) => s.nit || 'S/N');
  const planSaaSCode = useConfigStore((s) => s.planSaaS || 'CAUDAL');
  const costoMensualSaaSDB = useConfigStore((s) => s.costoMensualSaaS || 100000);
  const frecuenciaPagoDB = useConfigStore((s) => s.frecuenciaPagoSaaS || 'MENSUAL');
  const cargarConfig = useConfigStore((s) => s.cargarConfig);

  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(() => {
    return localStorage.getItem('aquarural-periodo-licencia') || new Date().toISOString().slice(0, 7);
  });

  const frecuencia = frecuenciaPagoDB || 'ANUAL';
  const [licencias, setLicencias] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [licenciaAImprimir, setLicenciaAImprimir] = useState(null);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);

  const activePlan = PLANES_SAAS_MAP[planSaaSCode] || PLANES_SAAS_MAP.CAUDAL;

  useEffect(() => {
    cargarConfig();
  }, []);

  useEffect(() => {
    localStorage.setItem('aquarural-periodo-licencia', periodoSeleccionado);
    cargarLicencias();
  }, [periodoSeleccionado]);

  const cargarLicencias = async () => {
    try {
      // 1. Intentar obtener el historial oficial directo de MongoDB Atlas
      const resConfig = await api.get('/configuracion').catch(() => null);
      if (resConfig?.data?.data?.historialPagosSaaS && Array.isArray(resConfig.data.data.historialPagosSaaS)) {
        if (resConfig.data.data.historialPagosSaaS.length > 0) {
          setLicencias(resConfig.data.data.historialPagosSaaS);
          return;
        }
      }

      // 2. Fallback a almacenamiento local si la API aún no tiene registros
      const keyNit = nitAcueducto ? `aquarural-licencias-${nitAcueducto}` : null;
      const rawNit = keyNit ? localStorage.getItem(keyNit) : null;
      const rawGen = localStorage.getItem('aquarural-licencias-software-v1');

      let locList = [];
      if (rawNit) {
        try {
          const p = JSON.parse(rawNit);
          if (Array.isArray(p)) locList = p;
        } catch (e) {}
      }
      if (locList.length === 0 && rawGen) {
        try {
          const p = JSON.parse(rawGen);
          if (Array.isArray(p)) locList = p;
        } catch (e) {}
      }
      setLicencias(locList);
    } catch (e) {}
  };

  const montoActualCalculado = frecuencia === 'ANUAL'
    ? (activePlan.anual || costoMensualSaaSDB)
    : (activePlan.mensual || 60000);

  const handleGenerarCuentaCobroSoftware = () => {
    setGenerando(true);
    setMensajeExito('');

    setTimeout(() => {
      const codigoFac = `FAC-${periodoSeleccionado.replace('-', '')}-ADM-001`;
      const nuevaCuenta = {
        id: String(Date.now()),
        codigoFactura: codigoFac,
        periodo: periodoSeleccionado,
        plan: activePlan.nombre,
        badge: activePlan.badge,
        frecuencia,
        montoTotal: montoActualCalculado,
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: `${periodoSeleccionado}-30`,
        estado: 'PENDIENTE',
        metodoPago: 'WOMPI_PSE',
      };

      setLicencias((prev) => {
        const seguras = Array.isArray(prev) ? prev : [];
        const sinDuplicados = seguras.filter((l) => l.codigoFactura !== codigoFac);
        const resultado = [nuevaCuenta, ...sinDuplicados];
        localStorage.setItem('aquarural-licencias-software-v1', JSON.stringify(resultado));
        return resultado;
      });

      setGenerando(false);
      setMensajeExito(`Cuenta de cobro ${codigoFac} generada exitosamente.`);
    }, 600);
  };

  const handleIniciarPagoWompiSaaS = async (item) => {
    const montoTotal = item?.montoTotal || montoActualCalculado || 100000;
    const montoCents = montoTotal * 100;
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const ref = `SAAS-PAY-${uniqueId}`;
    const pubKey = 'pub_test_TYld0TKr4chIS8TbArF0lDp85rLkyX35';
    const integritySecret = 'test_integrity_Ck1W1N3nS3YwdpitCdiPBFrz0Zabvlnn';

    const signature = await generarFirmaIntegridadWompi(ref, montoCents, integritySecret);

    const wompiUrl = `https://checkout.wompi.co/p/?public-key=${pubKey}&currency=COP&amount-in-cents=${montoCents}&reference=${ref}&signature:integrity=${signature}`;
    window.open(wompiUrl, '_blank');
  };



  const calcularRangoCobertura = (periodoStr, modoFrecuencia) => {
    if (!periodoStr) return { inicio: '', fin: '', texto: '' };
    const [yr, mo] = periodoStr.split('-').map(Number);
    const startDate = new Date(yr, mo - 1, 1);
    const startStr = startDate.toISOString().split('T')[0];

    let endDate;
    if (modoFrecuencia === 'ANUAL') {
      endDate = new Date(yr + 1, mo - 1, 0);
    } else {
      endDate = new Date(yr, mo, 0);
    }
    const endStr = endDate.toISOString().split('T')[0];

    return {
      inicio: startStr,
      fin: endStr,
      texto: modoFrecuencia === 'ANUAL'
        ? `Del ${startStr} al ${endStr} (12 Meses)`
        : `Del ${startStr} al ${endStr} (1 Mes)`,
    };
  };

  const rangoActual = calcularRangoCobertura(periodoSeleccionado, frecuencia);

  const fechaInicioLicenciaDB = useConfigStore((s) => s.fechaInicioLicencia);
  const fechaVencimientoGratisDB = useConfigStore((s) => s.fechaVencimientoGratis);
  const estadoPagoSaaSDB = useConfigStore((s) => s.estadoPagoSaaS);

  const hoyStr = new Date().toISOString().split('T')[0];
  const fechaInicioStr = fechaInicioLicenciaDB ? String(fechaInicioLicenciaDB).split('T')[0] : rangoActual.inicio;
  const fechaVencStr = fechaVencimientoGratisDB ? String(fechaVencimientoGratisDB).split('T')[0] : rangoActual.fin;

  let fechaInicioCicloStr = fechaInicioStr;
  if (fechaVencStr && fechaVencStr.includes('-')) {
    const parts = fechaVencStr.split('-').map(Number);
    if (parts.length === 3) {
      const dFin = new Date(parts[0], parts[1] - 1, parts[2]);
      const dIni = new Date(dFin);
      if (frecuencia === 'ANUAL') {
        dIni.setFullYear(dIni.getFullYear() - 1);
      } else {
        dIni.setMonth(dIni.getMonth() - 1);
      }
      const yyyy = dIni.getFullYear();
      const mm = String(dIni.getMonth() + 1).padStart(2, '0');
      const dd = String(dIni.getDate()).padStart(2, '0');
      fechaInicioCicloStr = `${yyyy}-${mm}-${dd}`;
    }
  }

  const estaLicenciaVencida = fechaVencStr ? fechaVencStr < hoyStr : (estadoPagoSaaSDB === 'VENCIDO' || estadoPagoSaaSDB === 'POR_COBRAR');

  const handleConfirmarPagoAprobado = async () => {
    try {
      setGenerando(true);
      await api.post('/configuracion/confirmar-pago-saas').catch(() => null);
      await cargarConfig();

      const codigoFac = `FAC-${periodoSeleccionado.replace('-', '')}-${Date.now().toString().slice(-4)}`;
      const nuevaCuenta = {
        id: String(Date.now()),
        codigoFactura: codigoFac,
        periodo: periodoSeleccionado,
        plan: activePlan.nombre,
        badge: activePlan.badge,
        frecuencia,
        montoTotal: montoActualCalculado,
        fechaEmision: new Date().toISOString().split('T')[0],
        fechaVencimiento: fechaVencStr || `${periodoSeleccionado}-30`,
        estado: 'PAGADO',
        metodoPago: 'WOMPI_PSE',
      };

      setLicencias((prev) => {
        const seguras = Array.isArray(prev) ? prev : [];
        const sinDuplicados = seguras.filter((l) => l.codigoFactura !== codigoFac);
        const resultado = [nuevaCuenta, ...sinDuplicados];
        localStorage.setItem('aquarural-licencias-software-v1', JSON.stringify(resultado));
        if (nitAcueducto) {
          localStorage.setItem(`aquarural-licencias-${nitAcueducto}`, JSON.stringify(resultado));
        }
        return resultado;
      });

      setMensajeExito(`¡Pago de renovación por $${montoActualCalculado.toLocaleString()} COP registrado exitosamente! Se emitió la cuenta de cobro pagada ${codigoFac} en el historial.`);
    } catch (e) {
      setError('Error al confirmar pago.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in font-headline">
      {/* Header Hydro-Tech Premium */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-3xl">card_membership</span>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
              Licencia & Cobro del Sistema SaaS
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-body">
            Facturación oficial de licenciamiento, mantenimiento y soporte técnico expedida por la plataforma a la Junta Directiva de {nombreAcueducto}.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 shadow-inner whitespace-nowrap shrink-0 flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 whitespace-nowrap">Plan Sincronizado:</span>
            <span className="text-xs font-black text-cyan-400 whitespace-nowrap">{activePlan.badge}</span>
          </div>
        </div>
      </div>

      {/* Banner Destacado de Licencia Vencida */}
      {estaLicenciaVencida && (
        <div className="bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-3xl">warning</span>
            <div>
              <h3 className="text-amber-300 font-extrabold text-sm font-headline flex items-center gap-2">
                <span>⚠️ Licencia SaaS Expirada ({fechaVencStr || 'Vencido'})</span>
                <span className="bg-amber-500/30 text-amber-300 border border-amber-500/50 text-[10px] px-2 py-0.5 rounded-full">Cobro Pendiente</span>
              </h3>
              <p className="text-slate-300 text-xs font-body mt-0.5">
                La vigencia de la licencia del software para <strong className="text-white">{nombreAcueducto}</strong> ha finalizado. Realiza el pago de renovación para evitar la suspensión del servicio.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleIniciarPagoWompiSaaS({ montoTotal: montoActualCalculado, codigoFactura: `RENOVACION-${periodoSeleccionado}` })}
              className="bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-extrabold px-5 py-3 rounded-2xl text-xs font-headline shadow-xl flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105"
            >
              <span className="material-symbols-outlined text-base">credit_card</span>
              <span>Pagar Wompi / PSE (${montoActualCalculado.toLocaleString()} COP)</span>
            </button>
            <button
              onClick={handleConfirmarPagoAprobado}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-3 rounded-2xl text-xs font-headline shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Confirmar Pago Aprobado</span>
            </button>
          </div>
        </div>
      )}

      {mensajeExito && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito('')} className="hover:text-white">✕</button>
        </div>
      )}

      {/* Tarjeta de Plan Sincronizado en Tiempo Real desde SuperAdmin */}
      <div className="bg-white dark:bg-slate-900 border-2 border-cyan-200/80 dark:border-cyan-500/30 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-500/20 border border-cyan-200 dark:border-cyan-500/40 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-cyan-600 dark:text-cyan-400">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{activePlan.nombre}</h3>
                <span className="bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 text-[11px] font-black px-3 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-500/40">
                  {activePlan.rango}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Acueducto: <strong className="text-slate-800 dark:text-slate-200">{nombreAcueducto}</strong> • NIT: <strong className="text-slate-800 dark:text-slate-200">{nitAcueducto}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Tarifa Oficial Licencia</span>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              ${montoActualCalculado.toLocaleString()} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">COP</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Modalidad: <strong className="text-slate-800 dark:text-slate-200">{frecuencia}</strong></p>
          </div>

          <div className="bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">Fecha Registro / Afiliación Licencia</span>
            <p className="text-base font-black text-emerald-950 dark:text-emerald-300 font-mono">{fechaInicioStr}</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">✓ Arranque de Licencia</p>
          </div>

          <div className="bg-cyan-50/70 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-800 dark:text-cyan-400 block">Fecha Vencimiento Cobertura</span>
            <p className="text-base font-black text-cyan-950 dark:text-cyan-300 font-mono">{fechaVencStr}</p>
            <p className="text-[11px] text-cyan-700 dark:text-cyan-400 font-bold">
              {frecuencia === 'ANUAL' ? 'Cobertura 12 Meses' : 'Cobertura Mensual'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Facturas de Licencia Expedidas a la Junta */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
            Historial de Cuentas de Cobro de Software (Junta Directiva)
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Mostrando {licencias.length} comprobantes expedidos
          </span>
        </div>

        {licencias.length === 0 ? (
          <div className="p-8 text-center space-y-2 text-slate-400">
            <span className="material-symbols-outlined text-4xl">receipt_long</span>
            <p className="text-xs font-bold">No hay cuentas de cobro de software expedidas aún.</p>
            <p className="text-[11px]">Presiona el botón superior para expedir la cuenta de cobro del periodo {periodoSeleccionado}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-headline">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-400 uppercase text-[10px] font-black">
                  <th className="py-3 px-4">Código Factura</th>
                  <th className="py-3 px-4">Periodo</th>
                  <th className="py-3 px-4">Plan / Cobertura</th>
                  <th className="py-3 px-4">Monto Total</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {licencias.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-700 dark:text-cyan-400">{item.codigoFactura}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">{item.periodo}</td>
                    <td className="py-3 px-4 font-medium">{item.plan} ({item.frecuencia})</td>
                    <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-slate-100">${item.montoTotal.toLocaleString()} COP</td>
                    <td className="py-3 px-4">
                      {(item.estado === 'PAGADO' || item.estado === 'PAGADA') ? (
                        <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
                          ✓ PAGADA POR LA JUNTA
                        </span>
                      ) : (
                        <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase">
                          ⏳ PENDIENTE DE PAGO
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {item.estado === 'PENDIENTE' ? (
                        <button
                          type="button"
                          onClick={() => handleIniciarPagoWompiSaaS(item)}
                          className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 inline-flex"
                        >
                          <span className="material-symbols-outlined text-sm">credit_card</span>
                          <span>Pagar con Wompi</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-extrabold">✓ Verificado</span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setLicenciaAImprimir(item);
                          setMostrarModalImpresion(true);
                        }}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        🖨️ Comprobante
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl font-headline">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Comprobante Oficial de Licenciamiento</h4>
              <button onClick={() => setMostrarModalImpresion(false)} className="text-slate-400 hover:text-slate-700 text-base">✕</button>
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
                className="w-2/3 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow"
              >
                🖨️ Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenciaSoftwarePage;
