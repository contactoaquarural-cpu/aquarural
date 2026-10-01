const Asociado = require('../models/Asociado');
const Factura = require('../models/Factura');
const { periodoBogota } = require('../utils/fecha.utils');
const logger = require('../utils/logger');

const tieneMedidorReal = (asociado) => Boolean(asociado.numeroMedidor) && asociado.numeroMedidor !== 'S/N';

// Recalcula el estadoMoratorio de UN asociado puntual, según sus facturas
// VENCIDA vigentes — misma regla que aplica el cron diario (estado.job.js),
// pero disparada al instante cuando se confirma un pago (efectivo o Wompi),
// para que no quede "En mora" en Reportes/Dashboard hasta la próxima
// corrida del cron (6am) aunque ya haya pagado.
const recalcularEstadoMoratorio = async (acueductoId, asociadoId) => {
  const asociadoPrevio = await Asociado.findOne({ _id: asociadoId, acueductoId }).select('estadoMoratorio');
  const facturasVencidas = await Factura.countDocuments({ acueductoId, asociadoId, estado: 'VENCIDA' });
  const nuevoEstado = facturasVencidas === 0 ? 'AL_DIA' : facturasVencidas < 3 ? 'EN_MORA' : 'INACTIVO';
  await Asociado.updateOne({ _id: asociadoId, acueductoId }, { estadoMoratorio: nuevoEstado });
  return { estadoAnterior: asociadoPrevio?.estadoMoratorio, nuevoEstado };
};

// Costo mensualizado de la licencia SaaS del acueducto ÷ asociados activos,
// solo si el acueducto activó el traslado de ese costo a sus asociados.
// Se calcula una única vez por corrida de facturación masiva (no por
// asociado) para que todos compartan exactamente el mismo divisor.
const calcularRecargoLicenciaPorAsociado = (acueducto, totalAsociadosActivos) => {
  if (!acueducto.trasladarCostoLicenciaAsociados || totalAsociadosActivos === 0) return 0;

  const costoMensualizado =
    acueducto.frecuenciaPagoSaaS === 'MENSUAL' ? acueducto.costoSaaSVigente : acueducto.costoSaaSVigente / 12;

  return Math.round(costoMensualizado / totalAsociadosActivos);
};

// Wompi cobra su comisión (2.65% + $700 COP + IVA 19% sobre esa comisión)
// SOBRE EL MONTO TOTAL que efectivamente se transa, no sobre el valor de la
// factura — así que sumar la comisión calculada sobre la factura original
// deja al acueducto recibiendo MENOS del neto esperado (verificado con un
// pago real: factura $1.000 → se sumaron $865 → Wompi cobró su comisión
// sobre los $1.865 cobrados, no sobre $1.000 → al acueducto llegaron $973,19,
// no los $1.000 esperados). La fórmula correcta es la INVERSA: se despeja el
// total T tal que, tras descontar la comisión de Wompi sobre T, quede
// exactamente el monto neto deseado.
//
//   comisión(T) = (T × 0.0265 + 700) × 1.19
//   neto = T - comisión(T) = T × (1 - 0.0265×1.19) - 700×1.19
//   T = (neto + 700×1.19) / (1 - 0.0265×1.19)
//
// Verificado: factura $1.000 → T = $1.892,69 → Wompi cobra $892,69 →
// neto real = $1.000,00 exactos.
const FACTOR_COMISION = 0.0265;
const CARGO_FIJO_COMISION = 700;
const FACTOR_IVA = 1.19;

const calcularComisionWompi = (montoNetoDeseado) => {
  const totalACobrar =
    (montoNetoDeseado + CARGO_FIJO_COMISION * FACTOR_IVA) / (1 - FACTOR_COMISION * FACTOR_IVA);
  return Math.round(totalACobrar) - montoNetoDeseado;
};

