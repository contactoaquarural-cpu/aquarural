const multer = require('multer');

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMAÑO_MAXIMO = 5 * 1024 * 1024; // 5 MB

// Almacenamiento en memoria — el buffer se pasa a Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: TAMAÑO_MAXIMO },
});

// Middleware para subir una sola imagen con campo "foto"
const uploadFoto = upload.single('foto');

// Wrapper que convierte errores de multer al formato estándar de la API
const handleUpload = (req, res, next) => {
  uploadFoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: err.code === 'LIMIT_FILE_SIZE'
          ? 'La imagen no puede superar 5 MB'
          : 'Error al procesar el archivo',
      });
    }
    if (err) {
      return res.status(400).json({ success: false, data: null, message: err.message });
    }
    next();
  });
};

module.exports = { handleUpload };
