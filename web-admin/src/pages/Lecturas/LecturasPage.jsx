import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

const tieneMedidorReal = (s) => Boolean(s.numeroMedidor) && s.numeroMedidor !== 'S/N';

const LecturasPageContent = () => {
  const tipoTarifa = useConfigStore((s) => s.tipoTarifa || 'HIBRIDO');
  const cargoFijoMensual = useConfigStore((s) => s.cargoFijoMensual || 0);
  const valorMetroCubico = useConfigStore((s) => s.valorMetroCubico || 0);
  const consumoBasicoIncluido = useConfigStore((s) => s.consumoBasicoIncluido || 0);
  const tarifaBaseMensual = useConfigStore((s) => s.tarifaBaseMensual || 0);
  const cargarConfig = useConfigStore((s) => s.cargarConfig);

  // ?buscar=<matricula> — usado por el acceso rápido desde /mi-ruta: click
  // en un predio pendiente abre Lecturas ya filtrado en ese suscriptor, sin
  // tener que buscarlo manualmente en el padrón completo.
  const [searchParams] = useSearchParams();
  const busquedaInicial = searchParams.get('buscar') || '';

  const [asociados, setAsociados] = useState([]);
  const [lecturasEditadas, setLecturasEditadas] = useState({}); // { [asociadoId]: numero }
  const [gpsCapturado, setGpsCapturado] = useState({}); // { [asociadoId]: { latitud, longitud } }
  const [capturandoGpsId, setCapturandoGpsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [filtroVereda, setFiltroVereda] = useState('TODAS');
  const [filtroMedidor, setFiltroMedidor] = useState('TODOS');
  const [ordenamiento, setOrdenamiento] = useState('NOMBRE_AZ');
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState('');
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);

  const periodoActual = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const periodoActualISO = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    cargarConfig();
    cargarAsociados();
  }, []);

  const cargarAsociados = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/asociados', { params: { limit: 1000, incluirFacturadoPeriodo: 1 } });
      const lista = Array.isArray(data?.data?.asociados) ? data.data.asociados : [];
      setAsociados(lista);
      setLecturasEditadas({});
    } catch (e) {
      setError(e.response?.data?.message || 'Error al cargar el padrón de suscriptores.');
      setAsociados([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLecturaChange = (asociadoId, valor) => {
    setLecturasEditadas((prev) => ({ ...prev, [asociadoId]: valor }));
  };

  const capturarGps = (asociadoId) => {
    if (!navigator.geolocation) {
      setError('Este navegador no soporta geolocalización.');
      return;
    }
    setCapturandoGpsId(asociadoId);
    setError('');
    // Bandera para ignorar un callback de error que Chrome/Windows a veces
    // dispara DESPUÉS de que el de éxito ya guardó el punto (reintento
    // interno del proveedor de ubicación de alta precisión) — sin esto, el
    // guardado exitoso queda seguido de una alerta de error falsa.
    let yaResuelto = false;
    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        yaResuelto = true;
        const latitud = posicion.coords.latitude;
        const longitud = posicion.coords.longitude;
        try {
          await api.patch(`/asociados/${asociadoId}/gps`, { latitud, longitud });
          setGpsCapturado((prev) => ({ ...prev, [asociadoId]: { latitud, longitud } }));
        } catch (e) {
          setError(e.response?.data?.message || 'No se pudo guardar la ubicación GPS.');
        } finally {
          setCapturandoGpsId(null);
        }
      },
      (err) => {
        if (yaResuelto) return;
        let mensaje;
        if (err.code === err.PERMISSION_DENIED) {
          mensaje = 'Permiso de ubicación denegado. Actívalo en el navegador para capturar el GPS del predio.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          mensaje = 'El dispositivo no pudo determinar la ubicación. Verifica que el GPS/ubicación esté activado en el equipo o intenta desde un celular con señal.';
        } else if (err.code === err.TIMEOUT) {
          mensaje = 'La ubicación tardó demasiado en responder. Intenta de nuevo en un lugar con mejor señal.';
        } else {
          mensaje = 'No se pudo obtener la ubicación GPS. Intenta de nuevo.';
        }
        setError(mensaje);
        setCapturandoGpsId(null);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  };

  const obtenerLecturaActualEditable = (asociado) =>
    lecturasEditadas[asociado._id] !== undefined ? lecturasEditadas[asociado._id] : String(asociado.lecturaActual ?? 0);

  const asociadosConMedidor = asociados.filter(tieneMedidorReal);
  const asociadosSinMedidor = asociados.filter((s) => !tieneMedidorReal(s));

  const tieneInconsistencias = asociadosConMedidor.some((s) => {
    const valor = obtenerLecturaActualEditable(s);
    return valor !== '' && Number(valor) < (s.lecturaAnterior || 0);
  });

  const calcularConsumo = (s) => {
    const actual = Number(obtenerLecturaActualEditable(s)) || 0;
    return Math.max(0, actual - (s.lecturaAnterior || 0));
  };

  const calcularCobroEstimado = (s) => {
    const tieneMedidor = tieneMedidorReal(s);
    if (tipoTarifa === 'MEDIDOR' || (tipoTarifa === 'HIBRIDO' && tieneMedidor)) {
      const consumo = calcularConsumo(s);
      const facturable = Math.max(0, consumo - consumoBasicoIncluido);
      return cargoFijoMensual + facturable * valorMetroCubico;
    }
    return s.tarifaPersonalizada ?? tarifaBaseMensual;
  };

  const totalConsumoM3 = asociadosConMedidor.reduce((acc, s) => acc + calcularConsumo(s), 0);
  const totalRecaudoProyectado = asociados.reduce((acc, s) => acc + calcularCobroEstimado(s), 0);
  // Cuenta como "avance" tanto lo ya guardado este ciclo en el backend
  // (fechaUltimaLectura cae en el periodo vigente) como lo editado en esta
  // sesión aún sin guardar — así el avance no se "resetea" a 0% al recargar
  // la página si el fontanero ya había guardado antes.
  const yaRegistradaEsteCiclo = (s) =>
    Boolean(s.fechaUltimaLectura) && String(s.fechaUltimaLectura).slice(0, 7) === periodoActualISO;

  const lecturasTomadasCount = asociadosConMedidor.filter(
    (s) => lecturasEditadas[s._id] !== undefined || yaRegistradaEsteCiclo(s)
  ).length;
  const porcentajeAvance =
    asociadosConMedidor.length > 0 ? Math.round((lecturasTomadasCount / asociadosConMedidor.length) * 100) : 0;

  const colorAvance =
    porcentajeAvance >= 80
      ? { texto: 'text-emerald-600', icono: 'bg-emerald-50 border-emerald-200 text-emerald-600' }
      : porcentajeAvance >= 50
      ? { texto: 'text-amber-600', icono: 'bg-amber-50 border-amber-200 text-amber-600' }
      : { texto: 'text-rose-600', icono: 'bg-rose-50 border-rose-200 text-rose-600' };

  const veredasDisponibles = ['TODAS', ...new Set(asociados.map((s) => s.vereda).filter(Boolean))];

  const asociadosFiltrados = asociados
    .filter((s) => {
      const q = busqueda.toLowerCase();
      const coincideBusqueda =
        (s.nombres || '').toLowerCase().includes(q) ||
        (s.apellidos || '').toLowerCase().includes(q) ||
        String(s.cedula || '').includes(q) ||
        (s.matricula || '').toLowerCase().includes(q) ||
        (s.numeroMedidor || '').toLowerCase().includes(q);
      const coincideVereda = filtroVereda === 'TODAS' || s.vereda === filtroVereda;
      const coincideMedidor =
        filtroMedidor === 'TODOS' ||
        (filtroMedidor === 'CON_MEDIDOR' && tieneMedidorReal(s)) ||
        (filtroMedidor === 'SIN_MEDIDOR' && !tieneMedidorReal(s));
      return coincideBusqueda && coincideVereda && coincideMedidor;
    })
    .sort((a, b) => {
      if (ordenamiento === 'NOMBRE_AZ') {
        return `${a.nombres} ${a.apellidos}`.localeCompare(`${b.nombres} ${b.apellidos}`, 'es');
      }
      if (ordenamiento === 'MATRICULA') return (a.matricula || '').localeCompare(b.matricula || '', undefined, { numeric: true });
      if (ordenamiento === 'VEREDA') return (a.vereda || '').localeCompare(b.vereda || '');
      if (ordenamiento === 'MEDIDOR') return (a.numeroMedidor || '').localeCompare(b.numeroMedidor || '', undefined, { numeric: true });
      return 0;
    });

  const handleGuardarLecturas = async () => {
    setGuardando(true);
    setError('');
    try {
      const lecturas = Object.entries(lecturasEditadas)
        .filter(([, valor]) => valor !== '')
        .map(([asociadoId, valor]) => ({ asociadoId, lecturaActual: Number(valor) }));

      if (lecturas.length === 0) {
        setError('No hay lecturas nuevas para guardar.');
        return;
      }

      const { data } = await api.post('/asociados/lecturas-masivas', { lecturas });
      setMensaje(`Se guardaron ${data.data.actualizados} lecturas exitosamente.`);
      await cargarAsociados();
    } catch (e) {
      setError(e.response?.data?.message || 'Error al guardar las lecturas.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">water_ec</span>
            <h1 className="text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
              Lecturas & Medidores de Agua (m³)
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-body capitalize">
            Ciclo vigente: {periodoActual}. Ingreso de lecturas de campo y cálculo automático de consumo en metros cúbicos.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <button
            onClick={() => setMostrarModalConfirmacion(true)}
            disabled={guardando || tieneInconsistencias || lecturasTomadasCount === 0}
            style={!tieneInconsistencias ? { color: '#ffffff' } : undefined}
            className={`font-extrabold font-headline text-xs px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${
              tieneInconsistencias
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-[#1D4ED8] hover:bg-[#1E3A8A] cursor-pointer hover:shadow-md'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tieneInconsistencias ? 'block' : 'save'}</span>
            <span>{guardando ? 'Guardando...' : tieneInconsistencias ? 'Corregir Inconsistencia' : 'Guardar Lecturas'}</span>
          </button>
        </div>
      </div>

      {tieneInconsistencias && (
        <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-5 text-red-800 font-headline shadow-sm animate-fade-in flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl text-red-600">warning</span>
            </div>
            <div>
              <p className="font-black text-base tracking-wide">
                Hay lecturas menores a la anterior
              </p>
              <p className="text-xs text-red-700 font-medium mt-1 leading-relaxed">
                Revisa abajo las casillas marcadas en rojo con advertencia.
              </p>
            </div>
          </div>
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

      {mensaje && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3.5 flex items-center justify-between text-emerald-800 text-xs font-headline shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
            <p className="font-semibold">{mensaje}</p>
          </div>
          <button onClick={() => setMensaje(null)} className="text-emerald-600 hover:text-emerald-800">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Avance en Campo</span>
            <p className={`text-3xl font-extrabold font-headline mt-0.5 ${colorAvance.texto}`}>{porcentajeAvance}%</p>
            <p className="text-[11px] text-slate-500 mt-1">{lecturasTomadasCount} de {asociadosConMedidor.length} predios con lectura</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  porcentajeAvance >= 80 ? 'bg-emerald-500' : porcentajeAvance >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${porcentajeAvance}%` }}
              />
            </div>
          </div>
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${colorAvance.icono}`}>
            <span className="material-symbols-outlined text-xl">analytics</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Total Consumo Registrado</span>
          <p className="text-3xl font-extrabold text-[#1D4ED8] font-headline">{totalConsumoM3.toLocaleString()} m³</p>
          <p className="text-[11px] text-slate-500">Medido en las viviendas con contador activo</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Proyección de Recaudo</span>
          <p className="text-3xl font-extrabold text-emerald-600 font-headline">${totalRecaudoProyectado.toLocaleString()} COP</p>
          <p className="text-[11px] text-slate-500">
            {asociadosConMedidor.length} con medidor · {asociadosSinMedidor.length} tarifa fija
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-headline block">Padrón de Suscriptores</span>
          <p className="text-3xl font-extrabold text-slate-800 font-headline">{asociados.length} familias</p>
          <p className="text-[11px] text-slate-500">Esquema tarifario: {tipoTarifa}</p>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full lg:w-80 lg:shrink-0">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Buscar por suscriptor, cédula, matrícula o medidor..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:flex-1 lg:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-headline shrink-0">Medidor:</span>
            {/* Filtro Con/Sin medidor: separa de un vistazo a quién le toca
                tomar lectura de campo (con medidor, incluidos los nuevos con
                lectura en 0) de quién ya se factura directo por tarifa fija
                (sin medidor) — así el fontanero filtra su trabajo real sin
                tener que revisar fila por fila. Un solo color de acento
                (#1D4ED8) para el estado activo, igual que el resto de los
                controles de esta barra — el verde no comunicaba nada que
                el propio texto del botón no dijera ya. */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFiltroMedidor('TODOS')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all text-xs font-headline whitespace-nowrap ${
                  filtroMedidor === 'TODOS'
                    ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFiltroMedidor('CON_MEDIDOR')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all text-xs font-headline flex items-center justify-center gap-1 whitespace-nowrap ${
                  filtroMedidor === 'CON_MEDIDOR'
                    ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm">water_ec</span>
                Con Medidor
              </button>
              <button
                type="button"
                onClick={() => setFiltroMedidor('SIN_MEDIDOR')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all text-xs font-headline flex items-center justify-center gap-1 whitespace-nowrap ${
                  filtroMedidor === 'SIN_MEDIDOR'
                    ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm">home</span>
                Sin Medidor
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-headline shrink-0">Ordenar:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-[#1D4ED8] text-xs font-headline rounded-2xl pl-3.5 pr-9 py-2.5 focus:outline-none focus:border-[#1D4ED8] cursor-pointer appearance-none"
              >
                <option value="NOMBRE_AZ">Nombre (A - Z)</option>
                <option value="MATRICULA">N° Matrícula</option>
                <option value="VEREDA">Vereda / Sector</option>
                <option value="MEDIDOR">N° Medidor</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] pointer-events-none text-lg">
                unfold_more
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 font-headline shrink-0">Vereda:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={filtroVereda}
                onChange={(e) => setFiltroVereda(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-2xl pl-4 pr-9 py-2.5 focus:outline-none focus:border-[#1D4ED8] cursor-pointer appearance-none"
              >
                {veredasDisponibles.map((v) => (
                  <option key={v} value={v}>{v === 'TODAS' ? 'Todas' : v}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] pointer-events-none text-lg">
                unfold_more
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Lecturas — mismo patrón visual que SuperAdmin/AcueductosPage */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-[11px] font-headline uppercase tracking-wider text-gray-400">
                <th className="py-3.5 px-6">Suscriptor</th>
                <th className="py-3.5 px-4">Cédula</th>
                <th className="py-3.5 px-4">Vereda</th>
                <th className="py-3.5 px-4">Matrícula</th>
                <th className="py-3.5 px-4">Medidor / Modalidad</th>
                <th className="py-3.5 px-4">Lectura Anterior</th>
                <th className="py-3.5 px-4">Lectura Actual (m³)</th>
                <th className="py-3.5 px-4">GPS</th>
                <th className="py-3.5 px-4">Consumo (Δ m³)</th>
                <th className="py-3.5 px-4">Cobro Estimado</th>
                <th className="py-3.5 px-6">Estado</th>
              </tr>
            </thead>
            <tbody className="text-xs font-body text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">Cargando padrón de suscriptores...</td>
                </tr>
              ) : asociadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-gray-400">No se encontraron suscriptores con los criterios de búsqueda.</td>
                </tr>
              ) : (
                asociadosFiltrados.map((s, i) => {
                  const conMedidor = tieneMedidorReal(s);
                  const consumo = calcularConsumo(s);
                  const cobroEstimado = calcularCobroEstimado(s);
                  const lecturaEditable = obtenerLecturaActualEditable(s);
                  const esMenor = lecturaEditable !== '' && Number(lecturaEditable) < (s.lecturaAnterior || 0);
                  const bloqueadaPorFactura = conMedidor && s.periodoFacturado;

                  return (
                    <tr
                      key={s._id}
                      className={`hover:bg-gray-50/50 transition-colors border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}
                    >
                      <td className="py-5 px-6 font-extrabold text-gray-900 font-headline whitespace-nowrap">
                        {s.nombres} {s.apellidos}
                      </td>
                      <td className="py-5 px-4 text-gray-500 font-mono">{s.cedula}</td>
                      <td className="py-5 px-4 text-gray-600 whitespace-nowrap">{s.vereda || 'Centro'}</td>
                      <td className="py-5 px-4 text-[#1D4ED8] font-mono font-semibold">{s.matricula}</td>
                      <td className="py-5 px-4 font-semibold text-gray-700">
                        {conMedidor ? (
                          <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-[#1D4ED8] font-mono inline-block whitespace-nowrap">
                            {s.numeroMedidor}
                          </span>
                        ) : (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full font-headline whitespace-nowrap inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">home</span>
                            Sin Medidor (Tarifa Fija)
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-4">
                        {conMedidor ? (
                          <span className="text-gray-500 font-mono font-bold text-sm inline-flex items-center gap-1" title="Lectura anterior registrada">
                            <span className="material-symbols-outlined text-[14px] text-gray-400">lock</span>
                            <span>{s.lecturaAnterior || 0} m³</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-5 px-4">
                        {conMedidor ? (
                          <input
                            type="number"
                            min={s.lecturaAnterior || 0}
                            value={lecturaEditable}
                            disabled={bloqueadaPorFactura}
                            onChange={(e) => handleLecturaChange(s._id, e.target.value)}
                            title={
                              bloqueadaPorFactura
                                ? 'Ya se generó la factura de este periodo. Anúlala en Facturación para corregir.'
                                : esMenor
                                ? 'Advertencia: la lectura es menor a la anterior registrada.'
                                : undefined
                            }
                            className={`w-28 rounded-xl px-3 py-1.5 text-left font-mono font-black text-sm focus:outline-none transition-all border ${
                              bloqueadaPorFactura
                                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                : esMenor
                                ? 'bg-red-50 text-red-700 border-2 border-red-400'
                                : 'bg-white text-[#1D4ED8] border-blue-200 focus:border-[#1D4ED8]'
                            }`}
                          />
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-5 px-4">
                        <button
                          type="button"
                          onClick={() => capturarGps(s._id)}
                          disabled={capturandoGpsId === s._id}
                          title={
                            gpsCapturado[s._id]
                              ? `Guardado — Lat: ${gpsCapturado[s._id].latitud.toFixed(5)}, Lon: ${gpsCapturado[s._id].longitud.toFixed(5)}`
                              : s.latitud
                              ? `Ya tiene GPS — Lat: ${s.latitud.toFixed(5)}, Lon: ${s.longitud.toFixed(5)}. Click para actualizar.`
                              : 'Capturar y guardar GPS del predio'
                          }
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                            gpsCapturado[s._id] || s.latitud
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-[#1D4ED8] hover:border-blue-200'
                          }`}
                        >
                          <span className={`material-symbols-outlined text-base ${capturandoGpsId === s._id ? 'animate-spin' : ''}`}>
                            {capturandoGpsId === s._id ? 'progress_activity' : gpsCapturado[s._id] || s.latitud ? 'check_circle' : 'my_location'}
                          </span>
                        </button>
                      </td>
                      <td className="py-5 px-4 font-mono font-extrabold text-sm">
                        {conMedidor ? (
                          <span className={consumo > 30 ? 'text-amber-600' : 'text-gray-800'}>{consumo} m³</span>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-5 px-4 font-mono">
                        <p className="font-extrabold text-emerald-600 text-sm">${cobroEstimado.toLocaleString()} COP</p>
                      </td>
                      <td className="py-5 px-6">
                        {!conMedidor ? (
                          <span className="text-gray-400 text-[10px]">—</span>
                        ) : bloqueadaPorFactura ? (
                          <span className="bg-gray-100 text-gray-500 font-headline text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">lock</span>
                            Facturada
                          </span>
                        ) : lecturasEditadas[s._id] !== undefined || yaRegistradaEsteCiclo(s) ? (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-headline text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Tomada
                          </span>
                        ) : (
                          <span className="bg-amber-50 border border-amber-200 text-amber-700 font-headline text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE GUARDADO */}
      {mostrarModalConfirmacion && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">save</span>
              <div>
                <h3 className="font-extrabold font-headline text-slate-800 text-base">Guardar Lecturas</h3>
                <p className="text-slate-500 text-xs font-body capitalize">Ciclo vigente: {periodoActual}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs font-headline">
              <div className="flex justify-between items-center text-slate-700">
                <span>Lecturas a registrar:</span>
                <span className="font-extrabold text-[#1D4ED8] font-mono text-sm">{lecturasTomadasCount} predios</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Estos valores se guardarán como la lectura vigente de cada asociado, y servirán como base del próximo cálculo de consumo.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMostrarModalConfirmacion(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-2xl font-headline font-bold text-xs transition-colors cursor-pointer"
              >
                Seguir Digitando
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMostrarModalConfirmacion(false);
                  await handleGuardarLecturas();
                }}
                style={{ color: '#ffffff' }}
                className="flex-1 bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline text-xs py-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
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
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error en LecturasPage:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-4xl mx-auto text-slate-800 font-headline space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3 text-amber-600">
              <span className="material-symbols-outlined text-3xl">build_circle</span>
              <h2 className="text-xl font-extrabold">Error cargando Lecturas</h2>
            </div>
            <p className="text-xs text-slate-600 font-normal">
              Ocurrió un error inesperado en esta vista. Intenta recargar la página.
            </p>
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
