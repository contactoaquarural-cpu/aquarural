import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

const SuscriptoresPage = () => {
  const navigate = useNavigate();
  const [suscriptores, setSuscriptores] = useState([]);
  const [loading, setLoading] = useState(true);

  // El backend (no localStorage) es la única fuente de verdad — recargar
  // siempre que el CRUD confirme éxito, en vez de mutar el array local de
  // forma optimista y asumir que el backend hizo lo mismo.
  const cargarDesdeApi = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/asociados').catch(() => ({ data: null }));
      const rawLista = data?.data?.asociados || [];
      setSuscriptores(Array.isArray(rawLista) ? rawLista : []);
    } catch (e) {
      setSuscriptores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDesdeApi();
  }, []);

  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroMedidor, setFiltroMedidor] = useState('TODOS');
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Modales
  const [mostrarModalForm, setMostrarModalForm] = useState(false);
  const [suscriptorEditando, setSuscriptorEditando] = useState(null);
  const [suscriptorAEliminar, setSuscriptorAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Formulario nuevo/editar
  const [form, setForm] = useState({
    matricula: '',
    cedula: '',
    nombres: '',
    vereda: 'La Argentina',
    tieneMedidor: 'NO',
    medidor: '',
    esMedidorNuevo: 'SI',
    lecturaInicialArranque: 0,
    telefono: '',
  });

  const departamentoConfig = useConfigStore((s) => s.departamento || 'Huila');
  const municipioConfig = useConfigStore((s) => s.municipio || 'Garzón');

  const abrirModalCrear = () => {
    setSuscriptorEditando(null);
    setErrorForm('');
    // La matrícula ya no se calcula aquí (contar filas visibles se
    // desincroniza en cuanto se filtra o se borra un asociado de en medio) —
    // el backend genera el siguiente consecutivo real del acueducto.
    setForm({
      matricula: '',
      cedula: '',
      nombres: '',
      vereda: 'La Argentina',
      tieneMedidor: 'NO',
      medidor: '',
      esMedidorNuevo: 'SI',
      lecturaInicialArranque: 0,
      telefono: '',
    });
    setMostrarModalForm(true);
  };

  const abrirModalEditar = (s) => {
    setSuscriptorEditando(s);
    setErrorForm('');
    const med = s.numeroMedidor || '';
    const poseeMed = Boolean(med) && med !== 'S/N';

    setForm({
      matricula: s.matricula,
      cedula: s.cedula,
      nombres: s.nombres,
      telefono: s.telefono || '',
      vereda: s.vereda,
      tieneMedidor: poseeMed ? 'SI' : 'NO',
      medidor: poseeMed ? med : '',
      // Al EDITAR un suscriptor que ya tiene medidor, nunca se trata como
      // "nuevo" — un medidor que ya existía siempre conserva su lectura real
      // (lecturaActual), nunca se resetea a 0. "esMedidorNuevo" solo aplica al
      // dar de alta un suscriptor por primera vez (ver abrirModalCrear).
      esMedidorNuevo: 'NO',
      lecturaInicialArranque: s.lecturaActual || 0,
    });
    setMostrarModalForm(true);
  };

  const handleGuardarSuscriptor = async (e) => {
    e.preventDefault();
    setErrorForm('');

    const cedulaLimpia = form.cedula ? String(form.cedula).trim() : '';
    const telefonoLimpio = form.telefono ? String(form.telefono).trim() : '';
    const nombresLimpios = form.nombres ? String(form.nombres).trim() : '';
    const veredaLimpia = form.vereda ? String(form.vereda).trim() : '';
    const medidorLimpio = form.medidor ? String(form.medidor).trim() : '';
    const matriculaLimpia = form.matricula ? String(form.matricula).trim() : '';

    // Al crear, la matrícula la genera el backend si se deja en blanco (ver
    // generarSiguienteMatricula) — solo se exige un mínimo si el admin
    // escribió algo a mano, o siempre al editar (ya tiene una asignada).
    if (matriculaLimpia && matriculaLimpia.length < 3) {
      setErrorForm('La Matrícula debe tener al menos 3 caracteres (ej. MAT-0101).');
      return;
    }
    if (suscriptorEditando && !matriculaLimpia) {
      setErrorForm('La Matrícula no puede quedar vacía.');
      return;
    }
    if (!/^\d{6,10}$/.test(cedulaLimpia)) {
      setErrorForm('La Cédula de Ciudadanía debe contener entre 6 y 10 dígitos numéricos (ej. 1075283419).');
      return;
    }
    if (nombresLimpios.length < 3) {
      setErrorForm('Ingresa Nombres y Apellidos del suscriptor (ej. Carlos Alberto Trujillo).');
      return;
    }
    if (telefonoLimpio && !/^3\d{9}$/.test(telefonoLimpio)) {
      setErrorForm('El Teléfono Celular debe ser un número móvil de 10 dígitos iniciando por 3 (ej. 3166160377).');
      return;
    }

    let medidorFinal = 'S/N';
    let lecturaArranqueNum = 0;

    if (form.tieneMedidor === 'SI') {
      if (medidorLimpio.length < 2) {
        setErrorForm('Escribe el N° de Medidor / Contador (ej. MED-7741).');
        return;
      }
      medidorFinal = medidorLimpio;
      const esNuevoBool = form.esMedidorNuevo === 'SI';
      lecturaArranqueNum = esNuevoBool ? 0 : (Number(form.lecturaInicialArranque) || 0);
    }

    if (veredaLimpia.length < 2) {
      setErrorForm('Especifica la Vereda, Sector o Dirección de la vivienda.');
      return;
    }

    // Payload alineado al contrato real del backend (crearAsociadoSchema /
    // actualizarAsociadoSchema) — nunca campos inventados como "medidor" o
    // "tieneMedidor" que Zod descartaría en silencio.
    const payload = {
      cedula: cedulaLimpia,
      nombres: nombresLimpios,
      telefono: telefonoLimpio,
      vereda: veredaLimpia,
      numeroMedidor: medidorFinal,
      lecturaAnterior: lecturaArranqueNum,
      lecturaActual: lecturaArranqueNum,
    };
    // Solo se envía si el admin la escribió (siempre el caso al editar, dato
    // vacío al crear) — si va vacía, el backend genera el consecutivo real.
    if (matriculaLimpia) payload.matricula = matriculaLimpia;

    setGuardando(true);
    try {
      if (suscriptorEditando) {
        const targetId = suscriptorEditando._id;
        await api.put(`/asociados/${targetId}`, payload);
        setMensaje({ tipo: 'ok', texto: `¡Suscriptor "${payload.nombres}" actualizado correctamente!` });
      } else {
        await api.post('/asociados', payload);
        setMensaje({ tipo: 'ok', texto: `¡Suscriptor "${payload.nombres}" registrado exitosamente!` });
      }
      setMostrarModalForm(false);
      await cargarDesdeApi();
    } catch (err) {
      setErrorForm(err.response?.data?.message || 'No se pudo guardar el suscriptor.');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!suscriptorAEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/asociados/${suscriptorAEliminar._id}`);
      setMensaje({
        tipo: 'ok',
        texto: `¡Suscriptor ${suscriptorAEliminar.nombres} (Matrícula ${suscriptorAEliminar.matricula}) eliminado del acueducto!`,
      });
      setSuscriptorAEliminar(null);
      await cargarDesdeApi();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.message || 'No se pudo eliminar el suscriptor.' });
      setSuscriptorAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  // Filtrado de búsqueda (defensivo: nombres/cedula/matricula pueden faltar
  // en registros importados de forma incompleta)
  const suscriptoresFiltrados = suscriptores.filter((s) => {
    const nombres = s.nombres || '';
    const cedula = s.cedula || '';
    const matricula = s.matricula || '';
    const busq = buscar.toLowerCase();

    const coincideBusqueda =
      nombres.toLowerCase().includes(busq) ||
      cedula.includes(buscar) ||
      matricula.toLowerCase().includes(busq);

    const coincideEstado =
      filtroEstado === 'TODOS' || s.estadoMoratorio === filtroEstado;

    const tieneMedidor = Boolean(s.numeroMedidor) && s.numeroMedidor !== 'S/N';
    const coincideMedidor =
      filtroMedidor === 'TODOS' ||
      (filtroMedidor === 'CON_MEDIDOR' && tieneMedidor) ||
      (filtroMedidor === 'SIN_MEDIDOR' && !tieneMedidor);

    return coincideBusqueda && coincideEstado && coincideMedidor;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-body">
      {/* Header & Acciones Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">groups</span>
            <h1 className="text-2xl font-extrabold text-slate-800 font-headline">
              Gestión de Suscriptores Veredales
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-body">
            Padrón oficial de usuarios del agua, asignación de contadores y geolocalización de predios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/asociados/carga-masiva')}
            className="bg-white hover:bg-slate-50 text-[#1D4ED8] border border-blue-200 px-4 py-2.5 rounded-2xl font-headline font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>Cargar Excel (.xlsx)</span>
          </button>
          <button
            onClick={abrirModalCrear}
            style={{ color: '#ffffff' }}
            className="bg-[#1D4ED8] hover:bg-[#1E3A8A] px-5 py-2.5 rounded-2xl font-headline font-extrabold text-xs flex items-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base font-bold">person_add</span>
            <span>Registrar Nuevo Suscriptor</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK MENSAJE */}
      {mensaje && (
        <div className={`rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs font-headline shadow-sm animate-fade-in ${
          mensaje.tipo === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg">
              {mensaje.tipo === 'error' ? 'error' : 'check_circle'}
            </span>
            <p className="font-semibold">{mensaje.texto}</p>
          </div>
          <button onClick={() => setMensaje(null)} className="hover:opacity-70">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Bar de Búsqueda y Filtros */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por cédula, matrícula o nombre..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1D4ED8]/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-headline">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setFiltroMedidor('TODOS')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all whitespace-nowrap ${
                filtroMedidor === 'TODOS'
                  ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Todos ({suscriptores.length})
            </button>
            <button
              onClick={() => setFiltroMedidor('CON_MEDIDOR')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
                filtroMedidor === 'CON_MEDIDOR'
                  ? 'bg-blue-50 text-[#1D4ED8] border border-blue-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">water_ec</span>
              <span className="hidden sm:inline">Con Medidor ({suscriptores.filter((s) => Boolean(s.numeroMedidor) && s.numeroMedidor !== 'S/N').length})</span>
              <span className="sm:hidden">Con ({suscriptores.filter((s) => Boolean(s.numeroMedidor) && s.numeroMedidor !== 'S/N').length})</span>
            </button>
            <button
              onClick={() => setFiltroMedidor('SIN_MEDIDOR')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap ${
                filtroMedidor === 'SIN_MEDIDOR'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span className="hidden sm:inline">Sin Medidor ({suscriptores.filter((s) => !s.numeroMedidor || s.numeroMedidor === 'S/N').length})</span>
              <span className="sm:hidden">Sin ({suscriptores.filter((s) => !s.numeroMedidor || s.numeroMedidor === 'S/N').length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                filtroEstado === 'TODOS' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroEstado('AL_DIA')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                filtroEstado === 'AL_DIA' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'
              }`}
            >
              Al Día
            </button>
            <button
              onClick={() => setFiltroEstado('EN_MORA')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                filtroEstado === 'EN_MORA' ? 'bg-amber-50 text-amber-700' : 'text-slate-500'
              }`}
            >
              En Mora
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Suscriptores — mismo patrón visual que SuperAdmin/AcueductosPage */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 py-5 border-b border-gray-100">
          <p className="text-xs text-gray-400">Padrón oficial de usuarios del agua, contadores y geolocalización de predios</p>
          <span className="text-xs text-gray-500 font-mono bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            Total Suscriptores: {suscriptores.length}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 space-y-3">
            <span className="material-symbols-outlined text-3xl animate-spin text-[#1D4ED8]">sync</span>
            <p className="text-xs font-headline">Cargando suscriptores...</p>
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
                <col className="w-32" />
                <col className="w-px" />
              </colgroup>
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-headline uppercase tracking-wider text-gray-400">
                  <th className="py-3.5 px-6">Matrícula</th>
                  <th className="py-3.5 px-4">Suscriptor</th>
                  <th className="py-3.5 px-4">Cédula</th>
                  <th className="py-3.5 px-4">Vereda / Sector</th>
                  <th className="py-3.5 px-4">N° Medidor / Modalidad</th>
                  <th className="py-3.5 px-4">GPS Finca</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-6 text-left whitespace-nowrap tracking-normal">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-xs font-body text-gray-700">
                {suscriptoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No se encontraron suscriptores con los criterios de búsqueda.
                    </td>
                  </tr>
                ) : (
                  suscriptoresFiltrados.map((s, i) => {
                    const numMed = s.numeroMedidor;
                    const tieneMedidor = Boolean(numMed) && numMed !== 'S/N';

                    return (
                      <tr
                        key={s._id}
                        className={`hover:bg-gray-50/50 transition-colors border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}
                      >
                        <td className="py-5 px-6 font-mono font-bold text-[#1D4ED8]">
                          <Link to={`/asociados/${s._id}`} className="hover:underline">{s.matricula}</Link>
                        </td>
                        <td className="py-5 px-4 font-bold text-gray-900 whitespace-nowrap">{s.nombres}</td>
                        <td className="py-5 px-4 text-gray-500 font-mono">{s.cedula}</td>
                        <td className="py-5 px-4 text-gray-700">{s.vereda}</td>
                        <td className="py-5 px-4 font-mono">
                          {tieneMedidor ? (
                            <span className="bg-gray-50 border border-gray-200 text-[#1D4ED8] font-bold px-2.5 py-1 rounded-lg text-xs">
                              {numMed}
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full font-headline inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">home</span>
                              Sin Medidor (Tarifa Fija)
                            </span>
                          )}
                        </td>
                        <td className="py-5 px-4">
                          {s.latitud ? (
                            <span className="inline-flex items-center gap-1 text-[#1D4ED8] font-mono text-[11px]" title="Coordenadas GPS enviadas desde la App Móvil">
                              <span className="material-symbols-outlined text-sm">location_on</span>
                              {s.latitud.toFixed(4)}, {s.longitud.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px] italic inline-flex items-center gap-1" title="Pendiente registro de coordenadas desde la App Móvil del suscriptor">
                              <span className="material-symbols-outlined text-xs text-gray-400">phone_iphone</span>
                              Pendiente App Móvil
                            </span>
                          )}
                        </td>
                        <td className="py-5 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-headline font-extrabold inline-flex items-center gap-1 ${
                              s.estadoMoratorio === 'AL_DIA'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${s.estadoMoratorio === 'AL_DIA' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {s.estadoMoratorio === 'AL_DIA' ? 'AL DÍA' : s.estadoMoratorio === 'EN_MORA' ? 'EN MORA' : 'INACTIVO'}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-left space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => abrirModalEditar(s)}
                            className="text-gray-400 hover:text-[#1D4ED8] p-2 hover:bg-gray-100 rounded-xl transition-all inline-flex cursor-pointer"
                            title="Editar Suscriptor"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>

                          <button
                            onClick={() => setSuscriptorAEliminar(s)}
                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all inline-flex cursor-pointer"
                            title="Eliminar Suscriptor del Acueducto"
                          >
                            <span className="material-symbols-outlined text-lg text-red-500">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR SUSCRIPTOR */}
      {mostrarModalForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 max-w-2xl w-full max-h-[95vh] flex flex-col justify-between space-y-3 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1D4ED8] text-xl">person_add</span>
                <h3 className="text-sm font-extrabold text-slate-800 font-headline">
                  {suscriptorEditando ? 'Editar Datos del Suscriptor' : 'Registrar Nuevo Suscriptor'}
                </h3>
              </div>
              <button onClick={() => setMostrarModalForm(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleGuardarSuscriptor} noValidate className="space-y-3 text-xs font-body overflow-y-auto pr-1">
              {errorForm && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-headline animate-fade-in">
                  <span className="material-symbols-outlined text-red-500 text-base">warning</span>
                  <p className="font-semibold">{errorForm}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-bold block mb-1 font-headline">Matrícula</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={form.matricula}
                    disabled={!suscriptorEditando}
                    placeholder={!suscriptorEditando ? 'Automática (MAT-####)' : ''}
                    onChange={(e) => setForm({ ...form, matricula: e.target.value })}
                    title={!suscriptorEditando ? 'Se asigna automáticamente al guardar, siguiendo el consecutivo del acueducto.' : undefined}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-[#1D4ED8] font-mono font-bold focus:outline-none focus:border-[#1D4ED8] text-xs disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1 font-headline">Cédula de Ciudadanía</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value.replace(/\D/g, '') })}
                    placeholder="ej. 1075283419"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#1D4ED8] text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1 font-headline">Teléfono (Opcional)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })}
                    placeholder="ej. 3166160377"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-[#1D4ED8] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1 font-headline">Nombres y Apellidos Completos</label>
                <input
                  type="text"
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  placeholder="ej. Carlos Alberto Trujillo Morales"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#1D4ED8] text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-600 font-bold block mb-1 font-headline">Vereda / Sector / Dirección Vivienda</label>
                  <input
                    type="text"
                    value={form.vereda}
                    onChange={(e) => setForm({ ...form, vereda: e.target.value })}
                    placeholder="ej. Vereda La Argentina - Sector El Mirador"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-body text-xs focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1 font-headline">Acueducto</label>
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-500 font-headline text-[11px] truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#1D4ED8]">location_on</span>
                    <span>{municipioConfig}, {departamentoConfig}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-700 font-extrabold text-xs font-headline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#1D4ED8] text-base">water_ec</span>
                    <span>¿Tiene Medidor de Agua Instalado en la Vivienda?</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, tieneMedidor: 'NO', medidor: '' })}
                      className={`px-3 py-1 rounded-lg border font-headline font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 ${
                        form.tieneMedidor === 'NO'
                          ? 'bg-white border-[#1D4ED8]/40 text-[#1D4ED8] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">home</span>
                      No (Tarifa Fija)
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, tieneMedidor: 'SI' })}
                      className={`px-3 py-1 rounded-lg border font-headline font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1 ${
                        form.tieneMedidor === 'SI'
                          ? 'bg-blue-50 border-blue-200 text-[#1D4ED8] shadow-sm'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">water_ec</span>
                      Sí (Con Contador)
                    </button>
                  </div>
                </div>

                {form.tieneMedidor === 'SI' && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-200 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-600 font-bold block mb-1 font-headline">N° Medidor / Contador</label>
                        <input
                          type="text"
                          maxLength={20}
                          value={form.medidor}
                          onChange={(e) => setForm({ ...form, medidor: e.target.value })}
                          placeholder="ej. MED-7741"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-mono text-xs focus:outline-none focus:border-[#1D4ED8]"
                        />
                      </div>

                      <div>
                        <label className="text-slate-600 font-bold block mb-1 font-headline">Estado del Contador</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, esMedidorNuevo: 'SI' })}
                            className={`p-1.5 rounded-lg border text-center font-headline transition-all cursor-pointer text-[10px] inline-flex items-center justify-center gap-1 ${
                              form.esMedidorNuevo === 'SI'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">fiber_new</span>
                            Nuevo (0 m³)
                          </button>

                          <button
                            type="button"
                            onClick={() => setForm({ ...form, esMedidorNuevo: 'NO' })}
                            className={`p-1.5 rounded-lg border text-center font-headline transition-all cursor-pointer text-[10px] inline-flex items-center justify-center gap-1 ${
                              form.esMedidorNuevo === 'NO'
                                ? 'bg-amber-50 border-amber-200 text-amber-700 font-extrabold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">history</span>
                            Ya Instalado
                          </button>
                        </div>
                      </div>
                    </div>

                    {form.esMedidorNuevo === 'NO' && (
                      <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                        <div className="space-y-0.5">
                          <label className="text-amber-700 font-bold block text-[11px] font-headline flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">speed</span>
                            <span>Lectura Inicial de Arranque (m³)</span>
                          </label>
                          <p className="text-[10px] text-slate-500 font-body">
                            Reloj el día de empalme. Se cobrará únicamente el consumo futuro.
                          </p>
                        </div>

                        <input
                          type="number"
                          min="0"
                          value={form.lecturaInicialArranque}
                          onChange={(e) => setForm({ ...form, lecturaInicialArranque: e.target.value })}
                          placeholder="ej. 340"
                          className="w-28 bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-amber-700 font-mono font-extrabold text-xs text-center focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalForm(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{ color: '#ffffff' }}
                  className="w-1/2 bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer text-xs disabled:opacity-60"
                >
                  {guardando ? 'Guardando...' : suscriptorEditando ? 'Guardar Cambios' : 'Registrar Suscriptor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN DE SUSCRIPTOR */}
      {suscriptorAEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">warning</span>
                <h3 className="text-base font-extrabold text-slate-800 font-headline">
                  Eliminar Suscriptor
                </h3>
              </div>
              <button onClick={() => setSuscriptorAEliminar(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-body">
              <p className="text-slate-700">
                ¿Estás seguro de que deseas eliminar permanentemente a este suscriptor del acueducto veredal?
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs">
                <p className="text-slate-500">Nombre: <strong className="text-slate-800">{suscriptorAEliminar.nombres}</strong></p>
                <p className="text-slate-500">Matrícula: <strong className="text-[#1D4ED8] font-mono">{suscriptorAEliminar.matricula}</strong></p>
                <p className="text-slate-500">Cédula: <strong className="text-slate-700 font-mono">{suscriptorAEliminar.cedula}</strong></p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSuscriptorAEliminar(null)}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                disabled={eliminando}
                className="w-1/2 bg-red-600 hover:bg-red-500 text-white font-extrabold font-headline py-3 rounded-2xl shadow-sm text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>{eliminando ? 'Eliminando...' : 'Eliminar Suscriptor'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuscriptoresPage;
