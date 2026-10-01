// `.toISOString()` siempre devuelve en UTC — en Colombia (UTC-5), cualquier
// hora desde las 19:00 ya cae en el día siguiente en UTC, y los últimos días
// de cada mes eso significa calcular mal el MES completo (ej. a las 20:00
// del 30 de septiembre, UTC ya marca 1 de octubre). El periodo de
// facturación/lecturas debe calcularse en hora de Colombia, no UTC, o el
// ciclo cambia varias horas antes de que termine el día real para el
// acueducto. Mismo criterio que ya usan los cron de estado.job.js/
// licencias.job.js con `timezone: 'America/Bogota'`.
const periodoBogota = (fecha) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
  });
  const partes = formatter.formatToParts(fecha);
  const anio = partes.find((p) => p.type === 'year').value;
  const mes = partes.find((p) => p.type === 'month').value;
  return `${anio}-${mes}`;
};

const periodoActualBogota = () => periodoBogota(new Date());

module.exports = { periodoActualBogota, periodoBogota };
