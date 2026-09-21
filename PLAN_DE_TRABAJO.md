# Plan de Trabajo — AquaRural Pro

> Lista viva de mejoras identificadas para ir implementando de a poco. Cada ítem incluye el porqué y el contexto necesario para retomarlo sin tener que re-investigar desde cero.
>
> **Estructura:** todo lo **pendiente** va arriba; todo lo **completado** va abajo, como bitácora. Cuando un ítem se termina, se mueve de la sección Pendiente a la sección Completado (no se borra, para conservar el porqué y el detalle de lo que se hizo).

**Leyenda:** 🔴 Crítico — 🟠 Importante — 🟡 Mejora / limpieza

---

# 🔲 PENDIENTE

## Notificaciones Push (Firebase Cloud Messaging)

### 🟠 Pendiente en `mobile-app` — registrar token FCM y construir pantalla de Eventos
El proyecto de Firebase ya existe y el backend ya envía push al crear un Evento (ver Completado). Lo que falta es 100% del lado de `mobile-app`, y cae bajo su revisión general "al final de todo" (ver esa sección más abajo):
- `mobile-app` debe registrar el token FCM del dispositivo al iniciar sesión (`login-asociado`) y enviarlo al backend para guardarlo en el nuevo campo `tokenFCM` de `Asociado` (ya existe en el modelo, solo falta quién lo llene).
- Construir la pantalla de Eventos en `mobile-app` conectada a `GET /eventos`, para que el suscriptor vea el detalle completo de la convocatoria además de recibir el push.

## Bugs / mejoras menores aún abiertos

### 🔴 Falta el login de suscriptores (app móvil) — no es un bug del Login de `web-admin`
**Importante — no confundir los dos logins del sistema:**
- El Login de `web-admin/src/pages/Login/LoginPage.jsx` es **exclusivamente para SuperAdmin y Administradores de acueducto** (junta/tesorero/fontanero). Entra por correo + contraseña contra `POST /auth/login`. Esto funciona correctamente y no debe tocarse para "aceptar cédulas" — los suscriptores del acueducto **nunca inician sesión en `web-admin`**, ese panel no es para ellos.
- Los **suscriptores** (usuarios finales del acueducto) inician sesión en la **app móvil** (`mobile-app`), con un flujo distinto y más simple, pensado para gente con poca familiaridad tecnológica:
  1. Al abrir la app, se muestra una **lista de acueductos afiliados** (aquí es donde `GET /acueductos/publico` deja de ser código muerto — es exactamente el endpoint que alimentaría esa lista).
  2. El suscriptor elige su acueducto de la lista → resuelve el `acueductoId` sin que el usuario tenga que saberlo o escribirlo.
  3. Solo digita su **cédula**, sin contraseña → entra, vía `POST /auth/login-asociado` (`{acueductoId, cedula}`).

**Estado actual:** el backend ya tiene la ruta lista (`POST /auth/login-asociado`), pero **ninguna pantalla la usa todavía** — ni en `web-admin` (que no debería, no es su rol) ni en `mobile-app` (que sí debería, pero falta construirla).

**Pendiente:** revisar el estado actual de `mobile-app` para saber si esta pantalla de selector de acueducto + login por cédula ya existe a medias o hay que crearla desde cero, conectando `GET /acueductos/publico` + `POST /auth/login-asociado`.

### 🟡 `estadoServicio` sin pantalla que lo use
`actualizarAsociadoSchema` acepta `estadoServicio` (`ACTIVO`/`SUSPENDIDO`/`CORTE_PROGRAMADO`), pero ninguna pantalla de `web-admin` lo usa — no hay forma de suspender el servicio de un suscriptor puntual desde la UI hoy. No es urgente.

### 🟡 Código muerto / endpoints sin UI que los invoque
- `POST /pagos/iniciar` y `GET /acueductos/publico` — nadie los llama desde ningún frontend. Se conectan cuando se trabaje el login/pagos de la app móvil del suscriptor (ver ítem de login de suscriptores arriba).

---

## App Móvil / Portal del Suscriptor (revisar al final, cuando SuperAdmin y Admin/web-admin estén completos)
**Contexto:** sección dedicada para agrupar todo lo pendiente específico de `mobile-app` — login de suscriptores, limpieza de rastros del proyecto anterior, y funcionalidades que hoy no funcionan (Noticias, QR) o que se identificaron como necesarias en conversaciones con el usuario (aviso de lectura pendiente). Se agrupa aquí en vez de dispersarse por el resto del plan porque todo cae bajo el mismo bloque de trabajo futuro.

### 🔴 Noticias no funciona
Reportado por el usuario como no funcional en `mobile-app`. Pendiente de diagnosticar la causa raíz (¿pantalla no conectada al endpoint? ¿endpoint no existe para AquaRural? ¿error de red/parsing?) cuando se retome el bloque de mobile-app.

