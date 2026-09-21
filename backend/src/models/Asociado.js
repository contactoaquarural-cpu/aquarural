const mongoose = require('mongoose');

const asociadoSchema = new mongoose.Schema(
  {
    acueductoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Acueducto', required: true },
    matricula: { type: String, required: true, trim: true },
    cedula: { type: String, required: true, trim: true },
    nombres: { type: String, required: true, trim: true },
    apellidos: { type: String, default: '', trim: true },
    telefono: { type: String, trim: true },
    correo: { type: String, lowercase: true, trim: true },

    // Datos de predio, embebidos directamente (sin modelo Finca separado)
    direccion: { type: String, trim: true },
    vereda: { type: String, default: 'Centro', trim: true },
    latitud: { type: Number },
    longitud: { type: Number },
    numeroMedidor: { type: String, default: 'S/N', trim: true },
    lecturaAnterior: { type: Number, default: 0, min: 0 },
    lecturaActual: { type: Number, default: 0, min: 0 },
    fechaUltimaLectura: { type: Date },

    estadoServicio: {
      type: String,
      enum: ['ACTIVO', 'SUSPENDIDO', 'CORTE_PROGRAMADO'],
      default: 'ACTIVO',
    },
    estadoMoratorio: {
      type: String,
      enum: ['AL_DIA', 'EN_MORA', 'INACTIVO'],
      default: 'AL_DIA',
    },
    tarifaPersonalizada: { type: Number },

    // Token de notificaciones push (Firebase Cloud Messaging) del dispositivo
    // móvil del suscriptor. Se guarda al iniciar sesión en mobile-app (aún
    // pendiente de construir, ver PLAN_DE_TRABAJO.md) — sin login de
    // suscriptores todavía no hay quién lo registre.
    tokenFCM: { type: String, default: '' },

    fechaVinculacion: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

asociadoSchema.index({ acueductoId: 1, cedula: 1 }, { unique: true });
asociadoSchema.index({ acueductoId: 1, matricula: 1 }, { unique: true });

// Normaliza mayúsculas/minúsculas sin importar el camino de entrada (modal
// manual, carga Excel, o cualquier cliente futuro) — evita mezclar "juan
// perez", "MARIA GOMEZ", "carlos Ruiz" en la misma tabla. Title Case simple
// para nombres/vereda (sin lista de excepciones para "de"/"del": es una
// convención aceptable en español y agregar excepciones sería complejidad
// injustificada aquí); mayúsculas completas para el número de medidor, que
// son códigos alfanuméricos, no texto libre.
const aTitleCase = (texto) =>
  texto
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');

const normalizarCampos = (datos) => {
  if (datos.nombres) datos.nombres = aTitleCase(datos.nombres);
  if (datos.apellidos) datos.apellidos = aTitleCase(datos.apellidos);
  if (datos.vereda) datos.vereda = aTitleCase(datos.vereda);
  if (datos.numeroMedidor && datos.numeroMedidor !== 'S/N') datos.numeroMedidor = datos.numeroMedidor.toUpperCase();
};

asociadoSchema.pre('save', function (next) {
  normalizarCampos(this);
  next();
});

// findOneAndUpdate no dispara pre('save') — el controller de "actualizar"
// usa findOneAndUpdate, así que necesita su propio hook para normalizar
// igual que al crear.
asociadoSchema.pre('findOneAndUpdate', function (next) {
  normalizarCampos(this._update);
  next();
});

module.exports = mongoose.model('Asociado', asociadoSchema);
