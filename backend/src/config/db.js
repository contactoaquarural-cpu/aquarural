const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    logger.info('Conectado a MongoDB Atlas');
  } catch (error) {
    logger.error('Error al conectar a MongoDB', { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;