// Calcula el desglose de una factura para un asociado, según el esquema de
// tarifa del acueducto (TARIFA_FIJA | HIBRIDO | MEDIDOR) y si ese asociado en
// particular tiene medidor físico instalado (numeroMedidor real).
const calcularMontoFactura = (acueducto, asociado, montoRecargoLicencia = 0) => {
  const tieneMedidor = tieneMedidorReal(asociado);

  if (acueducto.tipoTarifa === 'MEDIDOR' || (acueducto.tipoTarifa === 'HIBRIDO' && tieneMedidor)) {
    const consumoM3 = Math.max(0, (asociado.lecturaActual || 0) - (asociado.lecturaAnterior || 0));
    const consumoFacturable = Math.max(0, consumoM3 - (acueducto.consumoBasicoIncluido || 0));
    const montoCargoFijo = acueducto.cargoFijoMensual || 0;
    const montoConsumo = consumoFacturable * (acueducto.valorMetroCubico || 0);
    return {
      consumoM3,
      montoCargoFijo,
      montoConsumo,
      montoRecargoLicencia,
      montoTotal: montoCargoFijo + montoConsumo + montoRecargoLicencia,
    };
  }

  // TARIFA_FIJA, o HIBRIDO para un asociado sin medidor real.
  const montoCargoFijo = asociado.tarifaPersonalizada ?? acueducto.tarifaBaseMensual ?? 0;
  return {
    consumoM3: 0,
    montoCargoFijo,
    montoConsumo: 0,
    montoRecargoLicencia,
    montoTotal: montoCargoFijo + montoRecargoLicencia,
  };
};

// Un asociado necesita lectura del ciclo vigente antes de facturarse solo si
// su tarifa depende de medidor (MEDIDOR siempre, HIBRIDO solo si tiene
// medidor físico instalado). TARIFA_FIJA nunca depende de lectura.
const requiereLecturaVigente = (acueducto, asociado) =>
  acueducto.tipoTarifa === 'MEDIDOR' || (acueducto.tipoTarifa === 'HIBRIDO' && tieneMedidorReal(asociado));

const tieneLecturaDelPeriodo = (asociado, periodo) =>
  asociado.fechaUltimaLectura && periodoBogota(asociado.fechaUltimaLectura) === periodo;

const generarCodigoFactura = (acueducto, asociado, periodo) =>
  `AGUA-${periodo.replace('-', '')}-${asociado.matricula}`;

// Calcula la fecha de vencimiento para el periodo dado, respetando el día
// límite configurado (1-31). Si ese día no existe en el mes (ej. 30 en
// febrero), usa el último día real del mes en vez de desbordar al mes
// siguiente — "día 30/31" se entiende como "fin de mes".
const calcularFechaVencimiento = (periodo, diaLimitePago) => {
  const [anio, mes] = periodo.split('-').map(Number);
  const ultimoDiaDelMes = new Date(anio, mes, 0).getDate();
  const dia = Math.min(diaLimitePago || 15, ultimoDiaDelMes);
  return new Date(anio, mes - 1, dia);
};

// Genera las facturas del periodo dado para todos los asociados ACTIVOS del
// acueducto que aún no tengan factura en ese periodo. Usado tanto por el botón
// manual del admin como por el cron automático mensual.
const generarFacturacionMasiva = async (acueducto, periodo) => {
  const asociados = await Asociado.find({ acueductoId: acueducto._id, estadoServicio: 'ACTIVO' });
  const montoRecargoLicencia = calcularRecargoLicenciaPorAsociado(acueducto, asociados.length);

  const fechaVencimiento = calcularFechaVencimiento(periodo, acueducto.diaLimitePago);

  const resultado = { creadas: 0, omitidas: 0, sinLectura: 0, errores: [] };

  for (const asociado of asociados) {
    const existente = await Factura.findOne({ acueductoId: acueducto._id, asociadoId: asociado._id, periodo });
    if (existente) {
      resultado.omitidas += 1;
      continue;
    }

    if (requiereLecturaVigente(acueducto, asociado) && !tieneLecturaDelPeriodo(asociado, periodo)) {
      resultado.sinLectura += 1;
      continue;
    }

    try {
      const desglose = calcularMontoFactura(acueducto, asociado, montoRecargoLicencia);
      await Factura.create({
        acueductoId: acueducto._id,
        asociadoId: asociado._id,
        codigoFactura: generarCodigoFactura(acueducto, asociado, periodo),
        periodo,
        ...desglose,
        fechaVencimiento,
      });
      resultado.creadas += 1;
    } catch (error) {
      logger.error('Error generando factura', { acueductoId: acueducto._id, asociadoId: asociado._id, error: error.message });
      resultado.errores.push({ asociadoId: asociado._id, motivo: error.message });
    }
  }

  return resultado;
};

module.exports = {
  calcularComisionWompi,
  calcularFechaVencimiento,
  calcularMontoFactura,
  calcularRecargoLicenciaPorAsociado,
  generarFacturacionMasiva,
  generarCodigoFactura,
  recalcularEstadoMoratorio,
  tieneMedidorReal,
};
