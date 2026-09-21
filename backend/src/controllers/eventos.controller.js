const Evento = require('../models/Evento');
const Asociado = require('../models/Asociado');
const { enviarPushATokens } = require('../services/firebase.service');
const { ok, fail, asyncHandler } = require('../utils/response');

const listar = asyncHandler(async (req, res) => {
  const eventos = await Evento.find({ acueductoId: req.acueductoId }).sort('-fecha');
  return ok(res, eventos);
});

// El push solo se envía al crear (una convocatoria nueva se anuncia una vez),
// no al editar — evita spamear a los suscriptores por cada corrección menor
// de texto/hora. Si Firebase no está configurado o nadie tiene tokenFCM
// todavía, enviarPushATokens es un no-op silencioso (ver firebase.service.js).
const crear = asyncHandler(async (req, res) => {
  const evento = await Evento.create({ ...req.body, acueductoId: req.acueductoId });

  const suscriptores = await Asociado.find({ acueductoId: req.acueductoId, tokenFCM: { $ne: '' } }).select('tokenFCM');
  await enviarPushATokens(
    suscriptores.map((s) => s.tokenFCM),
    {
      titulo: 'Nueva convocatoria',
      cuerpo: `${evento.titulo} — ${evento.fecha} ${evento.hora}`,
      data: { tipo: 'EVENTO', eventoId: evento._id.toString() },
    }
  );

  return ok(res, evento, 'Convocatoria creada.', 201);
});

const actualizar = asyncHandler(async (req, res) => {
  const evento = await Evento.findOneAndUpdate(
    { _id: req.params.id, acueductoId: req.acueductoId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!evento) return fail(res, 404, 'Evento no encontrado.');
  return ok(res, evento, 'Convocatoria actualizada.');
});

const eliminar = asyncHandler(async (req, res) => {
  const evento = await Evento.findOneAndDelete({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!evento) return fail(res, 404, 'Evento no encontrado.');
  return ok(res, null, 'Convocatoria eliminada.');
});

module.exports = { listar, crear, actualizar, eliminar };
