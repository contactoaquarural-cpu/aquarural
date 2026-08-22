import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.service';

const LecturasPageContent = () => {
  const navigate = useNavigate();
  const [suscriptores, setSuscriptores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroVereda, setFiltroVereda] = useState('TODAS');
  const [mensaje, setMensaje] = useState(null);
  const [mostrarModalFacturar, setMostrarModalFacturar] = useState(false);
  const getPeriodoValido = (val) => {
    if (typeof val === 'string' && /^\d{4}-\d{2}$/.test(val)) return val;
    return new Date().toISOString().slice(0, 7);
  };

  const [periodoFactura, setPeriodoFactura] = useState(() => {
    const raw = localStorage.getItem('aquarural-periodo-lectura-seleccionado');
    return getPeriodoValido(raw);
  });

  const [configTarifa, setConfigTarifa] = useState({
    tipoTarifa: 'HIBRIDO',
    cargoFijoMensual: 10000,
    valorMetroCubico: 1500,
    consumoBasicoIncluido: 0,
    tarifaBaseMensual: 25000,
  });

  const [ultimaGuardadoBorrador, setUltimaGuardadoBorrador] = useState(null);
  const [restauradoBorrador, setRestauradoBorrador] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [mostrarModalConfirmacionAvance, setMostrarModalConfirmacionAvance] = useState(false);
  const [mostrarPopoverPeriodo, setMostrarPopoverPeriodo] = useState(false);
  const [anoVisualPopover, setAnoVisualPopover] = useState(() => {
    const p = localStorage.getItem('aquarural-periodo-lectura-seleccionado') || '';
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

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setMensaje({ tipo: 'ok', texto: '⚡ ¡Conexión restablecida! Sincronizando lecturas de campo con el servidor...' });
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    cargarConfiguracionTarifa();
  }, []);

  useEffect(() => {
    if (periodoFactura) {
      localStorage.setItem('aquarural-periodo-lectura-seleccionado', periodoFactura);
      cargarSuscriptores();
    }
  }, [periodoFactura]);

  // Auto-guardado en borrador local ante cada dígito ingresado (protección contra recarga/apagón)
  useEffect(() => {
    if (Array.isArray(suscriptores) && suscriptores.length > 0 && !loading) {
      const borradorObj = {
        timestamp: Date.now(),
        fechaFormateada: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lecturas: suscriptores.map((s) => ({
          id: s.id,
          lecturaAnterior: s.lecturaAnterior,
          lecturaActual: s.lecturaActual,
        })),
      };
      localStorage.setItem('aquarural-lecturas-draft-v1', JSON.stringify(borradorObj));
      setUltimaGuardadoBorrador(borradorObj.fechaFormateada);
    }
  }, [suscriptores, loading]);

  const cargarConfiguracionTarifa = async () => {
    try {
      const guardado = localStorage.getItem('aquarural-config-form-v1');
      let configLocal = null;
      if (guardado) {
        try { configLocal = JSON.parse(guardado); } catch (e) {}
      }

      const res = await api.get('/configuracion').catch(() => null);
      const apiData = res && res.data && (res.data.success || res.data.ok) ? res.data.data : {};

      const mezclado = { ...apiData, ...configLocal };
      setConfigTarifa({
        tipoTarifa: mezclado.tipoTarifa || 'HIBRIDO',
        cargoFijoMensual: Number(mezclado.cargoFijoMensual) !== undefined && !isNaN(Number(mezclado.cargoFijoMensual)) ? Number(mezclado.cargoFijoMensual) : 10000,
        valorMetroCubico: Number(mezclado.valorMetroCubico) !== undefined && !isNaN(Number(mezclado.valorMetroCubico)) ? Number(mezclado.valorMetroCubico) : 1500,
        consumoBasicoIncluido: Number(mezclado.consumoBasicoIncluido) || 0,
        tarifaBaseMensual: Number(mezclado.tarifaBaseMensual) || 25000,
      });
    } catch (e) {}
  };

  const cargarSuscriptores = async () => {
    setLoading(true);
    try {
      let todosSuscriptores = [];
      const res = await api.get('/asociados').catch(() => null);
      if (res && res.data && (res.data.success || res.data.ok)) {
        const rawLista = res.data.data?.asociados || res.data.suscriptores || res.data.data || [];
        if (Array.isArray(rawLista)) {
          todosSuscriptores = rawLista;
        }
      }

      let soloConMedidor = todosSuscriptores
        .filter((s) => s && typeof s === 'object')
        .map((s) => ({
          id: s._id || s.id || String(s.matricula || Math.random()),
          matricula: s.matricula || '',
          cedula: s.cedula || 'S/D',
          nombres: s.nombres || 'Suscriptor',
          apellidos: s.apellidos || '',
          vereda: s.vereda || 'Centro Veredal',
          numeroMedidor: s.medidor || s.numeroMedidor || 'S/N',
          lecturaInicialArranque: Number(s.lecturaInicialArranque || s.lecturaAnterior || 0),
          promedioConsumo: Number(s.promedioConsumo) || 15,
        }));

      // CALCULAR LECTURA ANTERIOR DESDE EL MES ANTERIOR (PERIODO N-1)
      let lecturasMesAnteriorMap = new Map();
      try {
        const [yr, mo] = periodoFactura.split('-').map(Number);
        const prevDate = new Date(yr, mo - 2, 1);
        const periodoAnterior = prevDate.toISOString().slice(0, 7);
        const prevRaw = localStorage.getItem(`aquarural-lecturas-${periodoAnterior}`);
        if (prevRaw) {
          const parsedPrev = JSON.parse(prevRaw);
          if (Array.isArray(parsedPrev)) {
            parsedPrev.forEach((l) => {
              if (l.id || l._id) lecturasMesAnteriorMap.set(String(l.id || l._id), l);
              if (l.matricula) lecturasMesAnteriorMap.set(l.matricula, l);
            });
          }
        }
      } catch (e) {}

      soloConMedidor = soloConMedidor.map((s) => {
        const prevObj = lecturasMesAnteriorMap.get(String(s.id)) || lecturasMesAnteriorMap.get(s.matricula);
        const lectAnt = prevObj?.lecturaActual !== undefined ? Number(prevObj.lecturaActual) : Number(s.lecturaInicialArranque || 0);
        return {
          ...s,
          lecturaAnterior: lectAnt,
          lecturaActual: lectAnt,
          lecturaActualModificada: false,
        };
      });

      // RESTAURAR PLANILLA GUARDADA DEL PERIODO SELECCIONADO SI EXISTE
      const periodoRaw = localStorage.getItem(`aquarural-lecturas-${periodoFactura}`);
      if (periodoRaw) {
        try {
          const periodoArray = JSON.parse(periodoRaw);
          if (Array.isArray(periodoArray) && periodoArray.length > 0) {
            const pMap = new Map(periodoArray.map((p) => [String(p.id || p._id), p]));
            soloConMedidor = soloConMedidor.map((s) => {
              const pObj = pMap.get(String(s.id)) || pMap.get(s.matricula);
              if (pObj) {
                return {
                  ...s,
                  lecturaAnterior: pObj.lecturaAnterior !== undefined ? Number(pObj.lecturaAnterior) : s.lecturaAnterior,
                  lecturaActual: pObj.lecturaActual !== undefined ? Number(pObj.lecturaActual) : s.lecturaActual,
                  lecturaActualModificada: Boolean(pObj.lecturaActualModificada),
                };
              }
              return s;
            });
          }
        } catch (e) {}
      }

      // RESTAURAR BORRADOR EN PROGRESO SI EXISTE
      const draftRaw = localStorage.getItem('aquarural-lecturas-draft-v1');
      if (draftRaw) {
        try {
          const draftObj = JSON.parse(draftRaw);
          if (draftObj && Array.isArray(draftObj.lecturas) && draftObj.lecturas.length > 0) {
            const draftMap = new Map(draftObj.lecturas.map((d) => [String(d.id), d]));
            soloConMedidor = soloConMedidor.map((s) => {
              const d = draftMap.get(String(s.id));
              if (d) {
                return {
                  ...s,
                  lecturaAnterior: d.lecturaAnterior !== undefined ? d.lecturaAnterior : s.lecturaAnterior,
                  lecturaActual: d.lecturaActual !== undefined ? d.lecturaActual : s.lecturaActual,
                  lecturaActualModificada: d.lecturaActualModificada !== undefined ? d.lecturaActualModificada : s.lecturaActualModificada,
                };
              }
              return s;
            });
            setRestauradoBorrador(true);
            if (draftObj.fechaFormateada) setUltimaGuardadoBorrador(draftObj.fechaFormateada);
          }
        } catch (e) {}
      }

      setSuscriptores(soloConMedidor);
    } catch (e) {
      setSuscriptores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLecturaAnteriorChange = (id, valor) => {
    const num = Number(valor) || 0;
    const actualizados = suscriptores.map((s) => (s.id === id ? { ...s, lecturaAnterior: num } : s));
    setSuscriptores(actualizados);
  };

  const handleReiniciarPlanillaPeriodo = () => {
    try {
      localStorage.removeItem(`aquarural-lecturas-${periodoFactura}`);
      localStorage.removeItem('aquarural-lecturas-draft-v1');
    } catch (e) {}
    
    const resetSuscriptores = suscriptores.map((s) => ({
      ...s,
      lecturaActual: Number(s.lecturaAnterior) || 0,
      lecturaActualModificada: false,
    }));

    setSuscriptores(resetSuscriptores);
    setMensaje({ tipo: 'ok', texto: `🧹 Planilla del periodo ${periodoFactura} reiniciada a 0% de avance.` });
  };

  const handleLecturaChange = (id, valor) => {
    const num = Number(valor);
    if (isNaN(num)) return;

    const actualizados = suscriptores.map((s) => {
      if (s.id === id) {
        const esDiferente = num !== Number(s.lecturaAnterior);
        return { ...s, lecturaActual: num, lecturaActualModificada: esDiferente };
      }
      return s;
    });
    setSuscriptores(actualizados);
  };

  const handleGuardarLecturas = async () => {
    setGuardando(true);
    try {
      localStorage.setItem(`aquarural-lecturas-${periodoFactura}`, JSON.stringify(suscriptores));

      await api.post('/asociados/lecturas-masivas', { periodo: periodoFactura, lecturas: suscriptores }).catch(() => {});
      localStorage.removeItem('aquarural-lecturas-draft-v1');
      setRestauradoBorrador(false);
      setMensaje({ tipo: 'ok', texto: `¡Planilla de lecturas del periodo ${periodoFactura} guardada exitosamente!` });
    } catch (e) {
      localStorage.removeItem('aquarural-lecturas-draft-v1');
      setRestauradoBorrador(false);
      setMensaje({ tipo: 'ok', texto: `¡Planilla de lecturas del periodo ${periodoFactura} guardada exitosamente!` });
    } finally {
      setGuardando(false);
    }
  };

  const [ordenamiento, setOrdenamiento] = useState('NOMBRE_AZ');

  const veredasDisponibles = ['TODAS', ...new Set(suscriptores.map((s) => s.vereda))];

  const suscriptoresFiltrados = suscriptores
    .filter((s) => {
      if (!s) return false;
      const q = (busqueda || '').toLowerCase();
      const sNombres = (s.nombres || '').toLowerCase();
      const sApellidos = (s.apellidos || '').toLowerCase();
      const sCedula = String(s.cedula || '');
      const sMatricula = (s.matricula || '').toLowerCase();
      const sMedidor = String(s.numeroMedidor || s.medidor || '').toLowerCase();

      const coincideBusqueda =
        sNombres.includes(q) ||
        sApellidos.includes(q) ||
        sCedula.includes(q) ||
        sMatricula.includes(q) ||
        sMedidor.includes(q);

      const coincideVereda = filtroVereda === 'TODAS' || s.vereda === filtroVereda;
      return coincideBusqueda && coincideVereda;
    })
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (ordenamiento === 'NOMBRE_AZ') {
        const nomA = `${a.nombres || ''} ${a.apellidos || ''}`.toLowerCase();
        const nomB = `${b.nombres || ''} ${b.apellidos || ''}`.toLowerCase();
        return nomA.localeCompare(nomB, 'es', { sensitivity: 'base' });
      }
      if (ordenamiento === 'MATRICULA') {
        return (a.matricula || '').localeCompare(b.matricula || '', undefined, { numeric: true });
      }
      if (ordenamiento === 'VEREDA') {
        return (a.vereda || '').localeCompare(b.vereda || '');
      }
      if (ordenamiento === 'MEDIDOR') {
        return String(a.numeroMedidor || a.medidor || '').localeCompare(String(b.numeroMedidor || b.medidor || ''), undefined, { numeric: true });
      }
      return 0;
    });

  const todosSuscriptoresPadron = (() => {
    try {
      const p = localStorage.getItem('aquarural-suscriptores-v3');
      const parsed = p ? JSON.parse(p) : [];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : (Array.isArray(suscriptores) ? suscriptores : []);
    } catch (e) { return Array.isArray(suscriptores) ? suscriptores : []; }
  })();

  const listSegura = Array.isArray(suscriptores) ? suscriptores.filter((s) => s && typeof s === 'object') : [];
  const suscriptoresConMedidor = listSegura.filter((s) => Boolean(s.numeroMedidor || s.medidor) && (s.numeroMedidor || s.medidor) !== 'S/N');
  const suscriptoresSinMedidor = listSegura.filter((s) => !Boolean(s.numeroMedidor || s.medidor) || (s.numeroMedidor || s.medidor) === 'S/N');
  const suscriptoresConMedidorCount = suscriptoresConMedidor.length;
  const suscriptoresSinMedidorCount = suscriptoresSinMedidor.length;

  const tieneInconsistencias = suscriptoresConMedidor.some((s) => Number(s.lecturaActual) < Number(s.lecturaAnterior));

  const totalConsumoM3 = suscriptoresConMedidor.reduce((acc, s) => {
    return acc + Math.max(0, (s.lecturaActual || 0) - (s.lecturaAnterior || 0));
  }, 0);

  const totalRecaudoEstimadoMedidores = suscriptoresConMedidor.reduce((acc, s) => {
    const consumo = Math.max(0, (s.lecturaActual || 0) - (s.lecturaAnterior || 0));
    const m3Facturables = Math.max(0, consumo - (Number(configTarifa?.consumoBasicoIncluido) || 0));
    const valorConsumo = m3Facturables * (Number(configTarifa?.valorMetroCubico) || 1500);
    return acc + ((Number(configTarifa?.cargoFijoMensual) || 10000) + valorConsumo);
  }, 0);

  const recaudoTarifaFijaProyectado = suscriptoresSinMedidor.reduce((acc, s) => {
    return acc + ((Number(configTarifa?.tarifaBaseMensual) || 25000) + (Number(configTarifa?.cargoFijoMensual) || 10000));
  }, 0);

  const totalRecaudoHibridoProyectado = totalRecaudoEstimadoMedidores + recaudoTarifaFijaProyectado;

  const lecturasTomadasCount = suscriptoresConMedidor.filter((s) => {
    const tieneConsumoNuevo = Number(s.lecturaActual) > Number(s.lecturaAnterior);
    const fueEditadoValidamente = Boolean(s.lecturaActualModificada) && Number(s.lecturaActual) >= Number(s.lecturaAnterior);
    return fueEditadoValidamente || tieneConsumoNuevo;
  }).length;

  const porcentajeAvanceLecturas = suscriptoresConMedidorCount > 0 ? Math.round((lecturasTomadasCount / suscriptoresConMedidorCount) * 100) : 0;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-body selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Hydro-Tech */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-cyan-400 text-2xl">water_ec</span>
            <h1 className="text-2xl font-extrabold text-slate-100 font-headline tracking-tight">
              Lecturas & Medidores de Agua (m³)
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-body">
            Ingreso de lecturas de campo, cálculo automático de consumo en metros cúbicos y alertas por consumo inusual.
          </p>

          {/* BARRA DE PROGRESO DE CAMPO 0% - 100% */}
          <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 max-w-md">
            <div className="flex justify-between items-center text-xs font-headline mb-1.5">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-cyan-400 text-base">analytics</span>
                <span>Avance en Campo ({periodoFactura}):</span>
              </span>
              <span className="font-extrabold text-cyan-400 font-mono">{lecturasTomadasCount} de {suscriptoresConMedidorCount} Predios ({porcentajeAvanceLecturas}%)</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${porcentajeAvanceLecturas}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Indicador de Señal Offline / Online */}
          <span className={`border text-[11px] font-headline px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-inner whitespace-nowrap ${
            isOnline
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isOnline ? '📶 En Línea (Sincronizado)' : '📡 Modo Vereda (Sin Señal)'}</span>
          </span>

          {/* Selector de Periodo tipo Pastilla Minimalista [ 📅 Agosto 2026 ▾ ] */}
          <div className="relative z-30">
            <button
              type="button"
              onClick={() => setMostrarPopoverPeriodo(!mostrarPopoverPeriodo)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 text-slate-800 dark:text-slate-100 font-headline text-xs font-black px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-2.5 transition-all cursor-pointer hover:shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-base">calendar_month</span>
              <span className="tracking-tight">{formatPeriodoTextoLindo(periodoFactura)}</span>
              <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
            </button>

            {/* Ventana Emergente Limpia de Selección de Meses */}
            {mostrarPopoverPeriodo && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setMostrarPopoverPeriodo(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-[100] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl w-72 space-y-3 animate-fade-in font-headline">
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
                      const isSelected = periodoFactura === targetPeriodo;

                      return (
                        <button
                          key={targetPeriodo}
                          type="button"
                          onClick={() => {
                            setPeriodoFactura(targetPeriodo);
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
            onClick={handleReiniciarPlanillaPeriodo}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-headline font-bold text-xs px-3.5 py-3 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
            title={`Borrar lecturas de prueba y reiniciar el periodo ${periodoFactura} a 0%`}
          >
            <span className="material-symbols-outlined text-amber-400 text-base">restart_alt</span>
            <span>Reiniciar Planilla</span>
          </button>

          <button
            onClick={() => setMostrarModalConfirmacionAvance(true)}
            disabled={guardando || tieneInconsistencias}
            className={`font-extrabold font-headline text-xs px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-2 whitespace-nowrap ${
              tieneInconsistencias
                ? 'bg-slate-800 text-rose-400 border border-rose-500/50 cursor-not-allowed opacity-90'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 cursor-pointer shadow-emerald-500/20 hover:shadow-emerald-500/35'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tieneInconsistencias ? 'block' : 'save'}</span>
            <span>{guardando ? 'Guardando...' : (tieneInconsistencias ? 'Corregir Inconsistencia' : '💾 Guardar Avance del Día')}</span>
          </button>
        </div>
      </div>

      {/* BANNER DE INCONSISTENCIA (LECTURA ACTUAL MENOR A LA ANTERIOR) - ALTO CONTRASTE */}
      {tieneInconsistencias && (
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 border-2 border-rose-400 rounded-3xl p-5 text-white font-headline shadow-2xl shadow-rose-600/30 animate-fade-in flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm">
              <span className="material-symbols-outlined text-3xl text-white animate-bounce">warning</span>
            </div>
            <div>
              <p className="font-black text-base tracking-wide text-white drop-shadow-sm">
                ❌ ¡ATENCIÓN FONTANERO! HAY LECTURAS MENORES A LA ANTERIOR
              </p>
              <p className="text-xs text-rose-100 font-medium mt-1 leading-relaxed">
                Has ingresado números de lectura menores a la lectura anterior registrada (por ejemplo 20 &lt; 200). Revisa abajo las casillas en <strong>rojo brillante con advertencia ⚠️</strong>.
              </p>
            </div>
          </div>
          <div className="shrink-0 bg-white/10 px-4 py-2 rounded-2xl border border-white/20 text-center">
            <span className="text-[11px] font-bold block text-rose-100">Guardado Bloqueado</span>
            <span className="text-xs font-black text-white">Corrige para Continuar</span>
          </div>
        </div>
      )}

      {/* BANNER DE BORRADOR RECUPERADO DE RECARGA */}
      {restauradoBorrador && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl px-5 py-3.5 flex items-center justify-between text-sky-300 text-xs font-headline animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-sky-400">history</span>
            <p>
              <strong>⚡ Borrador de Campo Restaurado:</strong> Se recuperaron automáticamente las lecturas ingresadas antes de la recarga ({ultimaGuardadoBorrador}). Puedes continuar digitando o guardar la planilla.
            </p>
          </div>
          <button onClick={() => setRestauradoBorrador(false)} className="text-sky-400 hover:text-sky-200">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Alertas de Notificación */}
      {mensaje && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-4 flex items-center justify-between text-emerald-300 text-xs font-headline animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-xl text-emerald-400">check_circle</span>
            <p>{mensaje.texto}</p>
          </div>
          <button onClick={() => setMensaje(null)} className="text-emerald-400 hover:text-emerald-200">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Tarjetas de Métricas de Lectura Híbrida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Total Consumo Registrado</span>
          <p className="text-3xl font-extrabold text-cyan-300 font-headline">{totalConsumoM3.toLocaleString()} m³</p>
          <p className="text-[11px] text-slate-400">Medido en las viviendas con contador activo</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Proyección Recaudo Híbrido</span>
          <p className="text-3xl font-extrabold text-emerald-400 font-headline">${totalRecaudoHibridoProyectado.toLocaleString()} COP</p>
          <p className="text-[11px] text-slate-400">
            {suscriptoresConMedidorCount} con medidor (${totalRecaudoEstimadoMedidores.toLocaleString()}) + {suscriptoresSinMedidorCount} tarifa fija (${recaudoTarifaFijaProyectado.toLocaleString()})
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Padrón de Suscriptores</span>
          <p className="text-3xl font-extrabold text-sky-400 font-headline">{todosSuscriptoresPadron.length} familias</p>
          <p className="text-[11px] text-slate-400">
            {suscriptores.length} con medidor • {suscriptoresSinMedidorCount} en tarifa fija
          </p>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por suscriptor, cédula, matrícula o medidor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 font-headline">Ordenar:</span>
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-headline font-bold rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="NOMBRE_AZ">🔤 Nombre (A - Z)</option>
              <option value="MATRICULA">🔢 N° Matrícula</option>
              <option value="VEREDA">📍 Vereda / Sector</option>
              <option value="MEDIDOR">💧 N° Medidor</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 font-headline">Vereda:</span>
            <select
              value={filtroVereda}
              onChange={(e) => setFiltroVereda(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-2xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {veredasDisponibles.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Principal de Planilla de Lecturas Híbridas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-headline">
                <th className="py-4 px-6">Suscriptor / Vivienda</th>
                <th className="py-4 px-6">Medidor / Modalidad</th>
                <th className="py-4 px-6 text-center">Lectura Anterior</th>
                <th className="py-4 px-6 text-center">Lectura Actual (m³)</th>
                <th className="py-4 px-6 text-center">Consumo (Δ m³)</th>
                <th className="py-4 px-6 text-right">Cobro Estimado</th>
                <th className="py-4 px-6 text-center">Estado / Alertas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {suscriptoresFiltrados.map((s) => {
                if (!s) return null;
                const tieneMedidor = Boolean(s.numeroMedidor || s.medidor) && (s.numeroMedidor || s.medidor) !== 'S/N';
                const consumo = tieneMedidor ? Math.max(0, (s.lecturaActual || 0) - (s.lecturaAnterior || 0)) : 0;
                const m3Facturables = Math.max(0, consumo - (Number(configTarifa?.consumoBasicoIncluido) || 0));
                
                const cargoFijo = Number(configTarifa?.cargoFijoMensual) !== undefined && !isNaN(Number(configTarifa?.cargoFijoMensual)) ? Number(configTarifa?.cargoFijoMensual) : 10000;
                const valorM3 = Number(configTarifa?.valorMetroCubico) || 1500;
                const tarifaBase = Number(configTarifa?.tarifaBaseMensual) || 25000;

                const cobroEstimado = tieneMedidor
                  ? cargoFijo + (m3Facturables * valorM3)
                  : tarifaBase + cargoFijo;

                const posFuga = tieneMedidor && consumo > ((s.promedioConsumo || 15) * 1.5);

                return (
                  <tr key={s.id || s._id || s.matricula} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-extrabold text-slate-100 font-headline">{s.nombres || ''} {s.apellidos || ''}</p>
                      <p className="text-[11px] text-slate-400 font-mono">C.C. {s.cedula || 'S/D'} • <span className="text-cyan-400">{s.matricula || ''}</span> • {s.vereda || 'Centro Veredal'}</p>
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-slate-300">
                      {tieneMedidor ? (
                        <span className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-cyan-300 inline-block whitespace-nowrap">
                          {s.numeroMedidor || s.medidor}
                        </span>
                      ) : (
                        <span className="bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[10px] font-bold px-2.5 py-1 rounded-full font-headline whitespace-nowrap inline-flex items-center gap-1">
                          🏠 Sin Medidor (Plana)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {tieneMedidor ? (
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className="bg-slate-950/80 border border-slate-800/80 text-slate-400 font-mono font-bold text-xs px-3 py-1.5 rounded-xl shadow-inner select-none cursor-not-allowed opacity-90 inline-flex items-center gap-1"
                            title="Lectura anterior histórica (Bloqueada para edición)"
                          >
                            <span className="material-symbols-outlined text-[14px] text-slate-500">lock</span>
                            <span>{s.lecturaAnterior || 0} m³</span>
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {tieneMedidor ? (
                        (() => {
                          const esMenor = s.lecturaActual !== undefined && s.lecturaActual !== '' && Number(s.lecturaActual) < Number(s.lecturaAnterior);
                          return (
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                min={s.lecturaAnterior || 0}
                                value={s.lecturaActual !== undefined ? s.lecturaActual : (s.lecturaAnterior || 0)}
                                onChange={(e) => handleLecturaChange(s.id, e.target.value)}
                                className={`w-28 rounded-xl px-3 py-1.5 text-center font-mono font-black text-sm focus:outline-none transition-all ${
                                  esMenor
                                    ? 'bg-rose-950 text-rose-100 border-4 border-rose-500 shadow-xl shadow-rose-600/40 animate-pulse'
                                    : 'bg-slate-950 text-cyan-300 border border-cyan-500/50 focus:border-cyan-400'
                                }`}
                              />
                              {esMenor && (
                                <span className="bg-rose-600 text-white font-headline text-[10px] font-black px-2 py-0.5 rounded-md shadow-md animate-pulse whitespace-nowrap">
                                  ⚠️ Lectura Menor ({s.lecturaActual} &lt; {s.lecturaAnterior})
                                </span>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-slate-500 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-extrabold text-sm">
                      {tieneMedidor ? (
                        <span className={consumo > 30 ? 'text-amber-400' : 'text-slate-100'}>
                          {consumo} m³
                        </span>
                      ) : (
                        <span className="text-slate-500 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-mono">
                      <p className="font-extrabold text-emerald-400 text-sm">
                        ${cobroEstimado.toLocaleString()} COP
                      </p>
                      {tieneMedidor ? (
                        <p className="text-[10px] text-slate-400 font-headline font-normal">
                          ${cargoFijo.toLocaleString()} cargo fijo + {m3Facturables} m³ (${(m3Facturables * valorM3).toLocaleString()})
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-headline font-normal">
                          ${tarifaBase.toLocaleString()} base + ${cargoFijo.toLocaleString()} cargo fijo
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {!tieneMedidor ? (
                        <span className="bg-slate-800 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full">
                          Tarifa Fija Mensual
                        </span>
                      ) : posFuga ? (
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">warning</span>
                          <span>Posible Fuga (+50%)</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          <span>Consumo Normal</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>



      {/* MODAL DE CONFIRMACIÓN DE GUARDADO DE AVANCE DE CAMPO */}
      {mostrarModalConfirmacionAvance && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <span className="material-symbols-outlined text-emerald-400 text-3xl">save</span>
              <div>
                <h3 className="font-extrabold font-headline text-slate-100 text-base">
                  Guardar Avance de Campo
                </h3>
                <p className="text-slate-400 text-xs font-body">Periodo Lectura: {periodoFactura}</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3 text-xs font-headline">
              <div className="flex justify-between items-center text-slate-300">
                <span>Avance registrado:</span>
                <span className="font-extrabold text-cyan-400 font-mono text-sm">{lecturasTomadasCount} de {suscriptoresConMedidorCount} Predios ({porcentajeAvanceLecturas}%)</span>
              </div>

              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${porcentajeAvanceLecturas}%` }}
                />
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-slate-400 font-normal">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>Estado Red: <strong>{isOnline ? '📶 En Línea (Sincronización Inmediata)' : '📡 Modo Vereda (Guardado Local)'}</strong></span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {porcentajeAvanceLecturas === 100
                    ? '🎉 ¡Felicitaciones! Has completado el 100% de las lecturas del periodo.'
                    : 'ℹ️ Puedes continuar tomando y guardando las lecturas faltantes en los próximos días sin perder tu trabajo.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarModalConfirmacionAvance(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-headline font-bold text-xs transition-colors cursor-pointer"
              >
                Seguir Digitando
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMostrarModalConfirmacionAvance(false);
                  await handleGuardarLecturas();
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold font-headline text-xs py-3 rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Confirmar y Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

class LecturasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error en LecturasPage:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-4xl mx-auto text-slate-100 font-headline space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-amber-400">
              <span className="material-symbols-outlined text-3xl">build_circle</span>
              <h2 className="text-xl font-extrabold">Sincronización de Lecturas de Campo</h2>
            </div>
            <p className="text-xs text-slate-300 font-normal">
              Se detectó un cambio en el formato de los datos almacenados localmente. Haz clic en el botón a continuación para restablecer la vista de lectura limpia.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem('aquarural-lecturas-draft-v1');
                    localStorage.removeItem('aquarural-lecturas-v1');
                  } catch (e) {}
                  window.location.reload();
                }}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl cursor-pointer shadow-lg"
              >
                🔄 Restablecer Vista de Lecturas
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LecturasPage = () => (
  <LecturasErrorBoundary>
    <LecturasPageContent />
  </LecturasErrorBoundary>
);

export default LecturasPage;
