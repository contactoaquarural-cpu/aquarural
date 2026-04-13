# Manual de Fases — Prompts por Agente
## Plataforma Digital Ganadera — MetaDevelopment Ltd

> **Para:** Julián Andrés Trujillo Morales  
> **Uso:** Prompts listos para los 3 modos de Claude en cada fase  
> **Proyecto:** Plataforma Digital Ganadera — Asociación de Ganaderos de Garzón

---

## 🧭 Cómo leer este manual

Cada fase tiene **3 prompts** según el modo que vayas a usar:

| Ícono | Modo | Cuándo usarlo |
|---|---|---|
| 🟦 **VS Code** | Claude en el panel lateral de VS Code | Revisar archivos existentes, hacer cambios puntuales, depurar errores |
| 🟩 **Terminal** | Claude Code en CMD/PowerShell | Construir módulos completos, crear archivos, ejecutar comandos |
| 🟨 **claude.ai** | Chat nuevo en claude.ai | Planear la fase, resolver dudas de arquitectura, generar documentación |

---

## 📖 Cómo usar Claude en VS Code (panel lateral)

1. Abre VS Code en la carpeta del proyecto
2. Haz clic en el ícono de Claude en la barra lateral izquierda
3. Para referenciar un archivo escribe `@` seguido del nombre:
   ```
   @Asociado.js dime si este modelo está bien estructurado
   ```
4. Para referenciar toda una carpeta:
   ```
   @src/controllers/ revisa que todos los controllers sigan el mismo patrón
   ```
5. Para referenciar el CLAUDE.md y dar contexto:
   ```
   @CLAUDE.md estamos iniciando la Fase 1, ayúdame a crear los modelos
   ```

---

## 📖 Cómo usar Claude Code en Terminal

1. Abre la terminal integrada de VS Code con **Ctrl + `**
2. Navega a la carpeta correcta según la fase:
   ```cmd
   cd C:\Users\TuUsuario\plataforma-digital-ganadera\backend
   ```
3. Inicia Claude Code:
   ```cmd
   claude
   ```
4. Pega el prompt de la fase directamente en la sesión
5. Claude Code leerá tu `CLAUDE.md` automáticamente y empezará a trabajar

> 💡 **Truco:** Si quieres que Claude Code empiece leyendo el CLAUDE.md explícitamente, escribe primero:
> ```
> lee el archivo CLAUDE.md de esta carpeta y confirma que entendiste el contexto
> ```

---

## 📖 Cómo usar el chat de claude.ai

1. Abre https://claude.ai en el navegador
2. Haz clic en "New Chat"
3. Pega el prompt de la fase
4. Úsalo para planear, resolver dudas o generar código que luego pegas en VS Code

---
---

# FASE 1
## Configuración, Registro de Usuarios y Autenticación
**Duración estimada:** 2–3 semanas | **Carpeta principal:** `backend/`

### ¿Qué construyes en esta fase?
- Proyecto Node.js inicializado con todas las dependencias
- Conexión a MongoDB Atlas
- 5 modelos Mongoose: Asociado, Finca, Aporte, Convenio, Noticia
- Autenticación JWT completa (login, refresh, middleware)
- CRUD completo de asociados y fincas
- Seed de datos de prueba
- Servidor corriendo en puerto 3000

---

### 🟨 Prompt para claude.ai — Planear la Fase 1

```
Voy a iniciar la Fase 1 de mi proyecto: una plataforma digital para la 
Asociación de Ganaderos de Garzón, Huila, Colombia.

Stack del backend:
- Node.js v20 + Express.js v4
- Mongoose v8 + MongoDB Atlas M0
- JWT (jsonwebtoken) + bcrypt para autenticación
- Zod para validación de datos
- Winston para logs

Esta fase incluye:
1. Inicializar el proyecto Node.js con la estructura de carpetas correcta
2. Crear 5 modelos Mongoose: Asociado, Finca, Aporte, Convenio, Noticia
3. Implementar autenticación JWT: login, refresh token, middleware
4. CRUD completo de asociados con validación Zod
5. CRUD de fincas vinculadas a asociados
6. Seed de 10 asociados de prueba con datos del municipio de Garzón

Formato estándar de respuestas de la API:
{ success: true/false, data: {}, message: '', pagination: {} }

Nunca exponer el campo password en las respuestas.
Siempre usar try/catch en los controllers.

Dame un plan paso a paso para implementar esta fase en orden lógico, 
identificando las dependencias entre tareas (qué debo hacer primero).
```

---

### 🟩 Prompt para Claude Code en Terminal — Construir la Fase 1

**Antes de pegar este prompt:**
```cmd
cd plataforma-digital-ganadera\backend
claude
```

**Luego pega este prompt:**

```
Lee el archivo CLAUDE.md de esta carpeta. Vamos a construir la Fase 1 
completa del backend.

Ejecuta las siguientes tareas EN ORDEN. Después de cada tarea confirma 
que funcionó antes de continuar con la siguiente.

