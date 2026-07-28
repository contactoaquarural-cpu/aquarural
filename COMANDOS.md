# Comandos del Monorepo — Plataforma Digital Ganadera

## Backend (API REST)

```bash
cd backend

npm run dev        # Servidor de desarrollo con nodemon (puerto 3000)
npm start          # Servidor de producción
npm test           # Ejecutar suite de tests con cobertura
npm run test:watch # Tests en modo watch
npm run seed       # Poblar base de datos con datos de prueba
```

## Panel Web Administrativo

```bash
cd web-admin

npm install        # Instalar dependencias (primera vez)
npm run dev        # Servidor de desarrollo (http://localhost:5173)
npm run build      # Build de producción (genera carpeta dist/)
npm run preview    # Preview del build de producción
```

> Credenciales de acceso al panel:
> - Cédula: `000000001`
> - Contraseña: `Admin2024*`

> Credenciales de asociado de prueba (app móvil):
> - Cédula: `12203639`
> - Contraseña: `Admin1234`

## App Móvil

```bash
cd mobile-app

npm install                    # Instalar dependencias (primera vez)
npx expo start                 # Iniciar servidor Metro
npx expo start --tunnel        # Modo túnel (para dispositivo físico con Expo Go)
npx expo start --android       # Abrir en emulador Android
npx expo start --ios           # Abrir en simulador iOS (solo Mac)
npx expo start --clear

# Conectar desde Expo Go (ingresar URL manual en la app)
# exp://192.168.100.133:8081

# Builds con EAS
eas login                                          # Iniciar sesión en Expo (primera vez)
eas build --platform android --profile preview     # APK de prueba (10-15 min)
eas build --platform android --profile production  # Build Play Store
eas submit --platform android                      # Subir a Google Play
```

## Variables de entorno

Antes de ejecutar cualquier módulo, copia el archivo de ejemplo y completa los valores:

```bash
# Backend
cp backend/.env.example backend/.env

# App móvil
cp mobile-app/.env.example mobile-app/.env
```

## Landing Page (GanaderoPro)

```bash
cd landing

npm install        # Instalar dependencias (primera vez)
npm run dev        # Servidor de desarrollo (http://localhost:5174)
npm run build      # Build de producción
npm run preview    # Preview del build
```

> Variables de entorno en `landing/.env`:
> - `VITE_API_URL` → URL del backend
> - `VITE_ADMIN_URL` → URL del panel admin

## Orden recomendado para desarrollo local

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Panel Web
cd web-admin && npm run dev

# Terminal 3 — App Móvil
cd mobile-app && npx expo start --tunnel
```
