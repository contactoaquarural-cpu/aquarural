# 💧 CRONOGRAMA EJECUTIVO Y PLAN DE TRANSFORMACIÓN — AQUARURAL
> **Plataforma Integral de Gestión, Facturación y Recaudo Digital para Acueductos Veredales**  
> *Reutilización y Modernización Arquitectónica de Plataforma Ganadera a AquaRural SaaS*

---

## 🏢 Identidad del Proyecto

| Campo | Valor |
|---|---|
| **Producto** | **AquaRural Pro** |
| **Descripción** | Plataforma SaaS multi-inquilino para la administración, facturación masiva y recaudo digital de acueductos veredales en Colombia |
| **Empresa / Desarrollador** | MetaDevelopment Ltd / Julián Andrés Trujillo Morales |
| **Modelo de Negocio** | SaaS Multi-empresa (Suscripción por acueducto + comisión opcional por transacción) |
| **Pasarela de Pago** | Wompi API v2 (PSE, Nequi, Tarjetas, Bancolombia) con llaves independientes por acueducto |
| **Estilo Visual** | **Modern Glassmorphism & Hydro-Tech** (Cyan/Emerald, Deep Slate, sombras suaves, bordes luminosos) |

---

## 🗺️ Mapa General de la Transformación

```
FASE 0: Rediseño de Identidad & Sistema de Diseño "Hydro-Tech" ✅ (Planificación)
│
BLOQUE 1: RECONVERSIÓN Y BACKEND SAAS MULTI-TENANT (Fases 1 - 3)
├─ Fase 1: Arquitectura Multi-Acueducto & SuperAdmin
├─ Fase 2: Módulo de Suscriptores & Carga Masiva Excel
└─ Fase 3: Motor de Facturación Masiva, Tarifas & Integración Wompi Cifrada
│
BLOQUE 2: REDISEÑO DE INTERFACES MODERNAS (Fases 4 - 5)
├─ Fase 4: Panel Web Administrativo (Glassmorphic React Admin)
└─ Fase 5: Portal / App de Pago Rápido para Suscriptores (Sin Fricción)
│
BLOQUE 3: COMERCIALIZACIÓN, TESTING Y DESPLIEGUE (Fases 6 - 7)
├─ Fase 6: Landing Page Comercial SaaS & Simulación de Recaudo
└─ Fase 7: Pruebas de Carga, Seguridad Wompi & Despliegue en Producción
```

---

## 🌿 ESTRATEGIA GIT

### Estructura de Ramas

```
main                           → Producción (AquaRural v1.0)
develop                        → Integración continua
├── aquarural/fase-0-design    → Sistema de diseño moderno & assets
├── aquarural/fase-1-multi-tenant → Backend Multi-Acueducto + SuperAdmin
├── aquarural/fase-2-suscriptores → Gestión y carga masiva Excel
├── aquarural/fase-3-facturacion → Motor de facturación + Wompi cifrado
├── aquarural/fase-4-web-admin   → Panel Web Admin Moderno
├── aquarural/fase-5-portal-pago → Portal web/app de pago rápido suscriptor
└── aquarural/fase-6-landing     → Landing Page Comercial & Deploy
```

---

## 📅 CRONOGRAMA DETALLADO POR FASES

### 🎨 FASE 0: Rediseño de Identidad Visual & UI System ("Hydro-Tech") ✅
**Duración:** 3 días  
**Estado:** ✅ **Completado**  
**Objetivo:** Crear una experiencia visual impresionante, moderna, confiable y fluida centrada en la temática del agua y la gestión pública rural.

- [x] Definición de paleta de colores Hydro-Tech:
  - **Primary:** `Cyan Hydro` (`#0284C7` / `#0EA5E9`)
  - **Secondary:** `Emerald Fresh` (`#059669` / `#10B981`)
  - **Accent/Glow:** `Electric Aqua` (`#06B6D4`)
  - **Dark Mode Background:** `Deep Navy Slate` (`#090D16` / `#0F172A`)
  - **Light Mode Background:** `Ice Blue Mist` (`#F0F9FF`)
- [x] Selección tipográfica: Google Fonts `Outfit` (titulares tecnológicos) e `Inter` (cuerpo de texto legible).
- [x] Actualización de tokens de diseño en `tailwind.config.js` (Web Admin y Landing) y `theme.js` (Mobile App).
- [x] Actualización de metas, títulos e identidad corporativa a **AquaRural**.

---

### ⚙️ FASE 1: Reestructuración Backend Multi-Empresa & SuperAdmin ✅
**Duración:** 1 semana  
**Estado:** ✅ **Completado**  
**Objetivo:** Modificar el backend Node.js + Express + MongoDB para soportar múltiples acueductos independientes en una sola instancia.

