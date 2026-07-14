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

// Middleware para subir hasta 5 imágenes con campo "fotos" (publicaciones del mercado)
const uploadFotos = upload.array('fotos', 5);

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

// Wrapper para múltiples fotos (mercado)
const handleUploadMultiple = (req, res, next) => {
  uploadFotos(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: err.code === 'LIMIT_FILE_SIZE'
          ? 'Cada imagen no puede superar 5 MB'
          : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Máximo 5 fotos por publicación'
          : 'Error al procesar los archivos',
      });
    }
    if (err) {
      return res.status(400).json({ success: false, data: null, message: err.message });
    }
    next();
  });
};

// ─── Video (Ganadero TV) ──────────────────────────────────────────────────────

const TIPOS_VIDEO = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
const TAMAÑO_MAXIMO_VIDEO = 100 * 1024 * 1024; // 100 MB

const uploadVideo = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (TIPOS_VIDEO.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten videos MP4, MOV o AVI'), false);
    }
  },
  limits: { fileSize: TAMAÑO_MAXIMO_VIDEO },
}).single('video');

const handleUploadVideo = (req, res, next) => {
  uploadVideo(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        data: null,
        message: err.code === 'LIMIT_FILE_SIZE'
          ? 'El video no puede superar 100 MB'
          : 'Error al procesar el video',
      });
    }
    if (err) {
      return res.status(400).json({ success: false, data: null, message: err.message });
    }
    next();
  });
};

module.exports = { handleUpload, handleUploadMultiple, handleUploadVideo };
