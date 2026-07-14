const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Sube un buffer de imagen a Cloudinary y retorna la URL segura
const subirImagen = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error) {
          logger.error('Error al subir imagen a Cloudinary', { error: error.message });
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Elimina una imagen de Cloudinary por su public_id
const eliminarImagen = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.warn('Error al eliminar imagen de Cloudinary', { publicId, error: error.message });
  }
};

// Sube una imagen para publicaciones del mercado (sin recorte de cara, formato landscape)
const subirImagenMercado = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [{ width: 1080, height: 1080, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) {
          logger.error('Error al subir imagen de mercado a Cloudinary', { error: error.message });
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Sube un video MP4 a Cloudinary y genera thumbnail automáticamente del primer frame
// El thumbnail se obtiene reemplazando la extensión .mp4 por .jpg en la URL
const subirVideo = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'video',
        // eager genera el thumbnail del primer frame al momento de subir
        eager: [{ format: 'jpg', transformation: [{ width: 1080, height: 1080, crop: 'fill' }] }],
        eager_async: false,
      },
      (error, result) => {
        if (error) {
          logger.error('Error al subir video a Cloudinary', { error: error.message });
          reject(error);
        } else {
          // Construir URL del thumbnail desde el eager result o derivarla de la URL del video
          const thumbnailUrl = result.eager?.[0]?.secure_url
            || result.secure_url.replace('/video/upload/', '/video/upload/so_0,w_1080,h_1080,c_fill/').replace('.mp4', '.jpg');
          resolve({ videoUrl: result.secure_url, thumbnailUrl, duracion: Math.round(result.duration || 0) });
        }
      }
    );
    uploadStream.end(buffer);
  });
};

// Sube un documento (PDF o imagen) a Cloudinary sin transformación
const subirDocumento = (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error('Error al subir documento a Cloudinary', { error: error.message });
          reject(error);
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = { subirImagen, eliminarImagen, subirImagenMercado, subirVideo, subirDocumento };
