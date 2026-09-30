import { useState, useEffect, Fragment } from 'react';
import api from '../../services/api.service';
import Dropdown from '../../components/Dropdown';

const ROL_LABELS = { FONTANERO: 'Fontanero', TESORERO: 'Tesorero' };

// Sección aparte de Configuración: gestionar quién tiene acceso al sistema
// (Tesorero/Fontanero) es control de acceso, no un parámetro de cómo opera
// el acueducto (tarifas, cargos) — misma lógica de separación ya aplicada
// a la Pasarela de Pagos Wompi.
const EquipoPage = () => {
  const [equipo, setEquipo] = useState([]);
  const [veredasDisponibles, setVeredasDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
  const [nuevoMiembro, setNuevoMiembro] = useState({ nombre: '', correo: '', password: '', rol: 'FONTANERO', veredasAsignadas: [] });
  const [passwordConfirmarCrear, setPasswordConfirmarCrear] = useState('');
  const [verPasswordCrear, setVerPasswordCrear] = useState(false);
  const [creandoMiembro, setCreandoMiembro] = useState(false);
  const [errorEquipo, setErrorEquipo] = useState('');
  const [mensaje, setMensaje] = useState(null);

  const [editandoId, setEditandoId] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ nombre: '', estado: 'ACTIVO', veredasAsignadas: [] });
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // No existe recuperación de contraseña por correo (ver PLAN_DE_TRABAJO.md) —
  // esta es la única salida cuando un Fontanero/Tesorero la olvida: el admin
  // del acueducto le define una nueva y se la comunica directamente.
  const [miembroAResetear, setMiembroAResetear] = useState(null);
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [verPassword, setVerPassword] = useState(false);
  const [reseteandoPassword, setReseteandoPassword] = useState(false);
  const [errorReset, setErrorReset] = useState('');

  const cargarEquipo = async () => {
    setCargando(true);
    try {
      const { data } = await api.get('/equipo');
      setEquipo(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setErrorEquipo('No se pudo cargar el equipo de trabajo.');
    } finally {
      setCargando(false);
    }
  };

  // Veredas reales del padrón, para asignarle a cada fontanero solo las que
  // le corresponden en campo — mismo criterio de "derivar de los datos
  // reales" que usa el filtro de LecturasPage.jsx, no una lista fija.
  const cargarVeredas = async () => {
    try {
      const { data } = await api.get('/asociados', { params: { limit: 1000 } });
      const lista = Array.isArray(data?.data?.asociados) ? data.data.asociados : [];
      setVeredasDisponibles([...new Set(lista.map((a) => a.vereda).filter(Boolean))].sort());
    } catch (e) {
      setVeredasDisponibles([]);
    }
  };

  useEffect(() => {
    cargarEquipo();
    cargarVeredas();
  }, []);

  const handleCrearMiembro = async (e) => {
    e.preventDefault();
    setErrorEquipo('');

    if (nuevoMiembro.password !== passwordConfirmarCrear) {
      setErrorEquipo('Las contraseñas no coinciden.');
      return;
    }

    setCreandoMiembro(true);
    try {
      await api.post('/equipo', nuevoMiembro);
      setNuevoMiembro({ nombre: '', correo: '', password: '', rol: 'FONTANERO', veredasAsignadas: [] });
      setPasswordConfirmarCrear('');
      setMostrarModalCrear(false);
      setMensaje({ tipo: 'ok', texto: 'Miembro del equipo creado exitosamente.' });
      await cargarEquipo();
    } catch (err) {
      setErrorEquipo(err.response?.data?.message || 'Error al crear el miembro del equipo.');
    } finally {
      setCreandoMiembro(false);
    }
  };

  const handleEliminarMiembro = async (id) => {
    if (!window.confirm('¿Eliminar el acceso de este miembro del equipo?')) return;
    try {
      await api.delete(`/equipo/${id}`);
      await cargarEquipo();
    } catch (err) {
      setErrorEquipo(err.response?.data?.message || 'Error al eliminar el miembro del equipo.');
    }
  };

  const abrirEdicion = (miembro) => {
    setEditandoId(miembro._id);
    setFormEdicion({
      nombre: miembro.nombre,
      estado: miembro.estado || 'ACTIVO',
      veredasAsignadas: miembro.veredasAsignadas || [],
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormEdicion({ nombre: '', estado: 'ACTIVO', veredasAsignadas: [] });
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    setGuardandoEdicion(true);
    setErrorEquipo('');
    try {
      await api.put(`/equipo/${editandoId}`, formEdicion);
      setMensaje({ tipo: 'ok', texto: 'Miembro del equipo actualizado.' });
      cancelarEdicion();
      await cargarEquipo();
    } catch (err) {
      setErrorEquipo(err.response?.data?.message || 'Error al actualizar el miembro del equipo.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const abrirModalReset = (miembro) => {
    setMiembroAResetear(miembro);
    setPasswordNueva('');
    setPasswordConfirmar('');
    setVerPassword(false);
    setErrorReset('');
  };

  const handleResetearPassword = async (e) => {
    e.preventDefault();
    setErrorReset('');

    if (passwordNueva !== passwordConfirmar) {
      setErrorReset('Las contraseñas no coinciden.');
      return;
    }

    setReseteandoPassword(true);
    try {
      await api.put(`/equipo/${miembroAResetear._id}`, { password: passwordNueva });
      setMensaje({ tipo: 'ok', texto: `Contraseña de ${miembroAResetear.nombre} restablecida. Comunícasela directamente.` });
      setMiembroAResetear(null);
    } catch (err) {
      setErrorReset(err.response?.data?.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setReseteandoPassword(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-body">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">groups</span>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 font-headline tracking-tight">Equipo de Trabajo</h1>
            <p className="text-slate-500 text-xs font-body">
              Crea accesos para tu fontanero o tesorero. El fontanero solo puede registrar lecturas de medidor.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMostrarModalCrear(true)}
          style={{ color: '#ffffff' }}
          className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline text-xs px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-base">person_add</span>
          <span>Nuevo Acceso</span>
        </button>
      </div>

      {errorEquipo && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-headline font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{errorEquipo}</span>
        </div>
      )}
      {mensaje && (
        <div className={`p-3 rounded-2xl text-xs font-headline font-bold flex items-center gap-2 ${
          mensaje.tipo === 'ok'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Tabla — mismo patrón visual que SuperAdmin/AcueductosPage */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {cargando ? (
            <div className="py-10 text-center text-gray-400">
              <span className="material-symbols-outlined text-3xl animate-spin text-[#1D4ED8]">sync</span>
              <p className="text-xs font-headline mt-2">Cargando equipo...</p>
            </div>
          ) : equipo.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <span className="material-symbols-outlined text-3xl text-gray-300">group_off</span>
              <p className="text-xs font-headline mt-2">Aún no has creado accesos para tu equipo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <colgroup>
                  <col />
                  <col />
                  <col />
                  <col />
                  <col className="w-px" />
                </colgroup>
                <thead>
                  <tr className="bg-gray-50/80 text-[11px] font-headline uppercase tracking-wider text-gray-400">
                    <th className="py-3.5 px-6">Nombre</th>
                    <th className="py-3.5 px-4">Correo</th>
                    <th className="py-3.5 px-4">Rol</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-6 whitespace-nowrap text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-body text-gray-700">
                  {equipo.map((m, i) =>
                    editandoId === m._id ? (
                      <Fragment key={m._id}>
                        <tr className={`bg-blue-50/60 border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}>
                          <td className="py-3 px-6" colSpan={2}>
                            <input
                              type="text"
                              required
                              autoFocus
                              value={formEdicion.nombre}
                              onChange={(e) => setFormEdicion({ ...formEdicion, nombre: e.target.value })}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
                            />
                          </td>
                          <td className="py-3 px-4 text-gray-500">{ROL_LABELS[m.rol] || m.rol}</td>
                          <td className="py-3 px-4">
                            <Dropdown
                              value={formEdicion.estado}
                              onChange={(estado) => setFormEdicion({ ...formEdicion, estado })}
                              className="w-36"
                              options={[
                                { value: 'ACTIVO', label: 'Activo' },
                                { value: 'INACTIVO', label: 'Inactivo' },
                              ]}
                            />
                          </td>
                          <td className="py-3 px-6 whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={handleGuardarEdicion}
                              disabled={guardandoEdicion}
                              style={{ color: '#ffffff' }}
                              className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                            >
                              {guardandoEdicion ? '...' : 'Guardar'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelarEdicion}
                              className="text-slate-500 hover:text-slate-700 text-xs px-3.5 py-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </td>
                        </tr>
                        {m.rol === 'FONTANERO' && (
                          <tr className="bg-blue-50/60">
                            <td colSpan={5} className="px-6 pb-4 pt-0">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Veredas asignadas <span className="text-slate-400 font-normal normal-case">(sin selección, ve todo el padrón)</span>
                              </p>
                              {veredasDisponibles.length === 0 ? (
                                <p className="text-[11px] text-slate-400 italic">Sin veredas registradas en el padrón aún.</p>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {veredasDisponibles.map((v) => {
                                    const seleccionada = (formEdicion.veredasAsignadas || []).includes(v);
                                    return (
                                      <button
                                        key={v}
                                        type="button"
                                        onClick={() =>
                                          setFormEdicion((prev) => ({
                                            ...prev,
                                            veredasAsignadas: seleccionada
                                              ? (prev.veredasAsignadas || []).filter((x) => x !== v)
                                              : [...(prev.veredasAsignadas || []), v],
                                          }))
                                        }
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold font-headline transition-all cursor-pointer border ${
                                          seleccionada
                                            ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-[#1D4ED8]/40'
                                        }`}
                                      >
                                        {v}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ) : (
                      <tr
                        key={m._id}
                        className={`hover:bg-gray-50/50 transition-colors border-t border-gray-50 ${i === 0 ? 'border-t-0' : ''}`}
                      >
                        <td className="py-4 px-6 font-bold text-gray-900 whitespace-nowrap">{m.nombre}</td>
                        <td className="py-4 px-4 text-gray-500">{m.correo}</td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-50 border border-blue-200 text-[#1D4ED8] text-[10px] font-bold px-2.5 py-1 rounded-full font-headline">
                            {ROL_LABELS[m.rol] || m.rol}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {m.estado === 'INACTIVO' ? (
                            <span className="bg-gray-100 border border-gray-200 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-full font-headline">
                              Inactivo
                            </span>
                          ) : (
                            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full font-headline">
                              Activo
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            onClick={() => abrirEdicion(m)}
                            className="text-gray-400 hover:text-[#1D4ED8] p-2 hover:bg-gray-100 rounded-xl transition-all inline-flex cursor-pointer"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirModalReset(m)}
                            className="text-gray-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-xl transition-all inline-flex cursor-pointer"
                            title="Restablecer Contraseña"
                          >
                            <span className="material-symbols-outlined text-lg">key</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminarMiembro(m._id)}
                            className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all inline-flex cursor-pointer"
                            title="Eliminar acceso"
                          >
                            <span className="material-symbols-outlined text-lg text-red-500">delete</span>
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* MODAL: CREAR NUEVO ACCESO */}
      {mostrarModalCrear && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1D4ED8]">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 font-headline">Crear Nuevo Acceso</h3>
                  <p className="text-xs text-slate-500 font-body">Fontanero o Tesorero de tu acueducto</p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalCrear(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCrearMiembro} className="space-y-4">
              <div>
                <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">Nombre completo</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="ej. Pedro Alvarez"
                  value={nuevoMiembro.nombre}
                  onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, nombre: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">Correo de acceso</label>
                <input
                  type="email"
                  required
                  placeholder="correo@ejemplo.com"
                  value={nuevoMiembro.correo}
                  onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, correo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">Contraseña (mín. 6)</label>
                <div className="relative">
                  <input
                    type={verPasswordCrear ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={nuevoMiembro.password}
                    onChange={(e) => setNuevoMiembro({ ...nuevoMiembro, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPasswordCrear((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1D4ED8] cursor-pointer"
                    title={verPasswordCrear ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-lg">{verPasswordCrear ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">Confirmar contraseña</label>
                <div className="relative">
                  <input
                    type={verPasswordCrear ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={passwordConfirmarCrear}
                    onChange={(e) => setPasswordConfirmarCrear(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPasswordCrear((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1D4ED8] cursor-pointer"
                    title={verPasswordCrear ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-lg">{verPasswordCrear ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {passwordConfirmarCrear && (
                  <p className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
                    nuevoMiembro.password === passwordConfirmarCrear ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    <span className="material-symbols-outlined text-xs">
                      {nuevoMiembro.password === passwordConfirmarCrear ? 'check_circle' : 'error'}
                    </span>
                    {nuevoMiembro.password === passwordConfirmarCrear ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">Rol</label>
                <Dropdown
                  value={nuevoMiembro.rol}
                  onChange={(rol) => setNuevoMiembro({ ...nuevoMiembro, rol })}
                  options={[
                    { value: 'FONTANERO', label: 'Fontanero' },
                    { value: 'TESORERO', label: 'Tesorero' },
                  ]}
                />
              </div>

              {nuevoMiembro.rol === 'FONTANERO' && (
                <div>
                  <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">
                    Veredas asignadas <span className="text-slate-400 font-normal normal-case">(opcional — sin selección, ve todo el padrón)</span>
                  </label>
                  {veredasDisponibles.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Aún no hay veredas registradas en el padrón de suscriptores.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl p-3 max-h-32 overflow-y-auto">
                      {veredasDisponibles.map((v) => {
                        const seleccionada = nuevoMiembro.veredasAsignadas.includes(v);
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() =>
                              setNuevoMiembro((prev) => ({
                                ...prev,
                                veredasAsignadas: seleccionada
                                  ? prev.veredasAsignadas.filter((x) => x !== v)
                                  : [...prev.veredasAsignadas, v],
                              }))
                            }
                            className={`px-3 py-1.5 rounded-full text-[11px] font-bold font-headline transition-all cursor-pointer border ${
                              seleccionada
                                ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#1D4ED8]/40'
                            }`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalCrear(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoMiembro}
                  style={{ color: '#ffffff' }}
                  className="w-1/2 bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline py-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  <span>{creandoMiembro ? 'Creando...' : 'Crear Acceso'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESTABLECER CONTRASEÑA */}
      {miembroAResetear && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">key</span>
                <h3 className="text-base font-extrabold text-slate-800 font-headline">Restablecer Contraseña</h3>
              </div>
              <button onClick={() => setMiembroAResetear(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
              No existe recuperación automática de contraseña. Define una nueva contraseña temporal para{' '}
              <strong className="text-slate-800">{miembroAResetear?.nombre}</strong> y comunícasela directamente
              (en persona o por WhatsApp) — podrá cambiarla después desde su propia sesión.
            </div>

            {errorReset && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-headline font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorReset}</span>
              </div>
            )}

            <form onSubmit={handleResetearPassword} className="space-y-4">
              <div>
                <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">Nueva contraseña (mín. 6)</label>
                <div className="relative">
                  <input
                    type={verPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoFocus
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1D4ED8] cursor-pointer"
                    title={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-lg">{verPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">Confirmar nueva contraseña</label>
                <div className="relative">
                  <input
                    type={verPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 pr-10 text-slate-800 text-xs focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1D4ED8] cursor-pointer"
                    title={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <span className="material-symbols-outlined text-lg">{verPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {passwordConfirmar && (
                  <p className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
                    passwordNueva === passwordConfirmar ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    <span className="material-symbols-outlined text-xs">
                      {passwordNueva === passwordConfirmar ? 'check_circle' : 'error'}
                    </span>
                    {passwordNueva === passwordConfirmar ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setMiembroAResetear(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold font-headline py-3 rounded-2xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reseteandoPassword}
                  style={{ color: '#ffffff' }}
                  className="w-1/2 bg-amber-500 hover:bg-amber-600 font-extrabold font-headline py-3 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">key</span>
                  <span>{reseteandoPassword ? 'Guardando...' : 'Restablecer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipoPage;
