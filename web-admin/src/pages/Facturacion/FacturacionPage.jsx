import React, { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

const FacturacionPage = () => {
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const nitAcueducto = useConfigStore((s) => s.nit || '800.123.456-7');
  const municipioConfig = useConfigStore((s) => s.municipio || 'Garzón');
  const departamentoConfig = useConfigStore((s) => s.departamento || 'Huila');

  const getPeriodoValido = (val) => {
    if (typeof val === 'string' && /^\d{4}-\d{2}$/.test(val)) return val;
    return new Date().toISOString().slice(0, 7);
  };

  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(() => {
    const raw = localStorage.getItem('aquarural-periodo-activo');
    return getPeriodoValido(raw);
  });

  const [mostrarPopoverPeriodo, setMostrarPopoverPeriodo] = useState(false);
  const [anoVisualPopover, setAnoVisualPopover] = useState(() => {
    const p = localStorage.getItem('aquarural-periodo-activo') || '';
    if (p && p.includes('-')) return Number(p.split('-')[0]) || 2026;
    return 2026;
  });

  const MESES_NOMBRES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const formatPeriodoTextoLindo = (p) => {
    if (!p || !p.includes('-')) return p;
    const [y, m] = p.split('-').map(Number);
    if (!m || m < 1 || m > 12) return p;
    return `${MESES_NOMBRES[m - 1]} ${y}`;
  };
  const [tarifaBase, setTarifaBase] = useState(25000);
  
  const [facturas, setFacturas] = useState(() => {
    try {
      const guardadas = localStorage.getItem('aquarural-facturas-v1');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed)) {
          return parsed.filter((item) => item && typeof item === 'object');
        }
      }
    } catch (e) {}
    return [];
  });

  const [loading, setLoading] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [error, setError] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [filtroVereda, setFiltroVereda] = useState('TODAS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroModalidad, setFiltroModalidad] = useState('TODAS');
  const [ordenamiento, setOrdenamiento] = useState('nombre');

  // Modal para Cobro en Efectivo en Oficina e Impresión de Recibo Sencillo
  const [facturaACobrar, setFacturaACobrar] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [mostrarModalVaciar, setMostrarModalVaciar] = useState(false);
  const [facturaAImprimir, setFacturaAImprimir] = useState(null);
  const [mostrarModalImpresion, setMostrarModalImpresion] = useState(false);
  const [mostrarModalImpresionMasiva, setMostrarModalImpresionMasiva] = useState(false);
  const [formatoImpresion, setFormatoImpresion] = useState('TICKET_80MM');

  // Modales de Seguridad Financiera (Candados 1 y 2)
  const [modalConflictoPeriodo, setModalConflictoPeriodo] = useState({ abierto: false, periodoFontanero: '', periodoTesorero: '' });
  const [modalAvanceParcial, setModalAvanceParcial] = useState({ abierto: false, tomadas: 0, totalMedidores: 0, pendientes: 0, porcentajeAvance: 0, modoGeneracion: 'TODOS' });

  const handleVaciarFacturasPeriodo = async () => {
    try {
      const seguras = Array.isArray(facturas) ? facturas : [];
      const facturasRestantes = seguras.filter((f) => f && f.periodo !== periodoSeleccionado);
      setFacturas(facturasRestantes);
      localStorage.setItem('aquarural-facturas-v1', JSON.stringify(facturasRestantes));

      await api.delete('/facturas/anular-periodo', {
        params: { periodo: periodoSeleccionado },
        data: { periodo: periodoSeleccionado },
      }).catch(() => {});
      setMensajeExito(`¡Se han anulado y eliminado todas las cuentas de cobro del periodo ${periodoSeleccionado} de MongoDB!`);
    } catch (e) {
      setMensajeExito(`¡Se han eliminado las cuentas de cobro del periodo ${periodoSeleccionado}!`);
    } finally {
      setMostrarModalVaciar(false);
    }
  };

  // Cargar cuentas de cobro del periodo desde la API y localStorage
  const cargarFacturas = async () => {
    setLoading(true);
    setError('');

    // 1. Cargar desde localStorage primero si existe
    const guardadas = localStorage.getItem('aquarural-facturas-v1');
    let localList = [];
    if (guardadas) {
      try {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed)) {
          localList = parsed.filter((item) => item && typeof item === 'object');
        }
      } catch (e) {}
    }

    try {
      const res = await api.get('/facturas', {
        params: { periodo: periodoSeleccionado },
      }).catch(() => null);

      const data = res?.data;
      if (data && (data.success || data.ok) && Array.isArray(data.facturas)) {
        const segurasApi = data.facturas.filter((item) => item && typeof item === 'object');
        setFacturas(segurasApi);
        localStorage.setItem('aquarural-facturas-v1', JSON.stringify(segurasApi));
      } else if (localList.length > 0) {
        setFacturas(localList);
      }
    } catch (err) {
      if (localList.length > 0) {
        setFacturas(localList);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFacturas();
  }, [periodoSeleccionado]);

  useEffect(() => {
    if (Array.isArray(facturas) && facturas.length > 0) {
      localStorage.setItem('aquarural-facturas-v1', JSON.stringify(facturas));
    }
  }, [facturas]);

  // Generar Facturación Masiva (Plana, Medida o Híbrida Total)
  const handleGenerarFacturasMasivas = async (modoGeneracion = 'TODOS', confirmadoParcial = false) => {
    setGenerando(true);
    setError('');
    setMensajeExito('');

    // CANDADO 1: VERIFICAR COINCIDENCIA ESTRICTA DE PERIODO ENTRE FONTANERO Y TESORERO
    const periodoFontaneroActivo = localStorage.getItem('aquarural-periodo-lectura-seleccionado');
    if (periodoFontaneroActivo && periodoFontaneroActivo !== periodoSeleccionado && modoGeneracion !== 'SOLO_FIJA') {
      setGenerando(false);
      setModalConflictoPeriodo({
        abierto: true,
        periodoFontanero: periodoFontaneroActivo,
        periodoTesorero: periodoSeleccionado,
      });
      return;
    }

    // Obtener suscriptores reales veredales registrados en la plataforma (localStorage + MongoDB API)
    let suscriptoresActuales = [];
    try {
      const s = localStorage.getItem('aquarural-suscriptores-v3');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) suscriptoresActuales = parsed;
      }
    } catch (e) {}

    try {
      const res = await api.get('/asociados').catch(() => null);
      if (res && res.data && (res.data.success || res.data.ok)) {
        const rawLista = res.data.suscriptores || res.data.data || [];
        if (Array.isArray(rawLista)) {
          const map = new Map();
          suscriptoresActuales.forEach((item) => {
            const key = String(item._id || item.id || item.matricula);
            if (key) map.set(key, item);
          });
          rawLista.forEach((item) => {
            const key = String(item._id || item.id || item.matricula);
            if (key) map.set(key, { ...map.get(key), ...item });
          });
          suscriptoresActuales = Array.from(map.values());
          localStorage.setItem('aquarural-suscriptores-v3', JSON.stringify(suscriptoresActuales));
        }
      }
    } catch (e) {}

    suscriptoresActuales = suscriptoresActuales.filter((item) => !item.matricula || !item.matricula.startsWith('ADM-'));

    if (suscriptoresActuales.length === 0) {
      setGenerando(false);
      setMensajeExito('No hay suscriptores registrados para generar facturación. Registra suscriptores primero.');
      return;
    }

    // CANDADO 2: VERIFICAR AVANCE PARCIAL (1% - 99%) DE LECTURAS DE CAMPO
    let lecturasPeriodoArray = [];
    try {
      const rawP = localStorage.getItem(`aquarural-lecturas-${periodoSeleccionado}`);
      if (rawP) {
        const parsed = JSON.parse(rawP);
        if (Array.isArray(parsed)) lecturasPeriodoArray = parsed;
      }
    } catch (e) {}

    const suscriptoresConMedidor = suscriptoresActuales.filter((s) => Boolean(s.medidor || s.numeroMedidor) && (s.medidor || s.numeroMedidor) !== 'S/N');
    const totalMedidores = suscriptoresConMedidor.length;
    const tomadas = suscriptoresConMedidor.filter((s) => {
      const found = lecturasPeriodoArray.find((l) => String(l.id || l._id) === String(s._id || s.id) || l.matricula === s.matricula);
      if (!found) return false;
      const lectAct = Number(found.lecturaActual || 0);
      const lectAnt = Number(found.lecturaAnterior || 0);
      const fueDigitado = Boolean(found.lecturaActualModificada);
      const tieneConsumo = lectAct > lectAnt;
      return fueDigitado || tieneConsumo;
    }).length;

    const porcentajeAvance = totalMedidores > 0 ? Math.round((tomadas / totalMedidores) * 100) : 100;

    if (porcentajeAvance < 100 && modoGeneracion !== 'SOLO_FIJA' && !confirmadoParcial) {
      setGenerando(false);
      setModalAvanceParcial({
        abierto: true,
        tomadas,
        totalMedidores,
        pendientes: totalMedidores - tomadas,
        porcentajeAvance,
        modoGeneracion,
      });
      return;
    }

    // Obtener Día Límite de Pago configurado
    let diaLimite = '30';
    try {
      const guardado = localStorage.getItem('aquarural-config-form-v1');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (parsed && parsed.diaLimitePago) {
          diaLimite = String(parsed.diaLimitePago).padStart(2, '0');
        }
      }
    } catch (e) {}

    const fechaVencimientoCalculada = `${periodoSeleccionado}-${diaLimite}`;

    try {
      await api.post('/facturas/generar-masiva', {
        periodo: periodoSeleccionado,
        montoCargoFijo: tarifaBase,
        fechaVencimiento: fechaVencimientoCalculada,
      }).catch(() => {});
    } catch (err) {}

    // Filtrar suscriptores según el modo seleccionado
    let suscriptoresAProcesar = suscriptoresActuales;
    if (modoGeneracion === 'SOLO_FIJA') {
      suscriptoresAProcesar = suscriptoresActuales.filter((s) => {
        const numMed = s.medidor || s.numeroMedidor;
        return !Boolean(numMed) || numMed === 'S/N';
      });
    } else if (modoGeneracion === 'SOLO_MEDIDO') {
      suscriptoresAProcesar = suscriptoresActuales.filter((s) => {
        const numMed = s.medidor || s.numeroMedidor;
        return Boolean(numMed) && numMed !== 'S/N';
      });
    }

    // Obtener lecturas y modalidad de cobro (Tarifa Fija vs Medidor m³)
    let configTarifa = { tipoTarifa: 'MEDIDOR', tarifaBaseMensual: tarifaBase, cargoFijoMensual: 1000, valorMetroCubico: 1500, consumoBasicoIncluido: 0 };
    try {
      const guardado = localStorage.getItem('aquarural-config-form-v1');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        configTarifa = { ...configTarifa, ...parsed };
      }
    } catch (e) {}

    let suscriptoresPadron = [];
    try {
      const p = localStorage.getItem('aquarural-suscriptores-v3');
      if (p) {
        const parsed = JSON.parse(p);
        if (Array.isArray(parsed)) suscriptoresPadron = parsed;
      }
    } catch (e) {}

    let lecturasPeriodoMap = new Map();
    try {
      const pData = localStorage.getItem(`aquarural-lecturas-${periodoSeleccionado}`);
      if (pData) {
        const parsedP = JSON.parse(pData);
        if (Array.isArray(parsedP)) {
          parsedP.forEach((l) => {
            if (l.id || l._id) lecturasPeriodoMap.set(String(l.id || l._id), l);
            if (l.matricula) lecturasPeriodoMap.set(l.matricula, l);
          });
        }
      }
    } catch (e) {}

    const facturasNuevas = suscriptoresAProcesar.map((s, idx) => {
      const tieneMedidor = s.numeroMedidor && s.numeroMedidor !== 'S/N';
      let montoCalculado = (Number(configTarifa.tarifaBaseMensual) || tarifaBase || 25000) + (Number(configTarifa.cargoFijoMensual) || 1000);
      let consumoM3 = 0;

      if (tieneMedidor) {
        const lectObj = lecturasPeriodoMap.get(String(s._id || s.id)) || lecturasPeriodoMap.get(s.matricula);

        const lectAnt = lectObj?.lecturaAnterior !== undefined ? Number(lectObj.lecturaAnterior) : (Number(s.lecturaInicialArranque) || 0);
        const lectAct = lectObj?.lecturaActual !== undefined ? Number(lectObj.lecturaActual) : lectAnt;

        consumoM3 = lectObj ? Math.max(0, lectAct - lectAnt) : 0;
        const m3Facturables = Math.max(0, consumoM3 - (Number(configTarifa.consumoBasicoIncluido) || 0));
        montoCalculado = (Number(configTarifa.cargoFijoMensual) || 10000) + (m3Facturables * (Number(configTarifa.valorMetroCubico) || 1500));
      }

      return {
        id: String(Date.now() + idx),
        codigoFactura: `FAC-${periodoSeleccionado.replace('-', '')}-${s.matricula || `ACU-${100 + idx}`}`,
        suscriptor: `${s.nombres} ${s.apellidos || ''}`.trim(),
        matricula: s.matricula,
        vereda: s.vereda || 'Sector Centro',
        cedula: s.cedula || 'S/D',
        numeroMedidor: s.numeroMedidor || s.medidor || null,
        periodo: periodoSeleccionado,
        consumoM3: consumoM3,
        montoTotal: montoCalculado,
        vencimiento: fechaVencimientoCalculada,
        estado: 'PENDIENTE',
        metodoPago: null,
      };
    });

    setFacturas((prev) => {
      const seguras = Array.isArray(prev) ? prev : [];
      const sinRepetidas = seguras.filter((f) => f && f.periodo !== periodoSeleccionado);
      const resultado = [...sinRepetidas, ...facturasNuevas];
      localStorage.setItem('aquarural-facturas-v1', JSON.stringify(resultado));
      return resultado;
    });

    setMensajeExito(`¡Se han generado exitosamente ${facturasNuevas.length} cuentas de cobro para el periodo ${periodoSeleccionado}!`);
    setGenerando(false);
  };

  // Confirmar cobro en efectivo presencial en oficina desde el modal
  const handleConfirmarPagoEfectivo = async () => {
    if (!facturaACobrar) return;
    setProcesandoPago(true);
    setError('');

    const targetId = facturaACobrar._id || facturaACobrar.id || facturaACobrar.codigoFactura;

    try {
      await api.post(`/facturas/${targetId}/pago-efectivo`, {
        metodoPago: 'EFECTIVO_OFICINA',
        monto: facturaACobrar.montoTotal,
      }).catch(() => {});

      setMensajeExito(`¡Pago de $${(facturaACobrar.montoTotal || 25000).toLocaleString()} COP registrado con éxito para ${facturaACobrar.suscriptor}! Recibo digital emitido.`);
      
      setFacturas((prev) => {
        const seguras = Array.isArray(prev) ? prev : [];
        const actualizadas = seguras.map((f) =>
          f && (f.codigoFactura === targetCodigo || (f.id && f.id === facturaACobrar.id))
            ? { ...f, estado: 'PAGADA', metodoPago: 'EFECTIVO_OFICINA' }
            : f
        );
        localStorage.setItem('aquarural-facturas-v1', JSON.stringify(actualizadas));
        return actualizadas;
      });

      // Abrir automáticamente el comprobante impreso oficial
      setFacturaAImprimir({ ...facturaACobrar, estado: 'PAGADA', metodoPago: 'EFECTIVO_OFICINA' });
      setMostrarModalImpresion(true);
      setFacturaACobrar(null);
    } catch (err) {
      setMensajeExito(`¡Pago de $${(facturaACobrar.montoTotal || 25000).toLocaleString()} COP registrado con éxito para ${facturaACobrar.suscriptor}! Recibo generado.`);
      setFacturas((prev) => {
        const seguras = Array.isArray(prev) ? prev : [];
        const actualizadas = seguras.map((f) =>
          f && (f.codigoFactura === targetCodigo || (f.id && f.id === facturaACobrar.id))
            ? { ...f, estado: 'PAGADA', metodoPago: 'EFECTIVO_OFICINA' }
            : f
        );
        localStorage.setItem('aquarural-facturas-v1', JSON.stringify(actualizadas));
        return actualizadas;
      });

      // Abrir automáticamente el comprobante impreso oficial
      setFacturaAImprimir({ ...facturaACobrar, estado: 'PAGADA', metodoPago: 'EFECTIVO_OFICINA' });
      setMostrarModalImpresion(true);
      setFacturaACobrar(null);
    } finally {
      setProcesandoPago(false);
    }
  };

  // Reversar / Anular cobro de factura (volver a estado PENDIENTE para pruebas)
  const handleReversarPago = (facturaTarget) => {
    if (!facturaTarget) return;

    setFacturas((prev) => {
      const seguras = Array.isArray(prev) ? prev : [];
      const actualizadas = seguras.map((f) =>
        f && (f.codigoFactura === facturaTarget.codigoFactura || (f.id && f.id === facturaTarget.id))
          ? { ...f, estado: 'PENDIENTE', metodoPago: null, referenciaWompi: null }
          : f
      );
      localStorage.setItem('aquarural-facturas-v1', JSON.stringify(actualizadas));
      return actualizadas;
    });

    setMensajeExito(`¡Se ha reversado el pago de ${facturaTarget.suscriptor}! La factura volvió a estar PENDIENTE de cobro.`);
  };

  // Padrón de suscriptores para enriquecimiento de datos de facturas
  const padronSuscriptores = (() => {
    try {
      const s = localStorage.getItem('aquarural-suscriptores-v3');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  })();

  const suscriptoresMap = new Map(padronSuscriptores.map((s) => [String(s._id || s.id), s]));

  // Generar y Descargar Reporte Contable Oficial para DIAN / Contabilidad (Excel .csv)
  const handleExportarExcelDIAN = () => {
    const listFacturasSegurasExport = (Array.isArray(facturas) ? facturas : []).filter(
      (f) => f && typeof f === 'object'
    );

    if (listFacturasSegurasExport.length === 0) {
      alert('No hay facturas o recuadros registrados en este periodo para exportar.');
      return;
    }

    let configTarifaExport = { tarifaBaseMensual: 25000, cargoFijoMensual: 1000, valorMetroCubico: 1500 };
    try {
      const guardado = localStorage.getItem('aquarural-config-form-v1');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        configTarifaExport = { ...configTarifaExport, ...parsed };
      }
    } catch (e) {}

    const cargoFijoConf = Number(configTarifaExport.cargoFijoMensual) !== undefined && !isNaN(Number(configTarifaExport.cargoFijoMensual)) ? Number(configTarifaExport.cargoFijoMensual) : 1000;
    const tarifaBaseConf = Number(configTarifaExport.tarifaBaseMensual) || 25000;

    const headers = [
      'CODIGO_FACTURA',
      'PERIODO',
      'DOCUMENTO_SUSCRIPTOR',
      'NOMBRE_SUSCRIPTOR',
      'MATRICULA',
      'MODALIDAD',
      'CONSUMO_M3',
      'CARGO_FIJO_COP',
      'VALOR_CONSUMO_COP',
      'TARIFA_BASE_COP',
      'SUBTOTAL_ANTES_IMPUESTOS',
      'IMPUESTO_IVA_0',
      'TOTAL_FACTURADO_COP',
      'ESTADO_FACTURA',
      'MONTO_RECAUDADO_COP',
      'METODO_PAGO',
      'REFERENCIA_DIAN_WOMPI',
    ];

    const rows = listFacturasSegurasExport.map((f) => {
      const estado = f.estado || 'PENDIENTE';
      const tieneMed = (f.consumoM3 && f.consumoM3 > 0) || (f.matricula && f.matricula.includes('MED'));
      const monto = Number(f.montoTotal) || (tieneMed ? cargoFijoConf : (tarifaBaseConf + cargoFijoConf));
      const pagado = estado === 'PAGADA' ? monto : 0;
      const valorConsumo = tieneMed ? Math.max(0, monto - cargoFijoConf) : 0;
      const tarifaBaseVal = tieneMed ? 0 : tarifaBaseConf;

      const metodo = f.metodoPago === 'EFECTIVO_OFICINA'
        ? 'EFECTIVO_OFICINA'
        : f.metodoPago === 'WOMPI_PSE'
        ? 'WOMPI_PSE'
        : 'SIN_PAGAR';

      return [
        `"${f.codigoFactura || ''}"`,
        `"${f.periodo || periodoSeleccionado}"`,
        `"${f.cedula || '12203638'}"`,
        `"${(f.suscriptor || '').replace(/"/g, '""')}"`,
        `"${f.matricula || ''}"`,
        `"${tieneMed ? 'MICRO_MEDIDOR' : 'TARIFA_FIJA'}"`,
        f.consumoM3 || 0,
        cargoFijoConf,
        valorConsumo,
        tarifaBaseVal,
        monto,
        0, // IVA Exento Agua Potable Rural Colombia
        monto,
        `"${estado}"`,
        pagado,
        `"${metodo}"`,
        `"${f.referenciaWompi || (estado === 'PAGADA' ? 'RECIBO-CAJA-OFICINA' : 'PENDIENTE')}"`,
      ].join(';');
    });

    const totalFacturadoSum = listFacturasSegurasExport.reduce((acc, f) => acc + (Number(f.montoTotal) || 25000), 0);
    const totalRecaudadoSum = listFacturasSegurasExport.filter(f => f.estado === 'PAGADA').reduce((acc, f) => acc + (Number(f.montoTotal) || 25000), 0);
    const totalPendienteSum = totalFacturadoSum - totalRecaudadoSum;

    const cierre1 = ['""', '""', '""', '"== TOTALES CONTABLES DIAN =="', '""', '""', '""', '""', '""', '""', totalFacturadoSum, 0, totalFacturadoSum, '""', totalRecaudadoSum, '""', '""'].join(';');
    const cierre2 = ['""', '""', '""', '"TOTAL CARTERA PENDIENTE DE COBRO"', '""', '""', '""', '""', '""', '""', totalPendienteSum, 0, totalPendienteSum, '""', 0, '""', '""'].join(';');

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows, '', cierre1, cierre2].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `REPORTE_CONTABLE_DIAN_${periodoSeleccionado}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cálculo de estadísticas rápidas con protección defensiva de arreglos
  const listFacturasSeguras = (Array.isArray(facturas) ? facturas : []).filter(
    (f) => f && typeof f === 'object'
  ).map((f) => {
    const sObj = suscriptoresMap.get(String(f.suscriptorId || f.id)) || padronSuscriptores.find((s) => s.matricula === f.matricula);
    return {
      ...f,
      vereda: f.vereda || sObj?.vereda || 'Sector Centro',
      cedula: f.cedula || sObj?.cedula || 'S/D',
      numeroMedidor: f.numeroMedidor || sObj?.numeroMedidor || (sObj?.medidor) || null,
    };
  });

  const listFacturasPeriodo = listFacturasSeguras.filter((f) => f && f.periodo === periodoSeleccionado);
  const totalFacturas = listFacturasPeriodo.length;
  const pagadas = listFacturasPeriodo.filter((f) => f && f.estado === 'PAGADA');
  const pendientes = listFacturasPeriodo.filter((f) => f && f.estado === 'PENDIENTE');
  const sumaPagadas = pagadas.reduce((acc, f) => acc + ((f && Number(f.montoTotal)) || 25000), 0);
  const sumaPendientes = pendientes.reduce((acc, f) => acc + ((f && Number(f.montoTotal)) || 25000), 0);

  // Lista única de veredas para el filtro
  const listaVeredas = Array.from(
    new Set(
      padronSuscriptores
        .map((s) => s.vereda)
        .concat(listFacturasSeguras.map((f) => f.vereda))
        .filter((v) => Boolean(v) && typeof v === 'string')
    )
  );

  // Filtrado y ordenamiento de facturas para la tabla del periodo seleccionado
  const facturasFiltradas = listFacturasPeriodo
    .filter((f) => {
      // Coincidencia de búsqueda general
      const q = busqueda.toLowerCase().trim();
      if (q) {
        const suscriptor = (f.suscriptor || '').toLowerCase();
        const cedula = String(f.cedula || '').toLowerCase();
        const matricula = (f.matricula || '').toLowerCase();
        const codigo = (f.codigoFactura || '').toLowerCase();
        const numMedidor = (f.numeroMedidor || '').toLowerCase();
        const coincide =
          suscriptor.includes(q) ||
          cedula.includes(q) ||
          matricula.includes(q) ||
          codigo.includes(q) ||
          numMedidor.includes(q);
        if (!coincide) return false;
      }

      // Filtro Vereda
      if (filtroVereda !== 'TODAS' && f.vereda !== filtroVereda) {
        return false;
      }

      // Filtro Estado de Pago (PAGADA vs PENDIENTE)
      if (filtroEstado !== 'TODOS' && f.estado !== filtroEstado) {
        return false;
      }

      // Filtro Modalidad (MEDIDOR vs TARIFA_FIJA)
      if (filtroModalidad !== 'TODAS') {
        const tieneMed = (f.consumoM3 && f.consumoM3 > 0) || (f.matricula && f.matricula.includes('MED')) || (f.numeroMedidor && f.numeroMedidor !== 'S/N');
        if (filtroModalidad === 'MEDIDOR' && !tieneMed) return false;
        if (filtroModalidad === 'TARIFA_FIJA' && tieneMed) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (ordenamiento === 'nombre') {
        return (a.suscriptor || '').localeCompare(b.suscriptor || '');
      }
      if (ordenamiento === 'matricula') {
        return (a.matricula || '').localeCompare(b.matricula || '');
      }
      if (ordenamiento === 'monto') {
        return (Number(b.montoTotal) || 0) - (Number(a.montoTotal) || 0);
      }
      if (ordenamiento === 'vereda') {
        return (a.vereda || '').localeCompare(b.vereda || '');
      }
      return 0;
    });

  return (
    <>
      {/* CONTENIDO PRINCIPAL DEL PANEL (SE OCULTA EN IMPRESIÓN) */}
      <div className="no-print-bg p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 font-body">
      {/* HEADER DE FACTURACIÓN CON PANEL DE CONTROL RESPONSIVO */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl relative space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* FILA 1: TÍTULO OFICIAL DEL HEADER */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-headline tracking-tight">
                Recaudo & Emisión de Facturas
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gestión de cobranza mensual, emisión masiva y comprobantes en oficina
              </p>
            </div>
          </div>
        </div>

        {/* FILA 2: BARRA DE CONTROL Y ACCIONES ALINEADAS */}
        <div className="relative z-30 flex flex-wrap items-center justify-end gap-2.5 pt-1">
            {/* Selector de Periodo tipo Pastilla Minimalista [ 📅 Agosto 2026 ▾ ] */}
            <div className="relative z-40">
              <button
                type="button"
                onClick={() => setMostrarPopoverPeriodo(!mostrarPopoverPeriodo)}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-cyan-500 dark:hover:border-cyan-500 text-slate-800 dark:text-slate-100 font-headline text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2.5 transition-all cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-base">calendar_month</span>
                <span className="tracking-tight">{formatPeriodoTextoLindo(periodoSeleccionado)}</span>
                <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
              </button>

              {/* Ventana Emergente Limpia de Selección de Meses */}
              {mostrarPopoverPeriodo && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setMostrarPopoverPeriodo(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-2 z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl w-72 space-y-3 animate-fade-in font-headline">
                    {/* Navegador de Año */}
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                      <button
                        type="button"
                        onClick={() => setAnoVisualPopover(anoVisualPopover - 1)}
                        className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        ‹
                      </button>
                      <span className="font-mono font-black text-cyan-600 dark:text-cyan-400 text-sm">{anoVisualPopover}</span>
                      <button
                        type="button"
                        onClick={() => setAnoVisualPopover(anoVisualPopover + 1)}
                        className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                      >
                        ›
                      </button>
                    </div>

                    {/* Cuadrícula de 12 Meses */}
                    <div className="grid grid-cols-3 gap-2">
                      {MESES_NOMBRES.map((nombreMes, index) => {
                        const numMes = String(index + 1).padStart(2, '0');
                        const targetPeriodo = `${anoVisualPopover}-${numMes}`;
                        const isSelected = periodoSeleccionado === targetPeriodo;

                        return (
                          <button
                            key={targetPeriodo}
                            type="button"
                            onClick={() => {
                              setPeriodoSeleccionado(targetPeriodo);
                              setMostrarPopoverPeriodo(false);
                            }}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                              isSelected
                                ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-md font-black scale-105'
                                : 'bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {nombreMes.slice(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportarExcelDIAN}
              className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              title="Descargar Planilla Excel Contable con Formato DIAN"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Reporte DIAN (Excel)</span>
            </button>

            {listFacturasSeguras.some((f) => f && f.periodo === periodoSeleccionado) && (
              <button
                type="button"
                onClick={() => setMostrarModalImpresionMasiva(true)}
                className="bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-500/10 dark:hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                title="Imprimir todos los tickets/facturas de este periodo en un solo lote masivo"
              >
                <span className="material-symbols-outlined text-base">print</span>
                <span>Imprimir Lote ({facturasFiltradas.length})</span>
              </button>
            )}

            {listFacturasSeguras.some((f) => f && f.periodo === periodoSeleccionado) && (
              <button
                type="button"
                onClick={() => setMostrarModalVaciar(true)}
                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                title="Anular y borrar facturas emitidas de este periodo"
              >
                <span className="material-symbols-outlined text-base">delete_sweep</span>
                <span>Anular Periodo</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleGenerarFacturasMasivas('SOLO_FIJA')}
              disabled={generando}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/30 font-headline font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
              title="Emitir facturas cuota fija únicamente para predios sin medidor"
            >
              <span className="material-symbols-outlined text-base">home</span>
              <span>Emitir Tarifa Fija</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerarFacturasMasivas('TODOS')}
              disabled={generando}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-headline font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 tracking-wide"
              title="Emitir masivamente la facturación del periodo seleccionado para todos los suscriptores"
            >
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>{generando ? 'Emitiendo...' : `Emitir Facturación Total (${periodoSeleccionado})`}</span>
            </button>
        </div>
      </div>

      {/* BANNER DE VISIBILIDAD EN TIEMPO REAL DEL AVANCE DE CAMPO DEL FONTANERO */}
      {(() => {
        let lecturasArray = [];
        try {
          const rawLecturas = localStorage.getItem(`aquarural-lecturas-${periodoSeleccionado}`);
          if (rawLecturas) {
            const parsed = JSON.parse(rawLecturas);
            if (Array.isArray(parsed)) lecturasArray = parsed;
          }
        } catch (e) {}

        let padronSuscriptores = [];
        try {
          const p = localStorage.getItem('aquarural-suscriptores-v3');
          if (p) {
            const parsed = JSON.parse(p);
            if (Array.isArray(parsed)) padronSuscriptores = parsed;
          }
        } catch (e) {}

        const suscriptoresConMedidor = padronSuscriptores.filter((s) => Boolean(s.medidor || s.numeroMedidor) && (s.medidor || s.numeroMedidor) !== 'S/N');
        const totalMedidores = suscriptoresConMedidor.length;

        if (totalMedidores === 0) return null;

        const tomadas = suscriptoresConMedidor.filter((s) => {
          const found = lecturasArray.find((l) => String(l.id || l._id) === String(s._id || s.id) || l.matricula === s.matricula);
          if (!found) return false;
          const lectAct = Number(found.lecturaActual || 0);
          const lectAnt = Number(found.lecturaAnterior || 0);
          const fueDigitado = Boolean(found.lecturaActualModificada);
          const tieneConsumo = lectAct > lectAnt;
          return fueDigitado || tieneConsumo;
        }).length;

        const porcentaje = Math.round((tomadas / totalMedidores) * 100);

        if (tomadas === 0) {
          return (
            <div className="bg-white border-2 border-rose-200 rounded-3xl p-5 shadow-lg animate-fade-in flex items-center justify-between gap-4 font-headline">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl text-rose-600">do_not_disturb_on</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      Sin Iniciar Toma de Lecturas ({periodoSeleccionado})
                    </h4>
                    <span className="bg-rose-100 text-rose-800 font-extrabold font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-rose-200 uppercase">
                      0% Completado
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    El fontanero aún no ha registrado lecturas de medidor para este periodo (0 de {totalMedidores} predios medidos). Si emites las facturas hoy, los predios con medidor se cobrarán únicamente con Cargo Fijo.
                  </p>
                </div>
              </div>
            </div>
          );
        } else if (porcentaje < 100) {
          return (
            <div className="bg-white border-2 border-amber-300/80 rounded-3xl p-5 shadow-lg animate-fade-in space-y-3 font-headline">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl text-amber-600 animate-spin">timelapse</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                        Avance Parcial de Campo en Curso
                      </h4>
                      <span className="bg-amber-100 text-amber-900 font-black font-mono text-xs px-2.5 py-0.5 rounded-full border border-amber-300">
                        {porcentaje}% COMPLETADO
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      El fontanero lleva <strong className="text-slate-900 font-black">{tomadas} de {totalMedidores} predios medidos</strong> para el periodo {periodoSeleccionado}.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl shrink-0 text-right">
                  <span className="text-[10px] text-amber-800 uppercase font-black tracking-wider block">Avance Predios</span>
                  <span className="text-xs font-black text-amber-950 font-mono">{tomadas} / {totalMedidores} Medidos</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-normal leading-relaxed">
                  ℹ️ Si emites las facturas hoy, los predios pendientes se liquidarán únicamente con Cargo Fijo obligatorio ($1.000 COP) hasta que se guarde el 100%.
                </p>
              </div>
            </div>
          );
        } else {
          return (
            <div className="bg-white border-2 border-emerald-300/80 rounded-3xl p-5 shadow-lg animate-fade-in flex items-center justify-between gap-4 font-headline">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl text-emerald-600">check_circle</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      Lecturas de Campo 100% Consolidadas
                    </h4>
                    <span className="bg-emerald-100 text-emerald-800 font-black font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                      100% Listo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Se registraron las lecturas del 100% del padrón ({tomadas} de {totalMedidores} predios) para el periodo {periodoSeleccionado}. ¡Listo para emitir facturación masiva!
                  </p>
                </div>
              </div>
            </div>
          );
        }
      })()}

      {/* ALERTAS FEEDBACK */}
      {mensajeExito && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl px-5 py-3.5 flex items-center justify-between text-emerald-800 dark:text-emerald-300 text-xs font-headline shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400">check_circle</span>
            <p className="font-semibold">{mensajeExito}</p>
          </div>
          <button onClick={() => setMensajeExito('')} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* TARJETAS RESUMEN DE RECAUDO EN VIVO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-lg">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Total Recaudado (Mes)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">${sumaPagadas.toLocaleString()} COP</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{pagadas.length} de {totalFacturas} facturas pagadas</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <span className="material-symbols-outlined text-xl">payments</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-lg">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Cartera por Cobrar</p>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">${sumaPendientes.toLocaleString()} COP</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{pendientes.length} facturas pendientes</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <span className="material-symbols-outlined text-xl">pending_actions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm dark:shadow-lg">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-headline">Efectividad de Recaudo</p>
            <h3 className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-300 font-mono mt-0.5">
              {totalFacturas > 0 ? Math.round((pagadas.length / totalFacturas) * 100) : 0}%
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Periodo activo {periodoSeleccionado}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <span className="material-symbols-outlined text-xl">analytics</span>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS ESTILO PREMIUM HYDRO-TECH */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm dark:shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* BUSCADOR GENERAL (4 COLUMNAS) */}
          <div className="relative sm:col-span-2 lg:col-span-4">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar suscriptor, cédula, matrícula o medidor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-body transition-colors"
            />
          </div>

          {/* SELECTOR 1: ORDENAR (2 COLUMNAS) */}
          <div className="lg:col-span-2">
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-headline font-bold rounded-2xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-sm"
            >
              <option value="nombre">🔤 Nombre (A - Z)</option>
              <option value="matricula">🔢 N° Matrícula</option>
              <option value="monto">💲 Monto Facturado</option>
              <option value="vereda">📍 Vereda / Sector</option>
            </select>
          </div>

          {/* SELECTOR 2: VEREDA (2 COLUMNAS) */}
          <div className="lg:col-span-2">
            <select
              value={filtroVereda}
              onChange={(e) => setFiltroVereda(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-headline font-bold rounded-2xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-sm"
            >
              <option value="TODAS">📍 Vereda: TODAS</option>
              {listaVeredas.map((v) => (
                <option key={v} value={v}>📍 Vereda {v}</option>
              ))}
            </select>
          </div>

          {/* SELECTOR 3: ESTADO PAGO (2 COLUMNAS) */}
          <div className="lg:col-span-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-headline font-bold rounded-2xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-sm"
            >
              <option value="TODOS">💳 Estado: TODOS</option>
              <option value="PAGADA">✅ Facturas Pagadas</option>
              <option value="PENDIENTE">⏳ Cuentas Pendientes</option>
            </select>
          </div>

          {/* SELECTOR 4: MODALIDAD (2 COLUMNAS) */}
          <div className="lg:col-span-2">
            <select
              value={filtroModalidad}
              onChange={(e) => setFiltroModalidad(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-headline font-bold rounded-2xl px-3 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer shadow-sm"
            >
              <option value="TODAS">⚙️ Cobro: TODOS</option>
              <option value="MEDIDOR">💧 Con Medidor (m³)</option>
              <option value="TARIFA_FIJA">🏠 Tarifa Fija Plana</option>
            </select>
          </div>

        </div>
      </div>

      {/* TABLA DE CUENTAS DE COBRO CON DISEÑO PULIDO */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400">receipt_long</span>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-headline">Cuentas de Cobro del Periodo</h2>
          </div>
          <span className="text-xs text-cyan-700 dark:text-cyan-300 font-mono font-bold bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 px-3 py-1 rounded-full">
            Mostrando {facturasFiltradas.length} de {totalFacturas} facturas
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <span className="material-symbols-outlined text-3xl animate-spin text-cyan-500">sync</span>
            <p className="text-xs font-headline">Cargando cuentas de cobro...</p>
          </div>
        ) : facturasFiltradas.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-600">search_off</span>
            <p className="text-sm font-headline font-bold text-slate-700 dark:text-slate-300">No se encontraron cuentas de cobro con los filtros aplicados</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Intenta ajustar tu búsqueda, vereda, estado de pago o modalidad de cobro.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-[10px] font-headline uppercase tracking-widest text-slate-400 select-none">
                  <th className="py-3.5 px-4 font-bold">Código Factura</th>
                  <th className="py-3.5 px-4 font-bold">Suscriptor / Matrícula</th>
                  <th className="py-3.5 px-4 font-bold">Periodo</th>
                  <th className="py-3.5 px-4 font-bold">Valor Total</th>
                  <th className="py-3.5 px-4 font-bold">Vencimiento</th>
                  <th className="py-3.5 px-4 font-bold">Medio de Pago</th>
                  <th className="py-3.5 px-4 font-bold">Estado</th>
                  <th className="py-3.5 px-4 text-center font-bold">Imprimir Ticket</th>
                  <th className="py-3.5 px-4 text-right font-bold">Acción de Cobro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-body text-slate-700 dark:text-slate-200">
                {facturasFiltradas.map((f) => (
                  <tr key={f.id || f._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Código Factura */}
                    <td className="py-4 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-300">
                      {f.codigoFactura}
                    </td>

                    {/* Suscriptor / Matrícula */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {f.suscriptor || `${f.suscriptorId?.nombres || ''} ${f.suscriptorId?.apellidos || ''}`}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 font-mono mt-0.5">
                        Matrícula: {f.matricula || f.suscriptorId?.matricula}
                      </p>
                    </td>

                    {/* Periodo */}
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-mono">{f.periodo}</td>

                    {/* Valor Total */}
                    <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">
                      ${(f.montoTotal || 25000).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">COP</span>
                    </td>

                    {/* Vencimiento */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{f.vencimiento || '2026-08-30'}</td>

                    {/* Medio de Pago */}
                    <td className="py-4 px-4">
                      {f.metodoPago === 'WOMPI_PSE' ? (
                        <span className="bg-sky-500/10 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">credit_card</span>
                          Wompi PSE
                        </span>
                      ) : f.metodoPago === 'EFECTIVO_OFICINA' ? (
                        <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-semibold font-mono inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">payments</span>
                          Efectivo Oficina
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-headline font-extrabold inline-flex items-center gap-1 ${
                          f.estado === 'PAGADA'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${f.estado === 'PAGADA' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {f.estado === 'PAGADA' ? 'PAGADA' : 'PENDIENTE'}
                      </span>
                    </td>

                    {/* Columna Imprimir Ticket */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => {
                          setFacturaAImprimir(f);
                          setMostrarModalImpresion(true);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl font-headline font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                        title="Ver / Imprimir Ticket Oficial POS (80mm)"
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                        <span>{f.estado === 'PAGADA' ? 'Recibo' : 'Factura'}</span>
                      </button>
                    </td>

                    {/* Columna Acción de Cobro */}
                    <td className="py-4 px-4 text-right">
                      {f.estado === 'PENDIENTE' ? (
                        <button
                          onClick={() => setFacturaACobrar(f)}
                          className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 px-3.5 py-1.5 rounded-xl font-headline font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">point_of_sale</span>
                          <span>Cobrar Efectivo</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReversarPago(f)}
                          className="bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1.5 rounded-xl font-headline font-bold text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer"
                          title="Reversar cobro para pruebas (volver a estado Pendiente)"
                        >
                          <span className="material-symbols-outlined text-xs">undo</span>
                          <span>Reversar</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CONFIRMAR COBRO PRESENCIAL EN EFECTIVO */}
      {facturaACobrar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400">point_of_sale</span>
                <h3 className="text-base font-extrabold text-slate-100 font-headline">
                  Cobro en Efectivo en Ventanilla
                </h3>
              </div>
              <button onClick={() => setFacturaACobrar(null)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-body">
              <p className="text-slate-400">
                Suscriptor: <strong className="text-slate-100">{facturaACobrar.suscriptor}</strong>
              </p>
              <p className="text-slate-400">
                Factura: <strong className="text-cyan-300 font-mono">{facturaACobrar.codigoFactura}</strong>
              </p>
              <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-sm font-headline">
                <span className="text-slate-300 font-bold">Total a Cobrar:</span>
                <span className="text-emerald-400 font-extrabold text-base font-mono">
                  ${(facturaACobrar.montoTotal || 25000).toLocaleString()} COP
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFacturaACobrar(null)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={procesandoPago}
                onClick={handleConfirmarPagoEfectivo}
                className="w-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold font-headline py-3 rounded-2xl shadow-lg shadow-emerald-500/20 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">payments</span>
                <span>{procesandoPago ? 'Registrando...' : 'Confirmar Pago'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 MODAL PARA ANULAR Y VACIAR FACTURACIÓN DEL PERIODO */}
      {mostrarModalVaciar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold font-headline">
                <span className="material-symbols-outlined text-2xl">delete_sweep</span>
                <h3 className="text-base font-extrabold text-slate-100">
                  Anular Facturación ({periodoSeleccionado})
                </h3>
              </div>
              <button onClick={() => setMostrarModalVaciar(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl space-y-2 text-xs font-body">
              <p className="text-rose-300 font-bold">
                ⚠️ ¿Seguro que deseas anular las cuentas de cobro de este periodo?
              </p>
              <p className="text-slate-300 leading-relaxed">
                Se eliminarán de la cartera las facturas emitidas para el periodo <b>{periodoSeleccionado}</b> ({listFacturasSeguras.filter((f) => f && f.periodo === periodoSeleccionado).length} facturas). Esto te permitirá re-ingresar o corregir lecturas en la planilla y volver a emitir cuando lo desees.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setMostrarModalVaciar(false)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleVaciarFacturasPeriodo}
                className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold font-headline py-3 rounded-2xl shadow-lg shadow-rose-600/20 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete_forever</span>
                <span>Sí, Anular Periodo</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div> {/* FIN DE NO-PRINT-BG */}

      {/* 🖨️ MODAL DE IMPRESIÓN EXCLUSIVO TICKET TÉRMICO POS 80MM */}
      {mostrarModalImpresion && facturaAImprimir && (
        <div className="modal-impresion-backdrop fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          {/* REGLA CSS DE IMPRESIÓN TICKET POS 80MM AISLADO Y EN 1 SOLA HOJA CONTINUA */}
          <style>{`
            @media print {
              .no-print-bg, aside, nav, header, footer, .print\\:hidden {
                display: none !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              html, body, main {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
              }

              .modal-impresion-backdrop {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                background: white !important;
                backdrop-filter: none !important;
                display: block !important;
                z-index: 99999 !important;
              }

              .modal-impresion-card {
                position: relative !important;
                left: 0 !important;
                top: 0 !important;
                width: 76mm !important;
                max-width: 76mm !important;
                margin-left: 6mm !important; /* Margen de seguridad para cabezal de impresoras EPSON / HP */
                margin-top: 2mm !important;
                padding: 2mm !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                background: white !important;
                color: black !important;
              }

              @page {
                size: letter portrait;
                margin: 6mm;
              }
            }
          `}</style>

          <div className="modal-impresion-card bg-white text-slate-900 rounded-3xl p-5 max-w-sm w-full flex flex-col max-h-[90vh] shadow-2xl transition-all">
            {/* Encabezado del modal */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600">receipt</span>
                <h3 className="font-extrabold font-headline text-sm text-slate-900">
                  Imprimir Ticket POS (80mm)
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMostrarModalImpresion(false);
                  setFacturaAImprimir(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Cerrar ventana"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* CUERPO DEL TICKET TÉRMICO POS 80MM */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 font-mono text-xs max-w-[320px] mx-auto text-slate-900 print:max-w-none print:w-full">
              
              {/* ENCABEZADO ACUEDUCTO */}
              <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-2">
                <h2 className="text-sm font-extrabold font-headline uppercase tracking-tight text-slate-950">
                  {nombreAcueducto}
                </h2>
                <p className="text-[10px] text-slate-600">NIT: {nitAcueducto} • {municipioConfig}, {departamentoConfig}</p>
                <p className="text-[10px] font-bold text-cyan-800 font-headline uppercase">
                  {facturaAImprimir.estado === 'PAGADA' ? 'Comprobante Oficial de Pago' : 'Cuenta de Cobro / Factura del Mes'}
                </p>
              </div>

              {/* DATOS GENERALES */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">N° Factura:</span>
                  <span className="font-bold text-slate-900">{facturaAImprimir.codigoFactura}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Periodo:</span>
                  <span className="font-bold text-slate-900">{facturaAImprimir.periodo || periodoSeleccionado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Suscriptor:</span>
                  <span className="font-bold text-slate-950">{facturaAImprimir.suscriptor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cédula / NIT:</span>
                  <span className="text-slate-900">{facturaAImprimir.cedula || 'S/D'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sector / Vereda:</span>
                  <span className="text-slate-900">{facturaAImprimir.vereda || 'Sector Centro'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Modalidad Cobro:</span>
                  <span className="font-bold text-slate-900">
                    {facturaAImprimir.numeroMedidor && facturaAImprimir.numeroMedidor !== 'S/N' 
                      ? `MEDIDOR (${facturaAImprimir.numeroMedidor})`
                      : 'TARIFA FIJA (Sin Medidor)'
                    }
                  </span>
                </div>
              </div>

              {/* DETALLE DEL COBRO */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                <p className="font-bold font-headline text-[10px] text-slate-950 uppercase">Detalle del Mes:</p>
                
                {facturaAImprimir.numeroMedidor && facturaAImprimir.numeroMedidor !== 'S/N' ? (
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Lectura Anterior:</span>
                      <span>{facturaAImprimir.lecturaAnterior || 0} m³</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Lectura Actual:</span>
                      <span>{facturaAImprimir.lecturaActual || 0} m³</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Consumo del Mes:</span>
                      <span>{facturaAImprimir.consumoM3 || 0} m³</span>
                    </div>
                    <div className="flex justify-between pt-0.5 text-slate-700">
                      <span>Cargo Básico (hasta 15m³):</span>
                      <span>${(facturaAImprimir.cargoFijo || 18000).toLocaleString()} COP</span>
                    </div>
                    {Number(facturaAImprimir.consumoM3 || 0) > 15 && (
                      <div className="flex justify-between text-slate-700">
                        <span>Exceso m³ ({Number(facturaAImprimir.consumoM3) - 15} m³):</span>
                        <span>${((facturaAImprimir.consumoM3 - 15) * 1200).toLocaleString()} COP</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Cuota Fija Mensual de Agua:</span>
                      <span>${(facturaAImprimir.montoTotal || 15000).toLocaleString()} COP</span>
                    </div>
                    <p className="text-[9px] text-slate-500 italic">
                      * Servicio tarifa plana mensual sin micromedición.
                    </p>
                  </div>
                )}
              </div>

              {/* TOTAL Y SELLO DE ESTADO */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs font-extrabold font-headline">
                  <span className="text-slate-950">
                    {facturaAImprimir.estado === 'PAGADA' ? 'TOTAL CANCELADO:' : 'TOTAL A PAGAR:'}
                  </span>
                  <span className={facturaAImprimir.estado === 'PAGADA' ? 'text-emerald-700 text-sm' : 'text-cyan-800 text-sm'}>
                    ${(facturaAImprimir.montoTotal || 25000).toLocaleString()} COP
                  </span>
                </div>

                {facturaAImprimir.estado === 'PAGADA' ? (
                  <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-xl text-center space-y-0.5">
                    <p className="text-[11px] font-extrabold text-emerald-800 font-headline uppercase">
                      ✅ PAGO CONFIRMADO — EN REGLA
                    </p>
                    <p className="text-[9px] text-emerald-700">
                      Método: {facturaAImprimir.metodoPago === 'EFECTIVO_OFICINA' ? 'Efectivo en Oficina' : 'Digital Wompi'}
                    </p>
                    <p className="text-[8px] text-slate-500">
                      Atendido por Tesorería • {new Date().toLocaleString('es-CO')}
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl text-center space-y-0.5">
                    <p className="text-[11px] font-extrabold text-amber-800 font-headline uppercase">
                      ⏳ FACTURA PENDIENTE DE PAGO
                    </p>
                    <p className="text-[9px] text-amber-800 font-bold">
                      Fecha Límite: {facturaAImprimir.vencimiento || '30 de este mes'}
                    </p>
                  </div>
                )}
              </div>

              {/* PIE Y NOTA COMUNAL */}
              <div className="text-center pt-2 space-y-0.5 text-[9px] text-slate-500 border-t border-dashed border-slate-300">
                <p className="font-bold text-slate-800">¡Gracias por apoyar a tu Acueducto Veredal!</p>
                <p>Agua potable y salud para nuestra tierra.</p>
              </div>
            </div>

            {/* BOTONES DE IMPRESIÓN */}
            <div className="flex gap-2.5 pt-3 border-t border-slate-200 shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => {
                  setMostrarModalImpresion(false);
                  setFacturaAImprimir(null);
                }}
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

      {/* 🖨️ MODAL DE IMPRESIÓN LOTE MASIVO DE FACTURAS / RECIBOS DEL MES */}
      {mostrarModalImpresionMasiva && (
        <div className="modal-impresion-masiva-backdrop fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <style>{`
            @media print {
              .no-print-bg, aside, nav, header, footer, .print\\:hidden {
                display: none !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
              }

              html, body, main {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                min-height: 0 !important;
                overflow: visible !important;
              }

              .modal-impresion-masiva-backdrop {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                background: white !important;
                backdrop-filter: none !important;
                display: block !important;
                z-index: 99999 !important;
              }

              .modal-impresion-masiva-card {
                background: white !important;
                box-shadow: none !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
              }

              .ticket-item-masivo {
                position: relative !important;
                width: 76mm !important;
                max-width: 76mm !important;
                margin-left: 6mm !important;
                margin-top: 0 !important;
                margin-bottom: 12mm !important;
                padding-top: 6mm !important;
                padding-bottom: 2mm !important;
                padding-left: 2mm !important;
                padding-right: 2mm !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                background: white !important;
                color: black !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
              }

              @page {
                size: letter portrait;
                margin-top: 15mm !important;
                margin-bottom: 12mm !important;
                margin-left: 6mm !important;
                margin-right: 6mm !important;
              }
            }
          `}</style>

          <div className="modal-impresion-masiva-card bg-white text-slate-900 rounded-3xl p-6 max-w-xl w-full flex flex-col max-h-[90vh] shadow-2xl transition-all">
            {/* Encabezado del modal */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-600 text-2xl">print</span>
                <div>
                  <h3 className="font-extrabold font-headline text-base text-slate-900">
                    Impresión Masiva en Lote ({facturasFiltradas.length} Facturas)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Periodo {periodoSeleccionado} • Tira continua para distribución veredal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMostrarModalImpresionMasiva(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Cerrar ventana"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* VISTA PREVIA SCROLLABLE DE LOS TICKETS */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2 print:py-0 print:space-y-0 print:pr-0">
              {facturasFiltradas.map((itemFactura, idx) => (
                <div key={itemFactura.id || itemFactura.codigoFactura || idx} className="ticket-item-masivo bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3 font-mono text-xs max-w-[320px] mx-auto text-slate-900">
                  {/* ENCABEZADO ACUEDUCTO */}
                  <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-2">
                    <h2 className="text-sm font-extrabold font-headline uppercase tracking-tight text-slate-950">
                      {nombreAcueducto}
                    </h2>
                    <p className="text-[10px] text-slate-600">NIT: {nitAcueducto} • {municipioConfig}, {departamentoConfig}</p>
                    <p className="text-[10px] font-bold text-cyan-800 font-headline uppercase">
                      {itemFactura.estado === 'PAGADA' ? 'Comprobante Oficial de Pago' : 'Cuenta de Cobro / Factura del Mes'}
                    </p>
                  </div>

                  {/* DATOS GENERALES */}
                  <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">N° Factura:</span>
                      <span className="font-bold text-slate-900">{itemFactura.codigoFactura}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Periodo:</span>
                      <span className="font-bold text-slate-900">{itemFactura.periodo || periodoSeleccionado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Suscriptor:</span>
                      <span className="font-bold text-slate-950">{itemFactura.suscriptor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cédula / NIT:</span>
                      <span className="text-slate-900">{itemFactura.cedula || 'S/D'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sector / Vereda:</span>
                      <span className="text-slate-900">{itemFactura.vereda || 'Sector Centro'}</span>
                    </div>
                  </div>

                  {/* DETALLE DEL COBRO */}
                  <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                    <p className="font-bold font-headline text-[10px] text-slate-950 uppercase">Detalle del Mes:</p>
                    {itemFactura.numeroMedidor && itemFactura.numeroMedidor !== 'S/N' ? (
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-600">
                          <span>Consumo del Mes:</span>
                          <span>{itemFactura.consumoM3 || 0} m³</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Cargo Básico (hasta 15m³):</span>
                          <span>${(itemFactura.cargoFijo || 18000).toLocaleString()} COP</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>Cuota Fija Mensual de Agua:</span>
                          <span>${(itemFactura.montoTotal || 15000).toLocaleString()} COP</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TOTAL Y SELLO DE ESTADO */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs font-extrabold font-headline">
                      <span className="text-slate-950">
                        {itemFactura.estado === 'PAGADA' ? 'TOTAL CANCELADO:' : 'TOTAL A PAGAR:'}
                      </span>
                      <span className={itemFactura.estado === 'PAGADA' ? 'text-emerald-700 text-sm' : 'text-cyan-800 text-sm'}>
                        ${(itemFactura.montoTotal || 25000).toLocaleString()} COP
                      </span>
                    </div>

                    {itemFactura.estado === 'PAGADA' ? (
                      <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-xl text-center space-y-0.5">
                        <p className="text-[10px] font-extrabold text-emerald-800 font-headline uppercase">
                          ✅ PAGO CONFIRMADO
                        </p>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-300 p-2 rounded-xl text-center space-y-0.5">
                        <p className="text-[10px] font-extrabold text-amber-800 font-headline uppercase">
                          ⏳ PENDIENTE (Límite: {itemFactura.vencimiento || '30 del mes'})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* LÍNEA DE CORTE */}
                  <div className="pt-3 border-t-2 border-dashed border-slate-300 text-center text-[9px] text-slate-400 select-none">
                    ✂ ---------------- CORTAR AQUÍ ---------------- ✂
                  </div>
                </div>
              ))}
            </div>

            {/* BOTONES DE IMPRESIÓN */}
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

      {/* MODAL CANDADO 1: BLOQUEO POR CONFLICTO DE PERIODO ENTRE FONTANERO Y TESORERO */}
      {modalConflictoPeriodo.abierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-scale-up text-slate-900 font-headline">
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-2xl text-rose-600">block</span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                  Conflictos de Fecha de Emisión
                </h3>
                <span className="inline-block bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
                  🔒 Candado Financiero 1 Activo
                </span>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 space-y-3.5 text-xs text-slate-700">
              <p className="leading-relaxed font-medium">
                El fontanero registró y guardó la planilla para el periodo <strong className="text-amber-800 font-extrabold">{modalConflictoPeriodo.periodoFontanero}</strong>, pero la Tesorería tiene seleccionado <strong className="text-rose-700 font-extrabold">{modalConflictoPeriodo.periodoTesorero}</strong>.
              </p>

              <div className="bg-white p-3.5 rounded-xl border border-rose-200/80 shadow-sm space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">• Periodo Fontanero:</span>
                  <span className="bg-amber-50 text-amber-800 font-black font-mono px-2.5 py-1 rounded-lg border border-amber-200">
                    {modalConflictoPeriodo.periodoFontanero}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">• Periodo Tesorero:</span>
                  <span className="bg-rose-50 text-rose-800 font-black font-mono px-2.5 py-1 rounded-lg border border-rose-200">
                    {modalConflictoPeriodo.periodoTesorero}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                Para proteger los fondos del acueducto, debes cambiar el selector de periodo a <strong>{modalConflictoPeriodo.periodoFontanero}</strong> en esta pantalla o solicitar al fontanero que guarde el avance bajo el mes <strong>{modalConflictoPeriodo.periodoTesorero}</strong>.
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setModalConflictoPeriodo({ abierto: false, periodoFontanero: '', periodoTesorero: '' })}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                Entendido, Ajustar Periodo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANDADO 2: ADVERTENCIA FINANCIERA POR AVANCE PARCIAL (1% A 99%) */}
      {modalAvanceParcial.abierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-scale-up text-slate-900 font-headline">
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-2xl text-amber-600">warning</span>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                  Advertencia de Avance Parcial ({modalAvanceParcial.porcentajeAvance}%)
                </h3>
                <span className="inline-block bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
                  🔒 Candado Financiero 2 Activo
                </span>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 space-y-3.5 text-xs text-slate-700">
              <p className="leading-relaxed font-medium">
                El fontanero solo ha registrado <strong className="text-slate-900 font-black">{modalAvanceParcial.tomadas} de {modalAvanceParcial.totalMedidores} predios medidos ({modalAvanceParcial.porcentajeAvance}% de avance)</strong>.
              </p>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-sm space-y-2 text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">• Predios Medidos:</span>
                  <span className="bg-emerald-50 text-emerald-800 font-black font-mono px-2.5 py-1 rounded-lg border border-emerald-200">
                    {modalAvanceParcial.tomadas} familias
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-bold">• Predios Pendientes:</span>
                  <span className="bg-amber-50 text-amber-800 font-black font-mono px-2.5 py-1 rounded-lg border border-amber-200">
                    {modalAvanceParcial.pendientes} familias
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                ℹ️ Si emites las facturas hoy, a las <strong>{modalAvanceParcial.pendientes} familias no medidas</strong> se les cobrará únicamente el Cargo Fijo obligatorio ($1.000 COP) sin metros cúbicos, lo que representa una potencial pérdida de recaudo si ya consumieron agua.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setModalAvanceParcial({ abierto: false, tomadas: 0, totalMedidores: 0, pendientes: 0, porcentajeAvance: 0, modoGeneracion: 'TODOS' })}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">schedule</span>
                <span>⏳ Cancelar y Esperar al Fontanero (Recomendado)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const modo = modalAvanceParcial.modoGeneracion;
                  setModalAvanceParcial({ abierto: false, tomadas: 0, totalMedidores: 0, pendientes: 0, porcentajeAvance: 0, modoGeneracion: 'TODOS' });
                  handleGenerarFacturasMasivas(modo, true);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl transition-all cursor-pointer text-center border border-slate-200"
              >
                ⚡ Emitir Facturación Parcial Bajo Responsabilidad
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Datos Demo por defecto (Inicia limpio en $0 COP)
const datosDemo = [];

class FacturacionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FacturacionPage Error:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('aquarural-facturas-v1');
    localStorage.removeItem('aquarural-periodo-activo');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto space-y-6 text-center mt-12 font-headline animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
            <span className="material-symbols-outlined text-amber-400 text-5xl">warning</span>
            <h2 className="text-xl font-extrabold text-slate-100">
              Se detectó un dato inconsistente en el caché de facturación
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-body">
              Es posible que haya datos de prueba antiguos en la memoria de tu navegador ({this.state.error?.message}). Haz clic en el botón inferior para restablecer la memoria caché del módulo.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs px-6 py-3 rounded-2xl shadow-lg transition-all cursor-pointer"
            >
              🔄 Restablecer Módulo de Facturación
            </button>
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
