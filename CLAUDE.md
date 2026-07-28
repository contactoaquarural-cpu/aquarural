# CLAUDE.md — Plataforma Digital Ganadera
> Este archivo es leído automáticamente por Claude Code al iniciar cualquier sesión.
> Contiene el contexto completo del proyecto. No eliminarlo ni moverlo.

---

## 🏢 Identidad del Proyecto

| Campo | Valor |
|---|---|
| **Producto** | GanaderoPro |
| **Descripción** | Plataforma digital replicable para asociaciones ganaderas de Colombia |
| **Empresa** | MetaDevelopment Ltd |
| **Desarrollador principal** | Julián Andrés Trujillo Morales |
| **Cliente demo** | Asociación de Ganaderos de Garzón – Huila, Colombia |
| **Modelo de negocio** | Pack por asociación: Landing + Admin + App (instancia independiente por cliente) |
| **Versión actual** | 1.0 — MVP |
| **Repositorio** | GitHub privado (monorepo) |

> **Nota de personalización:** El nombre "ASOGACENTRO", logo y colores son configurables desde el panel admin.
> Al vender a una nueva asociación se ajusta: nombre, logo, color primario, municipio y teléfono.

---

## 🎯 Qué es este proyecto

Sistema de dos plataformas digitales para modernizar la gestión de la Asociación de Ganaderos de Garzón:

1. **App Móvil** (iOS + Android) — Para los ganaderos asociados
2. **Panel Web Administrativo** — Para la junta directiva de la asociación

Ambas consumen una **API REST centralizada** en Node.js con base de datos MongoDB Atlas.

---

## 🗂️ Estructura del Monorepo

```
plataforma-digital-ganadera/
├── CLAUDE.md               ← Estás aquí (contexto global)
├── backend/                ← API REST Node.js + Express + MongoDB
│   ├── CLAUDE.md           ← Contexto específico del backend
│   └── src/
├── web-admin/              ← Panel web React.js + Vite + Tailwind CSS
│   ├── CLAUDE.md           ← Contexto específico del panel web
│   └── src/
├── mobile-app/             ← App React Native + Expo
│   ├── CLAUDE.md           ← Contexto específico de la app móvil
│   └── src/
├── landing/                ← Landing page pública de la asociación (React + Vite + Tailwind)
│   └── src/
└── docs/                   ← Documentación técnica y manuales
```

---

## ⚙️ Stack Tecnológico Completo

### Backend
| Capa | Tecnología | Versión |
|---|---|---|
| Runtime | Node.js | v20 LTS |
| Framework | Express.js | v4.x |
| ODM | Mongoose | v8.x |
| Base de datos | MongoDB Atlas | v7.x (free tier M0) |
| Autenticación | JWT + bcrypt | jsonwebtoken 9.x |
| Validación | Zod | v3.x |
| Pagos | Wompi API | REST v2 |
| Notificaciones | Firebase Admin SDK | v12.x |
| Emails | Nodemailer + Gmail | v6.x |
| QR | qrcode (npm) | v1.5.x |
| Cache | node-cache | v5.x |
| Logs | Winston | v3.x |
| Testing | Jest + Supertest | v29.x |
| Cron jobs | node-cron | v3.x |
| Imágenes | Cloudinary | SDK v2 |

### App Móvil
| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React Native + Expo | v0.74+ |
| Navegación | React Navigation | v6.x |
| Estado global | Zustand | v4.x |
| HTTP Client | Axios | v1.x |
| Almacenamiento | Expo SecureStore | latest |
| Build | Expo EAS Build | latest |
| Push | Firebase Cloud Messaging | v20.x |

### Panel Web
| Capa | Tecnología | Versión |
|---|---|---|
| Framework | React.js + Vite | React 18 |
| UI | Tailwind CSS | v3.x |
| Estado | Zustand | v4.x |
| Data fetching | Axios + React Query | v5.x |
| Gráficas | Recharts | v2.x |
| Routing | React Router | v6.x |
| Exportación | xlsx + jsPDF | latest |

### Infraestructura
| Servicio | Plataforma |
|---|---|
| API Hosting | Railway |
| Web Hosting | Vercel |
| Base de datos | MongoDB Atlas M0 |
| CI/CD | GitHub Actions |
| SSL | Let's Encrypt (auto) |
| Monitoreo | UptimeRobot |
| Imágenes CDN | Cloudinary |

---

## 📦 Módulos del MVP

