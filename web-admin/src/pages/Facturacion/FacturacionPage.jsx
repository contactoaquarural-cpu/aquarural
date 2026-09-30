import React, { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';
import Dropdown from '../../components/Dropdown';

const periodoActualISO = () => new Date().toISOString().slice(0, 7);

// Suma/resta meses a un período YYYY-MM sin depender de aritmética de
// fechas con día fijo (evita el bug clásico de desbordar a otro mes por
// zonas horarias) — se opera directamente sobre año/mes como enteros.
const sumarMesesAPeriodo = (periodo, delta) => {
  const [anio, mes] = periodo.split('-').map(Number);
  const fecha = new Date(anio, mes - 1 + delta, 1);
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
};

const formatPeriodoLargo = (periodo) => {
  const [anio, mes] = periodo.split('-').map(Number);
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
};

const FacturacionPage = () => {
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const nitAcueducto = useConfigStore((s) => s.nit || '');
  const municipioConfig = useConfigStore((s) => s.municipio || '');
  const departamentoConfig = useConfigStore((s) => s.departamento || '');
  const diaLimitePago = useConfigStore((s) => s.diaLimitePago || 15);

  // Antes era una constante fijada al mes calendario actual — sin selector,
  // al cambiar de mes esta pantalla dejaba de mostrar el período anterior
  // por completo, sin forma de reabrirlo (las facturas seguían existiendo en
  // la base de datos, solo dejaban de listarse aquí). Ahora es un estado
  // navegable, por defecto en el mes actual.
  const [periodo, setPeriodo] = useState(periodoActualISO());
  const esPeriodoActual = periodo === periodoActualISO();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [ordenamiento, setOrdenamiento] = useState('nombre');

  const [facturaACobrar, setFacturaACobrar] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [mostrarModalVaciar, setMostrarModalVaciar] = useState(false);
  const [facturaAImprimir, setFacturaAImprimir] = useState(null);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);
  const [mostrarModalImpresionMasiva, setMostrarModalImpresionMasiva] = useState(false);
  const [avanceLecturas, setAvanceLecturas] = useState(null);

  useEffect(() => {
    cargarFacturas();
    cargarAvanceLecturas();
  }, [periodo]);

  const cargarAvanceLecturas = async () => {
    try {
      const { data } = await api.get('/asociados/estadisticas-lecturas');
      setAvanceLecturas(data.data);
    } catch {
      setAvanceLecturas(null);
    }
  };

  const cargarFacturas = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/facturas', { params: { periodo, limit: 1000 } });
      setFacturas(Array.isArray(data?.data?.facturas) ? data.data.facturas : []);
    } catch (e) {
      setError(e.response?.data?.message || 'Error al cargar las cuentas de cobro.');
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarFacturacion = async () => {
    setGenerando(true);
    setError('');
    setMensajeExito('');
    try {
      const { data } = await api.post('/facturas/generar-masiva', { periodo });
      const { creadas, omitidas, sinLectura, errores } = data.data;
      setMensajeExito(
        `Se generaron ${creadas} cuentas de cobro nuevas para ${periodo}` +
          (omitidas ? ` (${omitidas} ya existían).` : '.') +
          (sinLectura ? ` ${sinLectura} suscriptores con medidor no se facturaron por falta de lectura de este ciclo.` : '') +
          (errores?.length ? ` ${errores.length} con errores.` : '')
      );
      await cargarFacturas();
      await cargarAvanceLecturas();
    } catch (e) {
      setError(e.response?.data?.message || 'Error al generar la facturación.');
    } finally {
      setGenerando(false);
    }
  };

  const handleVaciarFacturasPeriodo = async () => {
    setMostrarModalVaciar(false);
    try {
      await api.delete('/facturas/anular-periodo', { params: { periodo } });
      setMensajeExito(`Se anularon las cuentas de cobro pendientes/vencidas del periodo ${periodo}.`);
      await cargarFacturas();
    } catch (e) {
      setError(e.response?.data?.message || 'Error al anular el periodo.');
    }
  };

  const handleConfirmarPagoEfectivo = async () => {
    if (!facturaACobrar) return;
    setProcesandoPago(true);
    setError('');
    try {
      const { data } = await api.post(`/facturas/${facturaACobrar._id}/pago-efectivo`, {});
      setMensajeExito(`Pago de $${(data.data.montoTotal).toLocaleString()} COP registrado para ${nombreCompleto(facturaACobrar)}.`);
      setFacturaAImprimir(data.data);
      setMostrarModalImpresion(true);
      setFacturaACobrar(null);
      await cargarFacturas();
    } catch (e) {
      setError(e.response?.data?.message || 'Error al registrar el pago.');
    } finally {
      setProcesandoPago(false);
    }
  };

  const nombreCompleto = (f) => `${f.asociadoId?.nombres || ''} ${f.asociadoId?.apellidos || ''}`.trim();

  const totalFacturas = facturas.length;
  const pagadas = facturas.filter((f) => f.estado === 'PAGADA');
  const pendientes = facturas.filter((f) => f.estado === 'PENDIENTE' || f.estado === 'VENCIDA');
  const sumaPagadas = pagadas.reduce((acc, f) => acc + f.montoTotal, 0);
  const sumaPendientes = pendientes.reduce((acc, f) => acc + f.montoTotal, 0);

  const facturasFiltradas = facturas
    .filter((f) => {
      const q = busqueda.toLowerCase().trim();
      if (q) {
        const nombre = nombreCompleto(f).toLowerCase();
        const cedula = String(f.asociadoId?.cedula || '').toLowerCase();
        const matricula = (f.asociadoId?.matricula || '').toLowerCase();
        const codigo = (f.codigoFactura || '').toLowerCase();
        if (!nombre.includes(q) && !cedula.includes(q) && !matricula.includes(q) && !codigo.includes(q)) return false;
      }
      if (filtroEstado !== 'TODOS' && f.estado !== filtroEstado) return false;
      return true;
    })
    .sort((a, b) => {
      if (ordenamiento === 'nombre') return nombreCompleto(a).localeCompare(nombreCompleto(b), 'es');
      if (ordenamiento === 'matricula') return (a.asociadoId?.matricula || '').localeCompare(b.asociadoId?.matricula || '');
      if (ordenamiento === 'monto') return b.montoTotal - a.montoTotal;
      return 0;
    });

  const handleExportarExcel = () => {
    if (facturas.length === 0) {
      setError('No hay facturas registradas en este periodo para exportar.');
      return;
    }

    const headers = [
      'CODIGO_FACTURA', 'PERIODO', 'DOCUMENTO_SUSCRIPTOR', 'NOMBRE_SUSCRIPTOR', 'MATRICULA',
      'CONSUMO_M3', 'CARGO_FIJO_COP', 'VALOR_CONSUMO_COP', 'APORTE_PLATAFORMA_COP', 'MONTO_MORA_COP', 'COMISION_WOMPI_COP', 'TOTAL_FACTURADO_COP',
      'ESTADO_FACTURA', 'METODO_PAGO', 'REFERENCIA_WOMPI',
    ];

    const rows = facturas.map((f) => [
      `"${f.codigoFactura}"`,
      `"${f.periodo}"`,
      `"${f.asociadoId?.cedula || ''}"`,
      `"${nombreCompleto(f).replace(/"/g, '""')}"`,
      `"${f.asociadoId?.matricula || ''}"`,
      f.consumoM3 || 0,
      f.montoCargoFijo || 0,
      f.montoConsumo || 0,
      f.montoRecargoLicencia || 0,
      f.montoMora || 0,
      f.montoComisionWompi || 0,
      f.montoTotal + (f.montoComisionWompi || 0),
      `"${f.estado}"`,
      `"${f.metodoPago || 'SIN_PAGAR'}"`,
      `"${f.referenciaWompi || ''}"`,
    ].join(';'));

    const csvContent = '﻿' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `REPORTE_FACTURACION_${periodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="no-print-bg p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 font-body">
        {/* HEADER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
                  Recaudo & Emisión de Facturas
                </h1>
                <p className="text-xs text-slate-500 capitalize">
                  {esPeriodoActual ? 'Ciclo vigente: ' : 'Viendo periodo: '}{formatPeriodoLargo(periodo)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportarExcel}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span className="hidden sm:inline">Exportar (CSV)</span>
            </button>

            {facturas.length > 0 && (
              <button
                type="button"
                onClick={() => setMostrarModalImpresionMasiva(true)}
                className="bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] border border-blue-200 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span className="hidden sm:inline">Imprimir Lote ({facturasFiltradas.length})</span>
                <span className="sm:hidden">({facturasFiltradas.length})</span>
              </button>
            )}

            {/* "Anular Periodo" es destructivo — separado con margen extra del
                botón principal para reducir el riesgo de un clic equivocado. */}
            {facturas.length > 0 && (
              <button
                type="button"
                onClick={() => setMostrarModalVaciar(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer sm:mr-4"
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
                <span className="hidden sm:inline">Anular Periodo</span>
              </button>
            )}

            <div className="h-8 w-px bg-slate-200" />

            <button
              type="button"
              onClick={handleGenerarFacturacion}
              disabled={generando}
              style={{ color: '#ffffff' }}
              className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-headline font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>{generando ? 'Emitiendo...' : `Emitir Facturación (${periodo})`}</span>
            </button>
            </div>
          </div>
        </div>

        {/* El avance de lecturas siempre describe el ciclo real en curso
            (el backend no acepta período), así que solo tiene sentido
            mostrarlo mientras se está viendo ese mismo mes actual. */}
        {esPeriodoActual && avanceLecturas && avanceLecturas.totalConMedidor > 0 && avanceLecturas.pendientes > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center gap-2.5 text-amber-800 text-xs font-headline shadow-sm">
            <span className="material-symbols-outlined text-lg">water_ec</span>
            <p className="font-semibold">
              Avance de lecturas del ciclo: {avanceLecturas.registrados} de {avanceLecturas.totalConMedidor} predios con medidor ({avanceLecturas.porcentajeAvance}%).
              Los {avanceLecturas.pendientes} predios pendientes no se facturarán hasta tener lectura registrada.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-center justify-between text-red-700 text-xs font-headline shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg">error</span>
              <p className="font-semibold">{error}</p>
            </div>
            <button onClick={() => setError('')} className="hover:opacity-70">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {mensajeExito && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 flex items-center justify-between text-emerald-800 text-xs font-headline shadow-sm animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
              <p className="font-semibold">{mensajeExito}</p>
            </div>
            <button onClick={() => setMensajeExito('')} className="text-emerald-600 hover:text-emerald-800">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* TARJETAS RESUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Total Recaudado (Mes)</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">${sumaPagadas.toLocaleString()} COP</h3>
              <p className="text-[11px] text-slate-500 mt-1">{pagadas.length} de {totalFacturas} facturas pagadas</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Cartera por Cobrar</p>
              <h3 className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">${sumaPendientes.toLocaleString()} COP</h3>
              <p className="text-[11px] text-slate-500 mt-1">{pendientes.length} facturas pendientes</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined text-xl">pending_actions</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Efectividad de Recaudo</p>
              <h3 className="text-2xl font-extrabold text-[#1D4ED8] font-mono mt-0.5">
                {totalFacturas > 0 ? Math.round((pagadas.length / totalFacturas) * 100) : 0}%
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Periodo activo {periodo}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8]">
              <span className="material-symbols-outlined text-xl">analytics</span>
            </div>
          </div>
        </div>

        {/* BÚSQUEDA Y FILTROS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            <div className="relative sm:col-span-2 lg:col-span-4">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input
                type="text"
                placeholder="Buscar suscriptor, cédula, matrícula o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] font-body transition-colors"
              />
            </div>

            <div className="lg:col-span-3">
              <Dropdown
                value={ordenamiento}
                onChange={setOrdenamiento}
                options={[
                  { value: 'nombre', label: 'Nombre (A - Z)' },
                  { value: 'matricula', label: 'N° Matrícula' },
                  { value: 'monto', label: 'Monto Facturado' },
                ]}
              />
            </div>

            <div className="lg:col-span-2">
              <Dropdown
                value={filtroEstado}
                onChange={setFiltroEstado}
                options={[
                  { value: 'TODOS', label: 'Estado: Todos' },
                  { value: 'PAGADA', label: 'Pagadas' },
                  { value: 'PENDIENTE', label: 'Pendientes' },
                  { value: 'VENCIDA', label: 'Vencidas' },
                ]}
              />
            </div>

            {/* Selector de período — antes vivía en el header como
                flechas + texto; se movió aquí junto al resto de filtros
                de la tabla, que es donde el admin ya espera controlar
                qué se está mostrando. */}
            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-2xl px-2 py-1.5">
              <button
                type="button"
                onClick={() => setPeriodo((p) => sumarMesesAPeriodo(p, -1))}
                className="w-7 h-7 rounded-lg hover:bg-white text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Mes anterior"
              >
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <span className="flex-1 text-center text-xs font-headline font-bold text-slate-800 capitalize truncate">
                {formatPeriodoLargo(periodo)}
              </span>
              <button
                type="button"
                onClick={() => setPeriodo((p) => sumarMesesAPeriodo(p, 1))}
                disabled={esPeriodoActual}
                className="w-7 h-7 rounded-lg hover:bg-white text-slate-500 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                title="Mes siguiente"
              >
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>

            {!esPeriodoActual && (
              <div className="sm:col-span-2 lg:col-span-12 -mt-1">
                <button
                  type="button"
                  onClick={() => setPeriodo(periodoActualISO())}
                  className="text-[11px] font-bold text-[#1D4ED8] hover:underline"
                >
                  Volver al mes actual
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TABLA — mismo patrón visual que SuperAdmin/AcueductosPage */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1D4ED8]">receipt_long</span>
              <h2 className="text-base font-extrabold text-gray-800 font-headline">Cuentas de Cobro del Periodo</h2>
            </div>
            <span className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              Mostrando {facturasFiltradas.length} de {totalFacturas} facturas
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <span className="material-symbols-outlined text-3xl animate-spin text-[#1D4ED8]">sync</span>
              <p className="text-xs font-headline">Cargando cuentas de cobro...</p>
            </div>
          ) : facturasFiltradas.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
              <p className="text-sm font-headline font-bold text-gray-700">
                {facturas.length === 0 ? 'Aún no se ha emitido la facturación de este periodo' : 'No se encontraron cuentas de cobro con los filtros aplicados'}
              </p>
              <p className="text-xs text-gray-500">
                {facturas.length === 0 ? `Presiona "Emitir Facturación (${periodo})" para generarla.` : 'Intenta ajustar tu búsqueda o filtro de estado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                {/* <colgroup> fija el ancho de la columna de acción para que no
                    absorba el espacio sobrante de la tabla (ver LecturasPage/
                    AcueductosPage — un width en <th>/<td> se ignora en tablas
                    border-collapse con table-layout automático). */}
                <colgroup>
                  <col />
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
                    <th className="py-3.5 px-6">Código Factura</th>
                    <th className="py-3.5 px-4">Suscriptor</th>
                    <th className="py-3.5 px-4">Matrícula</th>
                    <th className="py-3.5 px-4">Valor Total</th>
                    <th className="py-3.5 px-4">Vencimiento</th>
                    <th className="py-3.5 px-4">Medio de Pago</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-6 whitespace-nowrap">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-body text-gray-700">
                  {facturasFiltradas.map((f, i) => (
                    <tr
                      key={f._id}
                      className={`hover:bg-gray-50/50 transition-colors border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}
                    >
                      <td className="py-5 px-6 font-mono font-bold text-[#1D4ED8] whitespace-nowrap">{f.codigoFactura}</td>
                      <td className="py-5 px-4 font-bold text-gray-900 whitespace-nowrap">{nombreCompleto(f)}</td>
                      <td className="py-5 px-4 text-gray-500 font-mono">{f.asociadoId?.matricula}</td>
                      <td className="py-5 px-4 font-extrabold text-gray-900 font-mono text-sm whitespace-nowrap">
                        ${f.montoTotal.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">COP</span>
                      </td>
                      <td className="py-5 px-4 text-gray-500 font-mono text-xs whitespace-nowrap">
                        {new Date(f.fechaVencimiento).toISOString().split('T')[0]}
                      </td>
                      <td className="py-5 px-4">
                        {f.metodoPago === 'WOMPI' ? (
                          <span className="bg-blue-50 text-[#1D4ED8] border border-blue-200 px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                            <span className="material-symbols-outlined text-xs">credit_card</span>
                            Wompi
                          </span>
                        ) : f.metodoPago === 'EFECTIVO_OFICINA' ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 whitespace-nowrap">
                            <span className="material-symbols-outlined text-xs">payments</span>
                            Efectivo
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-5 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-headline font-extrabold inline-flex items-center gap-1 whitespace-nowrap ${
                            f.estado === 'PAGADA'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : f.estado === 'VENCIDA'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${f.estado === 'PAGADA' ? 'bg-emerald-500' : f.estado === 'VENCIDA' ? 'bg-red-500' : 'bg-amber-500'}`} />
                          {f.estado}
                        </span>
                      </td>
                      <td className="py-5 px-6 whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => { setFacturaAImprimir(f); setMostrarModalImpresion(true); }}
                          className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-xl font-headline font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                          <span>{f.estado === 'PAGADA' ? 'Recibo' : 'Factura'}</span>
                        </button>
                        {f.estado !== 'PAGADA' ? (
                          <button
                            onClick={() => setFacturaACobrar(f)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-headline font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">point_of_sale</span>
                            <span className="hidden sm:inline">Cobrar Efectivo</span>
                            <span className="sm:hidden">Cobrar</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-extrabold inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Cobrada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL COBRO EFECTIVO */}
        {facturaACobrar && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">point_of_sale</span>
                  <h3 className="text-base font-extrabold text-slate-800 font-headline">Cobro en Efectivo en Ventanilla</h3>
                </div>
                <button onClick={() => setFacturaACobrar(null)} className="text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-body">
                <p className="text-slate-500">Suscriptor: <strong className="text-slate-800">{nombreCompleto(facturaACobrar)}</strong></p>
                <p className="text-slate-500">Factura: <strong className="text-[#1D4ED8] font-mono">{facturaACobrar.codigoFactura}</strong></p>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-headline">
                  <span className="text-slate-700 font-bold">Total a Cobrar:</span>
                  <span className="text-emerald-600 font-extrabold text-base font-mono">${facturaACobrar.montoTotal.toLocaleString()} COP</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFacturaACobrar(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={procesandoPago}
                  onClick={handleConfirmarPagoEfectivo}
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold font-headline py-3 rounded-2xl shadow-sm text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span>{procesandoPago ? 'Registrando...' : 'Confirmar Pago'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ANULAR PERIODO */}
        {mostrarModalVaciar && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-red-600 font-bold font-headline">
                  <span className="material-symbols-outlined text-2xl">delete_sweep</span>
                  <h3 className="text-base font-extrabold text-slate-800">Anular Facturación ({periodo})</h3>
                </div>
                <button onClick={() => setMostrarModalVaciar(false)} className="text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-2 text-xs font-body">
                <p className="text-red-700 font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">warning</span>
                  ¿Seguro que deseas anular las cuentas de cobro pendientes de este periodo?
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Se marcarán como ANULADAS las facturas pendientes/vencidas del periodo <b>{periodo}</b>. Las ya pagadas no se ven afectadas.
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setMostrarModalVaciar(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleVaciarFacturasPeriodo}
                  className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-extrabold font-headline py-3 rounded-2xl shadow-sm text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete_forever</span>
                  <span>Sí, Anular Periodo</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL IMPRESIÓN TICKET INDIVIDUAL — siempre blanco/negro, es para
          imprimir en papel térmico, no debe seguir el tema del panel. */}
      {mostrarModalImpresion && facturaAImprimir && (
        <div className="modal-impresion-backdrop fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <style>{`
            @media print {
              .no-print-bg, aside, nav, header, footer, .print\\:hidden { display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; }
              html, body, main { background: white !important; color: black !important; margin: 0 !important; padding: 0 !important; height: auto !important; min-height: 0 !important; overflow: visible !important; }
              .modal-impresion-backdrop { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; background: white !important; backdrop-filter: none !important; display: block !important; z-index: 99999 !important; }
              .modal-impresion-card { position: relative !important; left: 0 !important; top: 0 !important; width: 76mm !important; max-width: 76mm !important; margin-left: 6mm !important; margin-top: 2mm !important; padding: 2mm !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; background: white !important; color: black !important; }
              @page { size: letter portrait; margin: 6mm; }
            }
          `}</style>

          <div className="modal-impresion-card bg-white text-slate-900 rounded-3xl p-5 max-w-sm w-full flex flex-col max-h-[90vh] shadow-2xl transition-all">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600">receipt</span>
                <h3 className="font-extrabold font-headline text-sm text-slate-900">Imprimir Ticket POS (80mm)</h3>
              </div>
              <button
                type="button"
                onClick={() => { setMostrarModalImpresion(false); setFacturaAImprimir(null); }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 font-mono text-xs max-w-[320px] mx-auto text-slate-900 print:max-w-none print:w-full">
              <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-2">
                <h2 className="text-sm font-extrabold font-headline uppercase tracking-tight text-slate-950">{nombreAcueducto}</h2>
                <p className="text-[10px] text-slate-600">NIT: {nitAcueducto} • {municipioConfig}, {departamentoConfig}</p>
                <p className="text-[10px] font-bold text-cyan-800 font-headline uppercase">
                  {facturaAImprimir.estado === 'PAGADA' ? 'Comprobante Oficial de Pago' : 'Cuenta de Cobro / Factura del Mes'}
                </p>
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between"><span className="text-slate-500">N° Factura:</span><span className="font-bold text-slate-900">{facturaAImprimir.codigoFactura}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Periodo:</span><span className="font-bold text-slate-900">{facturaAImprimir.periodo}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Suscriptor:</span><span className="font-bold text-slate-950">{nombreCompleto(facturaAImprimir)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Cédula:</span><span className="text-slate-900">{facturaAImprimir.asociadoId?.cedula || 'S/D'}</span></div>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                <p className="font-bold font-headline text-[10px] text-slate-950 uppercase">Detalle del Mes:</p>
                <div className="space-y-1 text-[11px]">
                  {facturaAImprimir.consumoM3 > 0 && (
                    <div className="flex justify-between text-slate-600"><span>Consumo del Mes:</span><span>{facturaAImprimir.consumoM3} m³</span></div>
                  )}
                  <div className="flex justify-between text-slate-700"><span>Cargo Fijo:</span><span>${(facturaAImprimir.montoCargoFijo || 0).toLocaleString()} COP</span></div>
                  {facturaAImprimir.montoConsumo > 0 && (
                    <div className="flex justify-between text-slate-700"><span>Valor Consumo:</span><span>${facturaAImprimir.montoConsumo.toLocaleString()} COP</span></div>
                  )}
                  {facturaAImprimir.montoRecargoLicencia > 0 && (
                    <div className="flex justify-between text-slate-700"><span>Aporte Plataforma AquaRural:</span><span>${facturaAImprimir.montoRecargoLicencia.toLocaleString()} COP</span></div>
                  )}
                  {facturaAImprimir.montoMora > 0 && (
                    <div className="flex justify-between text-red-700"><span>Recargo por Mora:</span><span>${facturaAImprimir.montoMora.toLocaleString()} COP</span></div>
                  )}
                  {facturaAImprimir.montoComisionWompi > 0 && (
                    <div className="flex justify-between text-slate-700"><span>Comisión pasarela de pago:</span><span>${facturaAImprimir.montoComisionWompi.toLocaleString()} COP</span></div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs font-extrabold font-headline">
                  <span className="text-slate-950">{facturaAImprimir.estado === 'PAGADA' ? 'TOTAL CANCELADO:' : 'TOTAL A PAGAR:'}</span>
                  <span className={facturaAImprimir.estado === 'PAGADA' ? 'text-emerald-700 text-sm' : 'text-cyan-800 text-sm'}>
                    ${(facturaAImprimir.montoTotal + (facturaAImprimir.montoComisionWompi || 0)).toLocaleString()} COP
                  </span>
                </div>

                {facturaAImprimir.estado === 'PAGADA' ? (
                  <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-xl text-center space-y-0.5">
                    <p className="text-[11px] font-extrabold text-emerald-800 font-headline uppercase">✅ PAGO CONFIRMADO — EN REGLA</p>
                    <p className="text-[9px] text-emerald-700">Método: {facturaAImprimir.metodoPago === 'EFECTIVO_OFICINA' ? 'Efectivo en Oficina' : 'Digital Wompi'}</p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl text-center space-y-0.5">
                    <p className="text-[11px] font-extrabold text-amber-800 font-headline uppercase">⏳ FACTURA PENDIENTE DE PAGO</p>
                    <p className="text-[9px] text-amber-800 font-bold">Fecha Límite: {new Date(facturaAImprimir.fechaVencimiento).toISOString().split('T')[0]}</p>
                  </div>
                )}
              </div>

              <div className="text-center pt-2 space-y-0.5 text-[9px] text-slate-500 border-t border-dashed border-slate-300">
                <p className="font-bold text-slate-800">¡Gracias por apoyar a tu Acueducto Veredal!</p>
                <p>Agua potable y salud para nuestra tierra.</p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-200 shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => { setMostrarModalImpresion(false); setFacturaAImprimir(null); }}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-headline py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold font-headline py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span>Imprimir Ticket POS (80mm)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRESIÓN LOTE MASIVO — mismo criterio: siempre blanco/negro */}
      {mostrarModalImpresionMasiva && (
        <div className="modal-impresion-masiva-backdrop fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <style>{`
            @media print {
              .no-print-bg, aside, nav, header, footer, .print\\:hidden { display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; }
              html, body, main { background: white !important; color: black !important; margin: 0 !important; padding: 0 !important; height: auto !important; min-height: 0 !important; overflow: visible !important; }
              .modal-impresion-masiva-backdrop { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; height: auto !important; min-height: 0 !important; padding: 0 !important; margin: 0 !important; background: white !important; backdrop-filter: none !important; display: block !important; z-index: 99999 !important; }
              .modal-impresion-masiva-card { background: white !important; box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; }
              .ticket-item-masivo { position: relative !important; width: 76mm !important; max-width: 76mm !important; margin-left: 6mm !important; margin-top: 0 !important; margin-bottom: 12mm !important; padding-top: 6mm !important; padding-bottom: 2mm !important; padding-left: 2mm !important; padding-right: 2mm !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; background: white !important; color: black !important; page-break-inside: avoid !important; break-inside: avoid !important; }
              @page { size: letter portrait; margin-top: 15mm !important; margin-bottom: 12mm !important; margin-left: 6mm !important; margin-right: 6mm !important; }
            }
          `}</style>

          <div className="modal-impresion-masiva-card bg-white text-slate-900 rounded-3xl p-6 max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl transition-all">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600 text-2xl">print</span>
                <div>
                  <h3 className="font-extrabold font-headline text-base text-slate-900">Impresión Masiva en Lote ({facturasFiltradas.length} Facturas)</h3>
                  <p className="text-xs text-slate-500">Periodo {periodo} • Tira continua para distribución veredal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMostrarModalImpresionMasiva(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2 print:py-0 print:space-y-0 print:pr-0">
              {facturasFiltradas.map((f) => (
                <div key={f._id} className="ticket-item-masivo bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 font-mono text-xs max-w-[320px] mx-auto text-slate-900">
                  <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-2">
                    <h2 className="text-sm font-extrabold font-headline uppercase tracking-tight text-slate-950">{nombreAcueducto}</h2>
                    <p className="text-[10px] text-slate-600">NIT: {nitAcueducto} • {municipioConfig}, {departamentoConfig}</p>
                    <p className="text-[10px] font-bold text-cyan-800 font-headline uppercase">
                      {f.estado === 'PAGADA' ? 'Comprobante Oficial de Pago' : 'Cuenta de Cobro / Factura del Mes'}
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                    <div className="flex justify-between"><span className="text-slate-500">N° Factura:</span><span className="font-bold text-slate-900">{f.codigoFactura}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Periodo:</span><span className="font-bold text-slate-900">{f.periodo}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Suscriptor:</span><span className="font-bold text-slate-950">{nombreCompleto(f)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Cédula:</span><span className="text-slate-900">{f.asociadoId?.cedula || 'S/D'}</span></div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-extrabold font-headline">
                      <span className="text-slate-950">{f.estado === 'PAGADA' ? 'TOTAL CANCELADO:' : 'TOTAL A PAGAR:'}</span>
                      <span className={f.estado === 'PAGADA' ? 'text-emerald-700 text-sm' : 'text-cyan-800 text-sm'}>${(f.montoTotal + (f.montoComisionWompi || 0)).toLocaleString()} COP</span>
                    </div>
                    {f.estado === 'PAGADA' ? (
                      <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-xl text-center"><p className="text-[10px] font-extrabold text-emerald-800 font-headline uppercase">✅ PAGO CONFIRMADO</p></div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl text-center"><p className="text-[10px] font-extrabold text-amber-800 font-headline uppercase">⏳ PENDIENTE</p></div>
                    )}
                  </div>

                  <div className="pt-3 border-t-2 border-dashed border-slate-300 text-center text-[9px] text-slate-400 select-none">
                    ✂ ---------------- CORTAR AQUÍ ---------------- ✂
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-3 border-t border-slate-200 shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => setMostrarModalImpresionMasiva(false)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-2/3 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-extrabold font-headline py-3 rounded-2xl shadow-lg shadow-cyan-500/20 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span>Imprimir Lote Masivo ({facturasFiltradas.length} Facturas)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

class FacturacionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FacturacionPage Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto space-y-6 text-center mt-12 font-headline animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-4">
            <span className="material-symbols-outlined text-amber-500 text-5xl">warning</span>
            <h2 className="text-xl font-extrabold text-slate-800">Error cargando Facturación</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-body">Ocurrió un error inesperado en esta vista. Intenta recargar la página.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const FacturacionPageWrapper = () => (
  <FacturacionErrorBoundary>
    <FacturacionPage />
  </FacturacionErrorBoundary>
);

export default FacturacionPageWrapper;
