const { calcularPlanPorSuscriptores, precioPorFrecuencia } = require('../config/planes-saas');

// Estados posibles: MES_GRATIS_PRUEBA -> AL_DIA -> POR_COBRAR -> VENCIDO
// El sistema NUNCA suspende automáticamente por vencimiento; solo cambia este
// estado. La suspensión real siempre es una acción manual del SuperAdmin.
const DIAS_GRACIA_ANTES_DE_VENCER = 5;

// El día que termina el mes gratis es, por diseño, el mismo día en que arranca
// el primer ciclo de la licencia paga (aunque el acueducto ya haya pagado antes,
// el beneficio gratis se respeta completo).
const calcularEstadoLicencia = (acueducto, hoy = new Date()) => {
  const fechaVencimientoGratis = acueducto.fechaVencimientoGratis ? new Date(acueducto.fechaVencimientoGratis) : null;
  const fechaVencimientoMembresia = acueducto.fechaVencimientoMembresia
    ? new Date(acueducto.fechaVencimientoMembresia)
    : null;

  // Aún dentro del mes gratis.
  if (fechaVencimientoGratis && hoy < fechaVencimientoGratis) {
    const diasParaVencerGratis = Math.ceil((fechaVencimientoGratis - hoy) / (24 * 60 * 60 * 1000));
    return {
      // En los últimos días del mes gratis se reusa POR_COBRAR: misma
      // semántica ("debes pagar pronto") que el aviso de un ciclo pago vencido.
      estadoPagoSaaS: diasParaVencerGratis <= DIAS_GRACIA_ANTES_DE_VENCER ? 'POR_COBRAR' : 'MES_GRATIS_PRUEBA',
      fechaInicioMembresia: fechaVencimientoGratis,
      fechaFinCicloVigente: fechaVencimientoGratis,
    };
  }

  // El mes gratis ya terminó y todavía no hay ningún ciclo pago registrado
  // (fechaVencimientoMembresia nunca fue fijada) -> debe pagar su primer ciclo.
  if (!fechaVencimientoMembresia) {
    return {
      estadoPagoSaaS: 'VENCIDO',
      fechaInicioMembresia: fechaVencimientoGratis,
      fechaFinCicloVigente: fechaVencimientoGratis,
    };
  }

  if (hoy > fechaVencimientoMembresia) {
    return {
      estadoPagoSaaS: 'VENCIDO',
      fechaInicioMembresia: fechaVencimientoGratis,
      fechaFinCicloVigente: fechaVencimientoMembresia,
    };
  }

  const diasParaVencer = Math.ceil((fechaVencimientoMembresia - hoy) / (24 * 60 * 60 * 1000));
  if (diasParaVencer <= DIAS_GRACIA_ANTES_DE_VENCER) {
    return {
      estadoPagoSaaS: 'POR_COBRAR',
      fechaInicioMembresia: fechaVencimientoGratis,
      fechaFinCicloVigente: fechaVencimientoMembresia,
    };
  }

  return {
    estadoPagoSaaS: 'AL_DIA',
    fechaInicioMembresia: fechaVencimientoGratis,
    fechaFinCicloVigente: fechaVencimientoMembresia,
  };
};

// Calcula el siguiente ciclo de facturación a partir de la fecha de fin del
// ciclo vigente (o el vencimiento del mes gratis, si es el primer pago).
const calcularSiguienteCiclo = (fechaBase, frecuencia) => {
  const inicio = new Date(fechaBase);
  const fin = new Date(inicio);
  if (frecuencia === 'ANUAL') {
    fin.setFullYear(fin.getFullYear() + 1);
  } else {
    fin.setMonth(fin.getMonth() + 1);
  }
  return { inicio, fin };
};

// Recalcula el plan según el número real de suscriptores del acueducto,
// solo aplicable al momento de renovar (no en tiempo real al crecer).
const recalcularPlanEnRenovacion = (totalSuscriptores, frecuenciaPagoSaaS) => {
  const plan = calcularPlanPorSuscriptores(totalSuscriptores);
  return { plan, costo: precioPorFrecuencia(plan, frecuenciaPagoSaaS) };
};

module.exports = { calcularEstadoLicencia, calcularSiguienteCiclo, recalcularPlanEnRenovacion };
