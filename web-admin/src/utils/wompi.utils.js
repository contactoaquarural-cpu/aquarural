// Misma fórmula inversa que backend/src/services/facturacion.service.js —
// Wompi cobra su comisión (2.65% + $700 COP + IVA 19% sobre esa comisión)
// SOBRE EL MONTO TOTAL cobrado, no sobre el valor neto deseado. Se usa aquí
// para la calculadora de "Cargo Fijo sugerido" en ConfiguracionPage: cuánto
// cobrar de más para que, tras la comisión de Wompi, el acueducto reciba
// exactamente el neto de su factura más alta.
const FACTOR_COMISION = 0.0265;
const CARGO_FIJO_COMISION = 700;
const FACTOR_IVA = 1.19;

export const calcularComisionWompi = (montoNetoDeseado) => {
  const totalACobrar =
    (montoNetoDeseado + CARGO_FIJO_COMISION * FACTOR_IVA) / (1 - FACTOR_COMISION * FACTOR_IVA);
  return Math.round(totalACobrar) - montoNetoDeseado;
};
