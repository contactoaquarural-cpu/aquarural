# Comandos del Monorepo — AquaRural Pro

Guía de comandos para ejecutar, sembrar datos y compilar la plataforma AquaRural en entorno local.

---

## ⚡ 1. Backend (API REST Node.js / Express)

```bash
cd backend

# Instalar dependencias (primera vez)
npm install

# Servidor de desarrollo con nodemon (http://localhost:3000)
npm run dev

# Poblar la base de datos de AquaRural en MongoDB Atlas (crea Acueductos, Suscriptores, Facturas)
npm run seed:aquarural

# Servidor de producción
npm start
```

---

## 🏛️ 2. Panel Web Administrativo (React 18 + Vite)

```bash
cd web-admin

# Instalar dependencias (primera vez)
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev

# Compilar para producción (genera carpeta dist/)
npm run build

# Vista previa del build compilado
npm run preview
```

> **Credenciales de Acceso Demo al Panel Web:**
> - **SuperAdmin SaaS:** `contactoaquarural@gmail.com` / Contraseña: `SuperAdmin2026*`
> - **Admin / Tesorero Acueducto Veredal:** Cédula: `12203639` / Contraseña: `Admin2026*`

---

## 📱 3. App Móvil (React Native + Expo)

```bash
cd mobile-app

# Instalar dependencias (primera vez)
npm install

# Iniciar servidor Metro de Expo
npx expo start

# Modo túnel (para probar en tu celular físico con la App Expo Go)
npx expo start --tunnel

# Iniciar en emulador Android o simulador iOS
npx expo start --android
npx expo start --ios

# Limpiar caché de bundler
npx expo start --clear
```

> **Builds para Tiendas de Aplicaciones (EAS):**
> ```bash
> eas login                                          # Iniciar sesión en Expo
> eas build --platform android --profile preview     # Generar archivo APK de prueba
> eas build --platform android --profile production  # Build para Google Play Store
> ```

---

## 🌐 4. Landing Page Comercial (React 18 + Vite)

```bash
cd landing

# Instalar dependencias (primera vez)
npm install

# Servidor de desarrollo (http://localhost:5174 o 5175)
npm run dev

# Compilar para producción
npm run build
```

---

## 🚀 Orden Recomendado para Ejecución Local

Para probar todo el ecosistema al mismo tiempo, abre 3 terminales separadas:

```bash
# Terminal 1 — Backend API REST (Puerto 3000)
cd backend && npm run dev

# Terminal 2 — Panel Web Admin (Puerto 5173)
cd web-admin && npm run dev

# Terminal 3 — Landing Page Comercial (Puerto 5174)
cd landing && npm run dev

# Terminal 4 (Opcional) — App Móvil Expo
cd mobile-app && npx expo start --tunnel
```
