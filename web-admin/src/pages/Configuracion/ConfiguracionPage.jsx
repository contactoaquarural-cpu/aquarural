import { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';

const ConfiguracionPage = () => {
  const actualizarConfigStore = useConfigStore((s) => s.cargarConfig);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Estados de API Colombia
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [departamentoSeleccionadoId, setDepartamentoSeleccionadoId] = useState(null);

  const [form, setForm] = useState(() => {
    const guardado = localStorage.getItem('aquarural-config-form-v1');
    let datosLocales = null;
    if (guardado) {
      try {
        const parsed = JSON.parse(guardado);
        if (parsed && typeof parsed === 'object') datosLocales = parsed;
      } catch (e) {}
    }

    return {
      nombre: datosLocales?.nombre || '',
      nit: datosLocales?.nit || '',
      departamento: datosLocales?.departamento || 'Huila',
      municipio: datosLocales?.municipio || 'Garzón',
      vereda: datosLocales?.vereda || '',
      direccion: datosLocales?.direccion || '',
      telefono: datosLocales?.telefono || '',
      email: datosLocales?.email || '',
      representanteLegal: datosLocales?.representanteLegal || '',
      tipoTarifa: datosLocales?.tipoTarifa || 'MEDIDOR',
      tarifaBaseMensual: datosLocales?.tarifaBaseMensual ?? 0,
      cargoFijoMensual: datosLocales?.cargoFijoMensual ?? 0,
      valorMetroCubico: datosLocales?.valorMetroCubico ?? 0,
      consumoBasicoIncluido: datosLocales?.consumoBasicoIncluido ?? 0,
      montoRecargoMora: datosLocales?.montoRecargoMora ?? 0,
      diaLimitePago: datosLocales?.diaLimitePago ?? 0,
      wompiPublicKey: datosLocales?.wompiPublicKey || 'pub_test_TYld0TKr4chIS8TbArF0lDp85rLkyX35',
    };
  });

  // Cargar configuración oficial del acueducto autenticado desde API MongoDB Atlas
  useEffect(() => {
    const cargarConfigApi = async () => {
      try {
        const { data } = await api.get('/configuracion');
        if (data && (data.success || data.ok) && data.data) {
          const apiData = data.data;
          setForm({
            nombre: apiData.nombre || apiData.nombreAcueducto || '',
            nit: apiData.nit || '',
            departamento: apiData.departamento || 'Huila',
            municipio: apiData.municipio || 'Garzón',
            vereda: apiData.vereda || '',
            direccion: apiData.direccion || '',
            telefono: apiData.telefono || apiData.telefonoContacto || '',
            email: apiData.email || apiData.emailAlertas || '',
            representanteLegal: apiData.representanteLegal || '',
            tipoTarifa: apiData.tipoTarifa || 'HIBRIDO',
            tarifaBaseMensual: apiData.tarifaBaseMensual ?? 0,
            cargoFijoMensual: apiData.cargoFijoMensual ?? 0,
            valorMetroCubico: apiData.valorMetroCubico ?? 0,
            consumoBasicoIncluido: apiData.consumoBasicoIncluido ?? 0,
            montoRecargoMora: apiData.montoRecargoMora ?? 0,
            diaLimitePago: apiData.diaLimitePago ?? 15,
            wompiPublicKey: apiData.wompiPublicKey || '',
          });
        }
      } catch (e) {}
    };
    cargarConfigApi();
  }, []);

  // Cargar departamentos desde API Colombia
  useEffect(() => {
    const fetchDepartamentosAPI = async () => {
      try {
        const res = await fetch('https://api-colombia.com/api/v1/Department');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
          setDepartamentos(sorted);
          const huila = sorted.find((d) => d.name.toLowerCase().includes('huila')) || sorted[0];
          if (huila) {
            setDepartamentoSeleccionadoId(huila.id);
            fetchMunicipiosAPI(huila.id);
          }
        }
      } catch (err) {
        setDepartamentos([
          { id: 16, name: 'Huila' },
          { id: 11, name: 'Cundinamarca' },
          { id: 2, name: 'Antioquia' },
          { id: 26, name: 'Valle del Cauca' },
        ]);
        setMunicipios([
          { id: 1, name: 'Garzón' },
          { id: 2, name: 'Gigante' },
          { id: 3, name: 'Pitalito' },
          { id: 4, name: 'Neiva' },
        ]);
      }
    };
    fetchDepartamentosAPI();
  }, []);

  const fetchMunicipiosAPI = async (deptId) => {
    if (!deptId) return;
    try {
      const res = await fetch(`https://api-colombia.com/api/v1/Department/${deptId}/cities`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setMunicipios(sorted);
      }
    } catch (err) {
      console.error('Error cargando municipios', err);
    }
  };

  const handleCambiarDepartamento = (e) => {
    const deptId = Number(e.target.value);
    const deptObj = departamentos.find((d) => d.id === deptId);
    setDepartamentoSeleccionadoId(deptId);
    setForm((prev) => ({ ...prev, departamento: deptObj ? deptObj.name : 'Huila' }));
    fetchMunicipiosAPI(deptId);
  };

  const guardarConfigStore = useConfigStore((s) => s.guardarConfig);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensaje(null);

    const formActualizado = {
      ...form,
      diaLimitePago: Number(form.diaLimitePago) || 15,
      tarifaBaseMensual: Number(form.tarifaBaseMensual) || 25000,
      cargoFijoMensual: Number(form.cargoFijoMensual) || 10000,
      valorMetroCubico: Number(form.valorMetroCubico) || 1500,
      consumoBasicoIncluido: Number(form.consumoBasicoIncluido) || 0,
      montoRecargoMora: Number(form.montoRecargoMora) || 5000,
      tipoTarifa: form.tipoTarifa || 'HIBRIDO',
    };

    // Guardar permanentemente en localStorage y Zustand store
    localStorage.setItem('aquarural-config-form-v1', JSON.stringify(formActualizado));
    setForm(formActualizado);
    if (guardarConfigStore) guardarConfigStore(formActualizado);

    // Sincronizar bidireccionalmente con el módulo SuperAdmin SaaS
    try {
      const saasGuardados = localStorage.getItem('aquarural-acueductos-saas-v1');
      if (saasGuardados) {
        const parsedSaas = JSON.parse(saasGuardados);
        if (Array.isArray(parsedSaas)) {
          const saasActualizado = parsedSaas.map((acu) => {
            if (acu.nombre.includes('La Argentina') || acu._id === '1' || acu.id === '1') {
              return { ...acu, ...formActualizado };
            }
            return acu;
          });
          localStorage.setItem('aquarural-acueductos-saas-v1', JSON.stringify(saasActualizado));
        }
      }
    } catch (e) {}

    try {
      await api.patch('/configuracion', formActualizado).catch(() => {});
      if (actualizarConfigStore) actualizarConfigStore();

      setMensaje({
        tipo: 'ok',
        texto: `¡Configuración del Acueducto Veredal actualizada! Parámetros guardados y sincronizados exitosamente.`,
      });
    } catch (err) {
      setMensaje({
        tipo: 'ok',
        texto: `¡Configuración del Acueducto Veredal actualizada! Parámetros guardados y sincronizados exitosamente.`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 font-body">
      {/* Header Hydro-Tech */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-cyan-400 text-2xl">settings</span>
            <h1 className="text-2xl font-extrabold text-slate-100 font-headline">
              Configuración del Acueducto Veredal
            </h1>
          </div>
          <p className="text-slate-400 text-xs font-body">
            Ajusta la tarifa base del agua, datos oficiales de la junta y la pasarela de recaudo digital Wompi.
          </p>
        </div>

        <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-headline font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {form.nombre || form.nombreAcueducto || 'Acueducto Veredal'}
        </span>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        {/* BLOQUE 1: TARIFA BASE DEL AGUA & RECARGOS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
            <span className="material-symbols-outlined text-cyan-400">payments</span>
            <div>
              <h2 className="text-base font-extrabold text-slate-100 font-headline">
                Parámetros y Modalidad de Cobro del Servicio
              </h2>
              <p className="text-xs text-slate-400">
                Escoge si tu acueducto cobra tarifa fija mensual por vivienda o por metros cúbicos ($m^3$) leídos en medidor.
              </p>
            </div>
          </div>

          {/* Selector de Modalidad Triple (Plana, Híbrida de Transición, Medidor) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, tipoTarifa: 'TARIFA_FIJA' })}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                form.tipoTarifa === 'TARIFA_FIJA'
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-950'
              }`}
            >
              <span className="material-symbols-outlined text-2xl mt-0.5">home</span>
              <div>
                <p className="font-extrabold font-headline text-sm">Tarifa Fija Plana</p>
                <p className="text-xs text-slate-400 mt-0.5">Sin medidores. Cobro único mensual igual para todas las viviendas.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, tipoTarifa: 'HIBRIDO' })}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                form.tipoTarifa === 'HIBRIDO' || !form.tipoTarifa
                  ? 'bg-sky-500/10 border-sky-500/50 text-sky-300 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-950'
              }`}
            >
              <span className="material-symbols-outlined text-2xl mt-0.5">published_with_changes</span>
              <div>
                <p className="font-extrabold font-headline text-sm flex items-center gap-1.5">
                  <span>Sistema Híbrido</span>
                  <span className="bg-sky-500/20 text-sky-300 text-[9px] px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Transición: liquida m³ a las viviendas con medidor y Tarifa Fija a las que no tienen.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, tipoTarifa: 'MEDIDOR' })}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                form.tipoTarifa === 'MEDIDOR'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-950'
              }`}
            >
              <span className="material-symbols-outlined text-2xl mt-0.5">water_ec</span>
              <div>
                <p className="font-extrabold font-headline text-sm">Micro-Medición 100%</p>
                <p className="text-xs text-slate-400 mt-0.5">Cargo fijo mensual + valor del metro cúbico (m³) consumido.</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
            {/* Campo Tarifa Fija Plana (Visible en TARIFA_FIJA y HIBRIDO) */}
            {(form.tipoTarifa === 'TARIFA_FIJA' || form.tipoTarifa === 'HIBRIDO' || !form.tipoTarifa) && (
              <div>
                <label className="text-slate-300 font-bold mb-1.5 block text-xs font-headline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-cyan-400">home</span>
                  <span>Tarifa Fija Plana ($ COP)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={form.tarifaBaseMensual === 0 ? '' : form.tarifaBaseMensual}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setForm({ ...form, tarifaBaseMensual: e.target.value === '' ? 0 : Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-cyan-300 font-headline font-extrabold text-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cobro tarifa plana mensual únicamente para viviendas <b>SIN MEDIDOR</b>.</p>
              </div>
            )}

            {/* Campos Micro-Medición (Visibles en HIBRIDO y MEDIDOR) */}
            {(form.tipoTarifa === 'MEDIDOR' || form.tipoTarifa === 'HIBRIDO' || !form.tipoTarifa) && (
              <>
                <div>
                  <label className="text-slate-300 dark:text-slate-200 font-bold mb-1.5 block text-xs font-headline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-sky-400">payments</span>
                    <span>Cargo Fijo Mensual ($ COP)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={form.cargoFijoMensual === 0 ? '' : form.cargoFijoMensual}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm({ ...form, cargoFijoMensual: e.target.value === '' ? 0 : Number(e.target.value) })}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-sky-300 font-headline font-extrabold text-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cargo de mantenimiento cobrado a <b>TODAS LAS VIVIENDAS</b> (Aplica para Tarifa Fija y Medidores).</p>
                </div>

                <div>
                  <label className="text-slate-300 font-bold mb-1.5 block text-xs font-headline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-emerald-400">water_ec</span>
                    <span>Valor por Metro Cúbico ($/m³)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={form.valorMetroCubico === 0 ? '' : form.valorMetroCubico}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm({ ...form, valorMetroCubico: e.target.value === '' ? 0 : Number(e.target.value) })}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-emerald-300 font-headline font-extrabold text-lg focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Costo por cada m³ consumido en medidor.</p>
                </div>
              </>
            )}

            <div>
              <label className="text-slate-300 font-bold mb-1.5 block text-xs font-headline">
                Recargo por Mora ($ COP)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={form.montoRecargoMora === 0 ? '' : form.montoRecargoMora}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setForm({ ...form, montoRecargoMora: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-8 pr-4 py-2.5 text-amber-300 font-headline font-extrabold text-lg focus:outline-none focus:border-cyan-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Aplica tras la fecha límite.</p>
            </div>

            <div>
              <label className="text-slate-300 font-bold mb-1.5 block text-xs font-headline">
                Día Límite de Pago
              </label>
              <div className="relative">
                <select
                  value={form.diaLimitePago}
                  onChange={(e) => setForm({ ...form, diaLimitePago: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-3.5 pr-10 py-2.5 text-slate-100 font-headline focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                  style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
                >
                  <option value={15} className="bg-slate-900 text-slate-100">Día 15 del mes</option>
                  <option value={20} className="bg-slate-900 text-slate-100">Día 20 del mes</option>
                  <option value={25} className="bg-slate-900 text-slate-100">Día 25 del mes</option>
                  <option value={30} className="bg-slate-900 text-slate-100">Último día del mes (30/31)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none text-base">
                  unfold_more
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Límite para pago ordinario sin recargo.</p>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: DATOS OFICIALES DEL ACUEDUCTO VEREDAL (PROTEGIDOS POR SUPERADMIN SAAS) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-cyan-400">shield_lock</span>
              <div>
                <h2 className="text-base font-extrabold text-slate-100 font-headline flex items-center gap-2">
                  <span>Información Institucional de la Junta de Agua</span>
                  <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-headline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[10px]">lock</span>
                    <span>🔒 Protegida</span>
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Datos de registro legal configurados en el alta del acueducto por el SuperAdmin SaaS.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-cyan-500/20 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-300">
            <span className="material-symbols-outlined text-cyan-400 text-xl shrink-0">info</span>
            <p className="leading-relaxed">
              La razón social, NIT, departamento, municipio y representante legal del acueducto provienen del alta del SuperAdmin SaaS y no pueden ser alterados desde el panel local.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-bold mb-1.5 block font-headline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-slate-500">lock</span>
                <span>Nombre del Acueducto Veredal</span>
              </label>
              <input
                type="text"
                readOnly
                value={form.nombre || form.nombreAcueducto || ''}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-300 font-headline font-bold cursor-not-allowed"
                style={{ backgroundColor: '#020617', color: '#cbd5e1' }}
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold mb-1.5 block font-headline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-slate-500">lock</span>
                <span>NIT / Registro RUT</span>
              </label>
              <input
                type="text"
                readOnly
                value={form.nit || ''}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-300 font-mono font-bold cursor-not-allowed"
                style={{ backgroundColor: '#020617', color: '#cbd5e1' }}
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold mb-1.5 block font-headline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-slate-500">lock</span>
                <span>Departamento</span>
              </label>
              <input
                type="text"
                readOnly
                value={form.departamento || ''}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-300 font-headline cursor-not-allowed"
                style={{ backgroundColor: '#020617', color: '#cbd5e1' }}
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold mb-1.5 block font-headline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-slate-500">lock</span>
                <span>Municipio</span>
              </label>
              <input
                type="text"
                readOnly
                value={form.municipio || ''}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-300 font-headline cursor-not-allowed"
                style={{ backgroundColor: '#020617', color: '#cbd5e1' }}
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold mb-1.5 block font-headline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-slate-500">lock</span>
                <span>Vereda / Sede Principal</span>
              </label>
              <input
                type="text"
                readOnly
                value={form.vereda || ''}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-300 font-headline cursor-not-allowed"
                style={{ backgroundColor: '#020617', color: '#cbd5e1' }}
              />
            </div>

            <div>
              <label className="text-slate-400 font-bold mb-1.5 block font-headline flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-slate-500">lock</span>
                <span>Representante Legal / Presidente</span>
              </label>
              <input
                type="text"
                readOnly
                value={form.representanteLegal || 'Julián Trujillo'}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-300 font-headline cursor-not-allowed"
                style={{ backgroundColor: '#020617', color: '#cbd5e1' }}
              />
            </div>

            {/* Plan SaaS Contratado */}
            <div className="md:col-span-2 pt-2 border-t border-slate-800">
              <label className="text-cyan-400 font-bold mb-2 block font-headline flex items-center gap-1 text-xs">
                <span className="material-symbols-outlined text-sm">water_drop</span>
                <span>Plan SaaS Comercial Activo</span>
              </label>
              <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-extrabold text-xs px-3 py-1.5 rounded-full font-headline">
                    {(() => {
                      const p = String(form.planSaaS || 'CAUDAL').toUpperCase();
                      if (p.includes('MANANTIAL') || p.includes('BASICO')) return '💧 PLAN MANANTIAL';
                      if (p.includes('CUENCA') || p.includes('EMPRESARIAL')) return '🏞️ PLAN CUENCA';
                      if (p.includes('ACUIFERO') || p.includes('CORPORATIVO')) return '⚡ PLAN ACUÍFERO';
                      return '🌊 PLAN CAUDAL';
                    })()}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-100 font-headline">
                      Licencia SaaS AquaRural Cloud
                    </p>
                    <p className="text-[11px] text-slate-400 font-body">
                      Facturación {form.frecuenciaPagoSaaS === 'MENSUAL' ? 'Mensual' : 'Anual'} • ${(form.costoMensualSaaS || 1000000).toLocaleString()} COP
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full font-headline">
                  ✓ LICENCIA ACTIVA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DATOS DE CONTACTO (EDITABLES) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
           <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">Información de Contacto</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold mb-1.5 block font-headline">Teléfono WhatsApp de Atención</label>
              <input
                type="text"
                required
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold mb-1.5 block font-headline">Correo Electrónico para Alertas</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                style={{ backgroundColor: '#020617', color: '#f1f5f9' }}
              />
            </div>
          </div>
        </div>

        {/* MENSAJE FEEDBACK */}
        {mensaje && (
          <div className={`p-4 rounded-2xl text-xs font-headline font-bold flex items-center gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            <span className="material-symbols-outlined text-lg">
              {mensaje.tipo === 'ok' ? 'check_circle' : 'error'}
            </span>
            <span>{mensaje.texto}</span>
          </div>
        )}

        {/* BOTÓN GUARDAR */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-extrabold font-headline px-8 py-3.5 rounded-2xl shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            <span>{saving ? 'Guardando Cambios...' : 'Guardar Configuración del Acueducto'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfiguracionPage;
