const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const acueductosRoutes = require('./routes/acueductos.routes');
const superadminRoutes = require('./routes/superadmin.routes');
const asociadosRoutes = require('./routes/asociados.routes');
const configuracionRoutes = require('./routes/configuracion.routes');
const facturasRoutes = require('./routes/facturas.routes');
const pagosRoutes = require('./routes/pagos.routes');
const equipoRoutes = require('./routes/equipo.routes');
const reportesRoutes = require('./routes/reportes.routes');
const eventosRoutes = require('./routes/eventos.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    // En desarrollo el panel hace muchas más peticiones por recargas/HMR
    // seguidas que en uso real; en producción se mantiene el límite estricto.
    max: env.NODE_ENV === 'production' ? 300 : 3000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => res.json({ success: true, message: 'OK' }));

app.use('/auth', authRoutes);
app.use('/acueductos', acueductosRoutes);
app.use('/superadmin', superadminRoutes);
app.use('/asociados', asociadosRoutes);
app.use('/configuracion', configuracionRoutes);
app.use('/facturas', facturasRoutes);
app.use('/pagos', pagosRoutes);
app.use('/equipo', equipoRoutes);
app.use('/reportes', reportesRoutes);
app.use('/eventos', eventosRoutes);
app.use('/notificaciones', notificacionesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