1. **Registro de Asociados** — Datos personales + finca
2. **Pagos de Aportes** — Integración Wompi (PSE, tarjeta, Nequi)
3. **Control de Estado** — AL_DIA / EN_MORA / INACTIVO (automático)
4. **Carné QR Digital** — Firmado HMAC-SHA256, TTL 30 días
5. **Convenios Comerciales** — Almacenes agropecuarios, veterinarias
6. **Noticias del Sector** — GOBIERNO, SANIDAD, PRECIOS, EVENTO
7. **Notificaciones Push** — Automáticas y manuales (Firebase)
8. **Panel Administrativo** — Gestión completa para la junta
9. **Estadísticas** — Datos reales del sector ganadero de Garzón

---

## 🚦 Estado Actual del Proyecto

> **Actualiza esta sección al completar cada fase.**

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | Configuración, registro y autenticación (backend) | ✅ Completado |
| Fase 2 | Módulo de pagos y control de estado (backend) | ✅ Completado |
| Fase 3 | QR carné digital y convenios (backend) | ✅ Completado |
| Fase 4 | Panel web administrativo (React + Tailwind CSS) | ✅ Completado |
| Fase 5 | App móvil completa (React Native + Expo) | ✅ Completado |
| Fase 6 | Noticias y notificaciones (backend + frontend) | ✅ Completado |
| Fase 7 | Modo claro/oscuro (web admin + app móvil) | ✅ Completado |
| Fase 8 | Estadísticas, pruebas y despliegue | ⬜ Pendiente |
| Fase 9 | Ganadero TV — series de video (backend + web-admin + app) | ✅ Completado |
| Fase 10 | Mercado ganadero — avisos de compraventa (backend + web-admin + app) | ✅ Completado |
| Fase 11 | GanaderoPro — producto replicable + landing page institucional | 🔄 En progreso |
| Fase 12 | Eventos y Convocatorias — invitaciones push con confirmación de asistencia | ✅ Completado |
| v2.0 | Ubicación de finca con Google Maps API | ⬜ Versión 2.0 |

**Leyenda:** ⬜ Pendiente — 🔄 En progreso — ✅ Completado

---

## 🚀 Fase 11 — GanaderoPro: Producto Replicable + Landing Page

### Objetivo
Convertir el sistema en un producto vendible a cualquier asociación ganadera de Colombia.
Cada asociación recibe su propia instancia con nombre, logo y colores personalizados.

### Tareas

| # | Tarea | Archivos principales | Estado |
|---|---|---|---|
| 11.1 | Agregar `colorPrimario` y `logoUrl` a modelo `Configuracion` | `backend/src/models/Configuracion.js`, `configuracion.controller.js` | ⬜ |
| 11.2 | Admin: subir logo y elegir color primario desde Configuración | `web-admin/src/pages/Configuracion/ConfiguracionPage.jsx` | ⬜ |
| 11.3 | Limpiar hardcodes "ASOGACENTRO" en app móvil → usar `nombreAsociacion` dinámico | `mobile-app/src/` (múltiples screens) | ⬜ |
| 11.4 | Limpiar hardcodes "ASOGACENTRO" en web-admin → usar `nombreAsociacion` dinámico | `web-admin/src/` (múltiples componentes) | ⬜ |
| 11.5 | Crear landing page (`landing/`) — React + Vite + Tailwind | `landing/` (carpeta nueva) | ⬜ |
| 11.6 | Landing: secciones Hero, Nosotros, Convenios, Noticias, Precios, Ganadero TV, Contacto | `landing/src/` | ⬜ |
| 11.7 | Landing: formulario "Quiero asociarme" → WhatsApp/email de la asociación | `landing/src/components/FormularioContacto.jsx` | ⬜ |
| 11.8 | Landing: consumir datos reales del backend (noticias, convenios, precios, configuracion) | `landing/src/services/` | ⬜ |
| 11.9 | Deploy landing en Vercel (junto al web-admin o proyecto separado) | `vercel.json` | ⬜ |

### Secciones de la landing vinculadas al backend

| Sección | Endpoint | Editable desde admin |
|---|---|---|
| Hero (nombre, logo, slogan) | `GET /configuracion` | ✅ Configuración |
| Noticias recientes | `GET /noticias?limit=3` | ✅ Módulo Noticias |
| Convenios activos | `GET /convenios` | ✅ Módulo Convenios |
| Precios del ganado | `GET /precios` | ✅ Módulo Precios |
| Ganadero TV | `GET /videos?limit=3` | ✅ Módulo Ganadero TV |
| Estadísticas (socios, años) | `GET /estadisticas` | ✅ Automático |
| Contacto / WhatsApp | `GET /configuracion` → `telefonoContacto` | ✅ Configuración |

