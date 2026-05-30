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

## App Móvil

```bash
cd mobile-app

npm install                    # Instalar dependencias (primera vez)
npx expo start                 # Iniciar servidor Metro
npx expo start --tunnel        # Modo túnel (para dispositivo físico con Expo Go)
npx expo start --android       # Abrir en emulador Android
npx expo start --ios           # Abrir en simulador iOS (solo Mac)
npx expo start --clear

# Builds con EAS
eas build --platform android --profile preview     # APK de prueba
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

## Orden recomendado para desarrollo local

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Panel Web
cd web-admin && npm run dev

# Terminal 3 — App Móvil
cd mobile-app && npx expo start --tunnel
```
