const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const asociadosRoutes = require('./routes/asociados.routes');
const pagosRoutes = require('./routes/pagos.routes');
const adminRoutes = require('./routes/admin.routes');
const qrRoutes = require('./routes/qr.routes');
const conveniosRoutes = require('./routes/convenios.routes');
const fincasRoutes = require('./routes/fincas.routes');
const noticiasRoutes = require('./routes/noticias.routes');

const app = express();

// Seguridad HTTP
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// Rate limiting global: máx. 100 requests por 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    data: null,
    message: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.',
  },
});
app.use(limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check para Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok', timestamp: new Date().toISOString() },
    message: 'Servidor funcionando correctamente',
  });
});

// Rutas de la API
app.use('/auth', authRoutes);
app.use('/asociados', asociadosRoutes);
app.use('/pagos', pagosRoutes);
app.use('/admin', adminRoutes);
app.use('/qr', qrRoutes);
app.use('/convenios', conveniosRoutes);
app.use('/fincas', fincasRoutes);
app.use('/noticias', noticiasRoutes);

// 404 — ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: 'Ruta no encontrada',
  });
});

module.exports = app;
