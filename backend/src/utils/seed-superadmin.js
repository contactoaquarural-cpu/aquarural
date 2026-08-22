require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../config/env');
const AdminUser = require('../models/AdminUser');
const logger = require('./logger');

const run = async () => {
  const { SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NOMBRE } = process.env;

  if (!SUPERADMIN_EMAIL || !SUPERADMIN_PASSWORD || !SUPERADMIN_NOMBRE) {
    logger.error('Faltan SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD o SUPERADMIN_NOMBRE en el .env');
    process.exit(1);
  }

  await mongoose.connect(env.MONGODB_URI);

  const existente = await AdminUser.findOne({ correo: SUPERADMIN_EMAIL.toLowerCase(), rol: 'SUPERADMIN' });
  if (existente) {
    logger.info('El SUPERADMIN ya existe, no se crea de nuevo.');
    await mongoose.disconnect();
    return;
  }

  await AdminUser.create({
    acueductoId: null,
    nombre: SUPERADMIN_NOMBRE,
    correo: SUPERADMIN_EMAIL.toLowerCase(),
    password: await bcrypt.hash(SUPERADMIN_PASSWORD, 10),
    rol: 'SUPERADMIN',
  });

  logger.info(`SUPERADMIN creado: ${SUPERADMIN_EMAIL}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  logger.error('Error al sembrar SUPERADMIN', { error: error.message });
  process.exit(1);
});
