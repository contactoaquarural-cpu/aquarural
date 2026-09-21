require('dotenv').config();
const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');
const { iniciarJobLicencias } = require('./jobs/licencias.job');
const { iniciarJobEstado } = require('./jobs/estado.job');

const start = async () => {
  await connectDB();
  iniciarJobLicencias();
  iniciarJobEstado();

  app.listen(env.PORT, () => {
    logger.info(`AquaRural backend escuchando en el puerto ${env.PORT}`);
  });
};

start();