TAREA 1 — Inicializar el proyecto:
- Ejecuta npm init -y
- Instala dependencias: express mongoose jsonwebtoken bcryptjs zod 
  dotenv cors helmet morgan winston node-cache node-cron axios
- Instala devDependencies: nodemon jest supertest
- Crea la estructura de carpetas: src/routes src/controllers 
  src/middleware src/models src/jobs src/services src/utils tests
- Configura package.json con scripts: 
  "dev": "nodemon src/server.js"
  "start": "node src/server.js"  
  "test": "jest --coverage"
  "seed": "node src/utils/seed.js"

TAREA 2 — Archivos base:
- Crea src/app.js con Express, cors, helmet, morgan y rutas base
- Crea src/server.js que conecta a MongoDB Atlas usando MONGODB_URI 
  del .env y levanta el servidor en process.env.PORT || 3000
- Crea .env.example con todas las variables del CLAUDE.md
- Crea .gitignore con: node_modules/ .env coverage/ *.log
- Agrega GET /health que retorna { status: 'ok', timestamp: new Date() }

TAREA 3 — Modelos Mongoose:
Crea un archivo separado en src/models/ para cada modelo según las 
especificaciones exactas del CLAUDE.md:
Asociado.js, Finca.js, Aporte.js, Convenio.js, Noticia.js, Notificacion.js

TAREA 4 — Autenticación JWT:
- Crea src/utils/jwt.utils.js con generateAccessToken (15min) 
  y generateRefreshToken (7 días)
- Crea src/middleware/auth.middleware.js con verifyToken
- Crea src/controllers/auth.controller.js con login, refresh, logout
- Crea src/routes/auth.routes.js y regístralo en app.js

TAREA 5 — CRUD de Asociados:
- Crea src/controllers/asociados.controller.js con: crear, obtenerTodos 
  (paginado), obtenerPorId, actualizar, cambiarEstado
- Validación Zod en crear: nombre, cedula, password, correo, telefono
- Nunca retornar el campo password (.select('-password'))
- Crea src/routes/asociados.routes.js y regístralo en app.js

TAREA 6 — CRUD de Fincas:
- Crea src/controllers/fincas.controller.js con CRUD completo
- Crea src/routes/fincas.routes.js y regístralo en app.js

TAREA 7 — Seed de datos:
- Crea src/utils/seed.js con 1 admin y 10 asociados de prueba
- Nombres colombianos reales del Huila, veredas reales de Garzón
- Ejecuta: npm run seed

TAREA 8 — Verificación final:
- Ejecuta npm run dev
- Confirma que el servidor levanta en puerto 3000
- Confirma que GET /health responde { status: 'ok' }
- Lista todos los archivos creados
```

---

### 🟦 Prompt para VS Code — Revisar la Fase 1

**Úsalo después de que Claude Code construyó los archivos:**

```
@CLAUDE.md @src/controllers/asociados.controller.js 
@src/models/Asociado.js

Revisa estos archivos y dime:
1. ¿El controller sigue el formato estándar de respuesta del CLAUDE.md?
2. ¿El modelo tiene todos los campos especificados en el CLAUDE.md?
3. ¿Hay algún caso donde se pueda filtrar el campo password en la respuesta?
4. ¿El manejo de errores con try/catch es correcto en todos los métodos?

Si encuentras problemas, muéstrame solo las líneas que hay que corregir.
```

---
---

# FASE 2
## Módulo de Pagos y Control de Estado
**Duración estimada:** 3–4 semanas | **Carpeta principal:** `backend/`

### ¿Qué construyes en esta fase?
- Integración completa con Wompi (sandbox + producción)
- Endpoint de inicio de pago que genera URL de Wompi
- Webhook de confirmación con validación HMAC-SHA256
- Cron job diario que actualiza estado AL_DIA / EN_MORA / INACTIVO
- Reporte de morosos exportable
- Historial de pagos por asociado

---

### 🟨 Prompt para claude.ai — Entender Wompi antes de codear

```
Voy a integrar Wompi como pasarela de pagos en mi backend Node.js 
para una app de asociación ganadera colombiana.

Necesito entender:

1. ¿Cómo funciona el flujo de pago de Wompi paso a paso?
   (desde que el usuario hace clic en "pagar" hasta que recibo confirmación)

2. ¿Qué es el webhook de Wompi y cómo valido la firma HMAC-SHA256?

3. ¿Cuál es la diferencia entre el sandbox y producción de Wompi?
   ¿Qué credenciales necesito para cada uno?

4. El ganadero puede deber varios meses. ¿Cómo estructuro el pago 
   para que pueda pagar múltiples meses en una sola transacción?

5. ¿Qué pasa si el pago queda en estado PENDIENTE o ERROR en Wompi?
   ¿Cómo manejo esos casos en mi base de datos?

Mi modelo de Aporte en MongoDB tiene estos campos:
asociadoId, mes, año, monto, estado (PAGADO/PENDIENTE), 
fechaPago, referenciaPago, metodoPago

