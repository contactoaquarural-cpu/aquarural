# Plan — App del Suscriptor (mobile-app)

> Alcance definido por el usuario: la app se reduce a 5 pantallas. Todo lo demás del código actual (Eventos, Noticias, Ganadero TV, Mercado, Documentos, QR carné) se elimina, no se archiva ni se deja "por si acaso".

## Diagnóstico de partida (confirmado en backend/mobile-app real, no supuesto)

- `mobile-app` fue copiado del proyecto ganadero anterior. Tiene 13 pantallas; solo 5 sobreviven a este plan.
- Login actual (`LoginScreen.js` + `auth.store.js`) llama a `POST /auth/login` con `{cedula, password}` — es el login de **admin**, no de suscriptor. Se descarta por completo.
- Pagos actual (`EstadoFinancieroScreen.js` + `pagos.store.js`) está construido sobre "aportes mensuales" (modelo ganadero de cuota fija). No aplica al modelo real de `Factura` (consumo variable). Se descarta por completo.
- Backend confirmado hoy (grep directo a las rutas, 2026-09-21):
  - `POST /acueductos/publico` → lista acueductos activos (`_id, nombre, municipio, vereda, logoUrl, colorPrimario`), pública, sin auth.
  - `POST /auth/login-asociado` → body `{acueductoId, cedula}`, sin password. Devuelve `{accessToken, refreshToken, user: Asociado}`.
  - `GET /asociados/:id` → obtener datos propios.
  - `GET /asociados/:id/historial-consumo` → lecturas históricas (`periodo, lecturaAnterior, lecturaActual, consumoM3, fechaRegistro`).
  - `GET /facturas` → ya filtra por `asociadoId` cuando `req.user.rol === 'ASOCIADO'` (confirmado en sesión anterior). No requiere `verifyAdmin`.
  - `POST /pagos/iniciar` → body `{facturaId}`, genera checkout Wompi server-side (firma HMAC generada en backend, nunca en el cliente). No requiere `verifyAdmin`.
  - `PATCH /asociados/:id/gps` → ya existe (construido para el fontanero en esta misma sesión), protegido con `verifyFontanero` — **hoy NO permite rol ASOCIADO**, hay que ampliarlo o crear uno propio (ver Fase 3).
  - No existe generación de PDF en ningún lugar del backend (`grep -rl "pdf"` sin resultados, sin librería en `package.json`). Hay que construirlo desde cero.

## Estructura final de la app (5 tabs, post-login)

1. **Inicio** — estado de cuenta actual (al día / en mora, deuda total si aplica, último consumo).
2. **Pagar** — factura por factura, checkout Wompi (ya validado en sesión anterior como el flujo correcto, no "pagar varios meses juntos").
3. **Ubicación** — ver y capturar/actualizar el GPS del predio, mismo patrón que ya se construyó para el fontanero (`navigator.geolocation`, guardado inmediato).
4. **Facturas** — historial completo + descarga de PDF de las facturas pagadas.
5. **Perfil** — datos del suscriptor, cerrar sesión.

---

## Fase 0 — Limpieza (antes de construir nada nuevo)

Eliminar del `mobile-app`, sin dejar código muerto:
- `src/screens/eventos/` completo
- `src/screens/perfil/MisDocumentosScreen.js`
- `src/screens/qr/` completo
- `src/screens/notificaciones/` completo (se reevalúa como tarea aparte, fuera de este plan)
- `src/store/pagos.store.js` (se reescribe desde cero en Fase 2, no se repara)
- Referencias rotas en `MainNavigator.js`/`AuthNavigator.js` a las pantallas eliminadas
- `src/services/notifications.service.js` — se borra por completo (llama a un endpoint `fcm-token` que no existe; Notificaciones no está en el alcance de este plan, dejarlo sin uso es el mismo ruido que el resto del código eliminado)

## Fase 1 — Login (selector de acueducto → cédula, una sola pantalla en 2 pasos)

**Una sola pantalla, dos pasos:**
- Paso 1: selector de acueducto arriba (`GET /acueductos/publico` al montar, tarjetas con logo + nombre + municipio de cada acueducto activo).
- Paso 2: al elegir un acueducto, se habilita debajo el campo de cédula (sin password — el modelo real no lo usa para suscriptores). El selector de acueducto sigue visible/editable por si se equivocó, no navega a otra pantalla.
- `POST /auth/login-asociado` con `{acueductoId, cedula}`.
- Guarda `accessToken`/`refreshToken` en `expo-secure-store` (patrón ya usado en el proyecto) y navega a Inicio.
- Manejo de error 404 ("No estás registrado en este acueducto") con mensaje claro, sin perder la selección de acueducto.

**Archivos:**
- Reescribir `src/screens/auth/LoginScreen.js` como flujo de 2 pasos en la misma pantalla.
- Reescribir `src/store/auth.store.js` → método `login(acueductoId, cedula)` contra el endpoint correcto.
- `src/screens/auth/ForgotPasswordScreen.js` se elimina (no aplica, no hay password).

