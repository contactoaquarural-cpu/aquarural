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

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/health', (req, res) => res.json({ success: true, message: 'OK' }));

app.use('/auth', authRoutes);
app.use('/acueductos', acueductosRoutes);
app.use('/superadmin', superadminRoutes);
app.use('/asociados', asociadosRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