### 🔴 Carné QR no funciona
Reportado por el usuario como no funcional en `mobile-app`. El módulo "Carné QR Digital" (firmado HMAC-SHA256, TTL 30 días) está listado como completado a nivel backend en el CLAUDE.md del proyecto raíz, pero el consumo desde `mobile-app` no está funcionando. Pendiente de diagnosticar cuando se retome el bloque de mobile-app — probablemente relacionado con `src/screens/qr/MiPredioScreen.js`, que además tiene el hardcode de nombre heredado del proyecto ganadero anterior (ver hallazgo #3 más abajo).

### 🟠 Avisar al suscriptor cuando su predio queda sin lectura del mes (clima, orden público, etc.)
**Contexto:** si el fontanero no logra llegar a un predio en el ciclo del mes (por clima, orden público, u otra causa de fuerza mayor), el sistema de facturación ya maneja esto correctamente a nivel de datos — no se genera factura ese mes para ese predio (`resultado.sinLectura` en `facturacion.service.js`), y el consumo se acumula automáticamente para la siguiente lectura real (el suscriptor paga por todo el consumo real acumulado, no se pierde ni se inventa). Ver detalle técnico completo en Completado, sección "Facturación segura ante lecturas pendientes".

**Lo que falta:** hoy el suscriptor no tiene ninguna forma de enterarse de que no se le tomó lectura este mes ni de que la próxima factura puede venir más alta por consumo acumulado de varios meses. El usuario pidió evaluar 3 canales, y decidió que los 3 son válidos y deben quedar documentados aquí para implementarlos cuando se retome mobile-app:
1. **Mensaje visible en el portal/consulta de deuda** (recomendado como primera línea de defensa): cuando el suscriptor consulte su estado en la app, si su predio quedó sin lectura del ciclo vigente, mostrar un aviso explícito tipo "Este mes no se tomó lectura de tu medidor. La próxima factura puede incluir el consumo acumulado de varios meses." No depende de tener push configurado ni de que el suscriptor abra la app justo ese día — se muestra la próxima vez que consulte, cuando sea.
2. **Notificación Push (Firebase)**: enviar push a los predios sin lectura al cerrar el ciclo (ej. desde un cron o al correr la facturación masiva y detectar `sinLectura` > 0). Depende de que el login de suscriptores y el registro de `tokenFCM` en mobile-app ya estén funcionando (ver ítems de login de suscriptores y FCM más abajo) — no se puede implementar antes que eso.
3. **Nota impresa en el próximo recibo**: cuando finalmente se facture el consumo acumulado, el ticket/factura debe incluir una línea aclaratoria tipo "Incluye consumo de N meses sin lectura por [motivo]". Llega después del hecho pero deja constancia física/legal del porqué del monto más alto — útil para que el fontanero/administración no tengan que explicarlo de palabra en cada reclamo. Requiere guardar en el modelo cuántos meses/motivo cubre esa lectura acumulada (hoy no se registra explícitamente, solo se infiere de la diferencia de fechas).

### 🟠 Notificar por push a suscriptores sin GPS registrado, desde `/mapa`
**Contexto:** en `MapaPage.jsx` (web-admin), se agregó una sección "Sin Ubicación (N)" que lista a los suscriptores que aún no tienen `latitud`/`longitud` guardadas — dato que hoy solo se capturaría desde la app del suscriptor (aún sin construir). El usuario pidió poder notificarlos por push directamente desde esa pantalla para pedirles que actualicen su ubicación.

**Estado actual:** la sección y la lista ya están construidas y funcionando (`web-admin/src/pages/Mapa/MapaPage.jsx`), con un botón "Notificar" por suscriptor y uno "Notificar a Todos" — pero ambos están **deshabilitados a propósito**, con un `title` explicando por qué. No se conectó el envío real porque depende de piezas que aún no existen:
1. El **login de suscriptores por cédula** en `mobile-app` debe existir primero (ver ítem 🔴 más abajo, "Falta el login de suscriptores").
2. El suscriptor debe iniciar sesión al menos una vez para que la app registre su `tokenFCM` en el backend (campo ya existe en `Asociado.js`, pero nadie lo llena hoy).
3. Recién ahí un botón de "Notificar" real tendría a quién enviarle el push — antes de eso, sería un botón que aparenta funcionar pero no le llega a nadie (mismo tipo de bug de "UI que miente" ya corregido varias veces en este proyecto: carga Excel a localStorage, botones de exportar sin acción, etc.).

**Pendiente para cuando el login de suscriptores y el `tokenFCM` ya funcionen:**
- Backend: nuevo endpoint (ej. `POST /asociados/:id/notificar-gps` y una variante masiva) que envíe un push vía Firebase Admin SDK con un mensaje tipo "Actualiza la ubicación de tu predio en la app" — reutilizando el mismo servicio de Firebase ya usado para el push de Eventos (ver Completado).
- Frontend: conectar los 2 botones ya existentes en `MapaPage.jsx` (individual y masivo) a ese endpoint, quitando el `disabled` y el `title` explicativo.

### 🟡 Rastros textuales del proyecto ganadero anterior — limpiar, no reescribir todo
**Contexto:** `mobile-app` se reutilizó como base de un proyecto anterior de gestión ganadera. Se auditó con grep (`ganad|bovino|hato|vacun|res\b|finca ganadera|ASOGACENTRO`, case-insensitive) sobre `mobile-app/src` completo (29 archivos). Resultado: la arquitectura (navegación, stores de Zustand, servicio API, sistema de theming) ya está bien migrada y es reutilizable — **no se justifica borrar la carpeta**. Solo 3 archivos tienen contaminación real, el resto de coincidencias del grep fueron falsos positivos (variables como `notifRes`/`eventosRes`, o la palabra "res" dentro de "valores"/"recursos").

**Hallazgos reales a corregir cuando se retome mobile-app:**
1. `src/screens/perfil/MisDocumentosScreen.js` — tiene un tipo de documento completo de dominio ganadero, no un simple texto suelto:
   ```js
   tipo: 'VACUNACION', label: 'Certificado de Vacunación', desc: 'Certificado de vacunación del hato ganadero'
   ...
   label: 'Registro Ganadero ICA'
   ```
   No aplica a un acueducto veredal. Hay que reemplazar estos tipos de documento por los relevantes a un suscriptor de agua (ej. escritura del predio, certificado de conexión, paz y salvo) o eliminar la sección si "Mis Documentos" no es parte del alcance de AquaRural.
2. `src/screens/notificaciones/NotificacionesScreen.js` — tiene un tipo de notificación entero heredado:
   ```js
   GANADERO_TV: { icon: '📺', color: '#a78bfa' },
   ```
   "Ganadero TV" no existe como concepto en AquaRural. Eliminar esta entrada (y verificar que ningún otro lado del código dependa de ese tipo).
3. `src/screens/home/HomeScreen.js`, `src/screens/qr/MiPredioScreen.js`, `src/screens/perfil/PerfilScreen.js` — mismo patrón repetido de nombre de ejemplo hardcodeado del cliente ganadero anterior:
   ```js
   const nombre = user?.nombres || user?.nombre || 'José Donaldo Gómez';
   ```
   Cosmético (solo se ve si no hay usuario autenticado), pero da mala imagen en demo. Cambiar el fallback a algo genérico ("Suscriptor") o quitarlo si nunca debería renderizarse sin sesión.

**No requieren cambios:** `auth.store.js`, `config.store.js`, `PagoScreen.js` (coincidencias del grep eran falsos positivos, solo nombres de variable o comentarios genéricos).

**Cuándo abordarlo:** junto con el resto del trabajo pendiente de `mobile-app` (login de suscriptores por cédula, ver ítem arriba, y la pantalla de Eventos conectada a `GET /eventos`) — no antes, según lo acordado.

---

# ✅ COMPLETADO

## Migración visual del panel Admin a tema claro + #1D4ED8 — ✅ COMPLETA
**Contexto:** el panel Admin de acueducto tenía dos identidades visuales en paralelo: el shell (Sidebar/TopBar) en tema claro + azul `#1D4ED8` (igual a SuperAdmin y la landing), y todo el contenido en un tema oscuro "Hydro-Tech" con cian como acento, con varias páginas además arrastrando una capa `dark:` residual de una migración anterior a medio hacer. Se decidió que el azul `#1D4ED8` claro es la identidad real del producto, y se migró el contenido página por página, revisando y corrigiendo bugs funcionales encontrados en el camino (no fue un cambio solo de color).

**Todas las páginas migradas** (detalle completo de cada una en las entradas siguientes de esta sección): Dashboard, Suscriptores (`/asociados`), Lecturas (`/lecturas`), Facturación (`/facturacion`), FontaneroDashboard (`/mi-ruta`), Licencia (`/licencia`), Mapa (`/mapa`, incluida la página nueva `/mapa/sin-ubicacion`), Eventos (`/eventos`), Reportes (`/reportes`), Configuración (`/configuracion`), Mi Cuenta (`/mi-cuenta`, página nueva), Pagos Wompi (`/pagos-wompi`), Equipo (`/equipo`), Expediente (`/asociados/:id`).

**Patrón técnico validado a lo largo de esta migración (referencia para cualquier página nueva que se agregue al panel):**
- Tabla: `bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden`, header interno con contador (`px-6 py-5 border-b border-gray-100`), filas con `border-t border-gray-50` (no `divide-y`), colores `gray-*` (no `slate-*`) dentro de la tabla.
- Última columna de acciones: usar `<colgroup>` con `<col className="w-px" />` en la columna final — un `width`/`w-px` puesto directo en `<th>`/`<td>` se ignora en tablas `border-collapse` con `table-layout` automático, dejando que esa columna absorba el espacio sobrante. Alinear el header y las celdas de esa columna a la izquierda (`text-left`), no a la derecha ni centrado, para que arranque justo donde arranca el primer ícono.
- Botones de acción en tablas: todos del mismo tamaño/forma (solo ícono, sin fondo propio en unos sí y otros no) para no descuadrar visualmente el ancho del grupo respecto al header.
- Alineación de columnas: texto a la izquierda, números (montos, cantidades, fechas) también a la izquierda por consistencia con el resto de la tabla — no centrado.
- Reducir `font-mono` a solo cifras/identificadores cortos que se comparan entre sí (matrícula, cédula, lecturas, montos) — no en texto libre (nombres, direcciones).
- Cuando un formulario/tabla tenga muchos datos apilados en una sola celda, preferir separarlos en columnas propias si el usuario lo pide (validado con el fontanero: prefiere una columna por dato aunque la tabla se vuelva más ancha y requiera scroll horizontal, antes que celdas con múltiples líneas de texto).
- Botones destructivos (anular, eliminar) en una barra de acciones: separarlos con espacio/línea divisoria del botón principal, nunca uno al lado del otro sin separación, para reducir el riesgo de clic equivocado.
- Los modales de impresión térmica (ticket individual y lote masivo en Facturación) se dejan siempre en blanco/negro fijo — no deben seguir el tema del panel, son para imprimir en papel.
- Íconos: Material Symbols Outlined en todo el panel, nunca emojis Unicode como ícono funcional (solo texto plano cuando el ícono no puede insertarse, ej. `<option>` de un `<select>` nativo).
- Una tabla no debe forzar `w-full` si su contenido real es corto — usar `w-auto` para que se ajuste a su contenido en vez de estirarse a ocupar toda la columna del grid que la contiene; tampoco usar `h-full` en la tarjeta contenedora si eso la fuerza a igualar la altura de una columna vecina con más contenido.

### ✅ Alineación "Acciones" en tablas de SuperAdmin y Suscriptores + fondo global del layout (hecho 2026-09-19)
Antes de la migración por página, se corrigieron 2 problemas transversales que afectaban a todas las tablas:
- **Bug de fondo:** `MainLayout.jsx` usaba `bg-background text-on-surface` (tokens de Tailwind resueltos a `#090D16`, azul casi negro, del tema oscuro original del proyecto) como contenedor raíz de todo el panel Admin — se veía como un tinte oscuro en los bordes de cualquier página migrada a claro. Cambiado a `bg-gray-50` fijo.
- **Bug de alineación "Acciones":** en tablas `border-collapse` con `table-layout` automático, un `width`/`w-px` puesto directo en el `<th>`/`<td>` de la última columna se ignora — el navegador redistribuye el espacio sobrante hacia esa columna igual. Solución real: usar `<colgroup><col className="w-px" /></colgroup>` en la última columna. Además, el header debe ir `text-left` (no `text-right` ni centrado) para que la palabra "Acciones" arranque exactamente donde arranca el primer ícono del grupo, y todos los botones de una fila de acciones deben ser del mismo tamaño/forma (ej. en `AcueductosPage.jsx` un botón tenía fondo+borde propio y descuadraba visualmente el grupo). Aplicado en `SuperAdmin/AcueductosPage.jsx` y `Suscriptores/SuscriptoresPage.jsx`.

### ✅ DashboardPage.jsx migrado a claro + #1D4ED8, con 2 bugs encontrados y corregidos (hecho 2026-09-19)
- Quitada toda la capa `dark:` (64 apariciones), migrado a `bg-white`/`bg-gray-50` + acento `#1D4ED8`.
- **Bug encontrado:** la tabla "Transacciones & Facturación Reciente" siempre aparecía vacía. Causa: `resF.data.facturas || resF.data.data || []` no correspondía a la forma real de la respuesta del backend (`{success, data: {facturas, total, page, limit}}`) — las facturas están en `resF.data.data.facturas`, no en `resF.data.facturas`. Corregido a `resF.data.data?.facturas || []`.
- Ajustes de contenido pedidos: título "Dashboard General" cambiado a un saludo ("Hola, {nombreAcueducto}"); el banner de Licencia SaaS ahora solo se muestra cuando está vencida (`estaLicenciaVencida`), no siempre — cuando está al día no aparece nada en el Dashboard, evitando competir con las métricas del día a día.
- **Nota de seguridad sin resolver, no tocada en esta pasada:** `handleIniciarPagoWompiSaaS` genera la firma de checkout Wompi en el cliente con una llave privada de integridad hardcodeada en el frontend (`test_integrity_...`). Esto contradice el flujo real ya construido (`POST /superadmin/pago-saas/iniciar`, que genera la firma en el backend). Debería usarse ese endpoint en vez de firmar en el cliente — pendiente de decidir si se corrige.
- **Bug encontrado y corregido (2026-09-19):** la columna "Método" de la tabla de transacciones recientes comparaba `f.metodoPago === 'WOMPI_PSE'`, un valor que nunca existió — el modelo real (`Factura.js`) guarda `'WOMPI'` (confirmado en la factura de Juan pagada el día anterior, que aparecía sin método de pago en vez de mostrar "Wompi"). Corregido a `f.metodoPago === 'WOMPI'`. Verificado que no había más ocurrencias de `WOMPI_PSE` en el resto del código migrado (`FacturacionPage.jsx` ya usaba el valor correcto). De paso se reemplazaron los emojis (💰💳) de esa celda por Material Symbols reales (`payments`/`credit_card`), consistentes con el resto del panel ya migrado.
- **Segundo bug encontrado, mismo patrón (2026-09-19):** la columna "Suscriptor" de esa misma tabla siempre aparecía vacía — usaba `f.suscriptor || f.suscriptorId?.nombres`, pero el backend (`facturas.controller.js`, con `.populate('asociadoId', ...)`) devuelve el campo poblado como `asociadoId`, no `suscriptor` ni `suscriptorId`. Corregido a `f.asociadoId?.nombres} {f.asociadoId?.apellidos`.

### ✅ TopBar.jsx simplificado (hecho 2026-09-19)
- Quitados 2 elementos redundantes que llevaban a `/licencia` (un ícono suelto + una badge, uno al lado del otro) — el acceso a Licencia ya vive en el sidebar.
- Quitado el buscador global decorativo (sin `onChange`/`onSubmit`, nunca estuvo conectado a nada) — cada página que necesita buscar ya tiene su propio buscador contextual funcional (Suscriptores, Facturación, Lecturas).
- Agregada una badge de estado de licencia real (discreta si `AL_DIA`, ámbar si quedan ≤7 días, roja si venció), calculada con `fechaFinCicloVigente` del backend — mismo campo correcto usado para el fix del badge de SuperAdmin, nunca `fechaVencimientoGratis` a mano.
- Limpieza de imports/variables sin uso (`useState`, `useNavigate`, `useConfigStore` parcialmente) resultantes de estos cambios.

### ✅ SuscriptoresPage.jsx (`/asociados`) migrado + 3 bugs funcionales corregidos, no solo visual (hecho 2026-09-19)
Se decidió explícitamente arreglar también la lógica de datos de esta página, no solo el color:
- **Bug:** crear/editar/eliminar suscriptor usaba `localStorage` como fuente de verdad "optimista", con el backend real como afterthought silencioso (`.catch(() => {})`) — si el backend fallaba, la UI igual mostraba éxito. Reescrito para que el backend sea la única fuente de verdad, recargando la lista tras cada operación confirmada y mostrando el error real si falla.
- **Bug:** la carga masiva "Excel" parseaba CSV en el navegador y solo grababa en `localStorage`, nunca llamaba al endpoint real `POST /asociados/cargar-excel`. Reescrito para subir el archivo real vía `FormData`.
- **Bug:** el backend (`upload.middleware.js`) rechaza explícitamente cualquier archivo que no sea `.xlsx`/`.xls` — la plantilla descargable ofrecía un `.csv`, que nunca hubiera podido volver a subirse. Se instaló la librería `xlsx` en `web-admin` (ya usada en el backend) para generar la plantilla como `.xlsx` real; probado de punta a punta (2 creados, 0 errores) con un archivo generado por el mismo código del botón.
- Tabla migrada al patrón SuperAdmin (columnas separadas: Matrícula, Suscriptor, Cédula, Vereda, Medidor, GPS, Estado, Acciones — a pedido explícito, no agrupadas en una sola celda).
- El modal de crear/editar se mantiene como modal (no página completa) — evaluado explícitamente contra el patrón de `EditarAcueductoPage.jsx`; el formulario es corto y no amerita el peso de una página propia.

### ✅ Matrícula consecutiva generada por el backend, no contada en el frontend (hecho 2026-09-19)
**Problema:** el frontend calculaba la "siguiente" matrícula con `ACU-${suscriptores.length + 101}` — frágil, porque contar filas visibles se desincroniza en cuanto se filtra la tabla o se elimina un suscriptor de en medio (puede repetir o saltar números).

**Solución:** el backend ahora genera el consecutivo real, formato `MAT-####` (4 dígitos, ej. `MAT-0001`), calculado buscando el máximo existente con ese patrón exacto — no cuenta el total de registros, así que borrar un suscriptor de en medio nunca hace que se repita un número ya usado.
- `backend/src/controllers/asociados.controller.js` — nueva función `generarSiguienteMatricula(acueductoId)`; usada en `crear` (con reintento simple si dos altas concurrentes calculan el mismo consecutivo — el índice único `{acueductoId, matricula}` lo detecta como error 11000) y en `cargarExcel` (ya no exige `matricula` en la fila del Excel, solo `cedula` y `nombres`).
- `backend/src/validators/asociados.validator.js` — `matricula` pasó de requerida a opcional en `crearAsociadoSchema`.
- `web-admin/src/pages/Suscriptores/SuscriptoresPage.jsx` — el campo Matrícula del formulario de creación queda deshabilitado con placeholder "Automática (MAT-####)"; solo se envía en el payload si el admin la escribió a mano (siempre el caso al editar). La plantilla Excel descargable ya no incluye la columna `matricula`.
- **Verificado contra el backend real:** dos altas seguidas sin especificar matrícula generaron `MAT-0001` y `MAT-0002` correctamente, consecutivos. Los suscriptores de prueba existentes (`MAT-001`, `MAT-002`, `MAT-003`, formato de 3 dígitos de sesiones anteriores) no interfieren, porque el patrón de búsqueda exige exactamente 4 dígitos. Decisión explícita: los 4 suscriptores de prueba existentes se dejan con su formato viejo tal cual, sin renumerar — son datos de prueba, no hay riesgo de colisión real (son cadenas de texto distintas a `MAT-0001` en adelante).

### ✅ Plantilla Excel desalineada del modal manual "Registrar Nuevo Suscriptor" (hecho 2026-09-19)
**Encontrado al revisar:** la plantilla descargable pedía `apellidos` como columna separada y además `correo`/`direccion` — pero el modal manual solo tiene un único campo combinado "Nombres y Apellidos Completos" (todo va a `form.nombres`) y nunca pide correo ni dirección. Dos caminos de alta con formatos de datos incompatibles entre sí.

**Corrección:** se simplificó la plantilla Excel para que pida exactamente los mismos campos que el modal manual (`cedula`, `nombres` —con apellidos incluidos en el mismo texto—, `telefono`, `vereda`, `numeroMedidor`), quitando `apellidos`, `correo` y `direccion` de las columnas descargables. El backend (`COLUMNAS_EXCEL` en `asociados.controller.js`) sigue aceptando esos campos extra si alguien los agrega a mano al Excel (son opcionales en el modelo), solo ya no se sugieren en la plantilla por defecto.

### ✅ Carga masiva Excel: de modal ciego a página con vista previa fila por fila (hecho 2026-09-19)
**Decisión de producto:** el modal original subía el archivo directo al backend sin mostrar qué iba a pasar — el admin solo se enteraba después (creados/omitidos/errores) sin saber cuáles filas fallaron ni por qué, y sin poder corregir antes de que algo quedara guardado. Se decidió explícitamente moverlo a página completa (no modal) porque el flujo tiene pasos y contenido potencialmente largo (tabla de resultados), no cabe bien en un modal — mismo criterio ya usado para decidir modal vs. página en otras partes del panel.

**Backend — separación previsualizar/confirmar sin duplicar lógica:**
- `backend/src/controllers/asociados.controller.js` — extraída `analizarFilasExcel(buffer, acueductoId)`, que lee el Excel y clasifica cada fila como `CREAR` / `OMITIR` (cédula ya existe, con el nombre del suscriptor existente en el motivo) / `ERROR` (faltan campos), **sin tocar la base de datos**. Nuevo endpoint `previsualizarExcel` que solo llama a esta función y devuelve el detalle. `cargarExcel` (la carga real) ahora reutiliza la misma función para no duplicar las reglas de validación, y solo después de clasificar ejecuta los `Asociado.create()` reales.
- `backend/src/routes/asociados.routes.js` — nueva ruta `POST /asociados/cargar-excel/previsualizar` (mismo middleware `uploadExcel` y protección `verifyAdmin` que la ruta de carga real).

**Frontend — nueva página en 3 pasos:**
- `web-admin/src/pages/Suscriptores/CargaMasivaPage.jsx` (nueva), ruta `/asociados/carga-masiva` en `App.jsx`. Paso 1: descargar plantilla + subir archivo (llama a `previsualizar`). Paso 2: tabla de resultados fila por fila con badges de color (verde CREAR / ámbar OMITIR / rojo ERROR) y 3 contadores resumen arriba; el admin puede "Elegir otro archivo" o "Confirmar y Crear N Suscriptores" (deshabilitado si no hay ninguna fila válida). Paso 3: resultado final tras confirmar, con opción de cargar otro archivo o volver a la lista.
- `web-admin/src/pages/Suscriptores/SuscriptoresPage.jsx` — quitado el modal completo (estado `mostrarModalExcel`, función `handleSubirExcel`, JSX del modal) y el import de `xlsx` (ya sin uso ahí); el botón "Cargar Excel" ahora navega a la nueva página en vez de abrir un modal.

**Verificado de punta a punta contra el backend real:** archivo de prueba con 2 filas válidas + 1 fila sin cédula (inválida) → `previsualizar` clasificó correctamente (2 CREAR, 1 ERROR) → confirmado que la previsualización **no crea nada** (0 registros en la BD tras llamarla) → `cargar-excel` real procesó exactamente lo mismo que anticipó la vista previa (2 creados, 1 error, mismo motivo). Entorno limpio sin dejar registros ni archivos de prueba.

### ✅ Bug encontrado en la misma revisión: la carga Excel nunca capturaba la lectura de arranque de un medidor ya instalado (hecho 2026-09-19)
**Pregunta que lo detectó:** "¿la plantilla pide si el medidor es nuevo o ya instalado, y su lectura de arranque?" — la respuesta era no. `COLUMNAS_EXCEL` solo tenía `numeroMedidor` (el número de serie), nunca una columna de lectura — a diferencia del modal manual, que sí pregunta explícitamente "¿Nuevo o ya instalado?" + la lectura de arranque si es lo segundo. Sin esta columna, **todo suscriptor cargado por Excel con un medidor ya instalado quedaba guardado con `lecturaAnterior: 0, lecturaActual: 0`**, como si el medidor fuera nuevo — mismo bug histórico de pérdida de consumo real ya corregido antes en el alta manual (ver "Pérdida silenciosa de lecturaAnterior/lecturaActual" más abajo), pero que nunca se replicó al camino de Excel.

**Corrección:**
- `backend/src/controllers/asociados.controller.js` — agregada `lecturaInicial` a `COLUMNAS_EXCEL`. En `analizarFilasExcel`, si la fila tiene medidor real (no `S/N`) y trae `lecturaInicial`, esa se usa como `lecturaAnterior`/`lecturaActual`; si la columna viene vacía o en 0, el medidor se trata como nuevo (arranca en 0) — mismo comportamiento que el modal manual.
- `web-admin/src/pages/Suscriptores/CargaMasivaPage.jsx` — agregada la columna `lecturaInicial` a la plantilla descargable (opcional, con ejemplo de un medidor ya instalado con 45 m³ de arranque). La tabla de vista previa ahora muestra una columna "Medidor" con el texto "MED-XXX (arranca en N m³)" o "Sin medidor", para que el admin vea este dato antes de confirmar, no solo después.
- **Verificado contra el backend real:** archivo con un medidor nuevo (columna vacía) y uno "ya instalado" (lectura de arranque 45) → la previsualización calculó correctamente `lecturaAnterior: 0` para el primero y `lecturaAnterior: 45` para el segundo, y la carga real confirmó los mismos valores en la base de datos.

### ✅ Vista previa de carga masiva ampliada a todas las columnas relevantes (hecho 2026-09-19)
La tabla de previsualización solo mostraba un resumen parcial (Fila, Cédula, Nombres, Medidor, Estado, Detalle) — insuficiente para que el admin (no un desarrollador) confirme con confianza que 50 filas de un Excel real quedaron bien antes de crear los registros. Se agregaron las columnas Teléfono y Vereda, que antes no se veían en absoluto en la vista previa aunque sí se iban a guardar.

### ✅ Card informativa agregada en la carga masiva explicando cómo diligenciar el medidor (hecho 2026-09-19)
Las reglas de "sin medidor / medidor nuevo / medidor ya instalado" en el Excel son implícitas (se infieren de si `numeroMedidor`/`lecturaInicial` están vacías o no), a diferencia del modal manual que tiene botones explícitos "SI/NO" y "Nuevo/Ya Instalado". Se agregó una card azul en `CargaMasivaPage.jsx`, entre la plantilla descargable y el dropzone, con las 3 reglas explicadas en lenguaje simple para quien llena el Excel sin conocer el código.

### ✅ Normalización de mayúsculas/minúsculas en nombres, apellidos, vereda y medidor (hecho 2026-09-19)
**Problema:** sin una regla única, el mismo acueducto terminaría con "juan perez", "MARIA GOMEZ", "carlos Ruiz" mezclados en la misma tabla — mala presentación y complica búsquedas/ordenamientos, sin importar si el dato entró por el modal manual o la carga Excel.

**Solución:** normalización centralizada en el modelo (`backend/src/models/Asociado.js`), no en cada formulario del frontend — así aplica sin importar el camino de entrada (modal, Excel, o cualquier cliente futuro como mobile-app), sin tener que duplicar la lógica en cada lugar.
- `nombres`, `apellidos`, `vereda` → Title Case (primera letra de cada palabra en mayúscula). Se decidió no mantener una lista de excepciones para partículas como "de"/"del" (ej. "Rojas De Trujillo" en vez de "Rojas de Trujillo") — es una convención aceptable en español y una lista de excepciones sería complejidad injustificada para este caso.
- `numeroMedidor` → mayúsculas completas (es un código alfanumérico, no texto libre — ej. `med-abc123` → `MED-ABC123`).
- Implementado con dos hooks de Mongoose, no uno solo: `pre('save')` para `Asociado.create()` (alta manual y Excel) y `pre('findOneAndUpdate')` por separado, porque `findOneAndUpdate` (usado por el endpoint de editar) **no dispara** `pre('save')` en Mongoose — sin el segundo hook, la normalización solo hubiera funcionado al crear, no al editar.
- **Verificado contra el backend real:** creado un asociado con `"juan CARLOS rojas de trujillo"` / `"sector el MIRADOR"` / `"med-abc123"` → guardado como `"Juan Carlos Rojas De Trujillo"` / `"Sector El Mirador"` / `"MED-ABC123"`. Editado ese mismo asociado con `"OTRA vereda de PRUEBA"` → guardado como `"Otra Vereda De Prueba"`, confirmando que ambos caminos (crear y editar) normalizan igual.

### ✅ Filtros de `/lecturas` reorganizados de forma uniforme (hecho 2026-09-19)
El buscador y la píldora "Todos / Con Medidor / Sin Medidor" quedaban agrupados en un bloque, y los selects de "Ordenar"/"Vereda" en otro separado — asimétrico y con la píldora "Sin Medidor" en verde (`emerald`) sin motivo claro, mientras el resto del panel usa un único color de acento. Corregido en `LecturasPage.jsx`:
- Píldora "Sin Medidor" cambiada de verde a azul `#1D4ED8`, consistente con "Todos"/"Con Medidor" y el resto de controles activos del panel — no comunicaba ningún estado especial (éxito/error) que justificara un color distinto.
- Agregada la etiqueta "Medidor:" delante de la píldora, igual que "Ordenar:" y "Vereda:", para que los 3 grupos de control (Medidor, Ordenar, Vereda) se lean con el mismo patrón visual.
- Los 3 grupos ahora viven en un único contenedor flex que se distribuye de forma uniforme y colapsa a columna en pantallas angostas, reemplazando la agrupación asimétrica anterior.

### ✅ Análisis: qué pasa si el fontanero no logra tomar una lectura del mes (clima, orden público) — Facturación segura ante lecturas pendientes (hecho 2026-09-19)
**Pregunta del usuario:** cómo debe manejar administración/fontanero el ciclo de toma de lecturas — ¿todas en un solo día o repartidas en el mes? Y ¿qué pasa si por clima u orden público un predio queda sin visitar ese mes?

**Hallazgo (código ya existente, sin cambios necesarios):** el sistema ya soporta el flujo correcto de forma segura, verificado leyendo `backend/src/services/facturacion.service.js` y `backend/src/controllers/facturas.controller.js`:
- No hay corte de fecha rígido — el fontanero puede tomar lecturas cualquier día del mes en `/lecturas`, a su ritmo (esto ya funcionaba así).
- `generarFacturacionMasiva` (líneas 92-95 del servicio) salta automáticamente a cualquier asociado con medidor que no tenga lectura del período vigente (`requiereLecturaVigente` + `tieneLecturaDelPeriodo`) — no le genera factura ese mes, ni con monto en cero ni repitiendo la lectura anterior. Queda contado en `resultado.sinLectura`.
- La corrida es idempotente por asociado+período (`existente` check, línea 86-90) — administración puede volver a correr "Generar Facturación Masiva" las veces que quiera en el mismo mes; solo entran los que faltaban, sin duplicar a los ya facturados.
- Cuando el fontanero por fin visite ese predio (aunque hayan pasado varios meses), el consumo se calcula como `lecturaActual - lecturaAnterior` — cubre automáticamente **todo el consumo acumulado** de los meses sin visitar. El suscriptor no se libra de pagar ese consumo, solo se difiere la facturación hasta que se pueda medir. Decisión de negocio confirmada explícitamente por el usuario: esto es lo correcto (cobrar el acumulado real, no prorratear ni perdonar).
- `FacturacionPage.jsx` (líneas 253-261) ya muestra una alerta ámbar visible **antes** de facturar, con el conteo de predios sin lectura del ciclo (`avanceLecturas.pendientes`), alimentada por `GET /asociados/estadisticas-lecturas`. El resultado de la corrida también refuerza el mensaje después (`"X suscriptores con medidor no se facturaron por falta de lectura de este ciclo"`).

**Conclusión:** no se requirió ningún cambio de código — el flujo ya es seguro de punta a punta. Lo único identificado como faltante fue la falta de aviso al **suscriptor** (no a administración) de que su predio quedó sin lectura — ver el nuevo ítem "Avisar al suscriptor cuando su predio queda sin lectura del mes" en la sección de App Móvil / Portal del Suscriptor (Pendiente), que agrupa las 3 opciones de canal evaluadas con el usuario.

### ✅ ReportesPage.jsx (`/reportes`) migrado, con terminología de dominio corregida (hecho 2026-09-19)
**Hallazgo:** más allá del tema visual, todo el copy de la página seguía usando el lenguaje del proyecto ganadero-cooperativo anterior ("Recaudación y Morosidad" de "asociados" con "aportes"), aunque el backend (`reportes.controller.js`) ya trabaja correctamente en términos de acueducto (facturas de agua, `estadoMoratorio`). El usuario no pidió esto explícitamente en el mensaje, pero corregirlo era necesario para que la migración fuera coherente con el resto del panel ya migrado (Suscriptores, Lecturas, Facturación), que sí habla siempre de "suscriptores" y "facturas".
- Terminología corregida: "Reporte de Morosos" → "Suscriptores en Mora", "aportes pendientes" → "facturas vencidas", "Todos los aportes pagados" → "Todas las facturas pagadas", etc.
- Tema migrado de tokens Material antiguos (`bg-surface-container-low`, `text-on-surface`, `bg-tertiary`, `bg-error`) a `bg-white`/`border-slate-200`/`#1D4ED8`, consistente con el resto del panel.
- Tabla de morosos migrada al patrón SuperAdmin (`bg-white rounded-2xl border border-gray-100 shadow-sm`, header interno con contador, filas `border-t border-gray-50`).
- **FAB flotante (`add_chart`) eliminado** — no tenía ninguna acción conectada ni un propósito claro de "agregar" en una página de solo lectura/analítica.
- **Botón "Exportar Excel" conectado de verdad** (antes no tenía `onClick`) — genera un CSV real de la tabla de morosos (suscriptor, cédula, estado, deuda total, facturas vencidas), mismo patrón ya usado en `FacturacionPage.jsx` (`handleExportarExcel`, Blob + descarga), deshabilitado cuando no hay morosos.
- **Botón "Exportar PDF" eliminado** de esta pasada — no hay ningún generador de PDF en el proyecto todavía (ni librería instalada ni endpoint backend); no se dejó como botón muerto. Pendiente de implementar como tarea aparte si se necesita en el futuro.

### ✅ Bug encontrado en `/reportes`: "Maria Gomez" aparecía en mora aunque ya había pagado — estadoMoratorio no se recalculaba al confirmar un pago (hecho 2026-09-19)
**Cómo se encontró:** el usuario notó a María Gómez (MAT-002) en la tabla de "Suscriptores en Mora" de `/reportes` a pesar de que sus 2 facturas (agosto y septiembre 2026) ya estaban `PAGADA`.

**Causa raíz:** `estadoMoratorio` de un asociado **solo** se recalculaba en `estado.job.js`, un cron que corre **una vez al día a las 6:00am** (`America/Bogota`). Cuando se confirma un pago (efectivo en `pagoEfectivo`, o Wompi en el webhook) en cualquier otro momento del día, la factura pasa a `PAGADA` correctamente, pero el campo `estadoMoratorio` del asociado queda "congelado" en su valor anterior (`EN_MORA`) hasta la próxima corrida del cron. Este bug afecta a **cualquier suscriptor real** que pague después de las 6am — no es exclusivo del dato de prueba de María.

**Corrección:** extraída la regla de cálculo (antes duplicada dentro del bucle de `estado.job.js`) a una función reutilizable `recalcularEstadoMoratorio(acueductoId, asociadoId)` en `facturacion.service.js` — cuenta las facturas `VENCIDA` de ese asociado puntual y aplica la misma regla que ya existía (`0 vencidas → AL_DIA`, `1-2 → EN_MORA`, `3+ → INACTIVO`). Esta función ahora se llama en 3 lugares:
1. `estado.job.js` (el cron diario, ya no duplica la lógica, solo reutiliza la función para cada asociado).
2. `facturas.controller.js` → `pagoEfectivo`, justo después de guardar la factura como `PAGADA`.
3. `facturas.controller.js` → `webhookWompi`, justo después de confirmar el pago vía Wompi (evento `APPROVED`).

Con esto, el estado de mora se corrige al instante en el momento del pago, sin depender de esperar al cron del día siguiente.

**Verificado contra el backend real:** se creó una factura `VENCIDA` de prueba para María, se corrió el cron real (`ejecutarJobEstado`) confirmando que la marcaba `EN_MORA` (comportamiento esperado, ya tenía una vencida real), y luego se pagó esa factura vía el endpoint real `POST /facturas/:id/pago-efectivo` (login real con `admin.a@test.dev`) — el `estadoMoratorio` de María pasó a `AL_DIA` **inmediatamente**, sin volver a correr el cron. Factura de prueba eliminada y contraseña del admin restaurada al finalizar.

### ✅ Análisis: qué pasa si un suscriptor no paga una factura — ¿se acumulan en un solo monto o se gestionan por separado? (hecho 2026-09-19)
**Pregunta del usuario:** si un suscriptor no paga la factura de un mes, ¿al mes siguiente se le genera una sola factura con las dos acumuladas, o se calculan y gestionan por separado?

**Respuesta, confirmada leyendo `backend/src/models/Factura.js` y `facturacion.service.js`:** se gestionan **siempre por separado**, nunca se fusionan en un solo documento/monto.
- El modelo tiene un índice único `{acueductoId, asociadoId, periodo}` (`Factura.js:30`) — esto garantiza que cada mes genera su **propio documento de factura independiente** (`AGUA-202608-MAT-002`, `AGUA-202609-MAT-002`, etc.), nunca se sobreescribe ni se combina con el mes anterior.
- Si el suscriptor no paga agosto, esa factura queda `PENDIENTE` y luego `VENCIDA` (por el cron al pasar la fecha límite). En septiembre se genera una factura **nueva y distinta**, con su propio monto y fecha de vencimiento — el suscriptor termina con 2 facturas separadas en su historial, cada una gestionable de forma individual (`GET /facturas?periodo=2026-08` filtra solo ese mes; se puede pagar/anular una sin afectar la otra).
- El único lugar donde "se ven juntas" es agregando, no fusionando: `estadoMoratorio` cuenta cuántas facturas `VENCIDA` tiene en total para decidir el nivel de mora (ver ítem anterior), y el reporte de "Suscriptores en Mora" (`/reportes`) suma la deuda total de todas sus facturas vencidas para mostrar un número único de cuánto debe — pero cada factura individual sigue existiendo intacta y consultable por separado.

**Conclusión:** no se requiere ningún cambio de código — el diseño actual ya soporta gestión individual de cada mes, que es lo que el usuario buscaba confirmar.

### ✅ Tooltip aclaratorio en la tarjeta "Distribución" de `/reportes`: qué significa "Inactivo" (hecho 2026-09-19)
**Contexto:** el usuario preguntó qué significa la categoría "Inactivo" en la tarjeta de Distribución — nombre ambiguo, porque en el resto del sistema "Activo/Inactivo" también describe `estadoServicio` (si el agua está físicamente conectada o cortada), un campo completamente distinto e independiente de `estadoMoratorio`.

**Aclaración:** "Inactivo" en esta tarjeta es un nivel de `estadoMoratorio` (3 o más facturas vencidas sin pagar) — no implica que el servicio de agua esté cortado. Esa es una decisión operativa separada, gestionada por el campo `estadoServicio` en la ficha del suscriptor (aún sin pantalla propia en `web-admin`, ver ítem "🟡 `estadoServicio` sin pantalla que lo use" en Pendiente).

**Solución:** en `ReportesPage.jsx`, cada etiqueta de la tarjeta "Distribución" ("Al día", "En mora", "Inactivo") ahora tiene un ícono ⓘ junto al nombre con `title` (tooltip nativo del navegador) explicando la regla exacta de cada nivel, aclarando puntualmente en "Inactivo" que no equivale a corte de servicio.

### ✅ MapaPage.jsx (`/mapa`) migrado a tema claro + #1D4ED8, sin cambios funcionales (hecho 2026-09-19)
**Contexto:** el usuario confirmó que hoy ningún suscriptor tiene GPS registrado en la base de datos real (`latitud`/`longitud` son `undefined` para los 4 suscriptores de prueba) — verificado directamente contra MongoDB. Esto es esperado, no un bug: la captura de coordenadas depende de la app del suscriptor, que aún está pendiente de construir (ver sección App Móvil / Portal del Suscriptor). El estado vacío ("Ningún suscriptor tiene GPS registrado todavía") ya era el comportamiento correcto del código antes de esta migración.

**Decisión:** dado que la lógica ya funcionaba bien (fetch real, filtra por GPS presente, encuadra el mapa Leaflet a los puntos reales, popups con estado real), se migró solo el tema visual, sin tocar la lógica de datos:
- Contenedores de `bg-slate-900/90 border-slate-800` (oscuro cian) a `bg-white border-slate-200` + acento `#1D4ED8`, consistente con el resto del panel.
- Quitado el filtro `brightness-95 contrast-110` del contenedor del mapa — existía para oscurecer los tiles de OpenStreetMap sobre el fondo oscuro anterior; con fondo blanco ya no aplica, los tiles se ven con sus colores naturales.
- Agregado un estado vacío explícito al panel lateral de "Predios Registrados" cuando no hay ningún predio georreferenciado (antes quedaba un espacio en blanco sin explicación).
- Los colores semánticos de estado (verde = Al Día, ámbar = En Mora/Inactivo) se mantienen — son universales en todo el proyecto, no exclusivos del tema oscuro.

### ✅ Sección "Sin Ubicación" en `/mapa`, convertida en página propia con paginación real por escalabilidad (hecho 2026-09-19)
**Pregunta del usuario:** cómo gestionar desde `/mapa` a los suscriptores que aún no han actualizado su ubicación GPS.

**Primera versión (luego corregida en la misma sesión):** se agregó una tabla embebida al final de `MapaPage.jsx` con la lista completa de suscriptores sin GPS. El usuario hizo notar que con un acueducto grande (ejemplo dado: 2000 suscriptores, 1000 sin GPS) esa tabla embebida haría la página demasiado extensa de hacer scroll, y pidió explícitamente que se abriera en una página aparte.

**Bug de fondo encontrado al resolver esto:** `MapaPage.jsx` pedía `GET /asociados` **sin ningún `limit` explícito** — con el límite por defecto del backend (`limit=20`), un acueducto real de 2000 suscriptores solo le devolvería 20 al mapa, sin importar cuántos tuvieran GPS. El mapa habría estado roto (mostrando ~1% de los predios reales) en cuanto el acueducto creciera más allá de 20 suscriptores — no se notó antes porque los datos de prueba (4 suscriptores) nunca superaron ese límite.

**Solución completa implementada:**
1. **Backend** (`asociados.controller.js`, función `listar`): nuevo parámetro `tieneGPS=true|false`, que filtra directamente en la query de Mongo (`$type: 'number'` sobre `latitud`/`longitud`) en vez de traer todo y filtrar en el cliente — necesario para que escale con acueductos grandes. Cuando se combina con la búsqueda de texto `q` (que también usa `$or`), se combinan con `$and` en vez de que uno pise al otro.
2. **`MapaPage.jsx`**: ahora pide `tieneGPS=true&limit=5000` (todos los puntos con GPS, ya que el mapa necesita dibujarlos todos) y por separado `tieneGPS=false&limit=1` (solo para obtener el `total`, sin traer la lista completa). Al final de la página solo queda una tarjeta resumen ("Sin Ubicación (N)") con un botón "Ver Lista Completa" que navega a la nueva página.
3. **Nueva página `SinUbicacionPage.jsx`** (`web-admin/src/pages/Mapa/SinUbicacionPage.jsx`, ruta `/mapa/sin-ubicacion`): lista paginada de verdad (20 por página, pedidos al backend con `page`/`limit`, nunca los 1000 de una sola vez), con buscador propio (`q`) y botones "Notificar"/"Notificar a Todos" — **deshabilitados intencionalmente**, con `title` explicando la dependencia real: requieren que el suscriptor tenga la app instalada con sesión iniciada (login por cédula, aún pendiente) para registrar su `tokenFCM` y recibir push. Se decidió dejarlos visibles-mas-deshabilitados en vez de ocultos, para que el admin sepa que la función existe y por qué todavía no está activa, en vez de construir un botón que aparente funcionar sin llegarle a nadie.
4. Detalle completo de qué falta para conectar el push de verdad documentado en Pendiente, sección App Móvil / Portal del Suscriptor → "Notificar por push a suscriptores sin GPS registrado, desde `/mapa`".

**Verificado contra el backend real:** login con `admin.a@test.dev` (reset temporal de contraseña + restauración al finalizar, mismo patrón de siempre) y pruebas directas del endpoint: `tieneGPS=true` devuelve 0 (correcto, ningún suscriptor de prueba tiene GPS), `tieneGPS=false` devuelve los 4 suscriptores de prueba reales, `tieneGPS=false&q=carlos` encuentra solo a Carlos Ruiz (confirma que el `$and` combina ambos filtros correctamente), y `tieneGPS=false&q=noexiste123` devuelve vacío. La llamada sin ningún filtro (comportamiento preexistente) se probó también para confirmar que no se rompió nada.

### ✅ EventosPage.jsx (`/eventos`) migrado a tema claro + #1D4ED8 (hecho 2026-09-19)
**Contexto:** el shell de la página (tarjetas, filtros, listado) ya estaba a medio migrar con capa `dark:` residual sobre fondo claro, pero **ambos modales (crear/editar y eliminar) seguían 100% en tema oscuro fijo** (`bg-slate-900`, sin variante clara) — el salto de estilo entre la página y sus propios modales habría sido muy notorio.

**Solución:** quitada toda la capa `dark:` del shell (tarjetas resumen, filtros por tipo, tarjetas de evento) y migrados ambos modales de oscuro fijo a `bg-white`/`#1D4ED8`, consistentes con el resto del panel — mismo criterio que Suscriptores/Lecturas/Facturación/Reportes. Sin cambios funcionales: la lógica de crear/editar/eliminar eventos y el fetch real a `GET /eventos` ya funcionaban correctamente antes de este cambio.

**Bug de UI encontrado y corregido en la misma revisión:** el estado vacío ("No hay convocatorias agendadas") tenía su propio botón "Convocar Primera Reunión" duplicando exactamente la misma acción (`abrirModalCrear`) que el botón "Convocar Nueva Reunión / Asamblea" del header, visible al mismo tiempo. El usuario pidió dejar un solo punto de entrada — se eliminó el botón del estado vacío, dejando solo el del header (el texto del estado vacío ya guiaba explícitamente a "el botón de la parte superior", así que la instrucción seguía siendo clara sin el botón duplicado).

**Segundo hallazgo de copy heredado:** la tarjeta "Próxima Convocatoria" mostraba el texto "Padrón de eventos limpio" cuando no había ningún evento programado — lenguaje del proyecto ganadero-cooperativo anterior ("padrón" ahí se refiere al registro de socios/hato), inconsistente con el vocabulario ya migrado de AquaRural. Corregido a "No hay convocatorias pendientes".

**Bug funcional encontrado y corregido, no solo de copy:** el usuario preguntó qué significan las tarjetas "Reuniones Programadas" y "Próxima Convocatoria", lo que llevó a revisar el cálculo real de la segunda. `eventos.controller.js` (backend) devuelve los eventos con `.sort('-fecha')` — orden **descendente** (más lejano/reciente primero). El frontend hacía `eventos.find((ev) => ev.estado === 'PROGRAMADO')`, tomando el **primer** elemento de ese array ya ordenado al revés — es decir, mostraba como "próxima" la convocatoria programada con la fecha más **lejana**, no la más cercana (el bug pasaba desapercibido con los datos de prueba porque probablemente solo hay 1 evento `PROGRAMADO`). Corregido filtrando por `estado === 'PROGRAMADO'` y ordenando explícitamente por fecha ascendente en el propio frontend antes de tomar el primero, para no depender del orden en que el backend decida devolver la lista.

**Tercer hallazgo:** el usuario notó que los nombres de "Tipo de Convocatoria" no coincidían entre el dropdown del modal ("🔧 Mantenimiento / Limpieza Comunitaria (Minga)") y los botones de filtro ("Mantenimiento Bocatoma") — y de hecho había una **tercera variante** distinta en las tarjetas de evento ("🔧 Mantenimiento Veredal"), 3 nombres diferentes para el mismo `tipo: 'MANTENIMIENTO_BOCATOMA'`. El usuario pidió explícitamente no tocar el dropdown, solo unificar filtro y tarjetas hacia un nombre corto consistente: "Asamblea General", "Mantenimiento / Minga", "Reunión de Junta" — usado ahora igual en ambos lugares.

**Cuarto hallazgo:** el usuario preguntó si los íconos del modal/filtro eran acordes al resto del proyecto — no lo eran. Todo el panel ya migrado (Suscriptores, Lecturas, Facturación, Reportes, Mapa) usa Material Symbols Outlined como convención de íconos; `EventosPage.jsx` usaba emojis Unicode (🏛️🔧👥) en las 3 vistas. Corregido:
- Botones de filtro y tarjetas de evento: emojis reemplazados por Material Symbols reales (`account_balance` para Asamblea General, `plumbing` para Mantenimiento/Minga, `groups` para Reunión de Junta).
- Dropdown del modal (`<select>` nativo de HTML): un `<option>` no puede renderizar un ícono, solo texto plano — no se convirtió a un `<select>` custom (el usuario ya había pedido no tocar el dropdown), así que ahí simplemente se quitó el emoji y quedó solo el texto descriptivo largo, sin ícono.

### ✅ Auditoría de íconos en Dashboard/Suscriptores/Lecturas/Facturación tras el fix de Eventos — varios emojis funcionales corregidos (hecho 2026-09-19)
**Contexto:** después de corregir los emojis de `/eventos`, el usuario pidió auditar si `/dashboard`, `/asociados`, `/lecturas` y `/facturacion` (ya migradas en sesiones anteriores) eran igual de consistentes. Se delegó la lectura completa de los 4 archivos a un subagente de solo-lectura para no perder contexto de tokens en la búsqueda — encontró varios emojis funcionales colados que rompían la convención Material Symbols Outlined ya establecida en el resto del proyecto.

**Corregidos** (emoji → `material-symbols-outlined`):
- `DashboardPage.jsx`: ⚠️ redundante junto al ícono `warning` ya existente en el aviso de licencia SaaS vencida — quitado (era literal duplicado, no aportaba nada).
- `SuscriptoresPage.jsx`: 🏠 → `home` (badge "Sin Medidor" en la tabla y botón "No" del formulario), 💧 → `water_ec` (botón "Sí, Con Contador"), 🆕 → `fiber_new` (botón "Nuevo" de estado del contador), ⏱️ → `history` (botón "Ya Instalado").
- `LecturasPage.jsx`: 🏠 → `home` (mismo badge "Sin Medidor" que en Suscriptores).
- `CargaMasivaPage.jsx`: la card informativa "Cómo diligenciar las columnas de medidor" tenía los mismos 3 emojis (🏠🆕⏱️) que el modal manual — corregidos igual, a `home`/`fiber_new`/`history`, para que ambos caminos de alta (manual y Excel) usen el mismo lenguaje visual.
- `FacturacionPage.jsx`: "✓ Cobrada" → ícono `check_circle` + texto; ⚠️ del modal "Anular Facturación" → ícono `warning` (este sí aportaba, porque vivía en el cuerpo del mensaje, no duplicaba el `delete_sweep` del header del modal).

**Dejados intactos, a propósito:** los emojis ✅/⏳/✂️ dentro de los modales de impresión de tickets (individual y masivo) en `FacturacionPage.jsx` — esos modales tienen un comentario explícito en el código diciendo que deben quedar "siempre blanco/negro... no debe seguir el tema del panel" porque se imprimen en papel térmico, así que no están sujetos a la convención de íconos del panel administrativo.

### ✅ LicenciaSoftwarePage.jsx (`/licencia`) migrado a tema claro + #1D4ED8, íconos corregidos (hecho 2026-09-19)
**Contexto:** era la página con mayor desviación del criterio de migración hasta ahora — el header estaba en tema oscuro fijo (`bg-slate-900`, sin `dark:` alternativo, a diferencia de las demás páginas que al menos tenían la capa `dark:` presente), el resto usaba cian (`cyan-*`) en vez de `#1D4ED8` en casi todos sus elementos, y el banner de alerta de licencia vencida tenía gradientes y `animate-pulse` mucho más "vistosos" que el resto del panel (comparado, por ejemplo, contra el banner sobrio de licencia vencida ya migrado en `DashboardPage.jsx`).

**Migrado:**
- Header, banner de alerta (vencida/por vencer), tarjeta de "Plan Sincronizado" con sus 3 sub-tarjetas, y tabla de historial de facturas de licencia — todos de `cyan-*`/`slate-900`/gradientes a `bg-white`/`#1D4ED8`, consistente con el resto del panel.
- Tabla de historial migrada al patrón SuperAdmin (`<colgroup>` con `w-px` en la columna de acciones, header interno con contador, filas `border-t border-gray-50`).
- Modal de comprobante: backdrop unificado a `bg-slate-950/60 backdrop-blur-sm` (antes `/70` + `blur-md`, más oscuro que el resto de modales del panel).

**Íconos corregidos** (emoji → Material Symbols Outlined): ⚠️/⏳ en el banner de alerta (duplicaban los íconos `error`/`schedule` ya presentes — quitados sin reemplazo), ✓ en "Fin del mes gratis"/"Desde aquí inicia" → `check_circle`, ✓/⏳ en los badges "PAGADA POR LA JUNTA"/"PENDIENTE DE PAGO" de la tabla → `check_circle`/`schedule`, ✓ "Verificado" → `check_circle`, 🖨️ en los 2 botones de imprimir → `print`, y ✕ como botón de cerrar (3 lugares: error, mensaje de éxito, modal) → ícono `close`, igual que en el resto del proyecto.

**Corrección adicional pedida por el usuario:** el `badge` (💧🌊🏞️⚡) del `PLANES_SAAS_MAP` local de esta página se había dejado con emoji en la primera pasada, asumiendo que tocarlo podía afectar a SuperAdmin. Al revisar, se confirmó que **no es el mismo mapa** — `SuperAdmin/AcueductosPage.jsx` tiene su propio `PLANES_SAAS_MAP` independiente (no importado aquí), y ese ya seguía la convención correcta: `badge` como texto plano sin emoji + un campo `icon` separado con el Material Symbol (`water_drop`/`water`/`water_ec`/`bolt`). Se replicó exactamente ese mismo patrón en el mapa local de `LicenciaSoftwarePage.jsx`, y la tarjeta "Plan Sincronizado" del header ahora renderiza el ícono real junto al nombre del plan, en vez del emoji suelto en el texto.

### ✅ Bug de seguridad corregido: firma de pago Wompi SaaS ya no se genera en el frontend (hecho 2026-09-19)
**El bug:** `handleIniciarPagoWompiSaaS` en `LicenciaSoftwarePage.jsx` generaba la firma de integridad del checkout de Wompi **en el navegador**, con la llave privada de integridad de la plataforma hardcodeada en el código del cliente (`test_integrity_...`, visible para cualquiera que abriera las herramientas de desarrollador o descompilara el bundle de JS). Mismo patrón inseguro ya detectado antes en `DashboardPage.jsx` (bug distinto, mismo tipo de fuga). Además la función llamaba a `generarFirmaIntegridadWompi`, que ni siquiera estaba definida en ese archivo — el botón probablemente nunca funcionó de verdad.

**Corrección — reutilizando el patrón ya seguro de SuperAdmin, no inventado de cero:** `superadmin.controller.js` ya tenía `iniciarPagoSaaS`, que genera la firma en el backend con la llave real (`env.WOMPI_PLATAFORMA_INTEGRITY_SECRET`, nunca expuesta al cliente) — pero esa ruta exige rol SuperAdmin (`router.use(verifyToken, verifySuperadmin)` en `superadmin.routes.js`), así que un `ADMIN_ACUEDUCTO` normal (el rol que usa `/licencia`) no podía llamarla.
- Se creó un endpoint equivalente, **`POST /configuracion/iniciar-pago-saas`** (`configuracion.controller.js`), con la misma lógica de firma segura, pero resolviendo el acueducto desde `req.acueductoId` (inyectado por el tenant middleware a partir del token) — **nunca de un `acueductoId` que mande el body**, para que un admin no pueda generar un cobro a nombre de otro acueducto.
- Se confirmó explícitamente que debía usarse la llave de **la plataforma** (`WOMPI_PLATAFORMA_*`), no las llaves Wompi propias del acueducto (`wompiPublicKey`/`wompiPrivateKeyEncrypted` en `Acueducto.js`) — esas son para que el acueducto cobre el agua a sus propios suscriptores, un flujo de dinero completamente distinto a pagarle la licencia SaaS a la plataforma.
- `LicenciaSoftwarePage.jsx` reescrito para llamar a este endpoint y abrir la URL que devuelve, sin tocar ningún secreto en el cliente.
- El botón de "Pagar con Wompi" de una fila específica del historial (para una `FacturaSaaS` histórica puntual) ahora también dispara el mismo endpoint, que siempre calcula el **ciclo vigente actual** en vez de esa factura histórica exacta — mismo comportamiento que ya tenía el endpoint de SuperAdmin en el que se basó. El usuario confirmó que es aceptable, ya que en la práctica solo debería existir una `FacturaSaaS` `PENDIENTE` a la vez (la del ciclo vigente).

**Verificado contra el backend real:** login con `admin.a@test.dev` (reset temporal + restauración al finalizar, mismo patrón de siempre) → `POST /configuracion/iniciar-pago-saas` devolvió una URL de checkout de Wompi real con firma calculada en el backend, y creó la `FacturaSaaS` del ciclo vigente correctamente. Confirmado que sin token el endpoint rechaza con "No autenticado." Factura de prueba eliminada al finalizar.

### ✅ ConfiguracionPage.jsx (`/configuracion`) migrado a tema claro + #1D4ED8, con 2 hallazgos corregidos (hecho 2026-09-19)
**Contexto:** era una de las páginas marcadas en el plan como "decisión pendiente" (tema oscuro "Hydro-Tech" intencional). El usuario confirmó explícitamente migrarla, junto con `Equipo`/`PagosWompi`, al mismo criterio de tema claro ya aplicado en el resto del panel.

**Migrado:** archivo completo (743 líneas, 100% oscuro fijo sin ningún `dark:`, a diferencia de otras páginas que al menos tenían la capa `dark:` presente) — header, bloque de tarifas y modalidad de cobro, bloque de datos institucionales protegidos, datos de contacto, y formulario de cambio de contraseña. Todo de `slate-900`/`slate-950`/`cyan-*` a `bg-white`/`#1D4ED8`.

**Hallazgo 1 — bug de datos, no solo visual:** el campo de solo lectura "Representante Legal / Presidente" (`readOnly`) usaba `value={form.representanteLegal || 'Julián Trujillo'}` — un nombre real de una persona (el desarrollador del proyecto) hardcodeado como fallback. Si un acueducto real no tenía ese dato cargado, el panel le mostraría a la junta directiva el nombre de otra persona como si fuera su propio representante legal. Corregido a `'Sin definir'`.

**Hallazgo 2 — mapa de planes duplicado, ya van 3:** `ConfiguracionPage.jsx` tenía su propio `PLAN_BADGES` local con emojis (💧🌊🏞️⚡), sin relación con `PLANES_SAAS_MAP` de SuperAdmin ni con el de `LicenciaSoftwarePage.jsx` (ambos ya corregidos en hitos anteriores de esta sesión). Se aplicó la misma convención ya validada: texto plano sin emoji + campo `icon` con Material Symbol real (`water_drop`/`water`/`water_ec`/`bolt`), renderizado junto al badge del plan activo.

**Otros íconos corregidos:** 🔒 duplicado junto al ícono `lock` ya presente en el badge "Protegida" (quitado), ✓ en "LICENCIA ACTIVA" → ícono `check_circle` + texto "Licencia Activa" (mayúsculas sostenidas también normalizadas a texto title-case, consistente con el resto del panel).

### ✅ Separación de /configuracion en dos páginas: Configuración (tarifas) y Mi Cuenta (institucional + contacto + contraseña) (hecho 2026-09-19)
**Pregunta del usuario:** si "Información Institucional de la Junta de Agua" e "Información de Contacto" deberían estar en el sidebar junto con "Cambiar Mi Contraseña", en vez de mezcladas con la configuración de tarifas.

**Análisis:** se confirmó que `ConfiguracionPage.jsx` mezclaba 3 tipos de información de naturaleza distinta en una sola página larga: (1) tarifas y modalidad de cobro — configuración operativa real del negocio del acueducto; (2) datos institucionales de solo lectura (NIT, departamento, representante legal) — fijados por SuperAdmin, no algo que el admin "configure" ahí; (3) contacto + cambio de contraseña — datos de la cuenta/perfil del propio usuario admin, no del acueducto. El usuario confirmó separar (2) y (3) a una página nueva.

**Solución:**
- **`ConfiguracionPage.jsx` reescrita**, quedando enfocada solo en tarifas, modalidad de cobro (Tarifa Fija/Híbrido/Medidor) y el toggle de trasladar costo de licencia a los asociados — bloque "Datos Oficiales" y "Cambiar Contraseña" removidos. De paso se eliminó código muerto que ya existía antes de esta sesión: los estados `departamentos`/`municipios`/`departamentoSeleccionadoId` y la función `handleCambiarDepartamento` nunca se renderizaban en ningún JSX (probablemente un selector planeado que terminó siendo de solo lectura y nunca se conectó).
- **Nueva página `MiCuentaPage.jsx`** (`web-admin/src/pages/Configuracion/MiCuentaPage.jsx`, ruta `/mi-cuenta`), con los 3 bloques trasladados: Información Institucional (solo lectura), Información de Contacto (editable, con su propio botón "Guardar Contacto" y su propio `PATCH /configuracion` independiente del de tarifas), y Cambiar Mi Contraseña.
- **Agregada al sidebar** dentro de la sección "CUENTA" (junto a Licencia, Configuración, Pagos Wompi y Equipo), con ícono `account_circle`.
- El mismo hallazgo del tercer `PLAN_BADGES` duplicado (ver hito anterior) se replicó también en `MiCuentaPage.jsx`, ya que ese bloque se trasladó tal cual.

**Verificado contra el backend real:** login con `admin.a@test.dev` (reset temporal + restauración, mismo patrón de siempre) — se guardó un cambio de tarifa (`tarifaBaseMensual: 99999`) desde el payload que enviaría `ConfiguracionPage.jsx` (sin `telefono`/`email`), y por separado un cambio de contacto (`telefono: 3111234567`) desde el payload que enviaría `MiCuentaPage.jsx` (sin campos de tarifa) — ambos PATCH al mismo endpoint `/configuracion` coexistieron sin pisarse entre sí, confirmando que separar los formularios en 2 páginas no rompe el guardado parcial ya soportado por el backend. Valores de prueba restaurados al finalizar (`tarifaBaseMensual: 15000`, `telefono: 3156711731`, los originales).

### ✅ Bug funcional real encontrado y corregido: "Recargo por Mora" se guardaba pero nunca se aplicaba a ninguna factura (hecho 2026-09-19)
**Cómo se encontró:** el usuario preguntó cómo se aplica el campo "Recargo por Mora ($ COP)" de `/configuracion`. Al rastrear `montoRecargoMora` en todo el backend, solo aparecía en el modelo `Acueducto.js` y en los 2 validadores (guardar/leer) — **ningún controller ni servicio lo leía para aplicarlo a una factura**. El modelo `Factura.js` sí tiene un campo `montoMora` listo para recibirlo, pero nada lo escribía; siempre quedaba en `0`. Era un campo 100% decorativo: el admin podía configurarlo y verlo guardado, pero ningún suscriptor lo pagaba nunca, sin importar cuánto tiempo llevara en mora.

**Corrección:** en `estado.job.js` (el cron diario que ya marca facturas `PENDIENTE → VENCIDA` cuando pasa la fecha límite), el `updateMany` genérico se reemplazó por un bucle que, **solo si el acueducto tiene `montoRecargoMora > 0`**, procesa cada factura que está por vencer individualmente: la marca `VENCIDA`, le suma el recargo a `montoMora`, y suma ese mismo monto a `montoTotal`. Si el acueducto no configuró recargo (`0`, el valor por defecto), se mantiene el `updateMany` original sin cambios de comportamiento.
- **El recargo se aplica una sola vez por factura**, en el momento exacto en que cruza de `PENDIENTE` a `VENCIDA` — corridas posteriores del cron no vuelven a tocar facturas que ya están en `VENCIDA`, así que no se acumula día tras día ni se duplica.
- Como el pago (efectivo o Wompi) siempre cobra `factura.montoTotal`, el recargo queda automáticamente incluido en lo que paga el suscriptor sin tocar `pagoEfectivo` ni el webhook.

**Verificado contra el backend real:** configurado `montoRecargoMora: 5000` en el acueducto de prueba, creada una factura `PENDIENTE` con `fechaVencimiento` en el pasado y `montoTotal: 15000` — tras correr `ejecutarJobEstado()` pasó a `VENCIDA` con `montoMora: 5000` y `montoTotal: 20000`. Se corrió el cron **2 veces más** (3 en total) y el monto se mantuvo exactamente igual, confirmando que no se acumula. Factura de prueba eliminada al finalizar.

### ✅ EquipoPage.jsx (`/equipo`) migrado a tema claro + #1D4ED8, con 1 detalle de seguridad corregido (hecho 2026-09-19)
**Contexto:** última página del bloque "Configuracion/Equipo/PagosWompi" que el usuario confirmó migrar. Al igual que `PagosWompiPage.jsx`, la lógica ya era correcta (crear/editar/eliminar miembros del equipo, roles Fontanero/Tesorero) — no se tocó ningún flujo, solo el tema visual.

**Detalle de seguridad corregido de paso:** el campo de contraseña al crear un nuevo miembro del equipo usaba `type="text"` en vez de `type="password"` — mostraba la contraseña en texto plano mientras se escribía, visible para cualquiera mirando la pantalla del admin al crear un acceso. Corregido a `type="password"` con `autoComplete="new-password"`, mismo patrón ya usado en los demás formularios de contraseña del panel (`MiCuentaPage.jsx`, `PagosWompiPage.jsx`).

**Migrado:** header, lista de miembros del equipo (vista y modo edición inline), y formulario de alta — de `slate-900`/`cyan-*` a `bg-white`/`#1D4ED8`, consistente con el resto del panel.

**Ajustes adicionales pedidos por el usuario tras la primera pasada:**
- Contenedor ampliado de `max-w-3xl` a `max-w-5xl` y la lista de "tarjetas apiladas" reemplazada por una tabla real estilo SuperAdmin (`<colgroup>` con `w-px` en Acciones, header interno, columnas Nombre/Correo/Rol/Estado/Acciones) — mejor experiencia con más miembros del equipo que la lista angosta anterior. La edición inline de un miembro ahora ocurre dentro de la misma fila de la tabla (input + select + Guardar/Cancelar), en vez de una tarjeta separada.
- El formulario de alta se separó a su propia tarjeta ("Crear Nuevo Acceso"), en vez de vivir apilado dentro del mismo contenedor blanco que la tabla — evita anidar una tarjeta blanca dentro de otra.
- **Bug de layout corregido:** el botón "+ Crear" quedaba comprimido junto al `<select>` de rol dentro de una sola columna de un grid de 4, con `flex gap-2` anidado — mismo patrón de bug ya visto y corregido antes en "Cambiar Mi Contraseña" de `MiCuentaPage.jsx`. Corregido a un grid de 5 columnas propias (nombre, correo, contraseña, rol, botón), cada una con su espacio dedicado.
- El `<select>` de rol usaba la flecha nativa del navegador — corregido al mismo patrón ya validado (`<div className="relative">` + ícono `unfold_more` superpuesto) usado en Suscriptores/Lecturas/Equipo (fila de edición).

**Normalización de texto agregada:** el nombre de un miembro del equipo no pasaba por ningún Title Case (a diferencia de `Asociado.js`, ya corregido en un hito anterior) — "pedro JOSE ramirez" se guardaba tal cual. Se agregó el mismo patrón de hooks de Mongoose (`pre('save')` y `pre('findOneAndUpdate')`, este último necesario porque `equipo.controller.js` usa `findOneAndUpdate` para editar) al modelo `AdminUser.js` — que es compartido por miembros del equipo, el admin del acueducto y SuperAdmin, así que la normalización aplica a cualquier nombre que pase por ese modelo, no solo a Fontanero/Tesorero.

**Verificado contra el backend real:** login con `admin.a@test.dev` (reset temporal + restauración, mismo patrón de siempre) — creado un miembro con `"pedro JOSE ramirez"` → guardado como `"Pedro Jose Ramirez"`; editado ese mismo miembro con `"OTRO nombre EDITADO"` → guardado como `"Otro Nombre Editado"`, confirmando que ambos caminos (crear y editar) normalizan igual. Miembro de prueba eliminado al finalizar.

**Ajuste final pedido por el usuario:** el formulario de alta quedaba siempre visible debajo de la tabla, ocupando espacio permanentemente aunque crear un miembro del equipo es una acción ocasional, no algo que se haga a diario. Se convirtió en modal: nuevo botón "Nuevo Acceso" en el header de la página (mismo patrón ya usado en Suscriptores/Eventos: botón en header → modal), y el formulario de 5 campos ahora vive dentro de un modal que se abre/cierra con ese botón, dejando la tabla como el contenido principal siempre visible de la página.

### ✅ Bug crítico encontrado y corregido: no había forma de recuperar la contraseña de un Fontanero/Tesorero (hecho 2026-09-19)
**Pregunta del usuario:** qué pasa si un Fontanero o Tesorero pierde u olvida su contraseña.

**Hallazgo:** revisando `auth.routes.js`, se confirmó que el proyecto **no tiene ningún flujo de recuperación de contraseña por correo** — solo existe `PUT /auth/cambiar-password`, que requiere estar ya autenticado y conocer la contraseña actual (sirve para cambiarla voluntariamente, no para recuperarla). Y en `equipo.validator.js`, `actualizarMiembroEquipoSchema` solo permitía editar `nombre` y `estado` — **ni siquiera el `ADMIN_ACUEDUCTO` podía resetear la contraseña de su propio equipo** desde `/equipo`. Conclusión: si un Fontanero/Tesorero olvidaba su contraseña, quedaba bloqueado sin ninguna salida — la única opción real habría sido que alguien con acceso directo a MongoDB generara un hash a mano (como se ha hecho varias veces en esta sesión solo para pruebas).

**Segundo hallazgo, de seguridad, encontrado al implementar el fix:** el controller `actualizar` de `equipo.controller.js` pasaba `req.body` completo y sin tocar a `findOneAndUpdate` — si se hubiera agregado el campo `password` al validador sin revisar el controller, la nueva contraseña se habría guardado **en texto plano**, sin pasar por `bcrypt.hash` (a diferencia de `crear()`, que sí hashea correctamente). Corregido extrayendo `password` del body y hasheándolo explícitamente antes de construir el objeto de cambios, solo si viene presente.

**Solución implementada — el admin del acueducto restablece la contraseña de su propio equipo, no hay recuperación automática por correo:**
- Backend: `password` agregado como campo opcional a `actualizarMiembroEquipoSchema`, y `equipo.controller.js` (`actualizar`) ahora hashea la contraseña con bcrypt antes de guardarla, igual que en `crear()`.
- Frontend (`EquipoPage.jsx`): nuevo botón "Restablecer Contraseña" (ícono `key`, color ámbar para distinguirlo de editar/eliminar) en cada fila de la tabla, que abre un modal con una advertencia explícita ("No existe recuperación automática de contraseña... comunícasela directamente") y un solo campo para la nueva contraseña temporal.

**Verificado contra el backend real:** login con `admin.a@test.dev` (reset temporal + restauración, mismo patrón de siempre) — creado un Fontanero de prueba con clave `"ClaveVieja123"`, confirmado que podía iniciar sesión; reseteada su contraseña vía `PUT /equipo/:id` a `"ClaveNueva456"`; confirmado que la clave vieja **ya no funciona** ("Correo o contraseña incorrectos") y la nueva **sí funciona** ("Sesión iniciada") — prueba de que el hash se generó correctamente y no quedó en texto plano. Miembro de prueba eliminado al finalizar.

**Pendiente relacionado, no resuelto en esta sesión:** sigue sin existir un flujo de auto-recuperación para el `ADMIN_ACUEDUCTO` mismo (si el admin del acueducto olvida SU propia contraseña, no hay nadie "por encima" en el propio panel que se la resetee salvo SuperAdmin manualmente) — fuera de alcance de esta pregunta, que era específicamente sobre Fontanero/Tesorero.

**Ajuste de UX pedido por el usuario:** el modal de reset solo tenía un campo de contraseña, sin poder verla ni confirmarla — riesgo real de que el admin escriba mal la contraseña que le va a comunicar de palabra al Fontanero/Tesorero, sin darse cuenta. Se agregó un botón de mostrar/ocultar (ícono de ojo, afecta ambos campos a la vez) y un segundo campo "Confirmar nueva contraseña", con validación en el frontend (si no coinciden, muestra "Las contraseñas no coinciden" antes de llamar al backend).

**Corrección de alcance:** el mismo criterio se había agregado solo al modal de "Restablecer Contraseña", pero no al modal de "Crear Nuevo Acceso" (que también pide una contraseña al dar de alta un miembro nuevo) — mismo riesgo de escribirla mal sin darse cuenta. Se agregó el mismo toggle de mostrar/ocultar y campo "Confirmar contraseña" (con su propio estado, `passwordConfirmarCrear`/`verPasswordCrear`, independiente del modal de reset) también ahí, con la misma validación de coincidencia antes de enviar al backend.

**Segunda corrección:** el campo "Confirmar contraseña" en ambos modales solo heredaba el `type` (text/password) del toggle de la contraseña principal, pero no tenía su propio ícono de ojo visible al lado — el usuario notó que el toggle debía estar en los dos campos, no solo en el primero. Agregado el mismo botón de mostrar/ocultar (compartiendo el mismo estado `verPassword`/`verPasswordCrear` que ya controla el campo principal, para que ambos campos cambien de visibilidad juntos) también en los campos de confirmación de ambos modales.

**Tercera corrección:** la validación de coincidencia solo se revisaba al enviar el formulario (mensaje de error después del clic) — el usuario pidió saber si coinciden mientras escribe, no solo al intentar guardar. Se agregó un indicador en tiempo real debajo del campo "Confirmar contraseña" en ambos modales: en cuanto ese campo tiene contenido, muestra "✓ Las contraseñas coinciden" (verde) o "✕ Las contraseñas no coinciden" (rojo), comparando directamente los dos valores del formulario sin esperar al submit.

### ✅ Análisis de permisos por rol (Fontanero/Tesorero) — Fontanero habilitado en /mapa (hecho 2026-09-19)
**Preguntas del usuario:** si el Fontanero solo tiene acceso al panel y a `/lecturas`, si debería tener acceso a `/asociados`, y si el Tesorero tiene el mismo acceso que el Admin del acueducto.

**Confirmado leyendo `auth.middleware.js` y las rutas del backend (no solo el sidebar, que es cosmético):**
- El control de acceso real vive en el backend, no solo en qué enlaces muestra el sidebar — `verifyAdmin` (rutas de crear/editar/eliminar suscriptores, generar facturación, cobrar, anular, reportes) excluye explícitamente `FONTANERO`; `verifyFontanero` (listar asociados, guardar lecturas) sí lo incluye. Aunque un Fontanero escribiera una URL administrativa a mano, el backend le devuelve 403.
- **Tesorero tiene exactamente el mismo acceso que `ADMIN_ACUEDUCTO`** — `verifyAdmin` los trata como el mismo nivel (`['ADMIN_ACUEDUCTO', 'TESORERO', 'SUPERADMIN']`), sin ninguna distinción de permisos entre ambos hoy.
- **Decisión tomada:** el Fontanero **no** necesita acceso a `/asociados` — ya tiene los datos que necesita en campo (nombre, cédula, vereda, matrícula, medidor) directamente en `/lecturas`, y `/asociados` incluye funciones administrativas (crear/editar/eliminar, carga Excel masiva) que no le corresponden.
- **Cambio aplicado:** el Fontanero sí debería tener acceso a `/mapa` para ayudarle a planear su recorrido visual por las veredas, complementando "Mi Ruta y Avance". Verificado que `MapaPage.jsx` y `SinUbicacionPage.jsx` solo hacen `GET /asociados` (ya permitido para Fontanero por `verifyFontanero`, sin necesitar ningún cambio de backend) — se agregó "Mapa GPS de Predios" al menú "MI TRABAJO" del sidebar, y las rutas `mapa`/`mapa/sin-ubicacion` en `App.jsx` cambiaron de `permitido={!esFontanero}` a `permitido={true}`.

**Decisión evaluada y descartada — restringir permisos del Tesorero:** el usuario planteó inicialmente que el Tesorero tuviera un nivel intermedio, sin poder eliminar suscriptores, cambiar tarifas (`/configuracion`), ni gestionar equipo (`/equipo`) o llaves Wompi (`/pagos-wompi`) — reservando esas 4 áreas solo al `ADMIN_ACUEDUCTO`. Al preguntar el alcance exacto (sin acceso total vs. solo lectura), el usuario decidió **no restringir nada**: "mejor dejemole todo los accesos". El Tesorero se queda exactamente como estaba — mismo nivel que `ADMIN_ACUEDUCTO` en todo (`verifyAdmin` los trata igual, sin distinción). No se tocó ningún código. Si en el futuro se retoma esta idea, el punto de partida técnico sería diferenciar `TESORERO` de `ADMIN_ACUEDUCTO` en `auth.middleware.js` (hoy tratados como un solo nivel dentro de `verifyAdmin`) y ocultar/bloquear en el frontend las 4 áreas mencionadas.

### ✅ Auditoría preventiva de "campos huérfanos" en todo el backend — 2 más encontrados y eliminados (hecho 2026-09-19)
**Contexto:** tras encontrar 3 bugs de este mismo patrón en la sesión (matrícula, estadoMoratorio no recalculado, y `montoRecargoMora`), el usuario preguntó explícitamente si había más bugs sin identificar, preocupado por perder tiempo cerca del final de la sesión. Se delegó a un subagente de solo-lectura una auditoría sistemática de `Acueducto.js`, `Asociado.js` y los modelos de configuración global: para cada campo que implica una regla o cálculo (no solo datos de identidad/display), verificar si algún controller/servicio/job realmente lo lee para cambiar el comportamiento del sistema, no solo si se valida y se guarda.

**Hallazgo 1 — crítico, mismo patrón que `montoRecargoMora`: `Asociado.tipoTarifa`** (enum `GENERAL`/`COMERCIAL`/`SUBSIDIADO`/`ADULTO_MAYOR`/`ESPECIAL`). Un admin podía marcar a un suscriptor como "SUBSIDIADO" o "ADULTO_MAYOR" esperando una tarifa reducida, pero `facturacion.service.js` **nunca leía ese campo** — solo obedece a `tarifaPersonalizada` (un monto manual completamente aparte). Se confirmó con grep en todo el proyecto (backend y frontend) que **ninguna pantalla de `web-admin` lo mostraba ni lo editaba** — el único `tipoTarifa` que sí usa el frontend es el de `Acueducto` (modalidad de cobro general: `TARIFA_FIJA`/`HIBRIDO`/`MEDIDOR`, campo distinto y sí conectado). Al no haber ninguna UI que dependiera de él, se **eliminó el campo completo** (modelo `Asociado.js` y su validador `asociados.validator.js`) en vez de implementar una regla de descuento inventada sin que el usuario definiera los porcentajes/montos exactos por categoría — decisión de negocio pendiente, no técnica.

**Hallazgo 2 — menor, campo muerto: `Acueducto.esPrimerAnoGratis`** (Boolean). Sin ninguna referencia en absoluto fuera de su propia declaración en el modelo — la lógica real del período de gracia ya vive completamente en los campos de fecha (`fechaVencimientoGratis`, `fechaVencimientoMembresia`), gestionados por `licencia.service.js`. Eliminado del modelo `Acueducto.js`.

**Nota:** eliminar un campo del schema de Mongoose no borra el dato ya guardado en documentos existentes en MongoDB (Mongo no impone el schema a nivel de base de datos) — simplemente deja de validarse/exponerse desde ahora. No se requirió ninguna migración de datos.

### ✅ Estimación de aporte por suscriptor agregada al toggle "Trasladar costo de licencia" en /configuracion (hecho 2026-09-19)
**Pregunta del usuario:** el toggle de trasladar el costo de la licencia SaaS a los asociados no era explícito sobre cuánto se le sumaría a cada suscriptor — solo mencionaba el costo total mensual dentro de una frase, sin desglosarlo por persona.

**Aclaración importante dada al usuario antes de implementar:** el valor que se le muestre al admin en esta pantalla es necesariamente una **estimación**, no el monto exacto que pagará cada suscriptor — el cálculo real (`calcularRecargoLicenciaPorAsociado` en `facturacion.service.js`) se recalcula cada mes con el número de asociados activos *en el momento de facturar*, no con el conteo de hoy. El usuario confirmó que el valor real por suscriptor sí aparece en el ticket impreso que se le entrega (`FacturacionPage.jsx`, línea "Aporte Plataforma AquaRural: $X COP"), y que la app del suscriptor donde vería esto digitalmente aún no existe (pendiente en la sección App Móvil).

**Solución:** se agregó una tarjeta informativa que aparece solo cuando el toggle está activo, mostrando "Estimado hoy: cada suscriptor pagaría $X COP/mes adicionales... con tus N suscriptores activos actuales", calculado con el mismo conteo real de asociados (`GET /asociados`, `limit=1`, solo para el `total`) y la misma fórmula que usa el backend (costo mensualizado ÷ total de asociados). Se etiquetó explícitamente como proyección, aclarando que el monto real de cada factura puede variar según cuántos suscriptores haya en el momento exacto de facturar — para no generar una expectativa de cifra fija que después no coincida con la factura real.

### ✅ Badge "Pendiente" en el sidebar cuando falta configurar tarifas reales (hecho 2026-09-19)
**Pregunta del usuario:** `/configuracion` es la base de todo el proceso de facturación del acueducto — sin tarifas reales configuradas, nada del resto del sistema puede operar correctamente aunque las demás pantallas "funcionen". Pidió una señal visual en el sidebar (ej. color rojo) para que el admin la complete primero, antes de usar el resto del panel.

**Criterio definido:** se considera "configuración pendiente" cuando la modalidad de cobro activa (`tipoTarifa`) depende de un monto que sigue en su valor por defecto (0, nunca tocado por el admin):
- `TARIFA_FIJA` o `HIBRIDO` sin `tarifaBaseMensual` configurada.
- `MEDIDOR` o `HIBRIDO` sin `cargoFijoMensual` **ni** `valorMetroCubico` configurados.

No se usó identidad (nombre/NIT, ya fijados por SuperAdmin) ni Wompi (sección aparte) como criterio — solo lo que controla `/configuracion` en sí, que es lo que el usuario pidió resaltar.

**Implementación:** en `Sidebar.jsx`, el ítem "Configuración Acueducto" ahora recibe un flag `alerta` calculado desde el `useConfigStore` (ya cargado globalmente al iniciar sesión en `App.jsx`, sin necesidad de un fetch propio del sidebar). Cuando está pendiente:
- Un punto rojo sobre el ícono (visible también con el sidebar colapsado).
- Una etiqueta "Pendiente" en rojo junto al nombre del ítem (sidebar expandido).
- El `title` del enlace (tooltip al colapsar) incluye "— Configuración pendiente" para que no se pierda la señal al minimizar el menú.

No se implementó redirección forzosa ni bloqueo del resto del panel — se decidió una señal visible pero no invasiva, dejando la decisión de cuándo completarlo al propio admin.

### ✅ PagosWompiPage.jsx (`/pagos-wompi`) migrado a tema claro + #1D4ED8, sin cambios funcionales (hecho 2026-09-19)
**Contexto:** a diferencia de otras páginas migradas, esta ya tenía una lógica sólida sin bugs funcionales evidentes: gate de contraseña antes de mostrar las llaves (`verificar-password`), llaves sensibles cifradas AES-256-GCM en el backend, y el patrón correcto de "dejar en blanco para no sobreescribir" en los campos de llave privada/secretos — no se tocó nada de esa lógica.

**Migrado:** ambas pantallas (el gate de contraseña y el formulario de llaves una vez desbloqueado) de `slate-900`/`cyan-*` a `bg-white`/`#1D4ED8`, consistente con el resto del panel. Se agregó un ícono `enhanced_encryption` junto al texto "Cifrado AES-256-GCM" (antes solo texto plano) para reforzar visualmente que es información de seguridad, siguiendo la convención de íconos ya usada en el resto del panel migrado.

**Confirmado limpio (no orphaned), para referencia futura:** `tipoTarifa`/`tarifaBaseMensual`/`cargoFijoMensual`/`valorMetroCubico`/`consumoBasicoIncluido`/`diaLimitePago`/`trasladarCostoLicenciaAsociados`/`costoSaaSVigente`/`frecuenciaPagoSaaS` de `Acueducto` (todos usados en `facturacion.service.js`), `wompiSandbox` (usado en `pagos.controller.js`), `estadoPagoSaaS`/fechas de licencia (usados en `licencia.service.js`), y de `Asociado`: `tarifaPersonalizada`, `estadoMoratorio`, `estadoServicio`, `tokenFCM` (usado en `eventos.controller.js` para push).

### ✅ FontaneroDashboardPage.jsx (`/mi-ruta`) migrado a tema claro + #1D4ED8, sin cambios funcionales (hecho 2026-09-19)
**Contexto:** vista de inicio del Fontanero ("Mi Ruta y Avance de Campo"), consumiendo `GET /asociados/estadisticas-lecturas` (mismo endpoint ya validado en `LecturasPage.jsx`). Se confirmó en el backend (`asociados.controller.js`, función `estadisticasLecturas`) que `prediosPendientes` sí incluye `latitud`/`longitud` por predio, sin discrepancias con lo que el frontend espera — no había ningún bug de datos que corregir.

**Nota técnica sin acción tomada:** esta página usa `react-leaflet` (componentes declarativos `<MapContainer>`/`<Marker>`), mientras `MapaPage.jsx`/`SinUbicacionPage.jsx` usan Leaflet imperativo directo (`window.L`, manejo manual del ciclo de vida del mapa) — dos formas distintas de integrar el mismo mapa en el mismo proyecto. No se unificó en esta pasada por no ser un bug, solo una inconsistencia técnica menor; señalado para si se retoma en el futuro.

**Nota de comportamiento explicada al usuario:** el cálculo de "avance" aquí (`enPeriodoVigente`, solo con `fechaUltimaLectura` ya guardada) es más simple que el de `LecturasPage.jsx` (que también cuenta lecturas editadas en la sesión actual aún sin guardar) — son dos páginas con propósitos distintos (estado oficial guardado vs. trabajo en curso), así que sus porcentajes de avance pueden no coincidir en tiempo real mientras el fontanero está digitando sin haber guardado todavía. No requiere corrección, es el comportamiento esperado.

**Migrado:** header, 4 tarjetas de métricas, contenedor del mapa y su estado vacío, y la lista de "Pendientes sin coordenadas GPS" — de `slate-900`/`cyan-*` a `bg-white`/`#1D4ED8`, consistente con el resto del panel.

### ✅ ExpedientePage.jsx (`/asociados/:id`) migrado a tema claro + #1D4ED8, última página de la lista original (hecho 2026-09-19)
**Contexto:** ficha detallada de un suscriptor individual (accesible al dar clic en un nombre desde `/asociados`) — header con avatar/estado, "Información General", "Ubicación de Predio" (con enlace a Google Maps si tiene GPS), "Historial de Facturas" (últimas 12) e "Historial de Consumo" (solo si tiene medidor). Trae datos reales de 3 endpoints vía React Query (`/asociados/:id`, `/facturas`, `/asociados/:id/historial-consumo`) — sin bugs funcionales encontrados, la lógica de datos ya era correcta.

**Migrado:** header, ambas secciones de la columna lateral, y ambas tablas de historial — de `slate-900`/`cyan-*` a `bg-white`/`#1D4ED8`, consistente con el resto del panel. El badge de estado (`ESTADO_MAP`) se ajustó de fondos semitransparentes de colores intensos a `bg-{color}-500 text-white` sólido, legible sobre el nuevo fondo blanco del avatar.

**Con esta página se completa la migración visual de todas las páginas del panel Admin identificadas en la auditoría original** (Dashboard, Suscriptores, Lecturas, Facturación, Reportes, Mapa, Eventos, Licencia, Configuración, Mi Cuenta, Pagos Wompi, Equipo, FontaneroDashboard, Expediente) — no quedan páginas pendientes de esa lista.

**Ajuste pedido por el usuario:** la tabla "Historial de Facturas" se veía con demasiado espacio en blanco — con `w-full`, las 4 columnas (Periodo, Código, Monto, Estado) se estiraban a ocupar todo el ancho de la tarjeta (`col-span-8` del grid), aunque con pocas facturas el contenido real es corto. Primer intento con `<colgroup>` de anchos fijos por columna resultó peor (la columna sin ancho fijo, "Código", terminó absorbiendo todo el espacio sobrante y quedando desproporcionadamente ancha con solo 2 registros de prueba). Corregido de raíz: la tabla pasó de `w-full` a `w-auto` (se ajusta a su contenido real, no fuerza el ancho de la tarjeta) y "Estado" pasó de `text-right` a alineado a la izquierda junto a las demás — las 4 columnas quedan compactas y agrupadas, con el espacio sobrante como un solo bloque vacío a la derecha en vez de repartido entre columnas.

**Segundo ajuste, mismo hallazgo (contenedor, no solo la tabla):** la propia tarjeta (`<section>`) tenía `h-full`, forzándola a estirarse verticalmente hasta igualar la altura de la columna vecina izquierda (Información General + Ubicación de Predio) dentro del mismo grid — con pocas facturas, eso dejaba un vacío grande dentro de la tarjeta blanca, no solo en la tabla. Quitado `h-full`, la tarjeta ahora se ajusta a la altura de su propio contenido.

**Tercer ajuste — causa raíz real, no la tabla sino el layout:** el ancho excesivo no era de la tabla en sí, sino de la **columna del grid** que la contiene: `grid-cols-12` con `col-span-8` fijo para Facturas (y `col-span-4` para la columna izquierda), sin importar cuántas facturas hubiera. Cambiada la proporción de 4/8 a 5/7 — la columna izquierda (Información General + Ubicación) gana algo de espacio, y la de Facturas se angosta, quedando mejor balanceada con pocos registros sin perjudicar el caso de muchas facturas.

### ✅ Bug crítico introducido en la reescritura de SuscriptoresPage.jsx: editar cualquier suscriptor con medidor reseteaba su lectura a 0 (hecho 2026-09-19)
**Cómo se encontró:** el fontanero notó que "Pedro Medidor Nuevo" (con 8 m³ de consumo real registrados el día anterior) apareció con `lecturaActual: 0` sin que nadie tocara Lecturas ese día.

**Causa raíz:** `abrirModalEditar` en `SuscriptoresPage.jsx` seteaba `esMedidorNuevo: 'SI'` de forma fija, sin importar si el medidor del suscriptor ya existía desde antes. Como consecuencia, en `handleGuardarSuscriptor`, la condición `esNuevoBool ? 0 : Number(form.lecturaInicialArranque)` siempre tomaba la rama `0` al **editar** — es decir, **cualquier edición de un suscriptor con medidor (aunque solo se cambiara el teléfono o el nombre) reseteaba su `lecturaActual` y `lecturaAnterior` a 0**, borrando el consumo real acumulado. Esto pasó con Pedro mientras se probaban los nuevos filtros de `/lecturas` en la misma sesión — probablemente se abrió y guardó su edición sin querer, o el flujo de prueba lo disparó indirectamente.

**Corrección:** al editar (no al crear), `esMedidorNuevo` ahora siempre es `'NO'` y `lecturaInicialArranque` se precarga con `s.lecturaActual` real (antes usaba `s.lecturaAnterior`, dato incorrecto también) — un medidor que ya existía nunca se trata como nuevo, así que su lectura real se preserva salvo que el admin la cambie a mano explícitamente. El campo `esMedidorNuevo: 'SI'` fijo solo sigue siendo correcto en `abrirModalCrear` (dar de alta un suscriptor nuevo).

**Dato de prueba restaurado:** `lecturaActual` de Pedro vuelto a `8` (el valor real, confirmado contra `LecturaHistorica` del periodo 2026-09, que sí quedó bien guardado — el bug solo afectó el campo denormalizado en `Asociado`, no el historial).

### ✅ LecturasPage.jsx (`/lecturas`) migrado, sin bugs funcionales encontrados en la lógica original (hecho 2026-09-19)
- Lógica de negocio ya era correcta (sin `localStorage`, sin errores silenciosos) — solo migración visual + rediseño de tabla a pedido:
  - Alineación consistente: texto a la izquierda, números a la izquierda (no centrado ni mixto).
  - Celda de "Lectura Actual" simplificada: se quitó el badge apilado bajo el input (ocupaba más alto que el resto de la fila) — el estado (bloqueada/inconsistente) ahora se comunica con el color del borde del input + `title` (tooltip).
  - Reducido el uso de `font-mono` a solo cifras (antes también estaba en textos libres como vereda/matrícula juntos).
  - Se agregó una columna "Estado" nueva (Tomada / Facturada / Pendiente) a pedido, para no depender solo del tooltip oculto.
  - Se separaron en columnas propias: Suscriptor, Cédula, Vereda, Matrícula (antes combinados en una sola celda con 2 líneas) — mismo criterio "una columna por dato" ya aplicado en Suscriptores.
  - Vereda con `whitespace-nowrap` para que nunca se parta en dos líneas.
- **Filtros agregados a pedido (2026-09-19):** botones "Todos / Con Medidor / Sin Medidor" al lado del buscador — deja al fontanero filtrar directo a quién sí debe leer en campo (con medidor, incluidos los medidores nuevos con lectura en 0) de quién ya se factura por tarifa fija sin depender de lectura (sin medidor). Mismo patrón visual de botones tipo pill ya usado en `SuscriptoresPage.jsx`. De paso se corrigió la flecha nativa (inconsistente) de los `<select>` de "Ordenar" y "Vereda", reemplazada por el ícono custom `unfold_more` ya usado en Suscriptores.

### ✅ FacturacionPage.jsx (`/facturacion`) migrado, sin bugs funcionales encontrados; ajustes de layout del header (hecho 2026-09-19)
- Migración visual completa a claro + `#1D4ED8`, tabla al patrón SuperAdmin con `<colgroup>`.
- **Excepción intencional preservada:** los 2 modales de impresión térmica (ticket individual 80mm y lote masivo) se dejaron en blanco/negro fijo — nunca deben seguir el tema del panel, son para imprimir en papel.
- Header comprimido de 2 filas (título+subtítulo arriba, botones abajo con línea divisoria) a 1 sola fila (título a la izquierda, botones a la derecha) en pantallas anchas — a pedido, por ocupar demasiado espacio vertical.
- El botón destructivo "Anular Periodo" se separó con margen extra + una línea divisoria vertical del botón principal "Emitir Facturación", para reducir el riesgo de clic equivocado entre ambos.
- **Verificado en producción (no solo código):** se probó el botón "Cobrar Efectivo" contra el backend real, incluyendo cobrar 3 facturas distintas seguidas (Carlos, María, Pedro) — las 3 quedaron `PAGADA` con `metodoPago: EFECTIVO_OFICINA` y `fechaPago` correctos, y un intento de doble cobro sobre la misma factura se rechaza con 409 como se espera.

## Pagos y Wompi

### ✅ Bug: badge "Estado Pago" en SuperAdmin ignoraba el pago SaaS ya realizado (hecho 2026-09-19)
**Cómo se encontró:** después de probar el cobro SaaS end-to-end (factura marcada `PAGADO`, `estadoPagoSaaS: 'AL_DIA'` en la BD — ver ítem de abajo), el panel de SuperAdmin (`/superadmin/acueductos`) seguía mostrando el acueducto de prueba con el badge **"⏳ PENDIENTE"**, contradiciendo el dato real guardado.

**Causa raíz:** tanto `web-admin/src/pages/SuperAdmin/AcueductosPage.jsx` (columna "Estado Pago" de la tabla) como `EditarAcueductoPage.jsx` (sección "Estado de la Suscripción SaaS") calculaban si el acueducto estaba vencido comparando la fecha de hoy **solo contra `fechaVencimientoGratis`** — el campo que registra cuándo terminó el mes gratis inicial. Ese campo queda congelado para siempre en esa fecha una vez que pasa (en este caso, `2025-07-19`, hace más de un año), sin importar que después el acueducto haya pagado y tenga una `fechaVencimientoMembresia` real y vigente (`2028-08-13` en la prueba). Resultado: **cualquier acueducto que ya hubiera pagado al menos una vez aparecía "PENDIENTE" para siempre**, independientemente de `estadoPagoSaaS`.

**Corrección aplicada:** en ambos archivos, la fecha de vencimiento a comparar ahora es condicional: si `estadoPagoSaaS === 'AL_DIA'` y existe `fechaVencimientoMembresia`, se usa esa; si no (aún en mes gratis, nunca ha pagado), se sigue usando `fechaVencimientoGratis` como antes. `EditarAcueductoPage.jsx` además no cargaba `fechaVencimientoMembresia` en el estado del formulario — se agregó.

**Verificado:** `npx vite build` compila sin errores; el cambio se refleja vía HMR de Vite sin necesidad de reiniciar el dev server.

### ✅ Ciclo completo de cobro de AGUA probado end-to-end con Wompi real, en los 3 escenarios de facturación (hecho 2026-09-19)
Primera prueba real del cobro de agua (acueducto→suscriptor) contra la infraestructura de Wompi, cubriendo los 3 casos posibles de facturación por medidor en un acueducto `HIBRIDO`.

**Aclaración importante del mecanismo de facturación descubierta en el camino (no era un bug, es diseño correcto):** un suscriptor con medidor real (`MEDIDOR` o `HIBRIDO` con medidor) **no puede facturarse** en un periodo sin que el fontanero registre la lectura de ese mes primero (`facturacion.service.js` — `requiereLecturaVigente` + `tieneLecturaDelPeriodo`). El cron mensual (`estado.job.js`, día 1 a las 7 AM) los salta silenciosamente (`sinLectura`) si falta la lectura — nunca los factura con datos viejos ni con error. Solo los suscriptores sin medidor (tarifa fija) se facturan automáticamente sin depender de nada más.

**Los 3 escenarios probados:**
1. **Sin medidor** (tarifa fija) — María y Carlos (`numeroMedidor: 'S/N'`), facturados directo en la corrida masiva de septiembre sin necesitar ninguna lectura. $15.000 cada uno.
2. **Medidor viejo** (suscriptor que ya venía siendo facturado por consumo) — Juan (`MED-4521`, con lectura de agosto ya registrada). Se le registró una nueva lectura de septiembre vía `POST /asociados/lecturas-masivas` (rol Fontanero) subiendo de 60 a 75 m³, y se facturó correctamente: 15 m³ de consumo, $37.500.
3. **Medidor nuevo** (alta con medidor recién instalado) — se creó un suscriptor de prueba ("Pedro Medidor Nuevo") vía `POST /asociados` con `lecturaAnterior: 0, lecturaActual: 0` (medidor en cero al instalarse), se le registró su primera lectura real (8 m³) como fontanero, y se facturó correctamente desde su primer mes ($20.000) — confirma en un caso real que el fix de pérdida de `lecturaAnterior`/`lecturaActual` (ver más abajo) funciona de punta a punta.

**Pago real con Wompi (solo probado para el escenario 2, representativo del resto):**
- Llaves Wompi cargadas en el acueducto de prueba vía `PATCH /configuracion` (ver sección "Llaves Wompi cargables desde Configuración" más abajo) — **decisión consciente:** se reutilizaron las mismas llaves sandbox de MetaDevelopment (plataforma) por no tener a mano un segundo set de una cuenta distinta. No representa el caso real de producción (cada acueducto tendría su propia cuenta Wompi), pero **no se considera necesario repetir la prueba con otra cuenta**: el código lee las llaves de `req.acueducto` (flujo agua) vs. `env.WOMPI_PLATAFORMA_*` (flujo SaaS) en controllers completamente separados (`pagos.controller.js` vs `superadmin.controller.js`), sin ningún acoplamiento entre ambos — de qué cuenta Wompi provengan las llaves es irrelevante para la lógica, ya validada.
- Túnel ngrok reutilizado (mismo de la prueba SaaS), URL de eventos del panel de Wompi actualizada a `https://<url-ngrok>/facturas/webhook-wompi`.
- Checkout real generado vía `POST /pagos/iniciar` (usa las llaves propias del acueducto vía `req.acueducto`, no las de plataforma — confirma que el código sí diferencia ambos flujos aunque las llaves de prueba coincidieran) — $37.500 COP, firma de integridad válida.
- Pago completado en sandbox con datos de tarjeta de prueba — aprobado.
- **Verificado en la BD que el webhook llegó y procesó correctamente sin intervención manual:** la `Factura` de Juan pasó de `PENDIENTE` a `PAGADA` (con `metodoPago: 'WOMPI'`, `wompiTransactionId` y `fechaPago` registrados).

**Decisión:** se dejaron los datos de esta prueba en la BD de desarrollo tal cual (factura de Juan pagada, suscriptor "Pedro Medidor Nuevo" creado, lectura de septiembre de Juan registrada) — sirven como evidencia de que los 3 escenarios funcionan.

## Notificaciones Push (Firebase Cloud Messaging)

### ✅ Proyecto Firebase creado y push conectado al crear un Evento (hecho 2026-09-18)
Julián creó el proyecto real en Firebase Console (`aquarural-64ec7`), habilitó Cloud Messaging y generó la cuenta de servicio, pasando las credenciales del JSON descargado.

**Backend:**
- `backend/.env` — agregadas `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY` (con los `\n` literales del JSON, convertidos a saltos reales en el código) y `FIREBASE_CLIENT_EMAIL` con los valores reales. Agregados los mismos 3 campos vacíos a `.env.example` para documentar el contrato sin exponer secretos.
- `backend/src/config/env.js` — las 3 variables agregadas al schema de Zod como opcionales (si faltan, el sistema sigue funcionando sin push, no lo bloquea).
- `npm install firebase-admin` (SDK v13+, API modular: `admin.cert()`/`admin.initializeApp()` en el root del paquete, pero `getMessaging()` debe importarse del submódulo `firebase-admin/messaging` — `admin.messaging()` ya no existe en esta versión, tuvo que corregirse tras un primer intento fallido).
- `backend/src/services/firebase.service.js` (nuevo) — inicializa el SDK Admin solo si las 3 credenciales están presentes; si no, `enviarPushATokens` es un no-op silencioso que nunca lanza ni bloquea. Expone `enviarPushATokens(tokens, {titulo, cuerpo, data})` y `firebaseHabilitado()`.
- `backend/src/models/Asociado.js` — agregado el campo `tokenFCM` (string, default vacío), a llenar cuando `mobile-app` tenga login de suscriptores (ver Pendiente).
- `backend/src/controllers/eventos.controller.js` — al **crear** un evento (no al editar, para no spamear por correcciones menores), se busca a todos los asociados del acueducto con `tokenFCM` no vacío y se les envía push con título/cuerpo del evento.

**Verificado de punta a punta con las credenciales reales:**
- `firebaseHabilitado()` devuelve `true` con las credenciales cargadas.
- Envío de prueba a un token FCM inventado: llega hasta la API de Firebase y falla del lado esperado (token inválido), sin lanzar excepción — confirma que el pipeline completo (backend → Firebase) funciona, solo falta un token real de un dispositivo.
- Backend completo arrancado con las variables reales, sin errores de inicialización.
- Creado un evento de prueba con un asociado con `tokenFCM` falso asignado temporalmente: el evento se creó correctamente (201) y el intento de push no afectó la respuesta ni generó errores en el log.
- Entorno restaurado sin dejar el evento de prueba, el `tokenFCM` falso, ni cambios de contraseña.

**Pendiente (no de código backend):** falta el lado de `mobile-app` (registrar el token real del dispositivo, y su propia pantalla de Eventos) — ver sección Pendiente, bajo la revisión general de `mobile-app`.

## Pagos y Wompi

### ✅ Índice único parcial en `referenciaWompi` (hecho 2026-09-18)
Se agregó `unique: true` con `partialFilterExpression: { referenciaWompi: { $gt: '' } }` en `backend/src/models/Factura.js`, como defensa adicional para que dos facturas nunca puedan compartir la misma referencia de pago. El riesgo real era bajo (la referencia se genera con el `_id` de MongoDB, único por diseño), pero esto lo garantiza también a nivel de base de datos. Ya sincronizado contra la BD local.

### ✅ Llaves Wompi cargables desde Configuración del propio acueducto (hecho 2026-09-18)
Se agregó la sección "Pasarela de Pagos Wompi" a `web-admin/src/pages/Configuracion/ConfiguracionPage.jsx`, con los 4 campos (public key, private key, events secret, integrity secret) + toggle de sandbox, mismo patrón visual que ya existía en `EditarAcueductoPage.jsx` (SuperAdmin).

**Backend:**
- `backend/src/validators/configuracion.validator.js` — se agregaron los 5 campos Wompi como opcionales a `actualizarConfiguracionSchema` (antes los descartaba Zod en modo strip, mismo patrón de bug de siempre).
- `backend/src/controllers/configuracion.controller.js` — se agregó `construirCamposWompi()` (idéntico patrón al ya usado en `superadmin.controller.js`), que cifra `wompiPrivateKey`/`wompiEventsSecret`/`wompiIntegritySecret` con AES-256-GCM (`encryption.service.js`) antes de guardarlos, y solo incluye un campo si viene en el body (edición parcial: dejar en blanco = mantener la llave actual, nunca se sobreescribe con vacío).

**Frontend:** los 3 campos sensibles siempre llegan vacíos desde el backend (nunca se exponen ya cifrados, `Acueducto.js` los borra en `toJSON`) y solo se envían en el PATCH si el admin escribió algo nuevo.

**Verificado de punta a punta contra la BD local:** login como admin de prueba → PATCH con llaves de prueba → confirmado en Mongo que quedaron cifradas (no en texto plano) y que descifran correctamente → confirmado que un PATCH posterior sin enviar las llaves (ej. solo cambiar teléfono) **no** las borra ni las sobreescribe. Entorno restaurado sin dejar rastros de la prueba (llaves de prueba removidas, teléfono y contraseña del admin de prueba revertidos).

**✅ Actualizado (2026-09-18): las llaves se movieron a una sección aparte con gate de contraseña, fuera de Configuración.**
Decisión del usuario: las llaves Wompi son credenciales de dinero que casi nunca cambian (alta inicial o rotación de seguridad), a diferencia de tarifas/contacto que se editan seguido — no debían compartir el mismo formulario largo de Configuración, donde un cambio accidental es más fácil.

- **Backend:** nuevo endpoint `POST /auth/verificar-password` (`backend/src/controllers/auth.controller.js` + `routes/auth.routes.js` + `validators/auth.validator.js`) — solo confirma la contraseña del admin autenticado (compara con bcrypt), no cambia nada. Reutiliza `PATCH /configuracion` ya existente para guardar las llaves (mismo contrato, sin cambios adicionales de backend).
- **Frontend:** nueva página `web-admin/src/pages/PagosWompi/PagosWompiPage.jsx`, con dos pasos: (1) pantalla de bloqueo que pide la contraseña actual y la valida contra el nuevo endpoint, (2) una vez desbloqueada, el mismo formulario de las 4 llaves + toggle sandbox (movido tal cual desde `ConfiguracionPage.jsx`, que ya no lo tiene). Nueva ruta `/pagos-wompi` en `App.jsx` y entrada "Pasarela de Pagos Wompi" en el sidebar (`Sidebar.jsx`), bajo el grupo CUENTA junto a Configuración.
- El desbloqueo es solo de sesión (estado de React, `desbloqueado`) — no persiste entre recargas de página, así que cada vez que se entra a la sección hay que volver a confirmar la contraseña.

**Verificado:** backend arranca sin errores; `POST /auth/verificar-password` probado contra el backend real con contraseña correcta (200, verificada), incorrecta (401, rechazada) y sin token (401, no autenticado); `npx vite build` en `web-admin` compila sin errores.

**✅ Decisión tomada y aplicada (2026-09-18): se retiró por completo el bloque de llaves Wompi de SuperAdmin.** Ya no es su responsabilidad — cada acueducto la gestiona 100% desde su propia Configuración. Cambios:
- `web-admin/src/pages/SuperAdmin/NuevoAcueductoPage.jsx` y `EditarAcueductoPage.jsx` — quitada la sección visual "Pasarela de Pagos Wompi" y los campos `wompiPublicKey/PrivateKey/EventsSecret/IntegritySecret/Sandbox` del estado del form y del payload enviado (`EditarAcueductoPage.jsx` solo tenía inputs para Public/Private Key, nunca llegó a tener Events/Integrity Secret — quedaban como código muerto).
- `backend/src/controllers/superadmin.controller.js` — eliminado el helper `construirCamposWompi` y su uso en `crearAcueducto`/`actualizarAcueducto`; eliminado el import de `encryption.service` (ya sin uso en este archivo).
- `backend/src/validators/superadmin.validator.js` — eliminados los 5 campos Wompi de `crearAcueductoSchema` (heredaban a `actualizarAcueductoSchema` vía `.partial()`).
- **Verificado:** backend arranca sin errores, el schema ahora descarta `wompiPublicKey` si se envía (ya no es un campo válido), `npx vite build` en `web-admin` compila sin errores.

### ✅ Cobro SaaS con Wompi desde SuperAdmin (hecho 2026-09-18)
Decisión tomada: mantener las 3 formas de cobro de membresía SaaS (Wompi automático + WhatsApp manual + marcar como pagado), ya que son complementarias, no redundantes. Se implementó el endpoint real que faltaba:

- `POST /superadmin/pago-saas/iniciar` — crea/reutiliza la `FacturaSaaS` `PENDIENTE` del ciclo vigente (mismo cálculo de plan/monto/periodo que ya usaba `confirmarPagoSaaS` en `configuracion.controller.js`), genera la firma real de checkout con las **llaves de PLATAFORMA** (`WOMPI_PLATAFORMA_*`, distintas de las llaves propias de cada acueducto) y devuelve la URL real de Wompi.
- `POST /superadmin/pago-saas/webhook` (público, verificado por firma HMAC con `WOMPI_PLATAFORMA_EVENTS_SECRET`) — cuando Wompi confirma el pago, marca la `FacturaSaaS` como `PAGADO` y actualiza el `Acueducto` (`estadoPagoSaaS: 'AL_DIA'`, nueva `fechaVencimientoMembresia`, plan/costo vigente).
- `AcueductosPage.jsx` (`handlePagarConWompiSaaS`) ya no tiene el fallback que fabricaba una URL de pago falsa sin registrar nada — ahora usa la URL real que devuelve el backend, y si algo falla muestra el error real en vez de fingir éxito.
- Llaves sandbox de Wompi de MetaDevelopment ya cargadas en `backend/.env` (`WOMPI_PLATAFORMA_SANDBOX=true`). Probado de punta a punta contra la BD local: genera el checkout real y crea la `FacturaSaaS` `PENDIENTE` correctamente.

### ✅ Ciclo completo de cobro SaaS probado end-to-end con Wompi real (hecho 2026-09-19)
Primera prueba real del sistema contra la infraestructura de Wompi (no solo generación de checkout, sino el pago completo y el webhook de vuelta).

**Herramienta usada — ngrok:** se instaló y configuró con cuenta real (`ngrok config add-authtoken`, dashboard de ngrok creado por el usuario). El túnel expone `localhost:3000` con una URL pública HTTPS temporal (`ngrok http 3000`), tomada de `http://127.0.0.1:4040/api/tunnels`. Confirmado: sin cuenta autenticada el túnel es inestable/efímero, con cuenta queda respaldado de forma confiable.

**Pasos ejecutados:**
1. Backend local levantado + túnel ngrok activo, verificado que `https://<url-ngrok>/health` respondía correctamente.
2. Usuario configuró en el panel de Wompi (cuenta MetaDevelopment, modo sandbox activado) la **URL de Eventos** = `https://<url-ngrok>/superadmin/pago-saas/webhook`.
3. Generado el checkout real vía `POST /superadmin/pago-saas/iniciar` (a través del túnel, simulando exactamente el flujo de producción) para el acueducto de prueba "Acueducto La Argentina" — devolvió una URL real de `checkout.wompi.co` con firma de integridad válida, por $600.000 COP (plan MANANTIAL anual).
4. Usuario completó el pago en el checkout de Wompi con datos de tarjeta de prueba (sandbox) — aprobado, con comprobante descargable.
5. **Verificado en la BD que el webhook llegó y procesó correctamente sin intervención manual:** `FacturaSaaS` pasó de `PENDIENTE` a `PAGADO` (con `metodoPago: 'WOMPI'` y `fechaPago` registrada), y el `Acueducto` se actualizó (`estadoPagoSaaS: 'AL_DIA'`, `costoSaaSVigente: 600000`, `fechaVencimientoMembresia` avanzada al siguiente ciclo).

**Decisión:** se dejaron los datos de esta prueba en la BD de desarrollo tal cual (factura PAGADO, acueducto con membresía al día) — sirven como evidencia de que el ciclo funciona, no afectan nada más del sistema.

**Pendiente relacionado (no de este ítem):** el cobro de **agua** (acueducto→suscriptor) usa un webhook y llaves distintas — sigue sin probarse end-to-end, ver sección Pendiente arriba. El mismo túnel ngrok ya configurado sirve para repetir el procedimiento.

## Bugs encontrados en la auditoría de endpoints (2026-09-18)

### ✅ Pérdida silenciosa de `lecturaAnterior`/`lecturaActual` al registrar un suscriptor con medidor ya en uso (hecho 2026-09-18)
**El bug real, acotado:** en `web-admin/src/pages/Suscriptores/SuscriptoresPage.jsx` (líneas ~147-178), cuando el usuario marca que el suscriptor **ya tiene un medidor existente** (no nuevo), el formulario pide la lectura con la que ese medidor "arranca" en el sistema (`lecturaInicialArranque`) y la usa como base para `lecturaAnterior` y `lecturaActual` en el payload. El modelo `Asociado.js` sí tiene esos dos campos (`lecturaAnterior`, `lecturaActual`, con default `0`) — pero `crearAsociadoSchema` (`backend/src/validators/asociados.validator.js`) no los declaraba, así que Zod los descartaba antes de que Mongoose los recibiera (modo *strip* por defecto, mismo patrón que el bug histórico de `estado` en acueductos, ya corregido antes).
**Impacto real (antes de corregir):** todo suscriptor con medidor ya en uso se guardaba con `lecturaAnterior: 0, lecturaActual: 0` (el default), como si el medidor fuera nuevo. En la primera facturación, el sistema habría calculado el consumo desde 0 en vez de desde la lectura real de arranque — cobrando de más (todo lo que el medidor ya traía acumulado).
**Corrección aplicada:** se agregó `lecturaAnterior: z.number().nonnegative().optional()` y `lecturaActual: z.number().nonnegative().optional()` a `crearAsociadoSchema` en `backend/src/validators/asociados.validator.js`. `actualizarAsociadoSchema` los hereda automáticamente (es `crearAsociadoSchema.partial().extend({...})`), sin cambio adicional.
**Verificado:** probado el validator de forma aislada — con lecturas ahora sobreviven la validación (antes se perdían), sin lecturas (medidor nuevo) sigue funcionando igual que antes, sin romper nada.

**Aclaración — esto NO es un bug (se revisó y son campos legítimamente distintos):**
- `estadoServicio` (`ACTIVO`/`SUSPENDIDO`/`CORTE_PROGRAMADO`) = si el suscriptor tiene el servicio de agua operativo o no. Es técnico/operativo.
- `estadoMoratorio` (`AL_DIA`/`EN_MORA`/`INACTIVO`) = si está al día con sus pagos. Es financiero.
No son "dos conceptos de estado desalineados" — son dos campos distintos a propósito, cada uno con su enum propio en el modelo.

### ✅ Confirmado (2026-09-18): `estadoMoratorio` es correcto tal como está — 100% automático, no se edita manualmente
Existe `backend/src/jobs/estado.job.js`, un cron diario (6:00 AM hora Colombia) que:
1. Pasa a `VENCIDA` toda factura `PENDIENTE` cuya `fechaVencimiento` ya pasó.
2. Recalcula `estadoMoratorio` de cada suscriptor según sus facturas `VENCIDA`: 0 → `AL_DIA`, 1-2 → `EN_MORA`, 3+ → `INACTIVO`.

Esto es exactamente la regla de negocio esperada: el suscriptor pasa a mora automáticamente al vencerse una factura sin pagar, y vuelve a `AL_DIA` en el siguiente ciclo del cron una vez que el pago se registre (por webhook de Wompi o pago en efectivo) y ya no tenga facturas vencidas. `asociados.controller.js` solo usa `estadoMoratorio` como filtro de lectura (`GET /asociados?estadoMoratorio=...`), nunca lo escribe manualmente — correcto, no hay que agregarlo al formulario de alta/edición. **No se toca.**

### ✅ Páginas rotas — resuelto (2026-09-18): Eventos, Reportes y Mapa activados; Noticias eliminado
Confirmado en `Sidebar.jsx`: Eventos, Noticias, Reportes y Mapa GPS estaban en el menú del **Admin de cada acueducto** (junta/tesorero), no en el de SuperAdmin. Decisiones de producto aplicadas:

- **✅ Eventos — CRUD activado (hecho 2026-09-18); push conectado (hecho 2026-09-18, ver sección "Notificaciones Push" más arriba).** Decisión de alcance: construir el CRUD completo primero, dejar las notificaciones push como paso posterior — ya completado una vez Julián creó el proyecto de Firebase.
  - Backend nuevo: `backend/src/models/Evento.js` (multi-tenant con `acueductoId`, campos `titulo/tipo/fecha/hora/lugar/descripcion/estado`, y `respuestasRSVP` como `Map` vacío listo para cuando exista login de suscriptores en `mobile-app`), `validators/eventos.validator.js`, `controllers/eventos.controller.js` (listar/crear/actualizar/eliminar, todo scoped por `acueductoId`), `routes/eventos.routes.js` (mismo patrón de protección que `/equipo`: `tenantMiddleware` + `verifyAdmin`), montado en `app.js` bajo `/eventos`.
  - Frontend: `web-admin/src/pages/Eventos/EventosPage.jsx` ya estaba casi completo pero usaba `localStorage` y tenía rastros del proyecto ganadero — se conectó a la API real (crear/editar/eliminar/listar) y **se quitó el simulador de RSVP** (botones para "simular" que un suscriptor respondió Sí/No, y la constante `suscriptoresBase5 = []` fija): esa función dependía por completo de que existiera login de suscriptores en `mobile-app`, que aún no existe — mantenerla habría mostrado datos de asistencia falsos como si fueran reales. En su lugar cada tarjeta de evento muestra una nota indicando que la confirmación de asistencia se activará cuando los suscriptores tengan acceso desde la app móvil.
  - La ruta `/eventos` ya existía en `App.jsx` (huérfana); se agregó "Eventos & Convocatorias" al sidebar (`Sidebar.jsx`).
  - **Verificado de punta a punta contra el backend real:** crear evento → editar (título + estado a REALIZADO) → listar → eliminar, los 4 pasos correctos. `npx vite build` compila sin errores. Entorno restaurado sin dejar eventos de prueba ni cambios de contraseña.

- **✅ Noticias — ELIMINADO (hecho 2026-09-18).** No era parte del plan del producto. Era código 100% huérfano: `NoticiasPage.jsx` nunca tuvo ruta en `App.jsx` ni entrada en `Sidebar.jsx`, y no existía nada de backend. Se borró la carpeta `web-admin/src/pages/Noticias/` completa. `npx vite build` compila sin errores tras el borrado.

- **✅ Reportes — ACTIVADO (hecho 2026-09-18).** El frontend (`ReportesPage.jsx`) ya estaba completamente construido desde antes (KPIs, gráfica mensual, tabla de morosos) — solo le faltaba el backend real. Se creó bajo el prefijo `/reportes` (no `/admin`, que no es un patrón usado en el resto de la API):
  - `backend/src/controllers/reportes.controller.js` — dos funciones:
    - `financiero`: agrega `estadoMoratorio` de todos los asociados del acueducto (distribución AL_DIA/EN_MORA/INACTIVO), suma el total histórico de facturas `PAGADA` (`recaudacionTotal`), e indexa por mes las facturas del año en curso en pagado vs. pendiente/vencida (`recaudacionMensual`, 12 posiciones). El índice de morosidad es `(enMora + inactivos) / totalAsociados`.
    - `morosos`: lista los asociados con `estadoMoratorio` en `EN_MORA`/`INACTIVO`, con su deuda real sumando solo facturas `VENCIDA` (misma fuente que usa `estado.job.js`, para que nunca se desincronicen), ordenados de mayor a menor deuda.
  - `backend/src/routes/reportes.routes.js` — montado en `app.js` bajo `/reportes`, protegido con `tenantMiddleware` + `verifyAdmin` (mismo patrón que `/equipo`).
  - `web-admin/src/pages/Reportes/ReportesPage.jsx` — ajustadas las 2 llamadas de `/admin/reportes/...` a `/reportes/...`. Agregada la ruta `/reportes` en `App.jsx` y la entrada "Reportes & Morosos" en el sidebar (antes no tenía ni ruta ni entrada, pese a que la página ya existía).
  - **Verificado contra datos reales de la BD local:** ambos endpoints devuelven datos correctos del acueducto de prueba (3 asociados: 2 al día, 1 en mora, recaudación de agosto reflejada en el mes correcto). Se detectó que un asociado de prueba aparece `EN_MORA` con deuda `$0` — no es un bug del endpoint, es que su única factura ya está `PAGADA` pero `estadoMoratorio` no se ha vuelto a recalcular porque el cron diario (`estado.job.js`, corre a las 6 AM) aún no pasó desde que se pagó; el endpoint refleja fielmente el estado actual de la BD, tal como está diseñado.
  - `npx vite build` en `web-admin` compila sin errores. Entorno restaurado sin dejar cambios de prueba (contraseña del admin de prueba revertida).

- **✅ Mapa GPS de Predios — ACTIVADO (hecho 2026-09-18).** Como se sospechaba, no hacía falta backend nuevo — `latitud`/`longitud` ya existían en `Asociado.js` y ya se devuelven en `GET /asociados`. El mapa (Leaflet, ya cargado globalmente en `index.html`) estaba 100% construido pero leía de `localStorage` con coordenadas fallback inventadas (`2.1984, -75.6234`) en vez de datos reales. Cambios en `web-admin/src/pages/Mapa/MapaPage.jsx`:
  - Reemplazado el `useState` inicializado desde `localStorage` por un `useEffect` que llama a `GET /asociados` (mismo patrón que `SuscriptoresPage.jsx`).
  - Solo se muestran los asociados que sí tienen `latitud`/`longitud` numéricas — un asociado sin GPS capturado ya no aparece con una coordenada inventada, simplemente no sale en el mapa (con contador de "N sin ubicación aún" en el header).
  - El mapa ahora usa `fitBounds` sobre los puntos reales en vez de un centro fijo en Garzón, para funcionar igual con cualquier acueducto/vereda.
  - Agregado estado vacío ("Ningún suscriptor tiene GPS registrado todavía") cuando ningún asociado tiene coordenadas.
  - `estado` del pin ahora usa `estadoMoratorio` real (`AL_DIA`/`EN_MORA`/`INACTIVO`) en vez del dato simulado de antes.
  - La ruta `/mapa` ya existía en `App.jsx` (huérfana, sin entrada en sidebar) — se agregó "Mapa GPS de Predios" al sidebar (`Sidebar.jsx`).
  - **Verificado contra el backend real:** confirmado que `GET /asociados` devuelve `latitud`/`longitud` correctamente (probado con 2 de 3 asociados de prueba con coordenadas, 1 sin ellas — el filtro se comportó como se esperaba). `npx vite build` compila sin errores. Entorno restaurado sin dejar coordenadas de prueba ni cambios de contraseña.

### ✅ Recuperar/resetear contraseña de admin (hecho 2026-09-18): reemplazado por "Cambiar Contraseña" en Configuración
**Contexto de la decisión:** el suscriptor nunca usa contraseña (entra solo con cédula, ver ítem de login de suscriptores en Pendiente), así que la recuperación de contraseña solo aplica al **Admin de acueducto**. No tenía sentido montar un flujo de recuperación por correo (requeriría configurar Nodemailer, que no está implementado pese a estar en el stack) para un caso de uso acotado a un solo rol con pocos usuarios.

**Implementado:**
1. **Quitado** el link "¿Olvidaste tu contraseña?", el modal de recuperación y todo su estado (`showRecuperar`, `correoRecuperar`, etc.) de `web-admin/src/pages/Login/LoginPage.jsx`. Eliminado `ResetPasswordPage.jsx` (no tenía ruta montada en `App.jsx`, era código huérfano).
2. **Agregada** la sección "Cambiar Mi Contraseña" en `web-admin/src/pages/Configuracion/ConfiguracionPage.jsx` (contraseña actual + nueva + confirmación, con validación de que coincidan y mínimo 6 caracteres antes de enviar), conectada a `PUT /auth/cambiar-password` (backend ya existía y no requirió cambios).
3. El ciclo completo queda: el **SuperAdmin define la contraseña inicial** al crear el acueducto (`adminPassword` en `NuevoAcueductoPage.jsx`) → el **Admin la cambia él mismo** después desde su Configuración, sin fricción ni infraestructura de correo.

**Verificado de punta a punta:** probado contra el backend real — rechaza con 401 si la contraseña actual es incorrecta, y actualiza correctamente con datos válidos (probado cambiar y revertir sobre el SuperAdmin de desarrollo, sin dejar el entorno alterado).

### ✅ Alcance y gestión del equipo del acueducto — resuelto (2026-09-18)
El equipo de cada acueducto son únicamente: **Tesorero/Representante** (el Admin que ya se crea al dar de alta el acueducto, rol `ADMIN_ACUEDUCTO`) y **Fontaneros** (toman las lecturas de medidores). No hay más roles.

Se revisó `backend/src/validators/equipo.validator.js` y `crearMiembroEquipoSchema` ya está correctamente limitado a `z.enum(['TESORERO', 'FONTANERO'])` — no permite crear ningún rol adicional. El modelo ya está bien acotado, no hay nada que restringir.

**✅ Equipo movido a su propia sección + botón Editar agregado.**
Decisión del usuario: gestionar accesos (Tesorero/Fontanero) es control de acceso, no "cómo funciona el acueducto" (tarifas/cargos) — no debía vivir dentro de Configuración, mismo criterio ya aplicado a las llaves Wompi.

- Nueva página `web-admin/src/pages/Equipo/EquipoPage.jsx` (movida tal cual desde `ConfiguracionPage.jsx`, que ya no tiene esta sección), con crear/listar/eliminar igual que antes, **más el botón "Editar" que faltaba**: al hacer clic en un miembro se abre una fila editable (nombre + select Activo/Inactivo) conectada a `PUT /equipo/:id`, que ya existía en el backend sin ninguna pantalla que lo invocara.
- Nueva ruta `/equipo` en `App.jsx` y entrada "Equipo de Trabajo" en el sidebar (`Sidebar.jsx`), bajo el grupo CUENTA junto a Configuración y Pasarela de Pagos Wompi.
- No fue necesario tocar nada del backend — el endpoint y su validator ya estaban completos y correctos.

**Verificado de punta a punta contra el backend real:** crear miembro (fontanero de prueba) → editar (nombre + estado a INACTIVO) → confirmado en el listado que el cambio quedó → eliminado. `npx vite build` en `web-admin` compila sin errores. Entorno restaurado sin dejar el miembro de prueba ni cambios en la contraseña del admin de prueba.

**✅ Aclarado: `ADMIN_ACUEDUCTO` y `TESORERO` NO son redundantes — es una separación intencional.**
- `ADMIN_ACUEDUCTO` = el usuario único y original del acueducto, creado por el SuperAdmin al dar de alta el acueducto (`superadmin.controller.js`). Solo puede existir 1 por acueducto — es "el dueño de la cuenta".
- `TESORERO` = un administrador adicional que el propio `ADMIN_ACUEDUCTO` puede crear libremente desde Configuración → Equipo, si quiere delegar acceso completo a otra persona. Pueden existir varios.
- Ambos tienen exactamente los mismos permisos (`auth.middleware.js` los trata igual en todo lugar donde se exige rol de administrador) — la única diferencia es quién los crea y cuántos puede haber, no sus capacidades. El comentario en `equipo.controller.js:5-7` ya documenta esto correctamente. **No se toca.**

---

## Cómo usar este archivo

- El archivo tiene dos secciones fijas: **🔲 PENDIENTE** arriba y **✅ COMPLETADO** abajo. Al terminar un ítem, se recorta de Pendiente y se pega al final de Completado (misma sección temática si existe, o una nueva) con una línea de qué se hizo y la fecha — nunca se borra, sirve de bitácora.
- Nuevos hallazgos se agregan bajo la sección Pendiente que corresponda, o una nueva sección si no encaja en las existentes.
- La prioridad (🔴🟠🟡) es una guía, no una regla fija — se reordena según lo que sea más urgente en el momento.