Dame respuestas concretas y prácticas, no teóricas.
```

---

### 🟩 Prompt para Claude Code en Terminal — Construir la Fase 2

**Antes de pegar este prompt:**
```cmd
cd plataforma-digital-ganadera\backend
claude
```

**Luego pega este prompt:**

```
Lee el archivo CLAUDE.md. Vamos a construir la Fase 2: módulo de pagos 
con Wompi y control automático de estado de asociados.

La Fase 1 ya está completa: modelos, autenticación y CRUD de asociados 
están funcionando.

TAREA 1 — Instalar dependencias:
- Instala: npm install node-cron
- Verifica que axios ya está instalado

TAREA 2 — Integración con Wompi:
Crea src/services/wompi.service.js con:
- URL base sandbox: https://sandbox.wompi.co/v1
- URL base producción: https://production.wompi.co/v1
- Función crearTransaccion(datos): 
  Recibe { asociadoId, meses[], montoTotal, referencia }
  Llama a la API de Wompi para crear un link de pago
  Retorna la URL de pago de Wompi
- Función verificarFirmaWebhook(payload, firma, integritySecret):
  Calcula HMAC-SHA256 del payload con el integrity secret
  Retorna true si la firma es válida, false si no

TAREA 3 — Controller y rutas de pagos:
Crea src/controllers/pagos.controller.js con:

iniciarPago (POST /pagos/iniciar — requiere auth):
  - Recibe: asociadoId, meses (array de {mes, año})
  - Calcula monto: $50.000 COP por mes (configurable desde .env MONTO_APORTE)
  - Crea registros Aporte en estado PENDIENTE para cada mes
  - Llama a wompi.service para obtener URL de pago
  - Retorna: { urlPago, referencia, montoTotal, meses }

webhook (POST /pagos/webhook — PÚBLICO, sin auth middleware):
  - Verifica firma HMAC del evento de Wompi
  - Si estado === 'APPROVED': actualiza aportes a PAGADO, 
    guarda referenciaPago y fechaPago
  - Si estado === 'DECLINED' o 'VOIDED': 
    mantiene aportes en PENDIENTE para reintento
  - Retorna siempre 200 (Wompi reintenta si no recibe 200)

historial (GET /pagos/historial/:asociadoId — requiere auth):
  - Retorna todos los aportes ordenados por año y mes descendente
  - Incluye resumen: mesesPagados, mesesPendientes, montoTotal adeudado

Crea src/routes/pagos.routes.js y regístralo en app.js

TAREA 4 — Cron job de control de estado:
Crea src/jobs/estado.job.js:
- Se ejecuta todos los días a las 6:00 AM (node-cron: '0 6 * * *')
- Para cada asociado activo:
  * Verifica aportes PENDIENTE del mes anterior al actual y anteriores
  * 1 mes de mora → EN_MORA
  * 3+ meses de mora → INACTIVO  
  * Sin mora → AL_DIA
- Registra en consola: 'Estado actualizado: X al día, Y en mora, Z inactivos'
- Importa y arranca el job en src/server.js

TAREA 5 — Reporte de morosos:
Crea en src/controllers/admin.controller.js:
GET /admin/reportes/morosos (requiere auth):
- Retorna asociados con estado EN_MORA o INACTIVO
- Incluye: nombre, cedula, telefono, estado, mesesAdeudados (array), 
  montoTotal adeudado
- Agrega variable .env: MONTO_APORTE=50000

TAREA 6 — Verificación final:
- Ejecuta npm run dev y confirma que levanta sin errores
- Lista todos los archivos creados en esta fase
- Muestra los endpoints nuevos agregados
```

---

### 🟦 Prompt para VS Code — Probar el webhook de Wompi

```
@src/services/wompi.service.js @src/controllers/pagos.controller.js

Necesito probar el webhook de Wompi en local sin tener una URL pública.
Explícame:
1. ¿Cómo simulo un evento de webhook de Wompi desde Thunder Client?
2. ¿Qué headers y body exacto debo enviar para simular un pago aprobado?
3. ¿Cómo genero la firma HMAC-SHA256 correcta para la prueba?
4. ¿Qué debería cambiar en la base de datos después de un webhook exitoso?

Muéstrame el JSON de prueba listo para pegar en Thunder Client.
```

---
---

# FASE 3
## Carné QR Digital y Gestión de Convenios
**Duración estimada:** 2–3 semanas | **Carpeta principal:** `backend/`

### ¿Qué construyes en esta fase?
- Generación de QR como imagen base64 (firmado HMAC-SHA256)
- Verificación pública de QR para comercios aliados
- QR dinámico: se invalida si el asociado entra en mora
- CRUD completo de convenios comerciales con categorías

---

### 🟨 Prompt para claude.ai — Diseñar la seguridad del QR

```
Voy a implementar carnés digitales QR para ganaderos asociados.
El QR sirve para que en almacenes agropecuarios y veterinarias 
puedan verificar que el ganadero está al día con sus aportes.

Tengo estas preguntas de seguridad:

1. ¿Qué datos debo incluir en el payload del QR?
   (el comercio solo necesita saber: ¿es válido? ¿quién es? ¿está al día?)