- [x] **Modelo `Acueducto` (Multi-tenant):**
  - NIT, Nombre, Municipio, Vereda, Representante, Teléfono, Correo, Logo, Colores.
  - Almacenamiento seguro cifrado (`AES-256-GCM` via `encryption.service.js`) de llaves de **Wompi** (`wompiPublicKey`, `wompiPrivateKeyEncrypted`, `wompiEventsSecretEncrypted`).
- [x] **Modelo `Suscriptor` & `Factura` (Multi-tenant):**
  - Soporte de roles (`SUPERADMIN`, `ADMIN_ACUEDUCTO`, `TESORERO`, `SUSCRIPTOR`), coordenadas GPS (`latitud`, `longitud`), matrículas e historial de facturación por acueducto.
- [x] **Middleware de Contexto por Acueducto (`tenant.middleware.js`):**
  - Validación y aislamiento de datos por `x-acueducto-id`.
- [x] **Controlador y Rutas de SuperAdmin (`superadmin.controller.js` & `superadmin.routes.js`):**
  - Registro, edición, listado, métricas globales consolidadas y cifrado de llaves Wompi.

---

### 👥 FASE 2: Módulo de Suscriptores & Carga Masiva Excel ✅
**Duración:** 1 semana  
**Estado:** ✅ **Completado**  
**Objetivo:** Administrar los usuarios del acueducto y permitir la migración rápida de bases de datos existentes.

- [x] **Modelo `Suscriptor` (Multi-tenant):**
  - Número de matrícula/cuenta, documento, nombres, apellidos, teléfono, vereda, número de medidor, geolocalización GPS (`latitud`/`longitud`), estado (`ACTIVO`, `SUSPENDIDO`, `CORTE_PROGRAMADO`).
- [x] **Endpoint Carga Masiva (Excel - `xlsx` via `multer`):**
  - Parseo automático de archivos `.xlsx`, validación de campos requeridos, detección de duplicados por matrícula en la base de datos e inserción masiva.
- [x] **Actualización de Coordenadas GPS (`PATCH /suscriptores/:id/gps`):**
  - Captura y actualización de coordenadas geográficas de la finca o vivienda desde la app móvil / mapa.
- [x] Búsqueda rápida indexada por Cédula, Matrícula, Nombre o Medidor.

---

### 💧 FASE 3: Motor de Facturación Masiva, Tarifas & Pagos Wompi ✅
**Duración:** 1.5 semanas  
**Estado:** ✅ **Completado**  
**Objetivo:** Permitir la generación automática de facturas mensuales y el recaudo digital sin fricción.

- [x] **Modelo `Factura` / `CuentaDeCobro` (Multi-tenant):**
  - Periodo (`YYYY-MM`), código de factura único, suscriptor, acueducto, cargo fijo, mora, valor total, vencimiento, estado (`PENDIENTE`, `PAGADA`, `VENCIDA`, `ANULADA`).
- [x] **Motor de Facturación Masiva (`POST /facturas/generar-masiva`):**
  - Generación en 1-clic para todos los suscriptores activos del periodo.
- [x] **Consulta de Deuda Rápida (`GET /facturas/consultar-deuda`):**
  - Búsqueda por cédula o matrícula sin fricción para el suscriptor.
- [x] **Integración Wompi Dinámica por Acueducto:**
  - Generación de firma de integridad Wompi (`integritySignature` HMAC-SHA256) usando la llave específica descifrada del acueducto.
  - Webhook receptor Wompi (`POST /facturas/webhook-wompi`) que valida checksum y actualiza el estado de la factura automáticamente a `PAGADA` al recibir `TRANSACTION.UPDATED`.
- [x] **Registro de Pago Presencial (`POST /facturas/:id/pago-efectivo`):**
  - Para pagos recibidos en la oficina del acueducto.

---

### 💻 FASE 4: Rediseño Moderno del Panel Web Admin (React + Vite + Tailwind) ✅
**Duración:** 2 semanas  
**Estado:** ✅ **Completado**  
**Objetivo:** Transformar `web-admin` en una plataforma de gestión moderna de alto nivel con estilo Hydro-Tech Glassmorphism.

- [x] **Dashboard del Acueducto (`/dashboard`):**
  - KPI Cards de recaudo consolidado, suscriptores al día vs en mora, efectividad Wompi, banner de facturación masiva en 1-clic y accesos rápidos.
- [x] **Módulo de Suscriptores (`/suscriptores`):**
  - Padrón oficial interactivo con filtros, coordenadas GPS (`latitud`/`longitud`), modal de carga masiva drag-and-drop de archivos Excel (`.xlsx`).
- [x] **Módulo de Facturación & Cobro (`/facturacion`):**
  - Asistente de facturación masiva por periodo `YYYY-MM` y cobro presencial en efectivo por el tesorero.
- [x] **Mapa GPS de Predios (`/mapa`):**
  - Visualización geográfica de viviendas y tomas de agua con estado moratorio visual.
