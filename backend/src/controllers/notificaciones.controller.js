const Notificacion = require('../models/Notificacion');
const { ok, fail, asyncHandler } = require('../utils/response');

// Bandeja del propio suscriptor — nunca las de otro asociado del mismo
// acueducto, aunque req.acueductoId ya delimite el tenant.
const misNotificaciones = asyncHandler(async (req, res) => {
  const notificaciones = await Notificacion.find({
    acueductoId: req.acueductoId,
    asociadoId: req.user._id,
  })
    .sort('-createdAt')
    .limit(100);
  return ok(res, notificaciones);
});

const marcarLeida = asyncHandler(async (req, res) => {
  const notificacion = await Notificacion.findOneAndUpdate(
    { _id: req.params.id, acueductoId: req.acueductoId, asociadoId: req.user._id },
    { leida: true },
    { new: true }
  );
  if (!notificacion) return fail(res, 404, 'Notificación no encontrada.');
  return ok(res, notificacion, 'Notificación marcada como leída.');
});

const marcarTodasLeidas = asyncHandler(async (req, res) => {
  await Notificacion.updateMany(
    { acueductoId: req.acueductoId, asociadoId: req.user._id, leida: false },
    { leida: true }
  );
  return ok(res, null, 'Todas las notificaciones marcadas como leídas.');
});

module.exports = { misNotificaciones, marcarLeida, marcarTodasLeidas };
