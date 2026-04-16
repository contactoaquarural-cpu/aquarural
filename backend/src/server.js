require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');
const { inicializar: inicializarFirebase } = require('./services/firebase.service');
const { iniciarJob: iniciarJobEstado } = require('./jobs/estado.job');

const PORT = process.env.PORT || 3000;

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Conexión a MongoDB Atlas establecida');
  } catch (error) {
    logger.error('Error al conectar MongoDB', { error: error.message });
    process.exit(1);
  }
};

const iniciar = async () => {
  await conectarDB();
  inicializarFirebase();
  iniciarJobEstado();

  app.listen(PORT, () => {
    logger.info(`Servidor corriendo en puerto ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
};

iniciar();
