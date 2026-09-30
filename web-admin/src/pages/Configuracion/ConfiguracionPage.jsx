import { useState, useEffect } from 'react';
import api from '../../services/api.service';
import { useConfigStore } from '../../store/config.store';
import Dropdown from '../../components/Dropdown';

// Página enfocada solo en tarifas y modalidad de cobro del servicio de agua —
// datos institucionales (solo lectura), información de contacto y cambio de
// contraseña viven en MiCuentaPage.jsx (separados a pedido del usuario, ya
// que son datos de naturaleza distinta: operación del negocio vs. identidad
// institucional vs. cuenta personal del admin logueado).
const ConfiguracionPage = () => {
  const actualizarConfigStore = useConfigStore((s) => s.cargarConfig);

  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [totalAsociados, setTotalAsociados] = useState(0);

  const [form, setForm] = useState({
    tipoTarifa: 'HIBRIDO',
    tarifaBaseMensual: 0,
    cargoFijoMensual: 0,
    valorMetroCubico: 0,
    consumoBasicoIncluido: 0,
    montoRecargoMora: 0,
    diaLimitePago: 15,
    trasladarCostoLicenciaAsociados: false,
    trasladarComisionWompiAsociados: false,
    frecuenciaPagoSaaS: 'ANUAL',
    costoSaaSVigente: 0,
    nombreAcueducto: '',
  });

  // Cargar configuración oficial del acueducto autenticado desde el backend
  useEffect(() => {
    const cargarConfigApi = async () => {
      try {
        const { data } = await api.get('/configuracion');
        if (data?.success && data.data) {
          const apiData = data.data;
          setForm({
            tipoTarifa: apiData.tipoTarifa || 'HIBRIDO',
            tarifaBaseMensual: apiData.tarifaBaseMensual ?? 0,
            cargoFijoMensual: apiData.cargoFijoMensual ?? 0,
            valorMetroCubico: apiData.valorMetroCubico ?? 0,
            consumoBasicoIncluido: apiData.consumoBasicoIncluido ?? 0,
            montoRecargoMora: apiData.montoRecargoMora ?? 0,
            diaLimitePago: apiData.diaLimitePago ?? 15,
            trasladarCostoLicenciaAsociados: Boolean(apiData.trasladarCostoLicenciaAsociados),
            trasladarComisionWompiAsociados: Boolean(apiData.trasladarComisionWompiAsociados),
            frecuenciaPagoSaaS: apiData.frecuenciaPagoSaaS || 'ANUAL',
            costoSaaSVigente: apiData.costoSaaSVigente || 0,
            nombreAcueducto: apiData.nombre || '',
          });
        }
      } catch (e) {
        setMensaje({ tipo: 'error', texto: 'No se pudo cargar la configuración del acueducto.' });
      }
    };
    cargarConfigApi();

    // Solo para estimar el aporte por suscriptor en tiempo real (ver toggle
    // de trasladar costo de licencia) — limit=1 porque solo se necesita el
    // total, no la lista completa.
    const cargarTotalAsociados = async () => {
      try {
        const { data } = await api.get('/asociados', { params: { limit: 1 } });
        setTotalAsociados(data?.data?.total || 0);
      } catch (e) {
        setTotalAsociados(0);
      }
    };
    cargarTotalAsociados();
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMensaje(null);

    const payload = {
      tipoTarifa: form.tipoTarifa || 'HIBRIDO',
      tarifaBaseMensual: Number(form.tarifaBaseMensual) || 0,
      cargoFijoMensual: Number(form.cargoFijoMensual) || 0,
      valorMetroCubico: Number(form.valorMetroCubico) || 0,
      consumoBasicoIncluido: Number(form.consumoBasicoIncluido) || 0,
      montoRecargoMora: Number(form.montoRecargoMora) || 0,
      diaLimitePago: Number(form.diaLimitePago) || 15,
      trasladarCostoLicenciaAsociados: Boolean(form.trasladarCostoLicenciaAsociados),
      trasladarComisionWompiAsociados: Boolean(form.trasladarComisionWompiAsociados),
    };

    try {
      const { data } = await api.patch('/configuracion', payload);
      if (data?.success) {
        await actualizarConfigStore?.();
        setMensaje({ tipo: 'ok', texto: 'Configuración del acueducto actualizada exitosamente.' });
      } else {
        setMensaje({ tipo: 'error', texto: data?.message || 'No se pudo guardar la configuración.' });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.message || 'Error al guardar la configuración.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#1D4ED8] text-2xl">settings</span>
            <h1 className="text-2xl font-extrabold text-slate-800 font-headline tracking-tight">
              Configuración del Acueducto Veredal
            </h1>
          </div>
          <p className="text-slate-500 text-xs font-body">
            Ajusta la tarifa base del agua y los recargos del servicio.
          </p>
        </div>

        <span className="bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-headline font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
          {form.nombreAcueducto || 'Acueducto Veredal'}
        </span>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        {/* TARIFA BASE DEL AGUA & RECARGOS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <span className="material-symbols-outlined text-[#1D4ED8]">payments</span>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 font-headline">
                Parámetros y Modalidad de Cobro del Servicio
              </h2>
              <p className="text-xs text-slate-500">
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
                  ? 'bg-blue-50 border-[#1D4ED8]/40 text-[#1D4ED8] shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-2xl mt-0.5">home</span>
              <div>
                <p className="font-extrabold font-headline text-sm">Tarifa Fija Plana</p>
                <p className="text-xs text-slate-500 mt-0.5">Sin medidores. Cobro único mensual igual para todas las viviendas.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, tipoTarifa: 'HIBRIDO' })}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                form.tipoTarifa === 'HIBRIDO' || !form.tipoTarifa
                  ? 'bg-blue-50 border-[#1D4ED8]/40 text-[#1D4ED8] shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-2xl mt-0.5">published_with_changes</span>
              <div>
                <p className="font-extrabold font-headline text-sm flex items-center gap-1.5">
                  <span>Sistema Híbrido</span>
                  <span className="bg-blue-100 text-[#1D4ED8] text-[9px] px-1.5 py-0.5 rounded font-bold">RECOMENDADO</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Transición: liquida m³ a las viviendas con medidor y Tarifa Fija a las que no tienen.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, tipoTarifa: 'MEDIDOR' })}
              className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                form.tipoTarifa === 'MEDIDOR'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-2xl mt-0.5">water_ec</span>
              <div>
                <p className="font-extrabold font-headline text-sm">Micro-Medición 100%</p>
                <p className="text-xs text-slate-500 mt-0.5">Cargo fijo mensual + valor del metro cúbico (m³) consumido.</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 pt-2">
            {/* Campo Tarifa Fija Plana (Visible en TARIFA_FIJA y HIBRIDO) */}
            {(form.tipoTarifa === 'TARIFA_FIJA' || form.tipoTarifa === 'HIBRIDO' || !form.tipoTarifa) && (
              <div>
                <label className="text-slate-700 font-bold mb-1.5 text-xs font-headline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-[#1D4ED8]">home</span>
                  <span>Tarifa Fija Plana ($ COP)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={form.tarifaBaseMensual === 0 ? '' : form.tarifaBaseMensual}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setForm({ ...form, tarifaBaseMensual: e.target.value === '' ? 0 : Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-2.5 text-[#1D4ED8] font-headline font-extrabold text-lg focus:outline-none focus:border-[#1D4ED8]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Cobro tarifa plana mensual únicamente para viviendas <b>SIN MEDIDOR</b>.</p>
              </div>
            )}

            {/* Campos Micro-Medición (Visibles en HIBRIDO y MEDIDOR) */}
            {(form.tipoTarifa === 'MEDIDOR' || form.tipoTarifa === 'HIBRIDO' || !form.tipoTarifa) && (
              <>
                <div>
                  <label className="text-slate-700 font-bold mb-1.5 text-xs font-headline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#1D4ED8]">payments</span>
                    <span>Cargo Fijo Mensual ($ COP)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.cargoFijoMensual === 0 ? '' : form.cargoFijoMensual}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm({ ...form, cargoFijoMensual: e.target.value === '' ? 0 : Number(e.target.value) })}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-2.5 text-[#1D4ED8] font-headline font-extrabold text-lg focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Cargo de mantenimiento cobrado a <b>TODAS LAS VIVIENDAS</b> (Aplica para Tarifa Fija y Medidores).</p>
                </div>

                <div>
                  <label className="text-slate-700 font-bold mb-1.5 text-xs font-headline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-emerald-600">water_ec</span>
                    <span>Valor por Metro Cúbico ($/m³)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={form.valorMetroCubico === 0 ? '' : form.valorMetroCubico}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm({ ...form, valorMetroCubico: e.target.value === '' ? 0 : Number(e.target.value) })}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-2.5 text-emerald-700 font-headline font-extrabold text-lg focus:outline-none focus:border-[#1D4ED8]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Costo por cada m³ consumido en medidor.</p>
                </div>

                <div>
                  <label className="text-slate-700 font-bold mb-1.5 text-xs font-headline flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#1D4ED8]">redeem</span>
                    <span>Consumo Básico Incluido (m³)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.consumoBasicoIncluido}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setForm({ ...form, consumoBasicoIncluido: e.target.value === '' ? 0 : Number(e.target.value) })}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-[#1D4ED8] font-headline font-extrabold text-lg focus:outline-none focus:border-[#1D4ED8]"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Metros cúbicos que ya cubre el cargo fijo antes de cobrar excedente. Pon 0 para cobrar desde el primer m³.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">
                Recargo por Mora ($ COP)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600 font-bold">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.montoRecargoMora === 0 ? '' : form.montoRecargoMora}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setForm({ ...form, montoRecargoMora: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-2.5 text-amber-700 font-headline font-extrabold text-lg focus:outline-none focus:border-[#1D4ED8]"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Aplica tras la fecha límite.</p>
            </div>

            <div>
              <label className="text-slate-700 font-bold mb-1.5 block text-xs font-headline">
                Día Límite de Pago
              </label>
              <Dropdown
                value={form.diaLimitePago}
                onChange={(diaLimitePago) => setForm({ ...form, diaLimitePago })}
                options={[
                  { value: 15, label: 'Día 15 del mes' },
                  { value: 20, label: 'Día 20 del mes' },
                  { value: 25, label: 'Día 25 del mes' },
                  { value: 30, label: 'Último día del mes (30/31)' },
                ]}
              />
              <p className="text-[11px] text-slate-500 mt-1">Límite para pago ordinario sin recargo.</p>
            </div>
          </div>

          {/* TOGGLE: TRASLADAR COSTO DE LICENCIA SAAS A LOS ASOCIADOS */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, trasladarCostoLicenciaAsociados: !form.trasladarCostoLicenciaAsociados })}
              className="w-full flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-[#1D4ED8]/40 transition-all cursor-pointer text-left"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#1D4ED8] text-xl mt-0.5">account_balance_wallet</span>
                <div>
                  <p className="text-sm font-bold text-slate-800 font-headline">
                    Trasladar costo de la licencia AquaRural a los asociados
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Si lo activas, el costo mensual de tu licencia SaaS ($
                    {form.costoSaaSVigente ? Math.round(form.costoSaaSVigente / (form.frecuenciaPagoSaaS === 'MENSUAL' ? 1 : 12)).toLocaleString() : 0} COP/mes)
                    se reparte entre tus asociados activos y aparece como un rubro aparte ("Aporte plataforma") en cada factura de agua, en vez de asumirlo el acueducto.
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 w-12 h-7 rounded-full relative transition-colors ${
                  form.trasladarCostoLicenciaAsociados ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.trasladarCostoLicenciaAsociados ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </span>
            </button>

            {/* Estimación en tiempo real de cuánto se le sumaría a CADA
                suscriptor — el valor real que se aplica en la próxima
                factura se recalcula con el número de asociados activos en
                el momento de facturar (calcularRecargoLicenciaPorAsociado en
                facturacion.service.js), no con este número congelado en
                pantalla, por eso se etiqueta explícitamente como estimado. */}
            {form.trasladarCostoLicenciaAsociados && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#1D4ED8] text-xl shrink-0">calculate</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {totalAsociados > 0 ? (
                    <>
                      Estimado hoy: cada suscriptor pagaría{' '}
                      <strong className="text-[#1D4ED8] font-mono">
                        ${Math.round(
                          (form.costoSaaSVigente || 0) / (form.frecuenciaPagoSaaS === 'MENSUAL' ? 1 : 12) / totalAsociados
                        ).toLocaleString()} COP/mes
                      </strong>{' '}
                      adicionales, dividiendo el costo de la licencia entre tus <strong>{totalAsociados}</strong> suscriptores activos actuales.
                    </>
                  ) : (
                    'Aún no hay suscriptores activos registrados para calcular el aporte por persona.'
                  )}
                  {' '}Este valor es una proyección con los datos de hoy — el monto real de cada factura se recalcula con la cantidad de suscriptores activos en el momento de facturar, así que puede variar si el acueducto crece o se reduce.
                </p>
              </div>
            )}
          </div>

          {/* TOGGLE: TRASLADAR COMISIÓN DE WOMPI A LOS ASOCIADOS */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, trasladarComisionWompiAsociados: !form.trasladarComisionWompiAsociados })}
              className="w-full flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-[#1D4ED8]/40 transition-all cursor-pointer text-left"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#1D4ED8] text-xl mt-0.5">credit_card</span>
                <div>
                  <p className="text-sm font-bold text-slate-800 font-headline">
                    Trasladar comisión de Wompi a los asociados
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Si lo activas, cada vez que un suscriptor pague su factura por Wompi (Nequi, PSE, tarjeta o
                    Bancolombia), se le suma la comisión que Wompi cobra por esa transacción (2.65% + $700 COP + IVA
                    sobre la comisión) — el acueducto recibe el valor completo de su factura. Nunca aplica al pago en
                    efectivo en oficina. Si lo dejas apagado, el acueducto sigue asumiendo esa comisión como hasta ahora.
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 w-12 h-7 rounded-full relative transition-colors ${
                  form.trasladarComisionWompiAsociados ? 'bg-[#1D4ED8]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    form.trasladarComisionWompiAsociados ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </span>
            </button>

            {/* Ejemplo con una factura de referencia (no depende de datos en
                vivo como el toggle de licencia, porque esta comisión se
                calcula por transacción individual, no prorrateada). */}
            {form.trasladarComisionWompiAsociados && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#1D4ED8] text-xl shrink-0">calculate</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Ejemplo con una factura de <strong className="font-mono">$45.000 COP</strong>: la comisión de Wompi
                  sería <strong className="text-[#1D4ED8] font-mono">≈ $2.252 COP</strong>, así que el suscriptor
                  pagaría <strong className="text-[#1D4ED8] font-mono">≈ $47.252 COP</strong> en total por Wompi, y tu
                  acueducto recibiría los $45.000 completos de la factura.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MENSAJE FEEDBACK */}
        {mensaje && (
          <div className={`p-4 rounded-2xl text-xs font-headline font-bold flex items-center gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
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
            style={{ color: '#ffffff' }}
            className="bg-[#1D4ED8] hover:bg-[#1E3A8A] font-extrabold font-headline px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
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
