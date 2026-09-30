const Evento = require('../models/Evento');
const Asociado = require('../models/Asociado');
const { crearNotificacion } = require('../services/notificaciones.service');
const { ok, fail, asyncHandler } = require('../utils/response');

// Resuelve respuestasRSVP (Map de asociadoId -> 'SI'|'NO') a una lista con
// nombre y matrícula, para que la junta vea quiénes confirmaron/declinaron
// sin tener que cruzar IDs manualmente en el frontend. Se resuelve para
// todos los eventos con una sola consulta a Asociado (no una por evento),
// ya que un mismo acueducto reutiliza el mismo padrón de suscriptores.
const listar = asyncHandler(async (req, res) => {
  const eventos = await Evento.find({ acueductoId: req.acueductoId }).sort('-fecha');

  const idsUnicos = new Set();
  eventos.forEach((e) => {
    for (const asociadoId of e.respuestasRSVP.keys()) idsUnicos.add(asociadoId);
  });
  const asociados = await Asociado.find({ _id: { $in: [...idsUnicos] } }).select('nombres apellidos matricula');
  const asociadosPorId = new Map(asociados.map((a) => [a._id.toString(), a]));

  const eventosConAsistentes = eventos.map((e) => {
    const evento = e.toObject();
    const asistentes = [...e.respuestasRSVP.entries()].map(([asociadoId, respuesta]) => {
      const asociado = asociadosPorId.get(asociadoId);
      return {
        asociadoId,
        respuesta,
        nombre: asociado ? `${asociado.nombres} ${asociado.apellidos || ''}`.trim() : 'Suscriptor eliminado',
        matricula: asociado?.matricula || '',
      };
    });
    delete evento.respuestasRSVP;
    return { ...evento, asistentes };
  });

  return ok(res, eventosConAsistentes);
});

// Al crear, se notifica a todo el padrón (nadie ha respondido todavía). Al
// editar (ver `actualizar` más abajo), solo se notifica si cambia
// fecha/hora/lugar, y solo a quienes ya confirmaron asistencia.
const crear = asyncHandler(async (req, res) => {
  const evento = await Evento.create({ ...req.body, acueductoId: req.acueductoId });

  const suscriptores = await Asociado.find({ acueductoId: req.acueductoId }).select('_id');
  await Promise.all(
    suscriptores.map((s) =>
      crearNotificacion(s._id, req.acueductoId, {
        tipo: 'EVENTO',
        titulo: 'Nueva convocatoria',
        cuerpo: `${evento.titulo} — ${evento.fecha} ${evento.hora}`,
        referenciaId: evento._id.toString(),
      })
    )
  );

  return ok(res, evento, 'Convocatoria creada.', 201);
});

// Solo se notifica al editar si cambió fecha, hora o lugar — una corrección
// de texto/título no amerita avisar de nuevo (evita spamear por cada
// corrección menor). Se avisa solo a quienes ya habían confirmado 'SI', no a
// todo el padrón, porque a quien no va o no ha respondido un cambio de
// horario/lugar no le afecta de la misma forma.
const actualizar = asyncHandler(async (req, res) => {
  const eventoPrevio = await Evento.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!eventoPrevio) return fail(res, 404, 'Evento no encontrado.');

  const cambioFechaHoraLugar =
    (req.body.fecha !== undefined && req.body.fecha !== eventoPrevio.fecha) ||
    (req.body.hora !== undefined && req.body.hora !== eventoPrevio.hora) ||
    (req.body.lugar !== undefined && req.body.lugar !== eventoPrevio.lugar);

  const evento = await Evento.findOneAndUpdate(
    { _id: req.params.id, acueductoId: req.acueductoId },
    req.body,
    { new: true, runValidators: true }
  );

  if (cambioFechaHoraLugar) {
    const confirmados = [...evento.respuestasRSVP.entries()].filter(([, respuesta]) => respuesta === 'SI');
    await Promise.all(
      confirmados.map(([asociadoId]) =>
        crearNotificacion(asociadoId, req.acueductoId, {
          tipo: 'EVENTO',
          titulo: 'Convocatoria actualizada',
          cuerpo: `${evento.titulo} cambió — ahora es ${evento.fecha} ${evento.hora} en ${evento.lugar}.`,
          referenciaId: evento._id.toString(),
        })
      )
    );
  }

  return ok(res, evento, 'Convocatoria actualizada.');
});

const eliminar = asyncHandler(async (req, res) => {
  const evento = await Evento.findOneAndDelete({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!evento) return fail(res, 404, 'Evento no encontrado.');
  return ok(res, null, 'Convocatoria eliminada.');
});

// Lista los eventos del acueducto del suscriptor, con su propia respuesta
// RSVP (si ya confirmó) — nunca las respuestas de los demás suscriptores,
// que son un dato interno de la junta (respuestasRSVP es un Map completo en
// el modelo, pero aquí solo se expone la entrada del propio usuario).
const misEventos = asyncHandler(async (req, res) => {
  const eventos = await Evento.find({ acueductoId: req.acueductoId }).sort('-fecha');
  const eventosConMiRespuesta = eventos.map((e) => {
    const evento = e.toObject();
    const miRespuesta = e.respuestasRSVP?.get(req.user._id) || null;
    delete evento.respuestasRSVP;
    return { ...evento, miRespuesta };
  });
  return ok(res, eventosConMiRespuesta);
});

// El suscriptor confirma o declina asistencia a una convocatoria. Solo puede
// escribir su propia entrada del Map (req.user._id), nunca la de otro.
const confirmarAsistencia = asyncHandler(async (req, res) => {
  const { respuesta } = req.body;
  const evento = await Evento.findOne({ _id: req.params.id, acueductoId: req.acueductoId });
  if (!evento) return fail(res, 404, 'Evento no encontrado.');

  evento.respuestasRSVP.set(req.user._id, respuesta);
  await evento.save();

  return ok(res, { miRespuesta: respuesta }, 'Respuesta registrada.');
});

module.exports = { listar, crear, actualizar, eliminar, misEventos, confirmarAsistencia };
