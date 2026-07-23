const { z } = require('zod');
const Configuracion = require('../models/Configuracion');
const Aporte        = require('../models/Aporte');

const schemaActualizar = z.object({
  montoAporte:      z.number({ invalid_type_error: 'montoAporte debe ser un número' }).min(1000, 'El monto mínimo es $1.000').optional(),
  nombreAsociacion: z.string().min(3).optional(),
  municipio:        z.string().min(3).optional(),
  telefonoContacto: z.string().min(7, 'El teléfono debe tener al menos 7 dígitos').optional(),
});

// GET /configuracion — público
const obtener = async (req, res) => {
  try {
    const config = await Configuracion.obtener();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener configuración' });
  }
};

// PATCH /configuracion — solo admin
const actualizar = async (req, res) => {
  try {
    const parsed = schemaActualizar.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    }

    const config = await Configuracion.obtener();
    const montoAnterior = config.montoAporte;
    Object.assign(config, parsed.data);
    await config.save();

    // Si cambió el monto, actualizar aportes PENDIENTES que traían el monto anterior
    if (parsed.data.montoAporte && parsed.data.montoAporte !== montoAnterior) {
      await Aporte.updateMany(
        { estado: 'PENDIENTE', monto: montoAnterior },
        { monto: parsed.data.montoAporte }
      );
    }

    res.json({ success: true, message: 'Configuración actualizada', data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar configuración' });
  }
};

module.exports = { obtener, actualizar };