- [x] **Panel SuperAdmin (`/superadmin`):**
  - Vista general de acueductos veredales afiliados, planes SaaS y cifrado de llaves de Wompi.

---

### 📱 FASE 5: App Móvil & Portal de Pago Rápido para Suscriptores (React Native + Expo) ✅
**Duración:** 2 semanas  
**Estado:** ✅ **Completado**  
**Objetivo:** Desarrollar la aplicación móvil y portal exprés para los suscriptores rurales con la botonera de 5 pestañas y campana de avisos.

- [x] **Navegación Bottom Bar de 5 Botones:**
  - `[ 🏠 Inicio ]`: Dashboard del suscriptor con estado de cartera, botón de pago Wompi y avisos veredales.
  - `[ 💧 Predio/QR ]`: Carné digital QR para toma de lecturas, número de matrícula (`ACU-0101`) y medidor (`MED-90812`).
  - `[ 📍 Ubicación ]`: Mapa interactivo GPS para actualizar la posición exacta de la vivienda en la vereda.
  - `[ 💳 Facturas ]`: Historial de recibos emitidos, pagos en línea Wompi e impresos.
  - `[ 👤 Perfil ]`: Gestión de cuenta y botón directo de soporte por WhatsApp con el tesorero de la junta.
- [x] **Header Superior con Campana de Notificaciones 🔔:**
  - Módulo de alertas para avisar cortes programados por mantenimiento o citaciones a asambleas.
- [x] **App Móvil (React Native/Expo):**
  - Versión optimizada con carné de suscriptor, geolocalización GPS del predio/vivienda, historial de consumos y avisos push de corte o mantenimiento del acueducto.
  - Módulo de actualización de ubicación en mapa interactivo (GPS `lat/lng`).

---

### 🌐 FASE 6: Landing Page Comercial SaaS AquaRural ✅
**Duración:** 1.5 semanas  
**Estado:** ✅ **Completado**  
**Objetivo:** Sitio web público comercial B2B para promocionar y vender AquaRural SaaS a Juntas de Acueductos Veredales en Colombia.

- [x] **Hero Banner Comercial:**
  - Eslogan oficial en español *"AquaRural — Gestión y Recaudo Digital para Acueductos Veredales"*, llamado a la acción por WhatsApp y mockup Glassmorphic de precierre.
- [x] **Simulador Interactiva de Recaudo B2B:**
  - Calculadora de estimación de recaudo mensual, incremento de efectividad por pagos Nequi/PSE (+25%) y ahorro de horas de cobranza manual para la Junta.
- [x] **Grid de Características Clave Hydro-Tech:**
  - 6 módulos principales: Facturación Masiva, Wompi, Carga Masiva Excel, Mapa GPS de Predios, App Móvil con Carné QR y Seguridad Cifrada.
- [x] **Tarifario de Planes Comercial SaaS:**
  - Plan Básico (150 usuarios - $50.000/mes), Plan Estándar (151-500 usuarios - $80.000/mes ⭐) y Plan Empresarial ($150.000/mes).
- [x] **Formulario Lead & Contacto Directo:**
  - Captación de prospectos de acueductos comunitarios con redirección instantánea a WhatsApp (`+57 316 616 0377`).

---

### 🚀 FASE 7: Pruebas, Seguridad & Despliegue en Producción
**Duración:** 1 semana  
**Objetivo:** Garantizar la seguridad de las transacciones y lanzar el sistema en producción.

- [ ] Pruebas unitarias e integración de la pasarela Wompi en modo Sandbox.
- [ ] Auditoría de seguridad: cifrado de credenciales de acueductos y protección contra inyección SQL/NoSQL.
- [ ] Despliegue Backend en Railway / Render.
- [ ] Despliegue Web Admin & Landing en Vercel.
- [ ] Publicación de la App en Expo EAS / Google Play Store.

---

## 📊 Matriz de Reutilización del Código Actual

| Módulo Actual (Plataforma Ganadera) | Módulo Objetivo (AquaRural) | Nivel de Reutilización |
|---|---|---|
| Autenticación JWT / Roles (`auth`) | Autenticación SuperAdmin, Admin Acueducto y Suscriptor | ⚡ **95% Reutilizable** |
| Integración Wompi API (`pagos`) | Recaudo de Cuentas de Cobro / Facturas por Acueducto | ⚡ **85% Reutilizable** (Añadir cifrado multi-tenant) |
| Componentes React + Vite + Tailwind | Panel Web Admin y Landing Page | 🎨 **70% Reutilizable** (Rediseño visual a Hydro-Tech) |
| Estructura Expo React Native | App / Portal del Suscriptor | 📱 **75% Reutilizable** |
| Generación de QR y PDF (`qr`) | Comprobantes y Facturas Digitales PDF/QR | ⚡ **90% Reutilizable** |
| Notificaciones Firebase FCM | Alertas de Pago / Mantenimiento de Agua | ⚡ **90% Reutilizable** |

