const logger = require('../utils/logger');
const { fail } = require('../utils/response');

const notFoundHandler = (req, res) => {
  fail(res, 404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
};

const errorHandler = (err, req, res, _next) => {
  logger.error('Error no controlado', { error: err.message, stack: err.stack });

  if (err.name === 'ValidationError') {
    return fail(res, 400, 'Error de validación.', err.errors);
  }

  if (err.code === 11000) {
    return fail(res, 409, 'Ya existe un registro con esos datos.');
  }

  if (err.name === 'MulterError') {
    return fail(res, 400, err.message);
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Error interno del servidor.' : err.message;
  fail(res, status, message);
};

module.exports = { notFoundHandler, errorHandler };
