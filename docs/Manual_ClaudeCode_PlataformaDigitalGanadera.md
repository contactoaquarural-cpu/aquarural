# 🤖 Manual de Claude Code para Desarrollo Ágil
## Plataforma Digital Ganadera — MetaDevelopment Ltd

> **Para:** Julián Andrés Trujillo Morales  
> **Stack:** Node.js + Express + MongoDB + React Native + React.js  
> **Entorno:** Windows 10/11 + VS Code + Terminal CMD/PowerShell  
> **Objetivo:** Usar Claude Code como agente de desarrollo activo en cada fase del proyecto

---

## 📋 Tabla de Contenidos

1. [¿Qué es Claude Code y cómo funciona?](#1-qué-es-claude-code-y-cómo-funciona)
2. [Instalación y configuración en Windows](#2-instalación-y-configuración-en-windows)
3. [Configuración en VS Code](#3-configuración-en-vs-code)
4. [Conceptos clave para trabajar por agentes](#4-conceptos-clave-para-trabajar-por-agentes)
5. [Estructura del proyecto y contexto inicial](#5-estructura-del-proyecto-y-contexto-inicial)
6. [Flujo de trabajo diario con Claude Code](#6-flujo-de-trabajo-diario-con-claude-code)
7. [Prompts por fase del proyecto](#7-prompts-por-fase-del-proyecto)
8. [Patrones avanzados de instrucción](#8-patrones-avanzados-de-instrucción)
9. [Cómo corregir cuando Claude Code se equivoca](#9-cómo-corregir-cuando-claude-code-se-equivoca)
10. [Comandos de referencia rápida](#10-comandos-de-referencia-rápida)
11. [Errores comunes y soluciones](#11-errores-comunes-y-soluciones)
12. [Checklist de avance por fase](#12-checklist-de-avance-por-fase)

---

## 1. ¿Qué es Claude Code y cómo funciona?

Claude Code es un **agente de desarrollo** que vive en tu terminal. A diferencia del chat normal de Claude, aquí Claude puede:

- 📁 **Leer y escribir archivos** directamente en tu proyecto
- ⚙️ **Ejecutar comandos** en la terminal (npm install, git, etc.)
- 🔍 **Navegar tu código** entendiendo toda la estructura del proyecto
- 🔄 **Iterar en ciclos** hasta que el código funcione

### La diferencia clave con el chat normal

```
Chat normal:           Claude Code:
──────────────         ──────────────────────────────────
Tú escribes     →      Tú escribes una instrucción
Claude responde →      Claude LEE tu código
Tú copias       →      Claude ESCRIBE los archivos
Tú pegas        →      Claude EJECUTA comandos
Tú ejecutas     →      Claude VERIFICA que funcione
```

### Modelo mental: Claude Code como un desarrollador junior muy capaz

Imagina que tienes un desarrollador que:
- Sabe todo el stack tecnológico del proyecto
- Lee cualquier archivo que le señales
- Escribe código correcto a la primera la mayoría de las veces
- Necesita que tú le des **contexto claro** y **tareas específicas**
- Se confunde cuando le pides varias cosas a la vez sin orden

**Tu rol:** Arquitecto y revisor  
**Rol de Claude Code:** Ejecutor y escritor de código

---

## 2. Instalación y configuración en Windows

### Paso 1 — Verificar Node.js

Abre CMD o PowerShell y ejecuta:

```cmd
node --version
npm --version
```

Debes ver algo como `v20.x.x` y `10.x.x`. Si Node.js es menor a v18, actualízalo desde https://nodejs.org

### Paso 2 — Instalar Claude Code

```cmd
npm install -g @anthropic-ai/claude-code
```

Verifica la instalación:

```cmd
claude --version
```

### Paso 3 — Autenticación

```cmd
claude
```

Al ejecutar por primera vez, Claude Code abrirá el navegador para autenticarte con tu cuenta de Claude. Inicia sesión y acepta los permisos. Regresa a la terminal — ya está listo.

### Paso 4 — Verificar que funciona

```cmd
claude "dime hola y confirma que estás funcionando"
```

Si responde en la terminal, la instalación fue exitosa.

### Configuración de permisos en Windows

Claude Code necesita poder crear y editar archivos. Si Windows bloquea la ejecución de scripts, ejecuta PowerShell como administrador y corre:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 3. Configuración en VS Code

### Extensiones recomendadas para el proyecto

Instala estas extensiones en VS Code (Ctrl+Shift+X):

```
1. ESLint                    → Detecta errores en JavaScript
2. Prettier - Code formatter → Formatea el código automáticamente
3. MongoDB for VS Code       → Ver y editar MongoDB Atlas desde VS Code
4. REST Client               → Probar endpoints de la API sin Postman
5. GitLens                   → Historial de cambios por línea
6. Thunder Client            → Alternativa liviana a Postman
7. Auto Rename Tag           → Para el panel web en React
```

### Terminal integrada en VS Code

Abre la terminal integrada con **Ctrl + `** (acento grave). Esta terminal es donde vas a ejecutar todos los comandos de Claude Code.

**Importante:** Siempre trabaja desde la carpeta raíz del proyecto. Verifica con:

```cmd
cd
```

Debe mostrar algo como `C:\Users\Julian\plataforma-digital-ganadera`

### Configurar la terminal como CMD en VS Code

1. Abre VS Code
2. Presiona `Ctrl + Shift + P`
3. Escribe "Terminal: Select Default Profile"
4. Selecciona "Command Prompt" o "PowerShell"

---

## 4. Conceptos clave para trabajar por agentes

### ¿Qué es trabajar por agentes?

Trabajar por agentes significa dividir el proyecto en **tareas atómicas y ejecutables** que Claude Code puede completar de principio a fin sin ambigüedad. En lugar de decirle "construye la app", le dices:

```
"Crea el modelo Mongoose de Asociado con estos campos exactos: 
nombre (String, required), cedula (String, unique, required), 
telefono (String), correo (String), estado (enum: AL_DIA, EN_MORA, INACTIVO)"
```

### Los 3 niveles de instrucción

**Nivel 1 — Tarea puntual** (5–15 minutos de trabajo de Claude):
```
"Crea el archivo src/models/Asociado.js con el schema de Mongoose"
```

**Nivel 2 — Módulo completo** (30–60 minutos):
```
"Implementa el módulo de autenticación JWT: modelo de usuario, 
endpoint de login, endpoint de refresh token y middleware de autenticación"
```

**Nivel 3 — Fase completa** (varias horas, usa con cuidado):
```
"Implementa toda la Fase 1 del proyecto según el documento de stack tecnológico"
```

> 💡 **Recomendación:** Trabaja siempre en Nivel 1 o Nivel 2. El Nivel 3 puede generar código que necesita mucha revisión.

### El ciclo virtuoso de desarrollo con Claude Code

```
1. INSTRUCCIÓN CLARA  →  Le dices exactamente qué hacer
2. CLAUDE EJECUTA     →  Escribe archivos y corre comandos
3. TÚ REVISAS         →  Lees el código generado
4. PRUEBAS            →  Ejecutas npm run dev y pruebas el endpoint
5. CORRECCIÓN         →  Si algo falla, le dices exactamente qué
6. SIGUIENTE TAREA    →  Pasas a la siguiente instrucción
```

### Regla de oro: Un contexto, una tarea

❌ **Mal:**
```
"Crea los modelos, los endpoints, el middleware de autenticación, 
integra con Wompi y también haz las pantallas del móvil"
```

✅ **Bien:**
```
"Tarea 1: Crea el modelo Mongoose de Asociado en src/models/Asociado.js"
[Claude ejecuta → tú revisas → funciona]
"Tarea 2: Crea el endpoint POST /asociados en src/routes/asociados.js"
[Claude ejecuta → tú revisas → funciona]
```

---

## 5. Estructura del proyecto y contexto inicial

### Crear la estructura del monorepo

Antes de iniciar con Claude Code, crea la carpeta raíz del proyecto:

```cmd
mkdir plataforma-digital-ganadera
cd plataforma-digital-ganadera
```

Luego inicia Claude Code en esa carpeta:

```cmd
claude
```

### Prompt de contexto inicial del proyecto

La primera vez que abres Claude Code en el proyecto, dale este contexto. **Cópialo tal cual y ejecútalo:**

```
Eres el desarrollador principal de la Plataforma Digital Ganadera para la 
Asociación de Ganaderos de Garzón – Huila, Colombia. Este es el contexto 
completo del proyecto:

PROYECTO: Plataforma Digital Ganadera
EMPRESA: MetaDevelopment Ltd
DESARROLLADOR: Julián Andrés Trujillo Morales

STACK TECNOLÓGICO:
- Backend: Node.js v20 + Express.js v4 + Mongoose v8
- Base de datos: MongoDB Atlas (free tier M0)
- Autenticación: JWT (jsonwebtoken) + bcrypt
- Validación: Zod v3
- Notificaciones: Firebase Admin SDK
- Emails: Nodemailer + Gmail
- Pagos: Wompi API (pasarela colombiana)
- QR: librería qrcode npm
- Logs: Winston
- Testing: Jest + Supertest
- Cache: node-cache
- App Móvil: React Native v0.74 + Expo + Zustand + React Navigation v6
- Panel Web: React.js + Vite + Ant Design v5 + Zustand + React Query
- Hosting API: Railway
- Hosting Web: Vercel
- CI/CD: GitHub Actions

ESTRUCTURA DEL REPOSITORIO (monorepo):
plataforma-digital-ganadera/
├── backend/         (Node.js + Express + Mongoose)
├── web-admin/       (React.js + Vite + Ant Design)
├── mobile-app/      (React Native + Expo)
└── docs/

MÓDULOS DEL MVP:
1. Registro de asociados con datos personales y finca
2. Pagos de aportes mensuales (integración Wompi)
3. Control automático de estado: AL_DIA / EN_MORA / INACTIVO
4. Carné digital QR para acceso a convenios comerciales
5. Convenios con almacenes agropecuarios y veterinarias
6. Noticias del sector ganadero
7. Notificaciones push automáticas y manuales
8. Panel web administrativo para la junta directiva
9. Estadísticas del sector ganadero del municipio

Confirma que entendiste el proyecto y el stack. A partir de ahora trabajaremos 
por tareas específicas. Espera mis instrucciones antes de escribir cualquier código.
```

---

## 6. Flujo de trabajo diario con Claude Code

### Rutina de inicio de sesión

Cada vez que vayas a trabajar, sigue esta rutina:

```cmd
:: 1. Ve a la carpeta del proyecto
cd C:\Users\TuUsuario\plataforma-digital-ganadera

:: 2. Verifica en qué branch estás
git status

:: 3. Abre Claude Code
claude
```

### Estructura de una sesión de trabajo productiva

**Bloque 1 — Orientación (5 minutos):**
```
"Estamos en la Fase 2 del proyecto. Ya completamos los modelos de 
Mongoose y la autenticación JWT. Hoy vamos a implementar el módulo 
de pagos con Wompi. ¿Tienes el contexto claro?"
```

**Bloque 2 — Desarrollo (2–4 horas):**
Una tarea a la vez. Cada tarea tiene este ciclo:
1. Escribes la instrucción
2. Claude Code ejecuta
3. Tú revisas en VS Code
4. Pruebas con Thunder Client o Postman
5. Confirmas o corriges
6. Siguiente tarea

**Bloque 3 — Cierre (10 minutos):**
```cmd
git add .
git commit -m "feat: implementar módulo de pagos Wompi - fase 2"
git push origin develop
```

### Cómo abrir Claude Code con contexto de un archivo específico

```cmd
:: Abrir Claude Code enfocado en un archivo
claude --file src/models/Asociado.js

:: Abrir con contexto de toda una carpeta
claude --dir src/routes/

:: Modo interactivo normal (el más usado)
claude
```

### Comandos dentro de la sesión de Claude Code

Una vez dentro de la sesión interactiva, puedes usar:

```
/help          → Ver comandos disponibles
/clear         → Limpiar la conversación (útil al cambiar de módulo)
/compact       → Comprimir el historial para liberar contexto
Ctrl + C       → Interrumpir una tarea en ejecución
Ctrl + D       → Cerrar Claude Code
```

---

## 7. Prompts por fase del proyecto

> Cada prompt está diseñado para pegarse directamente en Claude Code. Trabaja uno a la vez, en el orden indicado.

---

### 📦 FASE 1 — Configuración, Registro y Autenticación

**Prompt 1.1 — Inicializar el backend:**
```
Inicializa el proyecto backend de Node.js. Haz lo siguiente en orden:

1. Navega a la carpeta backend/ (créala si no existe)
2. Ejecuta npm init -y
3. Instala las dependencias: express mongoose jsonwebtoken bcryptjs zod 
   dotenv cors helmet morgan winston node-cache
4. Instala dependencias de desarrollo: nodemon jest supertest @types/node
5. Crea la estructura de carpetas:
   backend/src/routes/
   backend/src/controllers/
   backend/src/middleware/
   backend/src/models/
   backend/src/jobs/
   backend/src/utils/
   backend/tests/
6. Crea el archivo backend/src/app.js con Express configurado 
   (cors, helmet, morgan, rutas base)
7. Crea backend/src/server.js que importe app.js y escuche en el puerto 3000
8. Crea backend/.env.example con las variables: PORT, MONGODB_URI, 
   JWT_SECRET, JWT_REFRESH_SECRET, NODE_ENV
9. Configura el script "dev": "nodemon src/server.js" en package.json

Al terminar ejecuta: npm run dev y confirma que el servidor levanta en puerto 3000.
```

**Prompt 1.2 — Modelos Mongoose:**
```
Crea los modelos Mongoose del proyecto en backend/src/models/. 
Crea un archivo separado para cada modelo:

Asociado.js:
- nombre: String, required, trim
- cedula: String, required, unique, trim  
- telefono: String, trim
- correo: String, lowercase, trim
- municipio: String, default: 'Garzón'
- estado: enum ['AL_DIA', 'EN_MORA', 'INACTIVO'], default: 'AL_DIA'
- foto: String (URL de Cloudinary)
- password: String, required (hasheado con bcrypt)
- fechaIngreso: Date, default: Date.now
- timestamps: true

Finca.js:
- asociadoId: ObjectId, ref: 'Asociado', required
- nombre: String, required
- hectareas: Number, min: 0
- cabezasGanado: Number, min: 0
- tipoProduccion: enum ['CARNE', 'LECHE', 'DOBLE'], required
- vereda: String
- timestamps: true

Aporte.js:
- asociadoId: ObjectId, ref: 'Asociado', required
- mes: Number, min: 1, max: 12, required
- año: Number, required
- monto: Number, required
- estado: enum ['PAGADO', 'PENDIENTE'], default: 'PENDIENTE'
- fechaPago: Date
- referenciaPago: String
- metodoPago: String
- timestamps: true

Convenio.js:
- nombre: String, required
- tipo: enum ['AGROPECUARIO', 'VETERINARIA', 'INSUMOS', 'OTRO'], required
- descuentoPorcentaje: Number, min: 0, max: 100
- descripcion: String
- direccion: String
- telefono: String
- activo: Boolean, default: true
- timestamps: true

Noticia.js:
- titulo: String, required
- contenido: String, required
- imagen: String
- categoria: enum ['GOBIERNO', 'SANIDAD', 'PRECIOS', 'EVENTO', 'INSTITUCIONAL']
- publicado: Boolean, default: false
- fechaPublicacion: Date
- timestamps: true

Después de crear cada modelo, exporta con module.exports = mongoose.model(...)
```

**Prompt 1.3 — Autenticación JWT:**
```
Implementa el módulo de autenticación JWT completo:

1. Crea backend/src/middleware/auth.middleware.js:
   - Función verifyToken: extrae Bearer token del header Authorization,
     verifica con JWT_SECRET, agrega req.user con el payload
   - Función verifyRefreshToken: verifica el refresh token
   - Exporta ambas funciones

2. Crea backend/src/utils/jwt.utils.js:
   - generateAccessToken(payload): genera token que expira en 15 minutos
   - generateRefreshToken(payload): genera token que expira en 7 días
   - Exporta ambas funciones

3. Crea backend/src/controllers/auth.controller.js con:
   - login: recibe cedula y password, busca el asociado en MongoDB,
     compara password con bcrypt.compare, retorna accessToken y refreshToken
   - refresh: recibe refreshToken, lo verifica, genera nuevo accessToken
   - logout: invalida la sesión (respuesta 200 con mensaje)

4. Crea backend/src/routes/auth.routes.js:
   - POST /auth/login → auth.controller.login
   - POST /auth/refresh → auth.controller.refresh
   - POST /auth/logout → auth.controller.logout

5. Registra las rutas en app.js

Usa validación con Zod en el controller de login: 
cedula (string, min 5), password (string, min 6).
Maneja errores con try/catch y respuestas consistentes: 
{ success: true/false, data: {}, message: '' }
```

**Prompt 1.4 — CRUD de Asociados:**
```
Implementa el CRUD completo de asociados:

1. Crea backend/src/controllers/asociados.controller.js con:
   - crear: POST, recibe datos del asociado, hashea password con bcrypt,
     guarda en MongoDB, retorna asociado sin password
   - obtenerTodos: GET, paginación (page, limit), filtro por estado,
     búsqueda por nombre o cédula, no retornar campo password
   - obtenerPorId: GET /:id, valida ObjectId, retorna asociado con finca
   - actualizar: PUT /:id, permite editar datos personales (no password)
   - cambiarEstado: PATCH /:id/estado, cambia estado manualmente

2. Crea backend/src/routes/asociados.routes.js:
   - POST /asociados → crear (público para registro)
   - GET /asociados → obtenerTodos (requiere auth middleware)
   - GET /asociados/:id → obtenerPorId (requiere auth middleware)
   - PUT /asociados/:id → actualizar (requiere auth middleware)
   - PATCH /asociados/:id/estado → cambiarEstado (requiere auth middleware)

3. Valida con Zod en el controller de crear:
   nombre (string, min 3), cedula (string, min 5, max 10),
   telefono (string, opcional), correo (email, opcional),
   municipio (string, opcional), password (string, min 6)

4. Registra las rutas en app.js

Formato de respuesta estándar en todos los endpoints:
{ success: true, data: {}, message: '', pagination: {} }
```

**Prompt 1.5 — Seed de datos iniciales:**
```
Crea el script de seed en backend/src/utils/seed.js:

1. Conecta a MongoDB usando la variable MONGODB_URI del .env
2. Crea o actualiza los datos de la asociación base
3. Crea 1 usuario administrador:
   - cedula: '0000000001'
   - nombre: 'Administrador MetaDevelopment'
   - password: 'Admin2024*' (hasheado con bcrypt)
   - estado: 'AL_DIA'
4. Crea 10 asociados de prueba con datos realistas del municipio de Garzón
   (nombres colombianos, cédulas ficticias, fincas con nombres de veredas del Huila)
5. Para cada asociado crea una finca asociada con datos variables
6. Al terminar imprime: 'Seed completado: X asociados, X fincas creadas'

Agrega el script "seed": "node src/utils/seed.js" en package.json.
Ejecuta el seed y confirma en la terminal que los datos se crearon.
```

---

### 💳 FASE 2 — Módulo de Pagos y Control de Estado

**Prompt 2.1 — Integración Wompi:**
```
Implementa la integración con Wompi para pagos en Colombia:

1. Instala: npm install axios crypto

2. Crea backend/src/utils/wompi.utils.js:
   - Configura las URLs de Wompi sandbox y producción
   - Función crearTransaccion(datos): llama a la API de Wompi,
     recibe asociadoId, meses[], monto, y retorna la URL de pago
   - Función verificarFirmaWompi(payload, firma): valida el HMAC-SHA256
     del webhook de Wompi usando WOMPI_INTEGRITY_SECRET del .env

3. Crea backend/src/controllers/pagos.controller.js:
   - iniciarPago: POST /pagos/iniciar
     Recibe asociadoId y array de meses a pagar
     Calcula monto total, crea registros Aporte en estado PENDIENTE,
     llama a Wompi para obtener URL de pago, retorna la URL
   - webhook: POST /pagos/webhook (público, sin auth middleware)
     Verifica firma HMAC de Wompi
     Si pago APROBADO: actualiza aportes a PAGADO, guarda referenciaPago
     Si pago RECHAZADO: actualiza aportes a PENDIENTE (para reintentar)
   - historial: GET /pagos/historial/:asociadoId
     Retorna todos los aportes del asociado ordenados por fecha

4. Crea backend/src/routes/pagos.routes.js con las rutas correspondientes

Agrega al .env.example: WOMPI_PUBLIC_KEY, WOMPI_PRIVATE_KEY, 
WOMPI_INTEGRITY_SECRET, WOMPI_SANDBOX=true
```

**Prompt 2.2 — Control automático de estado:**
```
Implementa el cron job de control de estado de asociados:

1. Instala: npm install node-cron

2. Crea backend/src/jobs/estado.job.js:
   - Cron que se ejecuta todos los días a las 6:00 AM
   - Lógica:
     * Para cada asociado activo, verifica si tiene aportes PENDIENTE 
       del mes anterior o anterior a ese
     * Si tiene 1 mes de mora: cambia estado a EN_MORA
     * Si tiene 3 o más meses de mora: cambia estado a INACTIVO
     * Si está al día: mantiene o cambia a AL_DIA
   - Registra en consola cuántos asociados fueron actualizados

3. Importa y ejecuta el job en backend/src/server.js

4. Crea el endpoint de reporte en backend/src/controllers/admin.controller.js:
   - GET /admin/reportes/morosos
     Retorna lista de asociados con estado EN_MORA o INACTIVO,
     incluye nombre, cédula, meses adeudados, monto total adeudado
     Soporta exportación: si query param ?formato=excel retorna datos
     estructurados para generar Excel en el panel web

5. Registra la ruta en app.js protegida con auth middleware
```

---

### 🪪 FASE 3 — QR y Convenios

**Prompt 3.1 — Generación y verificación de QR:**
```
Implementa el sistema de carnés QR digitales:

1. Instala: npm install qrcode

2. Crea backend/src/utils/qr.utils.js:
   - generarPayloadQR(asociado): crea objeto con asociadoId, nombre, 
     estado, validoHasta (30 días desde hoy)
   - firmarPayload(payload): firma con HMAC-SHA256 usando QR_SECRET del .env,
     retorna payload + firma
   - verificarFirma(payload, firma): verifica que la firma sea válida

3. Crea backend/src/controllers/qr.controller.js:
   - generarQR: GET /asociados/:id/qr
     Requiere auth, verifica que el asociado sea el mismo que hace el request
     Genera payload firmado, convierte a QR como base64 PNG
     Retorna: { qrBase64, validoHasta, estado }
   - verificarQR: POST /qr/verificar (público, para comercios aliados)
     Recibe el payload del QR escaneado
     Verifica firma, verifica que no haya expirado
     Retorna: { valido: true/false, nombre, estado, mensaje }

4. Agrega QR_SECRET al .env.example
5. Registra las rutas en app.js
```

**Prompt 3.2 — CRUD de Convenios:**
```
Implementa el módulo completo de convenios comerciales:

1. Crea backend/src/controllers/convenios.controller.js:
   - crear: POST /convenios (requiere auth admin)
   - obtenerTodos: GET /convenios (público, filtra por activo=true por defecto)
     Soporta filtro ?tipo=AGROPECUARIO y ?activo=false para admin
   - obtenerPorId: GET /convenios/:id (público)
   - actualizar: PUT /convenios/:id (requiere auth admin)
   - toggleActivo: PATCH /convenios/:id/toggle (requiere auth admin)
     Cambia activo de true a false o viceversa

2. Crea backend/src/routes/convenios.routes.js con las rutas

3. Agrega validación Zod:
   nombre (string, required), tipo (enum), descuentoPorcentaje (number, 0-100),
   descripcion (string), direccion (string), telefono (string)

4. Registra las rutas en app.js
```

---

### 📱 FASE 4 — App Móvil Completa

**Prompt 4.1 — Inicializar React Native con Expo:**
```
Inicializa la aplicación móvil con Expo en la carpeta mobile-app/:

1. Desde la raíz del monorepo ejecuta:
   npx create-expo-app mobile-app --template blank-typescript

2. Navega a mobile-app/ e instala dependencias:
   npx expo install @react-navigation/native @react-navigation/native-stack
   @react-navigation/bottom-tabs react-native-screens 
   react-native-safe-area-context
   npx expo install expo-secure-store expo-camera expo-image-picker
   npm install zustand axios

3. Crea la estructura de carpetas:
   mobile-app/src/screens/auth/
   mobile-app/src/screens/home/
   mobile-app/src/screens/pagos/
   mobile-app/src/screens/qr/
   mobile-app/src/screens/convenios/
   mobile-app/src/screens/noticias/
   mobile-app/src/screens/perfil/
   mobile-app/src/navigation/
   mobile-app/src/store/
   mobile-app/src/services/
   mobile-app/src/components/

4. Crea mobile-app/src/services/api.service.js:
   Instancia de Axios con baseURL apuntando a la API (http://localhost:3000)
   Interceptor de request que agrega el Bearer token del store de auth
   Interceptor de response que maneja errores 401 (token expirado)

5. Crea mobile-app/src/store/auth.store.js con Zustand:
   Estado: { user: null, token: null, refreshToken: null, isLoading: false }
   Acciones: login(cedula, password), logout(), refreshSession()
   Persiste token en expo-secure-store

Confirma que expo start corre sin errores.
```

**Prompt 4.2 — Pantallas de autenticación:**
```
Crea las pantallas de autenticación de la app móvil:

1. mobile-app/src/screens/auth/LoginScreen.js:
   - Formulario con campos cédula y contraseña
   - Botón "Ingresar" que llama a auth.store.login()
   - Manejo de loading state (ActivityIndicator mientras hace el request)
   - Manejo de errores (Alert con el mensaje del servidor)
   - Enlace "¿Olvidé mi contraseña?" (navega a ForgotPasswordScreen)
   - Diseño limpio con colores verde (#1A7A3C) y blanco

2. mobile-app/src/screens/auth/RegisterScreen.js:
   - Formulario multi-paso (3 pasos usando estado local):
     Paso 1: Nombre, Cédula, Contraseña, Confirmar contraseña
     Paso 2: Teléfono, Correo, Municipio
     Paso 3: Nombre finca, Hectáreas, Cabezas de ganado, Tipo producción
   - Validación básica antes de avanzar al siguiente paso
   - Botón "Registrarme" en el paso 3 que llama a la API

3. mobile-app/src/navigation/AuthNavigator.js:
   - Stack navigator con LoginScreen y RegisterScreen
   - Sin header en LoginScreen

4. Actualiza App.js para mostrar AuthNavigator si no hay sesión activa,
   o MainNavigator si hay sesión (lo crearemos en el siguiente prompt)
```

---

### 📰 FASE 5 — Noticias y Notificaciones

**Prompt 5.1 — Sistema de notificaciones push:**
```
Implementa el sistema de notificaciones push con Firebase:

1. Instala: npm install firebase-admin

2. Crea backend/src/utils/firebase.utils.js:
   - Inicializa Firebase Admin SDK con las credenciales del .env
   - Función enviarNotificacion(token, titulo, cuerpo, datos): 
     envía push notification a un dispositivo específico
   - Función enviarNotificacionMasiva(tokens[], titulo, cuerpo, datos):
     envía a múltiples dispositivos usando sendMulticast
   - Exporta ambas funciones

3. Crea backend/src/controllers/notificaciones.controller.js:
   - enviarMasiva: POST /admin/notificaciones/enviar (requiere auth admin)
     Recibe: destinatarios (enum: TODOS, EN_MORA, AL_DIA, ESPECIFICO),
     asociadoId (si es ESPECIFICO), titulo, mensaje
     Busca los tokens FCM de los destinatarios y envía
   - historial: GET /asociados/:id/notificaciones
     Retorna las últimas 50 notificaciones del asociado

4. Modelo Notificacion en backend/src/models/Notificacion.js:
   - asociadoId: ObjectId ref Asociado
   - titulo: String
   - mensaje: String
   - leido: Boolean, default: false
   - tipo: enum ['MORA', 'NOTICIA', 'CONVENIO', 'SISTEMA']
   - timestamps: true

5. Integra el envío automático en el cron de estado:
   Cuando un asociado pasa a EN_MORA envía push:
   "Tu membresía está en mora. Realiza tu pago para mantener tus beneficios."

Agrega al .env.example: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, 
FIREBASE_CLIENT_EMAIL
```

---

### 📊 FASE 6 — Estadísticas, Pruebas y Despliegue

**Prompt 6.1 — API de estadísticas:**
```
Implementa el módulo de estadísticas del sector ganadero:

1. Crea backend/src/controllers/estadisticas.controller.js:

   - sector: GET /estadisticas/sector (público)
     Agrega datos usando MongoDB aggregation pipeline:
     * Total de asociados registrados
     * Total de asociados AL_DIA, EN_MORA, INACTIVO (con porcentajes)
     * Total de cabezas de ganado en el municipio
     * Total de hectáreas registradas
     * Distribución por tipo de producción (CARNE, LECHE, DOBLE) con porcentajes
     * Top 5 veredas con más asociados
     Usa node-cache para cachear el resultado por 1 hora

   - financiero: GET /estadisticas/financiero (requiere auth admin)
     * Recaudo total del mes actual vs mes anterior
     * Recaudo por mes de los últimos 12 meses (para gráfica de línea)
     * Proyección del mes actual basada en el histórico
     * Total adeudado por asociados en mora

2. Registra las rutas en app.js
3. Prueba ambos endpoints con Thunder Client y confirma las respuestas
```

**Prompt 6.2 — Suite de pruebas:**
```
Crea la suite de pruebas con Jest y Supertest:

1. Configura Jest en backend/package.json:
   "jest": { "testEnvironment": "node", "testTimeout": 30000 }
   Script: "test": "jest --coverage", "test:watch": "jest --watch"

2. Crea backend/tests/setup.js:
   - Conecta a MongoDB de prueba (MONGODB_URI_TEST del .env)
   - Limpia las colecciones antes de cada test suite
   - Cierra la conexión al terminar

3. Crea backend/tests/auth.test.js:
   - Test: POST /auth/login con credenciales válidas → retorna tokens
   - Test: POST /auth/login con credenciales inválidas → retorna 401
   - Test: GET /asociados sin token → retorna 401
   - Test: GET /asociados con token válido → retorna lista

4. Crea backend/tests/asociados.test.js:
   - Test: POST /asociados crea asociado correctamente
   - Test: POST /asociados con cédula duplicada → retorna error 409
   - Test: GET /asociados/:id retorna el asociado correcto
   - Test: PUT /asociados/:id actualiza los datos

5. Crea backend/tests/pagos.test.js:
   - Test: POST /pagos/iniciar crea aportes en estado PENDIENTE
   - Test: POST /pagos/webhook actualiza estado a PAGADO

Ejecuta: npm test y confirma que todos los tests pasan con >80% de cobertura.
```

**Prompt 6.3 — Despliegue en Railway:**
```
Prepara el proyecto backend para despliegue en Railway:

1. Crea backend/Procfile:
   web: node src/server.js

2. Crea backend/railway.json:
   {
     "build": { "builder": "NIXPACKS" },
     "deploy": { "startCommand": "node src/server.js", "healthcheckPath": "/health" }
   }

3. Agrega endpoint de health check en app.js:
   GET /health → retorna { status: 'ok', timestamp: new Date(), version: '1.0.0' }

4. Actualiza backend/src/server.js para usar process.env.PORT con fallback a 3000

5. Crea el archivo .gitignore en backend/:
   node_modules/, .env, coverage/, *.log

6. Crea backend/README.md con:
   - Descripción del proyecto
   - Variables de entorno requeridas (lista completa del .env.example)
   - Comandos: npm run dev, npm test, npm start
   - Documentación básica de los endpoints principales

Verifica que npm start funcione localmente antes del despliegue.
```

---

## 8. Patrones avanzados de instrucción

### Patrón 1 — Continuar donde se quedó

Cuando Claude Code se interrumpe o necesitas retomar:

```
"Revisé el código de la Fase 1. Los modelos de Mongoose están correctos 
y el servidor levanta bien. El endpoint POST /asociados funciona pero 
falta validación de cédula duplicada que retorne 409. Corrígelo."
```

### Patrón 2 — Revisar y mejorar código existente

```
"Lee el archivo src/controllers/pagos.controller.js y dime:
1. ¿Hay algún caso de error que no esté manejado?
2. ¿El manejo del webhook de Wompi es seguro?
3. Mejora el manejo de errores sin cambiar la lógica de negocio"
```

### Patrón 3 — Depurar un error específico

```
"Estoy obteniendo este error al llamar POST /auth/login:
[pega el error exacto de la terminal]

El código del controller está en src/controllers/auth.controller.js.
Lee el archivo e identifica la causa. Muéstrame solo los cambios necesarios."
```

### Patrón 4 — Generar datos de prueba

```
"Genera un script en backend/tests/fixtures/asociados.fixtures.js 
con 20 asociados ficticios del municipio de Garzón para usar en los tests.
Incluye nombres colombianos realistas, cédulas de 10 dígitos ficticias 
y nombres de fincas de veredas del Huila."
```

### Patrón 5 — Refactorizar sin romper funcionalidad

```
"El archivo src/controllers/asociados.controller.js tiene 300 líneas.
Refactorízalo extrayendo la lógica de validación a src/validators/asociados.validator.js
y la lógica de base de datos a src/services/asociados.service.js.
Los tests existentes en tests/asociados.test.js deben seguir pasando."
```

### Patrón 6 — Documentar código existente

```
"Agrega comentarios JSDoc a todas las funciones en src/controllers/qr.controller.js.
Incluye descripción, parámetros, retorno y ejemplos de respuesta de la API."
```

---

## 9. Cómo corregir cuando Claude Code se equivoca

### Caso 1 — El código no compila o tiene errores de sintaxis

```
"El código que escribiste en src/models/Aporte.js tiene un error de sintaxis.
El error exacto es: [pega el error]
Lee el archivo y corrígelo. Solo ese archivo."
```

### Caso 2 — La lógica no es la correcta

```
"La función calcularEstado en el cron job no está funcionando bien.
Cuando un asociado tiene aportes de enero y febrero PENDIENTE en 2024,
debería quedar EN_MORA pero queda AL_DIA.
Revisa la lógica de comparación de fechas y corrígela."
```

### Caso 3 — Claude Code modificó archivos que no debía

```
"Revertiste cambios en src/middleware/auth.middleware.js que yo había hecho.
Ese archivo estaba correcto. Restaura estos cambios:
[describe los cambios que quieres restaurar]"
```

### Caso 4 — La respuesta de la API no tiene el formato correcto

```
"El endpoint GET /asociados retorna:
{ data: [...] }

Pero necesito que retorne:
{ success: true, data: [...], pagination: { total, page, limit } }

Actualiza el controller para cumplir este formato en todos los endpoints."
```

### Caso 5 — Claude Code se confunde con el contexto

Si Claude Code empieza a responder cosas que no tienen sentido, escribe:

```
/clear
```

Y luego vuelve a dar el contexto del proyecto antes de continuar.

---

## 10. Comandos de referencia rápida

### Terminal — Comandos del día a día

```cmd
:: Navegar al proyecto
cd C:\Users\TuUsuario\plataforma-digital-ganadera\backend

:: Iniciar servidor de desarrollo
npm run dev

:: Correr tests
npm test

:: Ver logs en tiempo real
npm run dev 2>&1 | findstr /i "error\|warn\|info"

:: Instalar una nueva dependencia
npm install nombre-paquete

:: Ver dependencias instaladas
npm list --depth=0
```

### Git — Control de versiones

```cmd
:: Ver estado actual
git status

:: Crear rama para una fase
git checkout -b fase-2-pagos

:: Agregar y hacer commit
git add .
git commit -m "feat: implementar webhook de Wompi - fase 2"

:: Subir rama al repositorio
git push origin fase-2-pagos

:: Volver a la rama principal de desarrollo
git checkout develop

:: Fusionar una fase completada
git merge fase-2-pagos
```

### MongoDB — Comandos útiles

```cmd
:: Conectar a MongoDB Atlas desde mongosh (si lo tienes instalado)
mongosh "tu-connection-string-de-atlas"

:: Ver colecciones
show collections

:: Ver todos los asociados
db.asociados.find().pretty()

:: Borrar todos los datos de prueba
db.asociados.deleteMany({})
db.fincas.deleteMany({})
```

### Claude Code — Comandos dentro de la sesión

```
/help          → Lista de comandos disponibles
/clear         → Limpiar contexto de la conversación
/compact       → Comprimir historial (útil después de mucho trabajo)
Ctrl + C       → Cancelar tarea en ejecución
Ctrl + D       → Salir de Claude Code
```

---

## 11. Errores comunes y soluciones

### Error: "Cannot find module"
```
Causa: Importación de un archivo que no existe o ruta incorrecta
Solución: 
claude "Tengo este error: Cannot find module './models/Asociado'. 
Verifica las rutas de importación en src/controllers/asociados.controller.js"
```

### Error: "MongoServerError: E11000 duplicate key"
```
Causa: Intentas insertar un documento con un campo unique que ya existe
Solución: 
claude "Maneja el error E11000 de MongoDB en el controller de asociados.
Cuando la cédula ya existe, retorna 409 con mensaje: 'La cédula ya está registrada'"
```

### Error: "JsonWebTokenError: invalid signature"
```
Causa: JWT_SECRET en .env no coincide con el que se usó para generar el token
Solución: Verifica que JWT_SECRET esté correctamente definido en .env
y que no tenga espacios al inicio o al final
```

### Error: "CORS policy" en el panel web
```
Solución:
claude "El panel web en React está obteniendo error de CORS al llamar 
a la API en localhost:3000. Actualiza la configuración de CORS en app.js 
para permitir origen http://localhost:5173 (Vite)"
```

### Error: Claude Code hace cambios en archivos equivocados
```
Solución: Sé más específico en el prompt:
"Modifica SOLO el archivo src/controllers/auth.controller.js. 
No toques ningún otro archivo."
```

### Claude Code genera código que no sigue el patrón del proyecto
```
Solución: Muéstrale un ejemplo del patrón correcto:
"El formato de respuesta en todos los controllers es:
res.json({ success: true, data: resultado, message: 'descripción' })
Actualiza el controller de pagos para seguir este mismo patrón."
```

---

## 12. Checklist de avance por fase

Usa este checklist para saber exactamente en qué punto estás y qué falta.

### ✅ Fase 1 — Configuración y Registro
- [ ] Carpeta backend/ inicializada con npm y dependencias instaladas
- [ ] Estructura de carpetas creada (routes, controllers, middleware, models)
- [ ] Conexión a MongoDB Atlas funcionando
- [ ] Modelos Mongoose creados: Asociado, Finca, Aporte, Convenio, Noticia
- [ ] Autenticación JWT: login, refresh, middleware
- [ ] CRUD completo de asociados
- [ ] CRUD completo de fincas
- [ ] Seed de 10 asociados de prueba ejecutado
- [ ] `npm run dev` levanta sin errores en puerto 3000
- [ ] Rama `fase-1-base` pusheada a GitHub

### ✅ Fase 2 — Pagos y Control de Estado
- [ ] Integración Wompi configurada (sandbox)
- [ ] Endpoint POST /pagos/iniciar funcionando
- [ ] Webhook POST /pagos/webhook verificando firma HMAC
- [ ] Cron job de estado ejecutándose cada día
- [ ] Lógica AL_DIA / EN_MORA / INACTIVO correcta
- [ ] Endpoint GET /admin/reportes/morosos funcionando
- [ ] Flujo de pago completo probado en sandbox de Wompi
- [ ] Rama `fase-2-pagos` pusheada a GitHub

### ✅ Fase 3 — QR y Convenios
- [ ] Endpoint GET /asociados/:id/qr generando QR base64
- [ ] QR firmado con HMAC-SHA256
- [ ] Endpoint POST /qr/verificar validando QR
- [ ] QR inválido cuando asociado está EN_MORA o INACTIVO
- [ ] CRUD completo de convenios
- [ ] Filtros por tipo y activo funcionando
- [ ] Rama `fase-3-qr-convenios` pusheada a GitHub

### ✅ Fase 4 — App Móvil
- [ ] Proyecto Expo inicializado en mobile-app/
- [ ] Navegación configurada (Auth + Main stacks)
- [ ] Login screen funcional conectada a la API
- [ ] Registro multi-paso funcionando
- [ ] Pantalla Home con estado del asociado
- [ ] Pantalla de Pagos con integración Wompi (WebView)
- [ ] Pantalla Mi Carné mostrando QR
- [ ] Pantalla de Convenios con lista y filtros
- [ ] Pantalla de Perfil con edición de datos
- [ ] `expo start` corre sin errores, app funcional en emulador

### ✅ Fase 5 — Noticias y Notificaciones
- [ ] Firebase Admin SDK configurado
- [ ] CRUD de noticias en la API
- [ ] Endpoint de envío de notificaciones masivas
- [ ] Cron de mora envía notificación automática
- [ ] Historial de notificaciones por asociado
- [ ] Feed de noticias en la app móvil

### ✅ Fase 6 — Estadísticas, Pruebas y Despliegue
- [ ] Endpoint /estadisticas/sector con aggregation pipeline
- [ ] Endpoint /estadisticas/financiero para admin
- [ ] Cache de 1 hora en estadísticas
- [ ] Suite de tests con Jest: auth, asociados, pagos
- [ ] Cobertura de tests >80%
- [ ] Backend desplegado en Railway con dominio propio
- [ ] Panel web desplegado en Vercel
- [ ] SSL activo y UptimeRobot monitoreando
- [ ] App publicada en Google Play Store
- [ ] App publicada en Apple App Store
- [ ] Capacitación al administrador completada

---

## 🎯 Consejo final

**Claude Code es tan bueno como las instrucciones que le das.**

La diferencia entre un desarrollador que avanza rápido y uno que se frustra con Claude Code está en la claridad de las instrucciones. Antes de escribir un prompt, hazte estas preguntas:

1. ¿Le estoy diciendo **exactamente qué archivo** crear o modificar?
2. ¿Le estoy diciendo **qué campos, validaciones o lógica** incluir?
3. ¿Le estoy diciendo **cómo verificar** que funcionó?
4. ¿Estoy pidiendo **una sola cosa** o varias a la vez?

Si respondes sí a las cuatro preguntas, el prompt va a funcionar.

---

*Manual generado por MetaDevelopment Ltd — Plataforma Digital Ganadera v1.0*  
*support@metadevelopment.co.uk | 316 616 0377*