## Fase 2 — Pagar (factura por factura)

- Pantalla lista las facturas con `estado !== 'PAGADA'` (`GET /facturas`).
- Al seleccionar una factura → `POST /pagos/iniciar` con `{facturaId}` → recibe `wompiUrl` → abre WebView (patrón `buildCheckoutHtml` ya existe en el código viejo, se puede adaptar) o el navegador externo.
- Tras confirmar pago (o volver del WebView), refresca el estado de la factura.

**Archivos:**
- Reescribir `src/screens/pagos/EstadoFinancieroScreen.js` (o renombrar a `PagarScreen.js`, ya que el alcance cambió de "estado financiero" a "pagar").
- Reescribir `src/store/pagos.store.js` → `cargarFacturasPendientes()`, `iniciarPago(facturaId)`.
- `src/screens/pagos/PagoScreen.js` (WebView de checkout) se revisa y se adapta al nuevo store — probablemente se mantiene con cambios menores.
- `src/screens/pagos/HistorialPagosScreen.js` se fusiona con la pantalla de Facturas (Fase 4), no queda como pantalla separada.

## Fase 3 — Ubicación / GPS

- Backend: decidir entre (a) ampliar `verifyFontanero` en la ruta `PATCH /asociados/:id/gps` para incluir `ASOCIADO` solo cuando `req.user._id === req.params.id`, o (b) crear una ruta separada `PATCH /asociados/:id/gps-propio` con esa restricción explícita. **Recomendado: (b)**, para no mezclar permisos de fontanero (edita cualquier asociado de su acueducto) con permisos de suscriptor (edita solo su propio registro) en el mismo endpoint.
- Frontend: pantalla que muestra el GPS actual (si existe) en un mapa simple, con botón "Actualizar mi ubicación" que usa `navigator.geolocation`/`expo-location` y guarda de inmediato — mismo patrón UX ya construido y probado para el fontanero en `LecturasPage.jsx` (web-admin).

**Archivos:**
- Reescribir `src/screens/perfil/UbicacionFincaScreen.js` → renombrar (el nombre "Finca" es residuo ganadero) a `UbicacionScreen.js`, quitar el GPS simulado (`setTimeout` con coordenadas fijas) y conectar a GPS real del dispositivo + backend real.
- Backend: nueva ruta + controller + validator para guardado propio de GPS.

## Fase 4 — Facturas (historial + descarga PDF)

- Backend: nuevo endpoint de generación de PDF por factura (ej. `GET /facturas/:id/pdf`), usando una librería tipo `pdfkit` (ligera, ya el proyecto usa patrones similares con `qrcode`/`xlsx` para generación de archivos). Contenido: datos del acueducto, del suscriptor, periodo, desglose (cargo fijo, consumo, mora si aplica), total, estado de pago.
- Frontend: lista completa de facturas (`GET /facturas`, sin filtrar por estado), cada una con su estado visual (Pagada/Pendiente/Vencida) y botón de descarga solo en las pagadas (usar `expo-file-system` + `expo-sharing`, patrón estándar en Expo para guardar/compartir un PDF descargado).

**Archivos:**
- Backend: nuevo `pdf.service.js` o similar, nueva ruta en `facturas.routes.js`.
- Frontend: pantalla nueva `FacturasScreen.js` (reemplaza y fusiona `HistorialPagosScreen.js`).

## Fase 5 — Perfil

- Datos propios (nombre, cédula, matrícula, teléfono, correo, dirección) — solo lectura o edición limitada (a decidir: probablemente solo teléfono/correo editables, cédula/matrícula no).
- Botón de cerrar sesión.

**Archivos:**
- Revisar `src/screens/perfil/PerfilScreen.js` y `EditarPerfilScreen.js` existentes — probablemente se mantienen con ajustes menores (quitar cualquier campo/texto residual ganadero si lo hay).

---

## Orden de ejecución sugerido

1. Fase 0 (limpieza) — para trabajar sobre una base sin ruido.
2. Fase 1 (login) — bloqueante, nada más funciona sin sesión real.
3. Fase 2 (pagar) — el objetivo central del proyecto según el usuario ("el objetivo es que los suscriptores paguen por la app").
4. Fase 4 (facturas + PDF) — depende del mismo modelo de Factura ya usado en Fase 2, tiene sentido hacerlo justo después.
5. Fase 3 (GPS) — independiente, se puede hacer en cualquier momento tras el login.
6. Fase 5 (perfil) — la de menor riesgo, se deja al final.

## Fuera de alcance de este plan (explícitamente descartado por el usuario)

- Eventos y Convocatorias del suscriptor
- Notificaciones push del suscriptor
- Noticias / Ganadero TV / Mercado (contaminación del proyecto ganadero — no existen en el dominio de agua)
- QR de carné digital
- Documentos (certificados, etc.)