2. ¿Cómo firmo el QR con HMAC-SHA256 para que no sea falsificable?
   Explícame el proceso paso a paso.

3. El QR debe expirar en 30 días. ¿Cómo incluyo la expiración 
   en el payload de forma segura?

4. ¿Cómo invalido el QR automáticamente cuando el asociado 
   entra en mora, sin que tenga que pedir uno nuevo?

5. El endpoint de verificación debe ser público (sin autenticación)
   para que los comercios aliados puedan usarlo. 
   ¿Cómo evito que sea abusado con rate limiting?

Dame el diseño del payload del QR y el flujo de verificación completo.
```

---

### 🟩 Prompt para Claude Code en Terminal — Construir la Fase 3

**Antes de pegar este prompt:**
```cmd
cd plataforma-digital-ganadera\backend
claude
```

**Luego pega este prompt:**

```
Lee el archivo CLAUDE.md. Vamos a construir la Fase 3: sistema de 
carnés QR digitales y módulo de convenios comerciales.

Fases 1 y 2 ya están completas y funcionando.

TAREA 1 — Instalar dependencias:
npm install qrcode

TAREA 2 — Servicio de QR:
Crea src/services/qr.service.js con:

generarQR(asociado):
  - Construye el payload:
    { asociadoId, nombre, cedula, estado, validoHasta (30 días desde hoy) }
  - Firma el payload con HMAC-SHA256 usando QR_SECRET del .env
  - Convierte a string JSON → genera imagen QR en base64 con la librería qrcode
  - Retorna: { qrBase64, validoHasta, payload }

verificarQR(payloadString, firma):
  - Parsea el payloadString
  - Recalcula la firma HMAC con QR_SECRET
  - Verifica que las firmas coincidan
  - Verifica que validoHasta no haya expirado
  - Verifica que el estado del asociado en BD siga siendo AL_DIA
  - Retorna: { valido: true/false, nombre, estado, mensaje }

TAREA 3 — Controller y rutas de QR:
Crea src/controllers/qr.controller.js:

generarCarnet (GET /asociados/:id/qr — requiere auth):
  - Verifica que req.user.id === req.params.id (cada uno ve solo el suyo)
  - Busca el asociado en MongoDB
  - Llama a qr.service.generarQR(asociado)
  - Retorna: { qrBase64, validoHasta, estado }

verificarCarnet (POST /qr/verificar — PÚBLICO, sin auth):
  - Recibe: { payload, firma }
  - Llama a qr.service.verificarQR(payload, firma)
  - Si válido: retorna nombre, estado, mensaje positivo
  - Si inválido: retorna mensaje explicando por qué (expirado, en mora, firma inválida)
  - Agrega rate limiting básico: máximo 60 requests por minuto por IP

Crea src/routes/qr.routes.js y regístralo en app.js
Agrega QR_SECRET al .env.example

TAREA 4 — CRUD de Convenios:
Crea src/controllers/convenios.controller.js con:
- crear (POST /convenios — auth admin)
- obtenerTodos (GET /convenios — PÚBLICO):
  Filtra activo=true por defecto
  Acepta query params: ?tipo=AGROPECUARIO, ?activo=false (solo admin)
- obtenerPorId (GET /convenios/:id — PÚBLICO)
- actualizar (PUT /convenios/:id — auth admin)
- toggleActivo (PATCH /convenios/:id/toggle — auth admin)

Validación Zod:
nombre (string, required), tipo (enum, required), 
descuentoPorcentaje (number, 0-100), descripcion (string),
direccion (string), telefono (string)

Crea src/routes/convenios.routes.js y regístralo en app.js

TAREA 5 — Integrar QR con el cron de estado:
En src/jobs/estado.job.js, agrega:
Cuando un asociado pasa a EN_MORA o INACTIVO, el QR queda 
automáticamente inválido porque verificarQR consulta el estado 
actual en BD. No hay nada extra que hacer — confirma que esto 
ya funciona así por diseño.

TAREA 6 — Verificación final:
- npm run dev sin errores
- Lista archivos creados
- Muestra los 4 endpoints nuevos
```

---

### 🟦 Prompt para VS Code — Probar el QR

```
@src/services/qr.service.js @src/controllers/qr.controller.js

Quiero probar el sistema de QR completo desde Thunder Client.
Dame el paso a paso:
1. Qué request hacer primero para obtener el QR de un asociado
2. Cómo decodifico el base64 para ver la imagen del QR
3. Cómo simulo la verificación del QR en el endpoint público
4. Cómo verifico que el QR se invalida cuando el asociado está EN_MORA

Dame los requests exactos con headers y body para cada paso.
```

---
---

# FASE 4
## Aplicación Móvil Completa
**Duración estimada:** 3–4 semanas | **Carpeta principal:** `mobile-app/`

### ¿Qué construyes en esta fase?
- Proyecto React Native con Expo inicializado
- Navegación completa (Auth + Bottom Tabs)
- Todas las pantallas: login, registro, home, pagos, QR, convenios, perfil
- Integración con la API del backend
- Stores de Zustand con persistencia en SecureStore
- Build de prueba APK para Android

---

### 🟨 Prompt para claude.ai — Diseñar la navegación

```
Voy a construir una app móvil con React Native + Expo para ganaderos 
colombianos en zonas rurales del Huila.

