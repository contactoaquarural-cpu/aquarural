const multer = require('multer');

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // El mimetype declarado por el cliente no siempre es fiable (varía entre
    // navegadores/herramientas para el mismo archivo válido), así que también
    // se acepta por extensión como respaldo.
    const tiposValidos = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const extensionValida = /\.(xlsx|xls)$/i.test(file.originalname);
    if (tiposValidos.includes(file.mimetype) || extensionValida) return cb(null, true);
    const error = new Error('El archivo debe ser un Excel (.xlsx o .xls).');
    error.status = 400;
    cb(error);
  },
});

const uploadImagen = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const tiposValidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (tiposValidos.includes(file.mimetype)) return cb(null, true);
    const error = new Error('La imagen debe ser JPG, PNG o WEBP.');
    error.status = 400;
    cb(error);
  },
});

module.exports = { uploadExcel, uploadImagen };
