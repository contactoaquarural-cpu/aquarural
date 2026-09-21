const mongoose = require('mongoose');
const Asociado = require('../models/Asociado');
const Factura = require('../models/Factura');
const { ok, asyncHandler } = require('../utils/response');

// Panel financiero del admin del acueducto: recaudación del año en curso mes
// a mes (pagado vs. pendiente) + distribución de asociados por estadoMoratorio
// (ya calculado automáticamente por estado.job.js, nunca se recalcula aquí).
const financiero = asyncHandler(async (req, res) => {
  const acueductoId = new mongoose.Types.ObjectId(req.acueductoId);
  const anioActual = new Date().getFullYear();

  const [distribucion, recaudacionTotalAgg, facturasDelAnio] = await Promise.all([
    Asociado.aggregate([
      { $match: { acueductoId } },
      { $group: { _id: '$estadoMoratorio', total: { $sum: 1 } } },
    ]),
    Factura.aggregate([
      { $match: { acueductoId, estado: 'PAGADA' } },
      { $group: { _id: null, total: { $sum: '$montoTotal' } } },
    ]),
    Factura.find({
      acueductoId,
      periodo: { $gte: `${anioActual}-01`, $lte: `${anioActual}-12` },
    }).select('periodo montoTotal estado'),
  ]);

  const contarPorEstado = (estado) => distribucion.find((d) => d._id === estado)?.total || 0;
  const alDia = contarPorEstado('AL_DIA');
  const enMora = contarPorEstado('EN_MORA');
  const inactivos = contarPorEstado('INACTIVO');
  const totalAsociados = alDia + enMora + inactivos;

  const recaudacionMensual = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, pagado: 0, pendiente: 0 }));
  for (const f of facturasDelAnio) {
    const mesIndex = Number(f.periodo.slice(5, 7)) - 1;
    if (mesIndex < 0 || mesIndex > 11) continue;
    if (f.estado === 'PAGADA') recaudacionMensual[mesIndex].pagado += f.montoTotal;
    else if (f.estado === 'PENDIENTE' || f.estado === 'VENCIDA') recaudacionMensual[mesIndex].pendiente += f.montoTotal;
  }

  return ok(res, {
    recaudacionTotal: recaudacionTotalAgg[0]?.total || 0,
    indiceMorosidad: totalAsociados > 0 ? Math.round(((enMora + inactivos) / totalAsociados) * 100) : 0,
    alDia,
    enMora,
    inactivos,
    totalAsociados,
    recaudacionMensual,
  });
});

// Lista de asociados en mora o inactivos por mora, con su deuda real sumando
// solo facturas VENCIDA (no PAGADA ni ANULADA) — la misma fuente que usa
// estado.job.js para calcular estadoMoratorio, así ambos nunca se desincronizan.
const morosos = asyncHandler(async (req, res) => {
  const acueductoId = req.acueductoId;

  const asociadosEnMora = await Asociado.find({
    acueductoId,
    estadoMoratorio: { $in: ['EN_MORA', 'INACTIVO'] },
  }).select('nombres apellidos cedula estadoMoratorio');

  const resultado = await Promise.all(
    asociadosEnMora.map(async (a) => {
      const facturasVencidas = await Factura.find({
        acueductoId,
        asociadoId: a._id,
        estado: 'VENCIDA',
      }).select('montoTotal');

      const deudaTotal = facturasVencidas.reduce((sum, f) => sum + f.montoTotal, 0);

      return {
        _id: a._id,
        nombre: `${a.nombres} ${a.apellidos || ''}`.trim(),
        cedula: a.cedula,
        estado: a.estadoMoratorio,
        deudaTotal,
        aportesPendientes: facturasVencidas.length,
      };
    })
  );

  // Mayor deuda primero, es lo más útil para priorizar el cobro.
  resultado.sort((a, b) => b.deudaTotal - a.deudaTotal);

  return ok(res, resultado);
});

module.exports = { financiero, morosos };