Consideraciones importantes:
- Los usuarios son ganaderos, muchos mayores, poco familiarizados con apps
- Conexión a internet puede ser lenta o intermitente en zonas rurales
- El flujo más importante es: ver mi carné QR y ver mi estado de pago

La app tiene estas secciones:
1. Autenticación: Login (cédula + password) y Registro (3 pasos)
2. Home: estado del asociado y accesos rápidos
3. Pagos: historial y pagar meses pendientes (Wompi via WebView)
4. Mi Carné: QR grande para mostrar en almacenes
5. Convenios: lista de descuentos disponibles
6. Perfil: datos personales y finca

Ayúdame a:
1. Diseñar la estructura de navegación más intuitiva para este usuario
2. ¿Bottom tabs o drawer navigation? ¿Por qué?
3. ¿Qué pantalla debe ser el home por defecto?
4. ¿Cómo manejo la pantalla de QR cuando el asociado está en mora?
   (debe verse diferente, no solo estar vacía)
5. ¿Qué datos debo precargar al hacer login para que la app funcione 
   offline básicamente?

Dame recomendaciones concretas basadas en UX para usuarios rurales colombianos.
```

---

### 🟩 Prompt para Claude Code en Terminal — Construir la Fase 4

**Antes de pegar este prompt:**
```cmd
cd plataforma-digital-ganadera
claude
```

**Luego pega este prompt:**

```
Lee el archivo CLAUDE.md de la raíz y también el archivo 
mobile-app/CLAUDE.md. Vamos a construir la Fase 4: aplicación 
móvil completa con React Native y Expo.

El backend ya está completo (Fases 1, 2 y 3 funcionando).

TAREA 1 — Inicializar el proyecto:
- Ejecuta desde la raíz del monorepo:
  npx create-expo-app mobile-app --template blank
- Navega a mobile-app/
- Instala dependencias según el CLAUDE.md de mobile-app:
  npx expo install @react-navigation/native @react-navigation/native-stack 
  @react-navigation/bottom-tabs react-native-screens 
  react-native-safe-area-context
  npm install zustand axios
  npx expo install expo-secure-store expo-image-picker
- Crea la estructura de carpetas según el CLAUDE.md de mobile-app

TAREA 2 — Configuración base:
- Crea src/utils/theme.js con los colores, tipografía y espaciado 
  del CLAUDE.md de mobile-app
- Crea src/services/api.service.js con Axios configurado según 
  el CLAUDE.md (timeout 15s, interceptores de token y 401)
- Crea los 3 stores de Zustand según el CLAUDE.md:
  src/store/auth.store.js (con persistencia en SecureStore)
  src/store/asociado.store.js
  src/store/pagos.store.js

TAREA 3 — Navegación:
Crea la estructura de navegación según el CLAUDE.md de mobile-app:
- src/navigation/AuthNavigator.js (Stack: Login, Register, ForgotPassword)
- src/navigation/MainNavigator.js (Bottom Tabs: Inicio, Pagos, Mi Carné, 
  Beneficios, Perfil) con íconos y color primario #1A7A3C
- src/navigation/index.js que decide qué navigator mostrar según 
  si hay token en auth.store
- Actualiza App.js para usar el navigator raíz

TAREA 4 — Pantallas de autenticación:
Crea con diseño limpio, colores verde #1A7A3C y blanco:
- src/screens/auth/LoginScreen.js:
  Campos cédula y contraseña, loading state, manejo de errores
  Al hacer login llama auth.store.login() y carga datos del asociado
- src/screens/auth/RegisterScreen.js:
  Formulario en 3 pasos con indicador de progreso:
  Paso 1: nombre, cédula, password, confirmar password
  Paso 2: teléfono, correo, municipio
  Paso 3: nombre finca, hectáreas, cabezas de ganado, tipo producción
  Botón "Registrarme" en paso 3 llama a POST /asociados + POST /fincas

TAREA 5 — Pantallas principales:
- src/screens/home/HomeScreen.js:
  Saludo con nombre del asociado, badge de estado (color según AL_DIA/EN_MORA/INACTIVO)
  Si EN_MORA: banner naranja con "Tienes X meses pendientes. Paga ahora"
  Accesos rápidos: Mi Carné, Pagar, Convenios, Noticias

- src/screens/qr/MiCarneScreen.js:
  Si AL_DIA: fondo verde, QR grande en base64, nombre y fecha de vencimiento
  Si EN_MORA o INACTIVO: fondo naranja/rojo, QR bloqueado (imagen gris),
  mensaje claro y botón "Pagar ahora" que navega a PagoScreen

- src/screens/pagos/EstadoFinancieroScreen.js:
  Lista de los últimos 12 meses con estado PAGADO (verde) o PENDIENTE (rojo)
  Total adeudado en grande, botón "Pagar meses pendientes"

