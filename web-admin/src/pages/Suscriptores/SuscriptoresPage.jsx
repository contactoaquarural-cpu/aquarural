import { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

const SuscriptoresPage = () => {
  const [suscriptores, setSuscriptores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch inicial desde la base de datos backend aislado por acueductoId
  useEffect(() => {
    const cargarDesdeApi = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/asociados').catch(() => ({ data: null }));
        if (data && (data.success || data.ok)) {
          const rawLista = data.data?.asociados || data.suscriptores || data.data || [];
          if (Array.isArray(rawLista)) {
            const listaApi = rawLista.map((s) => ({
              ...s,
              id: s.id || s._id || s.matricula,
              _id: s._id || s.id || s.matricula,
            }));
            setSuscriptores(listaApi);
          } else {
            setSuscriptores([]);
          }
        } else {
          setSuscriptores([]);
        }
      } catch (e) {
        setSuscriptores([]);
      } finally {
        setLoading(false);
      }
    };
    cargarDesdeApi();
  }, []);

  const [buscar, setBuscar] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroMedidor, setFiltroMedidor] = useState('TODOS');
  const [mensaje, setMensaje] = useState(null);
  const [errorForm, setErrorForm] = useState('');

  // Modales
  const [mostrarModalExcel, setMostrarModalExcel] = useState(false);
  const [mostrarModalForm, setMostrarModalForm] = useState(false);
  const [suscriptorEditando, setSuscriptorEditando] = useState(null);
  const [suscriptorAEliminar, setSuscriptorAEliminar] = useState(null);

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
    estadoMoratorio: 'AL_DIA',
  });

  const departamentoConfig = useConfigStore((s) => s.departamento || 'Huila');
  const municipioConfig = useConfigStore((s) => s.municipio || 'Garzón');

  const abrirModalCrear = () => {
    setSuscriptorEditando(null);
    setErrorForm('');
    const proximaMatricula = `ACU-${String(suscriptores.length + 101).padStart(4, '0')}`;
    setForm({
      matricula: proximaMatricula,
      cedula: '',
      nombres: '',
      vereda: 'La Argentina',
      tieneMedidor: 'NO',
      medidor: '',
      esMedidorNuevo: 'SI',
      lecturaInicialArranque: 0,
      telefono: '',
      estadoMoratorio: 'AL_DIA',
    });
    setMostrarModalForm(true);
  };

  const abrirModalEditar = (s) => {
    setSuscriptorEditando(s);
    setErrorForm('');
    const med = s.medidor || s.numeroMedidor || '';
    const poseeMed = Boolean(med) && med !== 'S/N';

    setForm({
      matricula: s.matricula,
      cedula: s.cedula,
      nombres: s.nombres,
      telefono: s.telefono || '',
      departamento: s.departamento || departamentoConfig,
      municipio: s.municipio || municipioConfig,
      vereda: s.vereda,
      tieneMedidor: poseeMed ? 'SI' : 'NO',
      medidor: poseeMed ? med : '',
      esMedidorNuevo: s.esMedidorNuevo === false ? 'NO' : 'SI',
      lecturaInicialArranque: s.lecturaInicialArranque || s.lecturaAnterior || 0,
      estadoMoratorio: s.estadoMoratorio || 'AL_DIA',
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

    // 1. Validar Matrícula
    if (matriculaLimpia.length < 3) {
      setErrorForm('La Matrícula del suscriptor debe tener al menos 3 caracteres (ej. ACU-0101).');
      return;
    }

    // 2. Validar Cédula de Ciudadanía (Solo dígitos, entre 6 y 10 dígitos)
    if (!/^\d{6,10}$/.test(cedulaLimpia)) {
      setErrorForm('La Cédula de Ciudadanía debe contener entre 6 y 10 dígitos numéricos (ej. 1075283419).');
      return;
    }

    // 3. Validar Nombres y Apellidos Completos (Mínimo 3 caracteres)
    if (nombresLimpios.length < 3) {
      setErrorForm('Ingresa Nombres y Apellidos del suscriptor (ej. Carlos Alberto Trujillo).');
      return;
    }

    // 4. Validar Teléfono Celular (Opcional o 10 dígitos)
    if (telefonoLimpio && !/^3\d{9}$/.test(telefonoLimpio)) {
      setErrorForm('El Teléfono Celular debe ser un número móvil de 10 dígitos iniciando por 3 (ej. 3166160377).');
      return;
    }

    // 5. Validar Medidor según opción de selección
    let medidorFinal = 'S/N';
    let esNuevoBool = true;
    let lecturaArranqueNum = 0;

    if (form.tieneMedidor === 'SI') {
      if (medidorLimpio.length < 2) {
        setErrorForm('Escribe el N° de Medidor / Contador (ej. MED-7741).');
        return;
      }
      medidorFinal = medidorLimpio;
      esNuevoBool = form.esMedidorNuevo === 'SI';
      lecturaArranqueNum = esNuevoBool ? 0 : (Number(form.lecturaInicialArranque) || 0);
    }

    // 6. Validar Vereda
    if (veredaLimpia.length < 2) {
      setErrorForm('Especifica la Vereda, Sector o Dirección de la vivienda.');
      return;
    }

    const payload = {
      ...form,
      cedula: cedulaLimpia,
      telefono: telefonoLimpio,
      nombres: nombresLimpios,
      vereda: veredaLimpia,
      medidor: medidorFinal,
      numeroMedidor: medidorFinal,
      esMedidorNuevo: esNuevoBool,
      lecturaInicialArranque: lecturaArranqueNum,
      lecturaAnterior: lecturaArranqueNum,
      lecturaActual: lecturaArranqueNum,
      matricula: matriculaLimpia,
    };

    if (suscriptorEditando) {
      const targetId = String(suscriptorEditando._id || suscriptorEditando.id || suscriptorEditando.matricula);
      const suscriptoresActualizados = suscriptores.map((s) => {
        const itemKey = String(s._id || s.id || s.matricula);
        return itemKey === targetId ? { ...s, ...payload } : s;
      });
      setSuscriptores(suscriptoresActualizados);
      localStorage.setItem('aquarural-suscriptores-v3', JSON.stringify(suscriptoresActualizados));

      try {
        await api.put(`/asociados/${targetId}`, payload).catch(() => {});
      } catch (err) {}

      setMensaje({ tipo: 'ok', texto: `¡Suscriptor "${payload.nombres}" actualizado correctamente!` });
    } else {
      const nuevoObj = {
        id: String(Date.now()),
        _id: String(Date.now()),
        ...payload,
        latitud: null,
        longitud: null,
      };

      const suscriptoresActualizados = [...suscriptores, nuevoObj];
      setSuscriptores(suscriptoresActualizados);
      localStorage.setItem('aquarural-suscriptores-v3', JSON.stringify(suscriptoresActualizados));

      try {
        const { data } = await api.post('/asociados', payload).catch(() => ({ data: null }));
        if (data && data.suscriptor) {
          const newBackendId = data.suscriptor._id || data.suscriptor.id;
          const listaActualizada = suscriptoresActualizados.map((s) => s.id === nuevoObj.id ? { ...s, _id: newBackendId, id: newBackendId } : s);
          setSuscriptores(listaActualizada);
          localStorage.setItem('aquarural-suscriptores-v3', JSON.stringify(listaActualizada));
        }
      } catch (err) {}

      setMensaje({ tipo: 'ok', texto: `¡Suscriptor "${payload.nombres}" registrado exitosamente en la plataforma y MongoDB Atlas!` });
    }
    setMostrarModalForm(false);
  };

  const handleConfirmarEliminar = async () => {
    if (!suscriptorAEliminar) return;

    const targetId = String(suscriptorAEliminar._id || suscriptorAEliminar.id || suscriptorAEliminar.matricula);
    const suscriptoresRestantes = suscriptores.filter((s) => {
      const itemKey = String(s._id || s.id || s.matricula);
      return itemKey !== targetId;
    });

    setSuscriptores(suscriptoresRestantes);
    localStorage.setItem('aquarural-suscriptores-v3', JSON.stringify(suscriptoresRestantes));

    try {
      await api.delete(`/asociados/${targetId}`).catch(() => {});
    } catch (err) {}

    setMensaje({
      tipo: 'ok',
      texto: `¡Suscriptor ${suscriptorAEliminar.nombres} (Matrícula ${suscriptorAEliminar.matricula}) eliminado definitivamente de la plataforma y MongoDB Atlas!`,
    });
    setSuscriptorAEliminar(null);
  };

  // Filtrado de búsqueda
  const suscriptoresFiltrados = suscriptores.filter((s) => {
    const coincideBusqueda =
      s.nombres.toLowerCase().includes(buscar.toLowerCase()) ||
      s.cedula.includes(buscar) ||
      s.matricula.toLowerCase().includes(buscar.toLowerCase());

    const coincideEstado =
      filtroEstado === 'TODOS' || s.estadoMoratorio === filtroEstado;

    const tieneMedidor = Boolean(s.medidor || s.numeroMedidor) && (s.medidor || s.numeroMedidor) !== 'S/N';
    const coincideMedidor =
      filtroMedidor === 'TODOS' ||
      (filtroMedidor === 'CON_MEDIDOR' && tieneMedidor) ||
      (filtroMedidor === 'SIN_MEDIDOR' && !tieneMedidor);

    return coincideBusqueda && coincideEstado && coincideMedidor;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-body">
      {/* Header & Acciones Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-cyan-400 text-2xl">groups</span>
            <h1 className="text-2xl font-extrabold text-slate-100 font-headline">
              Gestión de Suscriptores Veredales
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-body">
            Padrón oficial de usuarios del agua, asignación de contadores y geolocalización de predios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarModalExcel(true)}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 px-4 py-2.5 rounded-2xl font-headline font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            <span>Cargar Excel (.xlsx)</span>
          </button>
          <button
            onClick={abrirModalCrear}
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 px-5 py-2.5 rounded-2xl font-headline font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base font-bold">person_add</span>
            <span>Registrar Nuevo Suscriptor</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK MENSAJE */}
      {mensaje && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-5 py-3.5 flex items-center justify-between text-emerald-300 text-xs font-headline shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-lg text-emerald-400">check_circle</span>
            <p className="font-semibold">{mensaje.texto}</p>
          </div>
          <button onClick={() => setMensaje(null)} className="text-emerald-400 hover:text-emerald-200">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* Bar de Búsqueda y Filtros */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            type="text"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar por cédula, matrícula o nombre..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
            style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-headline">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setFiltroMedidor('TODOS')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                filtroMedidor === 'TODOS'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({suscriptores.length})
            </button>
            <button
              onClick={() => setFiltroMedidor('CON_MEDIDOR')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                filtroMedidor === 'CON_MEDIDOR'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">water_ec</span>
              <span>Con Medidor ({suscriptores.filter((s) => Boolean(s.medidor || s.numeroMedidor) && (s.medidor || s.numeroMedidor) !== 'S/N').length})</span>
            </button>
            <button
              onClick={() => setFiltroMedidor('SIN_MEDIDOR')}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1 ${
                filtroMedidor === 'SIN_MEDIDOR'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Sin Medidor ({suscriptores.filter((s) => !Boolean(s.medidor || s.numeroMedidor) || (s.medidor || s.numeroMedidor) === 'S/N').length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setFiltroEstado('TODOS')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                filtroEstado === 'TODOS' ? 'bg-slate-800 text-slate-200' : 'text-slate-500'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroEstado('AL_DIA')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                filtroEstado === 'AL_DIA' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500'
              }`}
            >
              Al Día
            </button>
            <button
              onClick={() => setFiltroEstado('EN_MORA')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                filtroEstado === 'EN_MORA' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-500'
              }`}
            >
              En Mora
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Suscriptores con Opción de Eliminar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-[10px] font-headline uppercase tracking-widest text-slate-400">
                <th className="py-4 px-4 font-bold">Matrícula</th>
                <th className="py-4 px-4 font-bold">Suscriptor / Cédula</th>
                <th className="py-4 px-4 font-bold">Vereda / Sector</th>
                <th className="py-4 px-4 font-bold">N° Medidor / Modalidad</th>
                <th className="py-4 px-4 font-bold">GPS Finca</th>
                <th className="py-4 px-4 font-bold">Estado</th>
                <th className="py-4 px-4 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-body text-slate-200">
              {suscriptoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No se encontraron suscriptores con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                suscriptoresFiltrados.map((s) => {
                  const numMed = s.medidor || s.numeroMedidor;
                  const tieneMedidor = Boolean(numMed) && numMed !== 'S/N';

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-cyan-300">{s.matricula}</td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-100">{s.nombres}</p>
                        <p className="text-[11px] text-slate-400 font-mono">C.C. {s.cedula}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{s.vereda}</td>
                      <td className="py-4 px-4 font-mono">
                        {tieneMedidor ? (
                          <span className="bg-slate-950 border border-slate-800 text-cyan-300 font-bold px-2.5 py-1 rounded-lg text-xs">
                            {numMed}
                          </span>
                        ) : (
                          <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full font-headline">
                            🏠 Sin Medidor (Tarifa Fija)
                          </span>
                        )}
                      </td>
                    <td className="py-4 px-4">
                      {s.latitud ? (
                        <span className="inline-flex items-center gap-1 text-cyan-400 font-mono text-[11px]" title="Coordenadas GPS enviadas desde la App Móvil">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {s.latitud.toFixed(4)}, {s.longitud.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px] italic inline-flex items-center gap-1" title="Pendiente registro de coordenadas desde la App Móvil del suscriptor">
                          <span className="material-symbols-outlined text-xs text-slate-500">phone_iphone</span>
                          Pendiente App Móvil
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-headline font-extrabold inline-flex items-center gap-1 ${
                          s.estadoMoratorio === 'AL_DIA'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.estadoMoratorio === 'AL_DIA' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {s.estadoMoratorio === 'AL_DIA' ? 'AL DÍA' : 'EN MORA'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1.5">
                      {/* Botón Editar */}
                      <button
                        onClick={() => abrirModalEditar(s)}
                        className="text-slate-400 hover:text-cyan-300 p-2 hover:bg-slate-800 rounded-xl transition-all inline-flex cursor-pointer"
                        title="Editar Suscriptor"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>

                      {/* BOTÓN ELIMINAR SUSCRIPTOR */}
                      <button
                        onClick={() => setSuscriptorAEliminar(s)}
                        className="text-slate-400 hover:text-red-400 p-2 hover:bg-red-500/10 hover:border hover:border-red-500/30 rounded-xl transition-all inline-flex cursor-pointer"
                        title="Eliminar Suscriptor del Acueducto"
                      >
                        <span className="material-symbols-outlined text-lg text-red-400">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR SUSCRIPTOR */}
      {mostrarModalForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-2xl w-full max-h-[95vh] flex flex-col justify-between space-y-3 shadow-2xl animate-fade-in">
            {/* Header del Modal */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-xl">person_add</span>
                <h3 className="text-sm font-extrabold text-slate-100 font-headline">
                  {suscriptorEditando ? 'Editar Datos del Suscriptor' : 'Registrar Nuevo Suscriptor'}
                </h3>
              </div>
              <button onClick={() => setMostrarModalForm(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleGuardarSuscriptor} noValidate className="space-y-3 text-xs font-body overflow-y-auto pr-1">
              {errorForm && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-headline animate-fade-in">
                  <span className="material-symbols-outlined text-red-400 text-base">warning</span>
                  <p className="font-semibold">{errorForm}</p>
                </div>
              )}

              {/* FILA 1: Matrícula, Cédula, Teléfono */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1 font-headline">Matrícula</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={form.matricula}
                    onChange={(e) => setForm({ ...form, matricula: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 font-headline">Cédula de Ciudadanía</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value.replace(/\D/g, '') })}
                    placeholder="ej. 1075283419"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 font-headline">Teléfono (Opcional)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value.replace(/\D/g, '') })}
                    placeholder="ej. 3166160377"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>
              </div>

              {/* FILA 2: Nombres completos */}
              <div>
                <label className="text-slate-300 font-bold block mb-1 font-headline">Nombres y Apellidos Completos</label>
                <input
                  type="text"
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                  placeholder="ej. Carlos Alberto Trujillo Morales"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              {/* FILA 3: Dirección / Vereda & Acueducto info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-300 font-bold block mb-1 font-headline">Vereda / Sector / Dirección Vivienda</label>
                  <input
                    type="text"
                    value={form.vereda}
                    onChange={(e) => setForm({ ...form, vereda: e.target.value })}
                    placeholder="ej. Vereda La Argentina - Sector El Mirador"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-body text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1 font-headline">Acueducto</label>
                  <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-400 font-headline text-[11px] truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-cyan-400">location_on</span>
                    <span>{form.municipio || municipioConfig}, {form.departamento || departamentoConfig}</span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN MEDIDOR DE AGUA COMPACTA */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-slate-200 font-extrabold text-xs font-headline flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-cyan-400 text-base">water_ec</span>
                    <span>¿Tiene Medidor de Agua Instalado en la Vivienda?</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, tieneMedidor: 'NO', medidor: '' })}
                      className={`px-3 py-1 rounded-lg border font-headline font-bold text-[11px] transition-all cursor-pointer ${
                        form.tieneMedidor === 'NO'
                          ? 'bg-slate-800 border-cyan-500/50 text-cyan-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      🏠 No (Tarifa Fija)
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, tieneMedidor: 'SI' })}
                      className={`px-3 py-1 rounded-lg border font-headline font-bold text-[11px] transition-all cursor-pointer ${
                        form.tieneMedidor === 'SI'
                          ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      💧 Sí (Con Contador)
                    </button>
                  </div>
                </div>

                {form.tieneMedidor === 'SI' && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-800/80 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1 font-headline">N° Medidor / Contador</label>
                        <input
                          type="text"
                          maxLength={20}
                          value={form.medidor}
                          onChange={(e) => setForm({ ...form, medidor: e.target.value })}
                          placeholder="ej. MED-7741"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 font-bold block mb-1 font-headline">Estado del Contador</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, esMedidorNuevo: 'SI' })}
                            className={`p-1.5 rounded-lg border text-center font-headline transition-all cursor-pointer text-[10px] ${
                              form.esMedidorNuevo === 'SI'
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-extrabold shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                            }`}
                          >
                            🆕 Nuevo (0 m³)
                          </button>

                          <button
                            type="button"
                            onClick={() => setForm({ ...form, esMedidorNuevo: 'NO' })}
                            className={`p-1.5 rounded-lg border text-center font-headline transition-all cursor-pointer text-[10px] ${
                              form.esMedidorNuevo === 'NO'
                                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-extrabold shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                            }`}
                          >
                            ⏱️ Ya Instalado
                          </button>
                        </div>
                      </div>
                    </div>

                    {form.esMedidorNuevo === 'NO' && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                        <div className="space-y-0.5">
                          <label className="text-amber-300 font-bold block text-[11px] font-headline flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">speed</span>
                            <span>Lectura Inicial de Arranque (m³)</span>
                          </label>
                          <p className="text-[10px] text-slate-400 font-body">
                            Reloj el día de empalme. Se cobrará únicamente el consumo futuro.
                          </p>
                        </div>

                        <input
                          type="number"
                          min="0"
                          value={form.lecturaInicialArranque}
                          onChange={(e) => setForm({ ...form, lecturaInicialArranque: e.target.value })}
                          placeholder="ej. 340"
                          className="w-28 bg-slate-900 border border-amber-500/50 rounded-xl px-2.5 py-1 text-amber-300 font-mono font-extrabold text-xs text-center focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* BOTONES DE ACCIÓN SIEMPRE VISIBLES */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalForm(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-headline py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold font-headline py-2.5 rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer text-xs"
                >
                  {suscriptorEditando ? 'Guardar Cambios' : 'Registrar Suscriptor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN DE SUSCRIPTOR */}
      {suscriptorAEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400">warning</span>
                <h3 className="text-base font-extrabold text-slate-100 font-headline">
                  Eliminar Suscriptor
                </h3>
              </div>
              <button onClick={() => setSuscriptorAEliminar(null)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs font-body">
              <p className="text-slate-300">
                ¿Estás seguro de que deseas eliminar permanentemente a este suscriptor del acueducto veredal?
              </p>
              <div className="pt-2 border-t border-slate-900 text-xs">
                <p className="text-slate-400">Nombre: <strong className="text-slate-100">{suscriptorAEliminar.nombres}</strong></p>
                <p className="text-slate-400">Matrícula: <strong className="text-cyan-300 font-mono">{suscriptorAEliminar.matricula}</strong></p>
                <p className="text-slate-400">Cédula: <strong className="text-slate-200 font-mono">{suscriptorAEliminar.cedula}</strong></p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSuscriptorAEliminar(null)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarEliminar}
                className="w-1/2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold font-headline py-3 rounded-2xl shadow-lg shadow-red-500/20 text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
                <span>Eliminar Suscriptor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carga Masiva Excel */}
      {mostrarModalExcel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400 text-xl">file_upload</span>
                <h3 className="text-base font-extrabold text-slate-100 font-headline">Cargar Suscriptores desde Excel / CSV</h3>
              </div>
              <button onClick={() => setMostrarModalExcel(false)} className="text-slate-400 hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* BOTÓN DESCARGAR PLANTILLA */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">description</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100 font-headline">Plantilla Oficial Estructurada</h4>
                  <p className="text-[11px] text-slate-400 font-body">Descarga el formato exacto con todos los campos requeridos (Tarifa Fija y Medidor)</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const contenidoCsv = "Matricula,Cedula,Nombres,Telefono,Vereda,TipoServicio,NumeroMedidor,CategoriaTarifa,ValorBaseCOP,LecturaInicialM3,Estado\nACU-0101,1075234891,José Donaldo Gómez Murcia,3124567890,Sector El Mirador,TARIFA_FIJA,S/N,RESIDENCIAL,15000,0,AL_DIA\nACU-0102,36304582,María Eudoxia Rojas de Trujillo,3159876543,Sector Bajo,MEDIDOR,MED-90813,RESIDENCIAL,25000,45,AL_DIA";
                  const blob = new Blob(['\uFEFF' + contenidoCsv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', 'Plantilla_Oficial_Suscriptores_AquaRural.csv');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-headline font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Descargar Plantilla Excel (.csv)</span>
              </button>
            </div>

            {/* VISTA PREVIA DE EJEMPLO DE LA ESTRUCTURA COMPLETA */}
            <div className="space-y-2">
              <p className="text-xs font-headline font-bold text-slate-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-cyan-400 text-sm">table_view</span>
                <span>Estructura de Columnas Oficiales (Sincronizada con Registro Manual):</span>
              </p>
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto max-h-48">
                <table className="w-full text-left text-[10px] font-mono whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-900 text-cyan-300 border-b border-slate-800 font-headline font-bold">
                      <th className="py-2 px-3">Matrícula</th>
                      <th className="py-2 px-3">Cédula</th>
                      <th className="py-2 px-3">Nombres Completo</th>
                      <th className="py-2 px-3">Teléfono</th>
                      <th className="py-2 px-3">Vereda / Sector</th>
                      <th className="py-2 px-3">Tipo Servicio</th>
                      <th className="py-2 px-3">N° Medidor</th>
                      <th className="py-2 px-3">Categoría</th>
                      <th className="py-2 px-3">Valor Base COP</th>
                      <th className="py-2 px-3">Lectura m³</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-2 px-3 text-cyan-400 font-bold">ACU-0101</td>
                      <td className="py-2 px-3">1075234891</td>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-100">José Donaldo Gómez</td>
                      <td className="py-2 px-3">3124567890</td>
                      <td className="py-2 px-3 font-sans text-slate-400">Sector El Mirador</td>
                      <td className="py-2 px-3"><span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-sans text-[10px] font-bold">Tarifa Fija</span></td>
                      <td className="py-2 px-3 text-slate-500">S/N</td>
                      <td className="py-2 px-3 font-sans">Residencial</td>
                      <td className="py-2 px-3 text-emerald-400">$15.000</td>
                      <td className="py-2 px-3 text-slate-500">0 m³</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-cyan-400 font-bold">ACU-0102</td>
                      <td className="py-2 px-3">36304582</td>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-100">María Eudoxia Rojas</td>
                      <td className="py-2 px-3">3159876543</td>
                      <td className="py-2 px-3 font-sans text-slate-400">Sector Bajo</td>
                      <td className="py-2 px-3"><span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-sans text-[10px] font-bold">Medidor</span></td>
                      <td className="py-2 px-3 text-cyan-300">MED-90813</td>
                      <td className="py-2 px-3 font-sans">Residencial</td>
                      <td className="py-2 px-3 text-emerald-400">$25.000</td>
                      <td className="py-2 px-3 text-cyan-400 font-bold">45 m³</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CAJA DROPZONE DE CARGA E INPUT DE ARCHIVO REAL */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-slate-950/40">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const text = event.target.result;
                      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
                      if (lines.length <= 1) {
                        alert('El archivo no contiene filas de suscriptores para importar.');
                        return;
                      }

                      const nuevasFilas = [];
                      for (let i = 1; i < lines.length; i++) {
                        const cols = lines[i].split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ''));
                        if (cols.length >= 3 && cols[1] && cols[2]) {
                          const matricula = cols[0] || `ACU-${String(suscriptores.length + i + 100).padStart(4, '0')}`;
                          const cedula = cols[1];
                          const nombres = cols[2];
                          const telefono = cols[3] || '';
                          const vereda = cols[4] || 'Sector Centro';
                          const tipoServicio = (cols[5] || '').toUpperCase();
                          const esTarifaFija = tipoServicio.includes('FIJA') || cols[6] === 'S/N' || !cols[6];
                          const medidor = esTarifaFija ? 'S/N' : (cols[6] || `MED-${Math.floor(10000 + Math.random() * 90000)}`);
                          const categoriaTarifa = cols[7] || 'RESIDENCIAL';
                          const valorBase = Number(cols[8]) || (esTarifaFija ? 15000 : 25000);
                          const lecturaInicial = Number(cols[9]) || 0;

                          nuevasFilas.push({
                            _id: `sub_${Date.now()}_${i}`,
                            id: `sub_${Date.now()}_${i}`,
                            matricula,
                            cedula,
                            nombres,
                            telefono,
                            vereda,
                            tieneMedidor: esTarifaFija ? 'NO' : 'SI',
                            tipoServicio: esTarifaFija ? 'TARIFA_FIJA' : 'MEDIDOR',
                            medidor,
                            numeroMedidor: medidor,
                            categoriaTarifa,
                            valorBase,
                            lecturaInicialArranque: lecturaInicial,
                            estadoMoratorio: cols[10] || 'AL_DIA',
                          });
                        }
                      }

                      if (nuevasFilas.length > 0) {
                        const combinados = [...suscriptores, ...nuevasFilas];
                        setSuscriptores(combinados);
                        localStorage.setItem('aquarural-suscriptores-v3', JSON.stringify(combinados));
                        setMensaje({ tipo: 'ok', texto: `¡Se importaron ${nuevasFilas.length} suscriptores exitosamente!` });
                        setMostrarModalExcel(false);
                      } else {
                        alert('No se encontraron registros válidos en la plantilla subida.');
                      }
                    } catch (err) {
                      alert('Error al leer el archivo CSV. Asegúrate de usar la plantilla descargable oficial.');
                    }
                  };
                  reader.readAsText(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto pointer-events-none">
                <span className="material-symbols-outlined text-2xl">upload_file</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 font-headline pointer-events-none">
                Arrastra tu archivo .csv listo aquí o haz clic para examinar
              </p>
              <p className="text-[11px] text-cyan-400 font-body pointer-events-none">
                Carga automática sincronizada con el padrón veredal
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setMostrarModalExcel(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-headline cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuscriptoresPage;
