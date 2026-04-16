const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

const sendPasswordResetEmail = async (correo, nombre, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset/${resetToken}`;

  const mailOptions = {
    from: `"Asociación Ganaderos Garzón" <${process.env.NODEMAILER_USER}>`,
    to: correo,
    subject: 'Recuperación de contraseña – Plataforma Ganadera',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2d6a4f;">Recuperación de contraseña</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Haz clic en el siguiente botón para continuar. El enlace expira en <strong>1 hora</strong>:</p>
        <a href="${resetUrl}"
           style="display:inline-block; background:#2d6a4f; color:#fff; padding:12px 28px;
                  text-decoration:none; border-radius:4px; margin:16px 0; font-size:15px;">
          Restablecer contraseña
        </a>
        <p style="color:#888; font-size:13px;">
          Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.
        </p>
        <hr style="border:none; border-top:1px solid #eee; margin-top:24px;"/>
        <small style="color:#aaa;">Asociación de Ganaderos de Garzón – Huila, Colombia</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  logger.info(`Correo de recuperación enviado a ${correo}`);
};

module.exports = { sendPasswordResetEmail };
