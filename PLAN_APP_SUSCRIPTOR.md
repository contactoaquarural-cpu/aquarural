# Plan — App del Suscriptor (mobile-app)

> Estado: **todas las fases originales completadas y probadas end-to-end**, más una ampliación de alcance (Eventos y Notificaciones) que el usuario pidió después de terminar las 5 pantallas iniciales. Este documento ya no es un plan a futuro — es el registro de lo construido, con lo pendiente real al final.

## Alcance final (más amplio que el original)

La app quedó con **7 superficies**, no 5: las 5 pantallas de tabs originales, más 2 pantallas apiladas (Eventos y Notificaciones) accesibles desde íconos en el header de Inicio.

## Estructura de la app

### Barra de navegación inferior (flotante, con Pagar como botón central elevado)
1. **Inicio** — hero de deuda actual/al-día con botón "Pagar ahora" integrado, fecha límite de la próxima factura, fila de datos de apoyo (consumo del mes, estado del servicio, matrícula), última factura. Header con 2 íconos: Eventos (calendario) y Notificaciones (campana).
2. **Ubicación** — ver GPS actual del predio + botón "Actualizar mi ubicación" (`expo-location`, guardado inmediato).
3. **Pagar** (botón central elevado) — lista de facturas pendientes/vencidas → checkout Wompi real en WebView modal.
4. **Facturas** — historial completo + botón "Descargar factura/recibo" en PDF.
5. **Perfil** — datos del suscriptor con edición in-line de teléfono/correo/dirección, modal propio de confirmación para cerrar sesión.

### Pantallas apiladas (fuera de la barra de tabs)
6. **Eventos y Convocatorias** — lista de eventos del acueducto (tipo, fecha, hora, lugar, descripción) con botones "Sí, asistiré" / "No podré" cuando el evento está `PROGRAMADO`.
7. **Notificaciones** — bandeja con historial de avisos (pago confirmado, factura vencida, entrada en mora, nueva convocatoria), no-leídas resaltadas, marcar leída individual o todas.

## Backend construido para soportar todo esto

- `POST /acueductos/publico`, `POST /auth/login-asociado` — login real por acueducto + cédula.
- `GET /facturas`, `POST /pagos/iniciar` — ya filtrados/restringidos a "solo mis propios datos" para rol ASOCIADO.
- `PATCH /asociados/:id/gps-propio` — ruta separada de la de fontanero, restringida a "solo mi propio registro".
- `PATCH /asociados/:id/perfil-propio` — solo acepta teléfono/correo/dirección (nunca cédula, nombres, matrícula, vereda, medidor).
- `GET /facturas/:id/pdf` — genera el recibo/factura en PDF real (`pdfkit`), mismo contenido que el ticket POS de web-admin.
- `GET /eventos/mis-eventos`, `POST /eventos/:id/confirmar` — RSVP del propio suscriptor, sin exponer las respuestas de otros.
- `PATCH /asociados/:id/token-fcm` — registra el token push nativo (FCM) del dispositivo.
- Modelo `Notificacion` + servicio `crearNotificacion` (persiste + envía push) — enganchado en: pago confirmado (efectivo y Wompi), factura vencida (cron diario), entrada a mora (solo al cambiar de estado), nueva convocatoria.
- Webhook de Wompi (`POST /facturas/webhook-wompi`) — probado end-to-end en desarrollo usando un túnel ngrok apuntando al backend local, ya que Wompi necesita una URL pública para confirmar pagos.

## Decisiones y hallazgos reales de esta implementación

- **`mobile-app` fue reconstruido desde cero** (proyecto Expo nuevo), no reparado — el código viejo venía de un proyecto ganadero copiado y tenía contaminación estructural real (login de admin en vez de suscriptor, modelo de pagos de "aportes mensuales" en vez de facturas por consumo), no solo textos sueltos.
- **Sistema de diseño**: `DESIGN.md` (raíz del monorepo) fue reescrito durante esta sesión para reflejar el sistema real (claro, azul de marca `#1D4ED8`, Outfit + Inter, Material Icons) — el documento anterior describía un sistema "Hydro-Tech" oscuro que nunca se implementó en ninguna página activa del proyecto.
- **El webhook de Wompi no puede confirmar pagos contra un backend en `localhost`** sin un túnel público (ngrok) — limitación real del entorno de desarrollo, no un bug. En producción (backend con URL pública) el webhook llega directo.
- **La IP local del backend cambia con el DHCP del router** — `mobile-app/src/services/api.service.js` tiene la IP hardcodeada (`BASE_URL`) y hay que actualizarla manualmente cada vez que cambia; no se automatizó.
- Cada vez que se agrega un módulo nativo nuevo (`expo-location`, `expo-sharing`, `expo-notifications`, `expo-device`, `react-native-webview`) se requiere un nuevo build de desarrollo vía `eas-cli build --profile development --platform android` — el hot-reload de Metro no basta para módulos nativos.

## Resuelto (2026-09-23)

- Build EAS con `expo-notifications`/`expo-device` instalado. Eventos (RSVP + tabla de asistentes en admin) y Notificaciones (push + bandeja + badges de contador en Inicio) probados end-to-end en dispositivo real.
- **IP hardcodeada de desarrollo** — reemplazada por una URL fija de ngrok (`BASE_URL` en `mobile-app/src/services/api.service.js`) apuntando al backend local. Ya no depende de la IP de red local, así que funciona sin importar si el celular está en la Wi-Fi de casa, un hotspot, u otra red — siempre que el túnel `ngrok http 3000` esté corriendo en la máquina de desarrollo.

## Pendiente real

1. **`BASE_URL` apunta a un túnel ngrok de desarrollo, no a producción** — `mobile-app/src/services/api.service.js` usa la URL fija de ngrok de esta máquina, válida solo para pruebas mientras el desarrollador la tenga corriendo. Antes de distribuir la app a un suscriptor real, `BASE_URL` debe apuntar al backend desplegado en un servidor real (Railway u otro, según `CLAUDE.md`), no a un túnel de desarrollo.
2. **No existe ningún build de producción todavía** — todos los builds generados hasta ahora son `--profile development` (requieren Metro corriendo, no sirven para publicar ni repartir libremente). Falta correr `eas-cli build --profile production --platform android` (y su equivalente iOS) cuando el backend esté desplegado y `BASE_URL` corregida.
3. **Nunca se probó en iOS** — todo el desarrollo y las pruebas fueron en Android; falta validar la app en un dispositivo/simulador iOS antes de considerarla lista para ambas plataformas.

**Decisión (2026-09-30):** el splash screen actual (corte diagonal blanco/azul con el wordmark "AquaRural") se mantiene sin cambios — el usuario decidió no invertir más trabajo en rediseñarlo.