- src/screens/pagos/PagoScreen.js:
  Lista de meses PENDIENTE con checkboxes para seleccionar cuáles pagar
  Monto total calculado dinámicamente
  Botón "Pagar con Wompi" que llama a POST /pagos/iniciar 
  y abre la URL en WebView

- src/screens/convenios/ConveniosScreen.js:
  Lista de convenios activos agrupados por tipo (AGROPECUARIO, VETERINARIA...)
  Cada item muestra nombre, descuento % y botón "Ver detalle"

- src/screens/perfil/PerfilScreen.js:
  Foto de perfil, nombre y cédula, botones: Editar datos, Mi finca, 
  Cambiar contraseña, Cerrar sesión

TAREA 6 — Verificación final:
- Ejecuta npx expo start
- Confirma que la app carga sin errores en Expo Go
- Lista todas las pantallas creadas
- Confirma que la navegación entre pantallas funciona
```

---

### 🟦 Prompt para VS Code — Depurar la app móvil

```
@mobile-app/src/screens/qr/MiCarneScreen.js
@mobile-app/src/store/asociado.store.js

La pantalla del carné QR no está mostrando la imagen. 
El endpoint GET /asociados/:id/qr retorna un campo qrBase64 
que es una cadena base64 de una imagen PNG.

Revisa el código y dime:
1. ¿Cómo muestro correctamente una imagen base64 en React Native con Image?
2. ¿El store está cargando el QR correctamente?
3. ¿Hay algún problema con el formato del base64 que podría causar 
   que la imagen no se renderice?

Muéstrame el código exacto para renderizar la imagen QR en React Native.
```

---
---

# FASE 5
## Noticias, Notificaciones Push y Comunicación
**Duración estimada:** 1–2 semanas | **Carpetas:** `backend/` y `mobile-app/`

### ¿Qué construyes en esta fase?
- CRUD de noticias con categorías
- Firebase Admin SDK para push notifications
- Notificaciones automáticas cuando el asociado entra en mora
- Envío masivo o individual desde el panel
- Feed de noticias en la app móvil
- Centro de notificaciones en la app

---

### 🟨 Prompt para claude.ai — Configurar Firebase

```
Voy a integrar Firebase Cloud Messaging (FCM) en mi proyecto:
- Backend: Node.js con firebase-admin SDK
- App móvil: React Native con Expo

Necesito entender:

1. ¿Cómo creo un proyecto en Firebase Console y obtengo las 
   credenciales para el Admin SDK? (paso a paso)

2. ¿Cómo obtengo el FCM token del dispositivo del usuario 
   en React Native con Expo? ¿Cuándo debo pedirle permisos?

3. ¿Dónde guardo el FCM token del usuario en mi BD?
   Mi modelo de Asociado ya tiene un campo fcmToken: String

4. ¿Cómo envío una notificación a todos los asociados en mora 
   desde el backend usando el Admin SDK?

5. ¿Cómo pruebo las notificaciones push en el emulador de Android 
   sin tener un dispositivo físico?

Dame los pasos exactos y el código mínimo necesario.
```

---

### 🟩 Prompt para Claude Code en Terminal — Construir la Fase 5

**Antes de pegar este prompt:**
```cmd
cd plataforma-digital-ganadera\backend
claude
```

**Luego pega este prompt:**

```
Lee el archivo CLAUDE.md. Vamos a construir la Fase 5: noticias 
del sector y sistema de notificaciones push con Firebase.

Las Fases 1, 2 y 3 del backend están completas.

TAREA 1 — Instalar dependencias:
npm install firebase-admin

TAREA 2 — Servicio de Firebase:
Crea src/services/firebase.service.js:
- Inicializa Firebase Admin SDK con las credenciales del .env
  (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)
- Función enviarNotificacion(fcmToken, titulo, cuerpo, datos):
  Envía push a un dispositivo específico
  Retorna { success: true/false, messageId }
- Función enviarMasiva(fcmTokens[], titulo, cuerpo, datos):
  Usa sendEachForMulticast para enviar a múltiples dispositivos
  Retorna { exitosos, fallidos, total }
Agrega al .env.example: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, 
FIREBASE_CLIENT_EMAIL

TAREA 3 — CRUD de Noticias:
Crea src/controllers/noticias.controller.js:
- crear (POST /noticias — auth admin):
  Campos: titulo, contenido, imagen (URL), categoria, publicado
- obtenerTodas (GET /noticias — PÚBLICO):
  Solo retorna publicado=true por defecto
  Ordenadas por fechaPublicacion descendente
  Paginación: ?page=1&limit=10
- obtenerPorId (GET /noticias/:id — PÚBLICO)
- actualizar (PUT /noticias/:id — auth admin)
- togglePublicado (PATCH /noticias/:id/toggle — auth admin)
  Al publicar: envía notificación push a TODOS los asociados
  con FCM token registrado
- eliminar (DELETE /noticias/:id — auth admin)

Crea src/routes/noticias.routes.js y regístralo en app.js