### Personalización por asociación (al vender)
1. Cambiar `MONGODB_URI` → nueva BD en Atlas
2. Subir logo desde panel admin → Configuración
3. Cambiar color primario desde panel admin → Configuración
4. Actualizar `nombreAsociacion` y `municipio` desde panel admin
5. Actualizar `telefonoContacto` desde panel admin
6. Configurar dominio en Vercel/Railway

---

## 🔐 Variables de Entorno (resumen)

> Los valores reales están en `backend/.env` (nunca en el repositorio).
> El archivo `backend/.env.example` tiene todas las claves sin valores.

```
PORT
MONGODB_URI
JWT_SECRET
JWT_REFRESH_SECRET
WOMPI_PUBLIC_KEY
WOMPI_PRIVATE_KEY
WOMPI_INTEGRITY_SECRET
WOMPI_SANDBOX
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
QR_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NODEMAILER_USER
NODEMAILER_PASS
NODE_ENV
```

---

## 🌿 Estrategia de Ramas Git

```
main          → Producción (solo merges desde develop cuando hay release)
develop       → Desarrollo activo (rama base para trabajar)
fase-1-backend    → Rama de trabajo para Fase 1
fase-2-pagos      → Rama de trabajo para Fase 2
fase-3-qr         → Rama de trabajo para Fase 3
fase-4.5-web-admin → Rama de trabajo para Fase 4
fase-4-mobile     → Rama de trabajo para Fase 5
fase-5-noticias   → Rama de trabajo para Fase 6
fase-6-darkmode   → Rama de trabajo para Fase 7
fase-7-deploy     → Rama de trabajo para Fase 8
```

**Flujo de trabajo:**
1. Crear rama `fase-X-nombre` desde `develop`
2. Desarrollar y hacer commits frecuentes
3. Al completar la fase, merge a `develop`
4. Al terminar el MVP, merge `develop` → `main`

---

## 📏 Convenciones Globales del Proyecto

### Idioma
- **Código:** inglés (variables, funciones, clases)
- **Comentarios y documentación:** español
- **Mensajes de respuesta de la API:** español
- **Commits de Git:** español con prefijo en inglés (`feat:`, `fix:`, `chore:`)

### Formato de commits
```
feat: implementar módulo de pagos con Wompi
fix: corregir validación de cédula duplicada
chore: actualizar dependencias de seguridad
docs: agregar documentación del endpoint de QR
test: agregar pruebas del webhook de Wompi
refactor: extraer lógica de estado a servicio separado
```

### Nombres de archivos
```
Modelos:       PascalCase    → Asociado.js, Finca.js
Controllers:   camelCase     → asociados.controller.js
Routes:        camelCase     → asociados.routes.js
Middleware:    camelCase     → auth.middleware.js
Utils:         camelCase     → jwt.utils.js
Tests:         camelCase     → asociados.test.js
Screens:       PascalCase    → LoginScreen.js, HomeScreen.js
Components:    PascalCase    → AsociadoCard.js, QRModal.js
Stores:        camelCase     → auth.store.js, pagos.store.js
```

---

## ⛔ Reglas que Claude Code SIEMPRE debe respetar

1. **Nunca modificar `.env`** — Solo `.env.example`
2. **Nunca hacer push directo a `main`** — Siempre a `develop` o rama de fase
3. **Nunca eliminar tests existentes** — Solo agregar nuevos
4. **Nunca cambiar el formato estándar de respuesta de la API** sin instrucción explícita
5. **Siempre manejar errores con try/catch** en controllers y jobs
6. **Nunca exponer el campo `password`** en respuestas de la API
7. **Siempre validar con Zod** antes de guardar en base de datos
8. **Un archivo por tarea** — No modificar más archivos de los necesarios

---

## 📞 Contacto del Proyecto

```
Empresa:    MetaDevelopment Ltd
Web:        https://metadevelopment.co.uk
Email:      support@metadevelopment.co.uk
Teléfono:   316 616 0377
Registro:   England & Wales No. 15830243
Colombia:   Cámara de Comercio del Huila No. 394664
```
