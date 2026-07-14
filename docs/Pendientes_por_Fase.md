# Pendientes por Fase — Plataforma Digital Ganadera
> Generado el 2026-07-11 con base en análisis del código real del proyecto.
> Actualizar este archivo cada vez que se complete un ítem.

---

## Estado general

```
Fase 1  ████████████ 100%  ✅ Completa
Fase 2  ████████████ 100%  ✅ Completa
Fase 3  ████████████ 100%  ✅ Completa
Fase 4  ████████████ 100%  ✅ Completa
Fase 5  ████████████ 100%  ✅ Completa
Fase 6  ████████████ 100%  ✅ Completa
Fase 7  ████████████ 100%  ✅ Completa
Fase 8  ░░░░░░░░░░░░   0%  ❌ Pendiente (después de Fase 9 y 10)
Fase 9  ████████████ 100%  ✅ Completa — Ganadero TV
Fase 10 ████████████ 100%  ✅ Completa — Mercado Ganadero
```

---

## Fase 1 — Configuración, Registro y Autenticación

**Estado: ✅ Completa**

No hay pendientes. Todos los módulos están implementados y operativos:
- Auth completo (login, refresh, logout, reset password, cambiar password)
- Middleware JWT funcional
- CRUD de asociados con paginación, filtros y validación Zod
- CRUD de fincas
- Seed con datos de prueba reales

---

## Fase 2 — Módulo de Pagos y Control de Estado

**Estado: ⚠️ 75% — Código listo, credenciales pendientes**

### Pendientes

- [x] **Obtener credenciales de Wompi** — configuradas en sandbox el 2026-07-11
  - Las 4 keys de Wompi están en `backend/.env`
  - `WOMPI_SANDBOX=true` — ambiente de pruebas activo
  - Bug corregido: webhook ahora usa `WOMPI_EVENTS_SECRET` (no `WOMPI_INTEGRITY_SECRET`)

### Qué ya está hecho
- ✅ `wompi.service.js` con firma HMAC-SHA256 y verificación de webhook
- ✅ `pagos.controller.js` con `iniciarPago` y `webhook`
- ✅ Cron job diario que actualiza AL_DIA / EN_MORA / INACTIVO
- ✅ Creación automática de aportes PENDIENTE cada mes
- ✅ Notificación push automática cuando el asociado entra en mora
- ✅ Integración Wompi en la app móvil via WebView (`PagoScreen.js`)

---

## Fase 3 — Carné QR Digital y Convenios

**Estado: ✅ Completa**

No hay pendientes. QR firmado con HMAC-SHA256, verificación pública con rate limiting, invalidación automática por mora, CRUD de convenios operativo.

---

## Fase 4 — Panel Web Administrativo

**Estado: ✅ Completa**

No hay pendientes críticos identificados. Dashboard, reportes, asociados, noticias, convenios y precios operativos con datos reales.

---

## Fase 5 — Aplicación Móvil

**Estado: ⚠️ 90% — Dependencia con Wompi**

### Pendientes

- [ ] **Flujo de pago bloqueado hasta tener keys de Wompi** (ver Fase 2)
  - `PagoScreen.js` ya tiene el widget de Wompi implementado con WebView
  - Funcionará automáticamente cuando se configuren las credenciales

### Qué ya está hecho
- ✅ 17 pantallas implementadas con código real
- ✅ Navegación bottom tabs + stacks anidados
- ✅ Auth con persistencia en Expo SecureStore
- ✅ QR del carné con estado dinámico (verde AL_DIA, naranja/rojo EN_MORA)
- ✅ Push notifications con Firebase
- ✅ Modo offline con OfflineBanner
- ✅ Componentes reutilizables (EstadoBadge, AppToast, LoadingSpinner, ErrorMessage)

---

## Fase 6 — Noticias y Notificaciones Push

**Estado: ✅ Completa**

No hay pendientes. CRUD de noticias, Firebase FCM con credenciales reales configuradas, notificaciones automáticas desde cron job, historial de notificaciones por asociado.

---

## Fase 7 — Modo Claro/Oscuro

**Estado: ✅ Completa**

No hay pendientes. ThemeContext implementado en web-admin y app móvil.

---

## Fase 8 — Estadísticas, Pruebas y Despliegue

**Estado: ❌ 0% — No iniciada**

Esta es la fase más grande pendiente. Contiene 4 bloques independientes.

---

### Bloque A — API de Estadísticas del Sector

**Archivos que hay que crear:**
- `backend/src/controllers/estadisticas.controller.js`
- `backend/src/routes/estadisticas.routes.js`
- Registrar la ruta en `backend/src/app.js`

**Endpoints a implementar:**

#### `GET /estadisticas/sector` (público)
Usar MongoDB aggregation pipeline con `$lookup`, `$group`, `$project`:

