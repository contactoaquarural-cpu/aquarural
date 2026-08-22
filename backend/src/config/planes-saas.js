// Catálogo de planes SaaS de MetaDevelopment -> Acueducto.
// El plan se determina por rango de suscriptores; el precio depende además
// de la frecuencia de pago elegida (mensual o anual).
// precioAnual = precioMensual * 10 (2 meses gratis por pagar anual), en los
// 4 planes. Aparte de ese descuento, TODO acueducto nuevo tiene además un
// primer mes de prueba gratis, sin importar la frecuencia elegida
// (ver fechaVencimientoGratis en Acueducto, independiente de este catálogo).
const PLANES_SAAS = {
  MANANTIAL: {
    nombre: 'Plan Manantial',
    maxSuscriptores: 150,
    precioAnual: 600000,
    precioMensual: 60000,
    funciones: [
      'PANEL_WEB_ADMIN',
      'APP_MOVIL_SUSCRIPTORES',
      'RECAUDO_WOMPI',
      'MAPA_GPS',
      'REPORTES_FINANCIEROS',
      'CARGA_MASIVA_EXCEL',
    ],
  },
  CAUDAL: {
    nombre: 'Plan Caudal',
    maxSuscriptores: 500,
    precioAnual: 1000000,
    precioMensual: 100000,
    funciones: [
      'PANEL_WEB_ADMIN',
      'APP_MOVIL_SUSCRIPTORES',
      'RECAUDO_WOMPI',
      'MAPA_GPS',
      'REPORTES_FINANCIEROS',
      'CARGA_MASIVA_EXCEL',
    ],
  },
  CUENCA: {
    nombre: 'Plan Cuenca',
    maxSuscriptores: 1000,
    precioAnual: 1800000,
    precioMensual: 180000,
    funciones: [
      'PANEL_WEB_ADMIN',
      'APP_MOVIL_SUSCRIPTORES',
      'APP_MOVIL_FONTANERO',
      'RECAUDO_WOMPI',
      'MAPA_GPS',
      'REPORTES_FINANCIEROS',
      'CARGA_MASIVA_EXCEL',
    ],
  },
  ACUIFERO: {
    nombre: 'Plan Acuífero',
    maxSuscriptores: Infinity,
    precioAnual: 3000000,
    precioMensual: 300000,
    funciones: [
      'PANEL_WEB_ADMIN',
      'APP_MOVIL_SUSCRIPTORES',
      'APP_MOVIL_FONTANERO',
      'RECAUDO_WOMPI',
      'MAPA_GPS',
      'REPORTES_FINANCIEROS',
      'CARGA_MASIVA_EXCEL',
      'SERVIDOR_DEDICADO',
      'SOPORTE_PRIORITARIO',
    ],
  },
};

// Devuelve el plan mínimo que cubre el número de suscriptores dado, en el
// orden Manantial -> Caudal -> Cuenca -> Acuífero.
const calcularPlanPorSuscriptores = (totalSuscriptores) => {
  const orden = ['MANANTIAL', 'CAUDAL', 'CUENCA', 'ACUIFERO'];
  return orden.find((clave) => totalSuscriptores <= PLANES_SAAS[clave].maxSuscriptores) || 'ACUIFERO';
};

const precioPorFrecuencia = (plan, frecuencia) =>
  frecuencia === 'ANUAL' ? PLANES_SAAS[plan].precioAnual : PLANES_SAAS[plan].precioMensual;

module.exports = { PLANES_SAAS, calcularPlanPorSuscriptores, precioPorFrecuencia };
