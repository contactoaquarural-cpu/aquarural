const { z } = require('zod');

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es requerido'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET es requerido'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET es requerido'),
  MASTER_ENCRYPTION_KEY: z.string().min(1, 'MASTER_ENCRYPTION_KEY es requerido'),
  DIAS_PRUEBA_GRATIS: z.string().default('30'),
  WOMPI_PLATAFORMA_PUBLIC_KEY: z.string().optional().default(''),
  WOMPI_PLATAFORMA_PRIVATE_KEY: z.string().optional().default(''),
  WOMPI_PLATAFORMA_EVENTS_SECRET: z.string().optional().default(''),
  WOMPI_PLATAFORMA_INTEGRITY_SECRET: z.string().optional().default(''),
  WOMPI_PLATAFORMA_SANDBOX: z.string().default('true'),
  NODEMAILER_USER: z.string().optional().default(''),
  NODEMAILER_PASS: z.string().optional().default(''),
  FRONTEND_URL: z.string().optional().default('http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  FIREBASE_PROJECT_ID: z.string().optional().default(''),
  FIREBASE_PRIVATE_KEY: z.string().optional().default(''),
  FIREBASE_CLIENT_EMAIL: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno inválidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;