- [ ] Total de asociados registrados
- [ ] Distribución por estado: AL_DIA / EN_MORA / INACTIVO con porcentajes
- [ ] Total de cabezas de ganado (sum desde colección Finca)
- [ ] Total de hectáreas registradas (sum desde colección Finca)
- [ ] Distribución por tipo de producción: CARNE / LECHE / DOBLE con porcentajes
- [ ] Top 5 veredas con más asociados
- [ ] Cachear resultado por 1 hora con `node-cache`
- [ ] Retornar datos en formato compatible con Recharts

#### `GET /estadisticas/financiero` (requiere auth admin)

- [ ] Recaudo total del mes actual
- [ ] Array de últimos 12 meses: `[{ mes, año, recaudo }]` para gráfica de línea
- [ ] Total adeudado por asociados en mora (sum de aportes PENDIENTE de meses anteriores)

---

### Bloque B — Suite de Pruebas Jest

**Archivos que hay que crear:**
- `backend/tests/setup.js`
- `backend/tests/auth.test.js`
- `backend/tests/asociados.test.js`
- `backend/tests/pagos.test.js`

**Configuración (`backend/package.json`):**
```json
"jest": {
  "testEnvironment": "node",
  "testTimeout": 30000
}
```

**`tests/setup.js`:**
- [ ] Conectar a MongoDB de prueba usando `MONGODB_URI_TEST` del `.env`
- [ ] Limpiar todas las colecciones con `beforeEach`
- [ ] Cerrar conexión con `afterAll`
- [ ] Agregar `MONGODB_URI_TEST=` al `backend/.env.example`

**`tests/auth.test.js`:**
- [ ] `POST /auth/login` con credenciales válidas → retorna `accessToken` y `refreshToken`
- [ ] `POST /auth/login` con password incorrecta → retorna 401
- [ ] `POST /auth/login` con cédula inexistente → retorna 401
- [ ] `GET /asociados` sin token → retorna 401
- [ ] `GET /asociados` con token válido → retorna array con `success: true`

**`tests/asociados.test.js`:**
- [ ] `POST /asociados` crea asociado y retorna sin campo `password`
- [ ] `POST /asociados` con cédula duplicada → retorna 409
- [ ] `GET /asociados/:id` retorna el asociado correcto
- [ ] `PUT /asociados/:id` actualiza nombre y teléfono correctamente

**`tests/pagos.test.js`:**
- [ ] `POST /pagos/iniciar` crea aportes en estado PENDIENTE
- [ ] `POST /qr/verificar` con QR válido retorna `{ valido: true }`
- [ ] `POST /qr/verificar` con QR expirado retorna `{ valido: false }`

**Meta:** cobertura >80% al ejecutar `npm test`

---

### Bloque C — Configuración de Despliegue

#### Railway (backend)

- [ ] Crear archivo `backend/railway.json`:
  ```json
  {
    "deploy": {
      "startCommand": "node src/server.js",
      "healthcheckPath": "/health"
    }
  }
  ```
- [ ] Verificar que `backend/package.json` tiene `"start": "node src/server.js"`
- [ ] Confirmar que el servidor usa `process.env.PORT` correctamente
- [ ] Configurar variables de entorno en el panel de Railway (todas las del `.env`)

#### Vercel (web-admin)

- [ ] Crear archivo `web-admin/vercel.json` para que React Router funcione:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/" }
    ]
  }
  ```
- [ ] Configurar variable de entorno `VITE_API_URL` en Vercel apuntando a Railway
- [ ] Actualizar CORS en el backend para permitir el dominio de Vercel:
  ```
  CORS_ORIGIN=https://asogacentro.vercel.app
  ```

#### Proxy de API en desarrollo

- [ ] Agregar proxy en `web-admin/vite.config.js`:
  ```js
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
  ```

---

### Bloque D — Monitoreo Post-Despliegue

- [ ] Crear cuenta en [UptimeRobot](https://uptimerobot.com)
- [ ] Agregar monitor HTTP para `GET /health` del backend en Railway
- [ ] Configurar alerta por email si el servidor cae
- [ ] Verificar que `GET /health` retorna `{ status: 'ok', timestamp: new Date() }`

---

## Resumen de pendientes por prioridad

### Prioridad alta (bloqueantes)
1. **Credenciales Wompi** — sin esto los pagos no funcionan en ninguna plataforma
2. **API de estadísticas** — necesaria para el dashboard de la Fase 8

### Prioridad media (para deploy)
3. **Suite de tests Jest** — mínimo auth + asociados para poder hacer deploy con confianza
4. **`railway.json`** — necesario para deploy automático en Railway
5. **`vercel.json`** — necesario para que React Router funcione en Vercel

### Prioridad baja (post-deploy)
6. **Proxy Vite** — mejora la experiencia de desarrollo local
7. **UptimeRobot** — monitoreo post-despliegue

---

*Última actualización: 2026-07-11*
*Siguiente revisión: al completar la Fase 8*