TAREA 4 — Notificaciones masivas:
Crea src/controllers/notificaciones.controller.js:

enviarMasiva (POST /admin/notificaciones/enviar — auth admin):
Recibe: { destinatarios, asociadoId, titulo, mensaje }
destinatarios puede ser: 'TODOS', 'EN_MORA', 'AL_DIA', 'ESPECIFICO'
- Si TODOS: obtiene todos los fcmTokens activos
- Si EN_MORA o AL_DIA: filtra por estado
- Si ESPECIFICO: usa el fcmToken del asociadoId enviado
Llama a firebase.service.enviarMasiva()
Guarda registro en colección Notificacion para cada destinatario
Retorna: { enviadas, fallidas }

historial (GET /asociados/:id/notificaciones — auth):
Retorna las últimas 50 notificaciones del asociado
Incluye campo 'leido' para marcar como leído

marcarLeida (PATCH /notificaciones/:id/leida — auth):
Actualiza leido=true en la notificación

TAREA 5 — Integrar notificación automática en el cron:
Actualiza src/jobs/estado.job.js:
Cuando un asociado cambia a EN_MORA por primera vez en ese mes:
- Envía push: titulo "⚠️ Membresía en mora" 
  cuerpo "Tienes aportes pendientes. Paga para mantener tus beneficios."
- Guarda en colección Notificacion

TAREA 6 — FCM Token en el modelo:
Crea el endpoint para que la app móvil registre el token FCM:
PUT /asociados/:id/fcm-token (requiere auth)
Recibe: { fcmToken }
Actualiza el campo fcmToken en el Asociado

TAREA 7 — Verificación final:
- npm run dev sin errores
- Lista todos los archivos creados y modificados
- Muestra los endpoints nuevos de noticias y notificaciones
```

---

### 🟦 Prompt para VS Code — Agregar noticias y notificaciones a la app

```
@mobile-app/CLAUDE.md 
@mobile-app/src/services/api.service.js

Necesito agregar dos pantallas nuevas a la app móvil:

1. NoticiasScreen: feed de noticias del sector con imagen, 
   título, categoría y fecha. Al hacer tap navega al detalle.
   Consume GET /noticias con paginación infinita (scroll).

2. NotificacionesScreen: lista de notificaciones recibidas.
   Las no leídas tienen un punto verde a la izquierda.
   Al hacer tap marca como leída (PATCH /notificaciones/:id/leida).

También necesito que al hacer login la app registre el FCM token 
del dispositivo llamando a PUT /asociados/:id/fcm-token.

¿Cómo obtengo el FCM token en Expo React Native?
Muéstrame el código para registrar el token al hacer login.
```

---
---

# FASE 6
## Estadísticas, Pruebas, Despliegue y Capacitación
**Duración estimada:** 2 semanas | **Todas las carpetas**

### ¿Qué construyes en esta fase?
- API de estadísticas con MongoDB aggregation pipeline
- Suite de pruebas Jest con >80% de cobertura
- Backend desplegado en Railway con dominio propio
- Panel web desplegado en Vercel
- App publicada en Google Play Store
- Monitoreo activo con UptimeRobot

---

### 🟨 Prompt para claude.ai — Diseñar las estadísticas

```
Tengo una base de datos MongoDB con estas colecciones:
- Asociado: nombre, cedula, municipio, estado (AL_DIA/EN_MORA/INACTIVO), fechaIngreso
- Finca: asociadoId, hectareas, cabezasGanado, tipoProduccion (CARNE/LECHE/DOBLE), vereda
- Aporte: asociadoId, mes, año, monto, estado (PAGADO/PENDIENTE)

Necesito un endpoint GET /estadisticas/sector que use MongoDB 
aggregation pipeline para calcular:

1. Total de asociados registrados
2. Distribución por estado: cuántos AL_DIA, EN_MORA, INACTIVO (con %)
3. Total de cabezas de ganado en el municipio
4. Total de hectáreas registradas
5. Distribución por tipo de producción: CARNE, LECHE, DOBLE (con %)
6. Top 5 veredas con más asociados

Y un endpoint GET /estadisticas/financiero para:
1. Recaudo total del mes actual
2. Recaudo de los últimos 12 meses (para gráfica de línea)
3. Total adeudado por asociados en mora

Dame los aggregation pipelines exactos de MongoDB para cada consulta.
Quiero los pipelines listos para usar con Mongoose.
```

---

### 🟩 Prompt para Claude Code en Terminal — Fase 6 completa

**Antes de pegar este prompt:**
```cmd
cd plataforma-digital-ganadera\backend
claude
```

**Luego pega este prompt:**

```
Lee el archivo CLAUDE.md. Vamos a construir la Fase 6 final:
estadísticas, pruebas y preparación para despliegue.

Todo el MVP (Fases 1–5) ya está completo y funcionando.

TAREA 1 — API de Estadísticas:
Crea src/controllers/estadisticas.controller.js:

sector (GET /estadisticas/sector — PÚBLICO):
Usa MongoDB aggregation pipeline con $lookup, $group y $project:
- Total asociados, distribución por estado con porcentajes
- Total cabezas de ganado y hectáreas (sum desde Finca)
- Distribución tipoProduccion con porcentajes
- Top 5 veredas por número de asociados
Cachea el resultado por 1 hora con node-cache
Retorna los datos en formato listo para Recharts

financiero (GET /estadisticas/financiero — requiere auth):
- Recaudo mes actual (sum de aportes PAGADO del mes/año actual)
- Array de 12 meses: [{ mes, año, recaudo }] para gráfica de línea
- Total adeudado: sum de aportes PENDIENTE de meses anteriores al actual

Crea src/routes/estadisticas.routes.js y regístralo en app.js

TAREA 2 — Suite de pruebas con Jest:
Configura Jest en package.json:
"jest": { "testEnvironment": "node", "testTimeout": 30000 }

Crea tests/setup.js:
- Conecta a MongoDB de prueba usando MONGODB_URI_TEST del .env
- Limpia todas las colecciones con beforeEach
- Cierra conexión con afterAll

Crea tests/auth.test.js:
- POST /auth/login con credenciales válidas → retorna accessToken y refreshToken
- POST /auth/login con password incorrecta → retorna 401
- POST /auth/login con cédula inexistente → retorna 401
- GET /asociados sin token → retorna 401
- GET /asociados con token válido → retorna array con success: true

Crea tests/asociados.test.js:
- POST /asociados crea asociado y retorna sin campo password
- POST /asociados con cédula duplicada → retorna 409
- GET /asociados/:id retorna el asociado correcto
- PUT /asociados/:id actualiza nombre y telefono correctamente

Crea tests/pagos.test.js:
- POST /pagos/iniciar crea aportes en estado PENDIENTE
- POST /qr/verificar con QR válido retorna { valido: true }
- POST /qr/verificar con QR expirado retorna { valido: false }

Ejecuta npm test y confirma que todos los tests pasan.
Muestra el reporte de cobertura.

TAREA 3 — Preparación para Railway:
- Verifica que package.json tiene script "start": "node src/server.js"
- Crea railway.json con: 
  { "deploy": { "startCommand": "node src/server.js", 
                "healthcheckPath": "/health" } }
- Asegúrate de que .gitignore incluye node_modules/ y .env
- Verifica que el servidor usa process.env.PORT correctamente
- Crea backend/README.md con lista de variables de entorno requeridas

TAREA 4 — Verificación final completa:
- Ejecuta npm test → todos los tests deben pasar
- Ejecuta npm start → servidor debe levantar
- GET /health debe responder 200
- GET /estadisticas/sector debe retornar datos del seed
- Lista todos los archivos del proyecto (tree de la carpeta src/)
```

---

### 🟦 Prompt para VS Code — Preparar el panel web para Vercel

```
@web-admin/CLAUDE.md
@web-admin/src/App.jsx
@web-admin/vite.config.js

Necesito preparar el panel web para desplegarlo en Vercel.

Revisa los archivos y dime:
1. ¿Vite está configurado correctamente para producción?
2. ¿Las variables de entorno VITE_API_URL están configuradas 
   para apuntar a Railway en producción?
3. ¿Necesito un archivo vercel.json para que el routing de 
   React Router funcione correctamente en Vercel?
4. ¿Hay alguna configuración de CORS en el backend que deba 
   actualizarse para permitir el dominio de Vercel?

Muéstrame los archivos de configuración exactos que necesito crear 
o modificar para que el despliegue en Vercel funcione correctamente.
```

---
---

# 📋 Resumen — ¿Cuándo usar cada modo?

| Tarea | Modo recomendado |
|---|---|
| Inicializar un proyecto desde cero | 🟩 Claude Code terminal |
| Crear modelos y archivos nuevos | 🟩 Claude Code terminal |
| Instalar dependencias | 🟩 Claude Code terminal |
| Revisar si un archivo sigue los estándares | 🟦 VS Code |
| Depurar un error específico | 🟦 VS Code |
| Hacer un cambio puntual en un archivo | 🟦 VS Code |
| Entender cómo funciona una tecnología | 🟨 claude.ai |
| Diseñar la arquitectura de un módulo | 🟨 claude.ai |
| Resolver dudas sobre APIs externas (Wompi, Firebase) | 🟨 claude.ai |
| Generar documentación | 🟨 claude.ai |
| Planear la siguiente fase | 🟨 claude.ai |

---

# 🚨 Reglas de oro para los 3 modos

1. **Siempre empieza con `lee el CLAUDE.md`** cuando abres una sesión nueva
2. **Una tarea a la vez** — no pidas 5 cosas en el mismo prompt
3. **Verifica antes de continuar** — prueba cada tarea antes de pedir la siguiente
4. **Si algo falla**, pega el error exacto — no lo parafrasees
5. **Haz commit después de cada tarea completada** — nunca acumules cambios sin commitear

---

*Manual generado por MetaDevelopment Ltd — Plataforma Digital Ganadera v1.0*  
*support@metadevelopment.co.uk | 316 616 0377*
