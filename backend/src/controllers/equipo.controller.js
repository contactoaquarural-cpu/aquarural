const bcrypt = require('bcryptjs');
const AdminUser = require('../models/AdminUser');
const { ok, fail, asyncHandler } = require('../utils/response');

// Solo roles TESORERO y FONTANERO se gestionan aquí (ADMIN_ACUEDUCTO es único
// por acueducto y se crea al dar de alta el acueducto; SUPERADMIN nunca se
// crea desde este endpoint).
const listar = asyncHandler(async (req, res) => {
  const equipo = await AdminUser.find({
    acueductoId: req.acueductoId,
    rol: { $in: ['TESORERO', 'FONTANERO'] },
  }).sort('nombre');
  return ok(res, equipo);
});

const crear = asyncHandler(async (req, res) => {
  const { nombre, correo, password, rol, veredasAsignadas } = req.body;

  const existente = await AdminUser.findOne({ correo: correo.toLowerCase() });
  if (existente) return fail(res, 409, 'Ya existe un usuario con ese correo.');

  const miembro = await AdminUser.create({
    acueductoId: req.acueductoId,
    nombre,
    correo: correo.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    rol,
    veredasAsignadas: rol === 'FONTANERO' ? veredasAsignadas || [] : [],
  });

  return ok(res, miembro.toJSON(), 'Miembro del equipo creado.', 201);
});

const actualizar = asyncHandler(async (req, res) => {
  const { password, ...resto } = req.body;
  // password llega en texto plano desde el formulario — nunca pasarlo tal
  // cual a findOneAndUpdate, hay que hashearlo primero como en crear().
  const cambios = password ? { ...resto, password: await bcrypt.hash(password, 10) } : resto;

  const miembro = await AdminUser.findOneAndUpdate(
    { _id: req.params.id, acueductoId: req.acueductoId, rol: { $in: ['TESORERO', 'FONTANERO'] } },
    cambios,
    { new: true, runValidators: true }
  );
  if (!miembro) return fail(res, 404, 'Miembro del equipo no encontrado.');
  return ok(res, miembro.toJSON(), 'Miembro del equipo actualizado.');
});

const eliminar = asyncHandler(async (req, res) => {
  const miembro = await AdminUser.findOneAndDelete({
    _id: req.params.id,
    acueductoId: req.acueductoId,
    rol: { $in: ['TESORERO', 'FONTANERO'] },
  });
  if (!miembro) return fail(res, 404, 'Miembro del equipo no encontrado.');
  return ok(res, null, 'Miembro del equipo eliminado.');
});

module.exports = { listar, crear, actualizar, eliminar };
