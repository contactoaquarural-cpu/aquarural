require('dotenv').config();
const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');

const start = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`AquaRural backend escuchando en el puerto ${env.PORT}`);
  });
};

start();
