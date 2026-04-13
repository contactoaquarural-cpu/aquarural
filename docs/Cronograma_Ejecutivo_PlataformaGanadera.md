# Cronograma Ejecutivo — Plataforma Digital Ganadera
> Plan completo de desarrollo para MVP | 10-12 semanas | 4-6 horas/día
> **Empresa:** MetaDevelopment Ltd | **Desarrollador:** Julián Andrés Trujillo Morales

---

## 📊 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Duración total** | 10-12 semanas (2.5-3 meses) |
| **Horas diarias** | 4-6 horas |
| **Total horas estimadas** | 280-360 horas |
| **Fases del proyecto** | 7 fases (0-6) |
| **Plataformas a construir** | 3 (Backend + App Mobile + Panel Web) |
| **Tecnologías principales** | Node.js, React Native, React.js, MongoDB |

---

## 🗺️ Mapa General del Proyecto

```
BLOQUE 1: ENTRENAMIENTO (1-2 semanas)
├─ Fase 1-Entrenamiento: Dominio del Contexto ✅
├─ Fase 2-Entrenamiento: Práctica en VS Code ✅
├─ Fase 3-Entrenamiento: Comandos Avanzados
├─ Fase 4-Entrenamiento: Sincronización Tri-modal
└─ Fase 0-Design: Google Stitch Design System

BLOQUE 2: CONSTRUCCIÓN (10-12 semanas)
├─ Semana 1-2: Backend — Fundamentos (Fase 1-3)
├─ Semana 3-5: App Móvil Completa (Fase 4)
├─ Semana 6-7: Panel Web Admin Completo (Fase 4.5)
├─ Semana 8: Noticias + Notificaciones (Fase 5)
└─ Semana 9-10: Testing, Deploy, Capacitación (Fase 6)
```

---

# BLOQUE 1: ENTRENAMIENTO (Pre-Construcción)

## 📅 Semana 0: Preparación y Entrenamiento

### Sesión 1: ✅ COMPLETADA
**Duración:** 2-3 horas

- ✅ Fase 1: Dominio del Contexto
  - Estructura de archivos CLAUDE.md
  - Lectura automática de contexto
  - Uso del símbolo @ para referencias
- ✅ Fase 2: Práctica en VS Code
  - Crear archivos con Claude Code
  - Verificar código generado
  - Sistema de múltiples terminales

---

### Sesión 2: Comandos Avanzados
**Duración:** 3-4 horas | **Objetivo:** Dominar herramientas de VS Code

#### Mañana (1.5 horas): Comandos Especiales

**Tarea 1: Comandos del Sistema (30 min)**
```
Prompt:
Escribe /help en el chat de Claude Code y explícame 
qué hace cada comando disponible.
```

**Comandos a dominar:**
- `/help` — Ver lista de comandos
- `/clear` — Limpiar conversación (cambiar de módulo)
- `/compact` — Comprimir historial (liberar tokens)

**Tarea 2: Editar Archivos Existentes (1 hora)**
```
Prompt:
@backend/src/models/Asociado.js

Agrega un nuevo campo al modelo:
- ultimoAcceso: Date (fecha del último login del asociado)

Actualiza también el método toJSON para no exponer 
el campo password cuando se serialice.
```

**Checkpoint:**
- [ ] Comandos /help, /clear, /compact funcionan
- [ ] Modelo Asociado editado correctamente
- [ ] Campo ultimoAcceso agregado

#### Tarde (1.5 horas): Referencias Múltiples

**Tarea 3: @ Múltiple (1.5 horas)**
```
Prompt:
@backend/CLAUDE.md @backend/src/models/Asociado.js

Crea el modelo Finca.js en src/models/ siguiendo 
el mismo patrón de Asociado.js.

Incluye la relación con Asociado usando asociadoId 
como referencia.
```

**Checkpoint:**
- [ ] Modelo Finca creado
- [ ] Relación con Asociado correcta
- [ ] Convenciones del proyecto respetadas

---

### Sesión 3: Sincronización Tri-modal
**Duración:** 3-4 horas | **Objetivo:** Saber cuándo usar cada modo

#### Mañana (2 horas): Teoría y Casos de Uso

**Tarea 1: Entender los 3 Modos (30 min)**

Leer y entender:
- 🟩 Terminal (Claude Code) — Para construir módulos completos
- 🟦 VS Code (Extensión) — Para revisar y editar código existente
- 🟨 claude.ai (Web) — Para diseño de arquitectura y conceptos

**Tarea 2: Ejercicio Práctico — Resolver un Bug Simulado (1.5 horas)**

**Escenario:** El endpoint POST /asociados retorna error 500

**Paso 1 — Analizar en VS Code (🟦):**
```
@backend/src/controllers/asociados.controller.js

Revisa este controller y dime si hay algún problema 
en el manejo de errores o validaciones.
```

**Paso 2 — Consultar en claude.ai (🟨):**
```
Pega el código del controller en claude.ai y pregunta:

"Este controller de Express me está dando error 500 
al intentar crear un asociado. ¿Qué podría estar causándolo?"
```

**Paso 3 — Implementar solución en VS Code (🟦):**
```
Basándote en la respuesta de claude.ai, corrige el 
controller en VS Code usando Claude Code.
```

**Checkpoint:**
- [ ] Bug identificado
- [ ] Solución implementada
- [ ] Entendiste cuándo usar cada modo

#### Tarde (1.5 horas): Flujo Real de Desarrollo

**Tarea 3: Implementar Autenticación JWT (1.5 horas)**

**Fase A — Diseño en claude.ai (🟨):**
```
Pregunta en claude.ai:

"Necesito implementar autenticación JWT en Express.
¿Cuál es la mejor arquitectura para:
1. Login que retorna accessToken y refreshToken
2. Middleware que verifica el token
3. Endpoint de refresh token"
```

**Fase B — Construcción en VS Code (🟦):**
```
@backend/CLAUDE.md

Implementa el sistema JWT completo según la arquitectura 
que diseñamos:
1. utils/jwt.utils.js
2. middleware/auth.middleware.js
3. controllers/auth.controller.js
4. routes/auth.routes.js
```

**Checkpoint:**
- [ ] Sistema JWT completo
- [ ] Login funcionando
- [ ] Refresh token funcionando
- [ ] Middleware protegiendo rutas

---

### Sesión 4: Design System con Stitch
**Duración:** 12-16 horas (3-4 días) | **Objetivo:** Design system completo

**Sigue la guía completa en:** `docs/Fase_0_Design_GoogleStitch.md`

**Resumen de entregables:**
- [ ] Proyecto en Stitch creado
- [ ] Paleta de colores definida y exportada
- [ ] Sistema de tipografía (6 niveles)
- [ ] Escala de espaciado (8pt grid)
- [ ] Componentes base diseñados
- [ ] Tokens exportados (colors.json, typography.json, spacing.json)
- [ ] CLAUDE.md actualizados con design system

---

### Sesión 5: Preparación Final
**Duración:** 2 horas | **Objetivo:** Setup de infraestructura

**Tarea 1: Git Workflow (30 min)**
```bash
# Crear ramas de trabajo
git checkout -b develop
git push origin develop

git checkout -b fase-1-backend
```

**Tarea 2: MongoDB Atlas (30 min)**
- Crear cuenta en MongoDB Atlas
- Crear cluster gratuito M0
- Obtener connection string
- Agregar a .env: MONGODB_URI

**Tarea 3: Variables de Entorno (30 min)**
- Revisar backend/.env.example
- Crear backend/.env con valores reales
- Generar JWT_SECRET y JWT_REFRESH_SECRET aleatorios

**Tarea 4: Revisión Final (30 min)**
- Revisar Manual_Fases_PlataformaDigitalGanadera.md
- Familiarizarse con los prompts de Fase 1
- Preparar ambiente de desarrollo

**Checkpoint Final de Entrenamiento:**
- [ ] Todas las Fases 1-4 de entrenamiento completadas
- [ ] Design system completo
- [ ] Git configurado
- [ ] MongoDB Atlas listo
- [ ] Variables de entorno configuradas
- [ ] Listo para construir

---

# BLOQUE 2: CONSTRUCCIÓN DEL PROYECTO

## 📅 SEMANA 1-2: Backend — Fundamentos

### 🎯 Objetivo de la Semana
Construir la API REST completa con:
- 6 modelos Mongoose
- Sistema de autenticación JWT
- CRUD de asociados y fincas
- Módulo de pagos con Wompi
- Sistema QR firmado HMAC
- Gestión de convenios

---

### DÍA 1: Modelos Mongoose (Lunes)
**Tiempo:** 4-6 horas

#### Mañana (2-3 horas)

**Tarea 1.1: Inicializar Proyecto Backend**
```
Prompt del Manual_Fases 1.1:

Inicializa el proyecto backend de Node.js. Haz lo siguiente en orden:
1. Navega a la carpeta backend/ (créala si no existe)
2. Ejecuta npm init -y
3. Instala las dependencias: express mongoose jsonwebtoken bcryptjs zod 
   dotenv cors helmet morgan winston node-cache
4. Instala dependencias de desarrollo: nodemon jest supertest
5. Crea la estructura de carpetas completa
6. Configura scripts en package.json
```

**Checkpoint:**
- [ ] Proyecto inicializado
- [ ] Dependencias instaladas
- [ ] Estructura de carpetas creada
- [ ] npm run dev funciona

**Tarea 1.2: Modelos Mongoose**
```
Prompt del Manual_Fases 1.2:

@backend/CLAUDE.md

Crea los modelos Mongoose del proyecto en backend/src/models/. 
Crea un archivo separado para cada modelo según las 
especificaciones en CLAUDE.md:

- Asociado.js
- Finca.js
- Aporte.js
- Convenio.js
- Noticia.js
- Notificacion.js
```

**Checkpoint:**
- [ ] 6 modelos creados
- [ ] Cada modelo exportado correctamente
- [ ] Validaciones incluidas
- [ ] Relaciones entre modelos correctas

#### Tarde (2-3 horas)

**Tarea 1.3: Conexión MongoDB y Seed**
```
Prompt del Manual_Fases 1.5:

Crea el script de seed en backend/src/utils/seed.js:
- Conecta a MongoDB usando MONGODB_URI
- Crea 1 usuario administrador
- Crea 10 asociados de prueba con datos del Huila
- Crea fincas asociadas
- Ejecuta: npm run seed
```

**Checkpoint:**
- [ ] Seed script creado
- [ ] Conexión a MongoDB funcionando
- [ ] Datos de prueba cargados
- [ ] Verificación en MongoDB Atlas

**Commit del día:**
```bash
git add .
git commit -m "feat: crear modelos Mongoose y seed de datos - día 1"
git push origin fase-1-backend
```

---

### DÍA 2: Autenticación JWT (Martes)
**Tiempo:** 4-6 horas

#### Mañana (2-3 horas)

**Tarea 2.1: Sistema JWT**
```
Prompt del Manual_Fases 1.3:

Implementa el módulo de autenticación JWT completo:
1. backend/src/middleware/auth.middleware.js
2. backend/src/utils/jwt.utils.js
3. backend/src/controllers/auth.controller.js
4. backend/src/routes/auth.routes.js

Incluye validación con Zod.
```

**Checkpoint:**
- [ ] Middleware de auth creado
- [ ] Utils de JWT creados
- [ ] Controller de auth completo
- [ ] Rutas registradas en app.js

#### Tarde (2-3 horas)

**Tarea 2.2: Probar Autenticación**

**En Thunder Client / Postman:**
1. POST /auth/login
   - Body: { cedula: "0000000001", password: "Admin2024*" }
   - Verificar: retorna accessToken y refreshToken

2. POST /auth/refresh
   - Body: { refreshToken: "..." }
   - Verificar: retorna nuevo accessToken

3. GET /asociados (sin token)
   - Verificar: retorna 401 Unauthorized

4. GET /asociados (con token en header)
   - Verificar: retorna lista de asociados

**Checkpoint:**
- [ ] Login funciona
- [ ] Refresh funciona
- [ ] Middleware protege rutas
- [ ] Tokens válidos por el tiempo correcto

**Commit del día:**
```bash
git add .
git commit -m "feat: implementar autenticación JWT completa - día 2"
git push origin fase-1-backend
```

---

### DÍA 3: CRUD de Asociados (Miércoles)
**Tiempo:** 4-6 horas

#### Mañana (2-3 horas)

**Tarea 3.1: Controller y Rutas de Asociados**
```
Prompt del Manual_Fases 1.4:

Implementa el CRUD completo de asociados:
1. backend/src/controllers/asociados.controller.js
2. backend/src/routes/asociados.routes.js

Incluye: crear, obtenerTodos (paginado), obtenerPorId, 
actualizar, cambiarEstado.

Validación Zod en crear.
```

**Checkpoint:**
- [ ] Controller completo
- [ ] Rutas registradas
- [ ] Validación Zod funcionando
- [ ] Password nunca expuesto en respuestas

#### Tarde (2-3 horas)

**Tarea 3.2: CRUD de Fincas**
```
Prompt:

Implementa el CRUD completo de fincas:
1. backend/src/controllers/fincas.controller.js
2. backend/src/routes/fincas.routes.js

Las fincas están vinculadas a asociados por asociadoId.
```

**Tarea 3.3: Probar Endpoints**

**En Thunder Client:**
1. POST /asociados (crear nuevo)
2. GET /asociados (listar con paginación)
3. GET /asociados/:id (obtener uno)
4. PUT /asociados/:id (actualizar)
5. POST /fincas (crear finca)
6. GET /asociados/:id/fincas (fincas de un asociado)

**Checkpoint:**
- [ ] Todos los endpoints funcionan
- [ ] Paginación funciona
- [ ] Relación asociado-finca correcta
- [ ] Formato de respuesta estándar

**Commit del día:**
```bash
git add .
git commit -m "feat: implementar CRUD asociados y fincas - día 3"
git push origin fase-1-backend
```

---

### DÍA 4: Módulo de Pagos con Wompi (Jueves)
**Tiempo:** 4-6 horas

#### Mañana (2-3 horas)

**Tarea 4.1: Integración Wompi**
```
Prompt del Manual_Fases 2.1:

Implementa la integración con Wompi:
1. npm install axios crypto
2. backend/src/services/wompi.service.js
3. backend/src/controllers/pagos.controller.js
4. backend/src/routes/pagos.routes.js

Endpoints: iniciarPago, webhook, historial
```

**Checkpoint:**
- [ ] Servicio Wompi creado
- [ ] Controller de pagos completo
- [ ] Webhook con verificación HMAC
- [ ] Variables de entorno de Wompi configuradas

#### Tarde (2-3 horas)

**Tarea 4.2: Probar Flujo de Pago**

**Pasos:**
1. POST /pagos/iniciar
   - Body: { asociadoId, meses: [{mes: 1, año: 2026}] }
   - Recibe: URL de pago de Wompi
2. Simular webhook de Wompi (con Thunder Client)
3. Verificar que aportes se actualizan a PAGADO

**Tarea 4.3: Cron Job de Estado**
```
Prompt del Manual_Fases 2.2:

Implementa el cron job de control de estado:
- backend/src/jobs/estado.job.js
- Se ejecuta diariamente a las 6:00 AM
- Actualiza estado según aportes pendientes
```

**Checkpoint:**
- [ ] Flujo de pago completo funciona
- [ ] Webhook verifica firma correctamente
- [ ] Cron job implementado
- [ ] Estados se actualizan automáticamente

**Commit del día:**
```bash
git add .
git commit -m "feat: implementar módulo de pagos Wompi y cron de estado - día 4"
git push origin fase-1-backend
```

---

### DÍA 5: Sistema QR y Convenios (Viernes)
**Tiempo:** 4-6 horas

#### Mañana (2-3 horas)

**Tarea 5.1: Sistema QR**
```
Prompt del Manual_Fases 3.1:

Implementa el sistema de carnés QR:
1. npm install qrcode
2. backend/src/services/qr.service.js
3. backend/src/controllers/qr.controller.js
4. backend/src/routes/qr.routes.js

Endpoints: generarCarnet, verificarCarnet
QR firmado con HMAC-SHA256, TTL 30 días
```

**Checkpoint:**
- [ ] Servicio QR creado
- [ ] QR genera imagen base64
- [ ] Firma HMAC funciona
- [ ] Verificación valida firma y expiración

#### Tarde (2-3 horas)

**Tarea 5.2: CRUD de Convenios**
```
Prompt del Manual_Fases 3.2:

Implementa el CRUD de convenios:
- backend/src/controllers/convenios.controller.js
- backend/src/routes/convenios.routes.js

Endpoints: crear, obtenerTodos, obtenerPorId, 
actualizar, toggleActivo
```

**Tarea 5.3: Probar QR y Convenios**

**En Thunder Client:**
1. GET /asociados/:id/qr → Genera QR
2. POST /qr/verificar → Verifica QR válido
3. POST /convenios → Crear convenio
4. GET /convenios → Listar convenios activos

**Checkpoint:**
- [ ] QR se genera correctamente
- [ ] Verificación funciona
- [ ] CRUD convenios completo
- [ ] Toggle activo/inactivo funciona

**Commit del día:**
```bash
git add .
git commit -m "feat: implementar sistema QR y gestión de convenios - día 5"
git push origin fase-1-backend
```

---

### 🎯 Checkpoint Semana 1: Backend Funcional

**Al final de la semana 1, debes tener:**
- [ ] Backend completo funcionando
- [ ] 6 modelos Mongoose creados
- [ ] Autenticación JWT completa
- [ ] CRUD de asociados y fincas
- [ ] Módulo de pagos con Wompi
- [ ] Sistema QR firmado
- [ ] Gestión de convenios
- [ ] Todos los endpoints probados

**Merge a develop:**
```bash
git checkout develop
git merge fase-1-backend
git push origin develop
```

---

## 📅 SEMANA 3-5: App Móvil Completa

### 🎯 Objetivo de las Semanas
Construir la aplicación móvil React Native completa con:
- Navegación (Auth + Main)
- Todas las pantallas
- Integración con backend
- Design system aplicado
- Push notifications

---

### DÍA 1: Setup y Navegación (Lunes Semana 3)
**Tiempo:** 4-6 horas

#### Mañana (2-3 horas)

**Tarea 1.1: Inicializar Expo**
```
Prompt del Manual_Fases 4.1:

Inicializa la aplicación móvil:
1. npx create-expo-app mobile-app --template blank
2. Instala dependencias de navegación y estado
3. Crea estructura de carpetas
4. Configura api.service.js con Axios
```

**Checkpoint:**
- [ ] Proyecto Expo creado
- [ ] Dependencias instaladas
- [ ] Estructura de carpetas correcta
- [ ] npx expo start funciona

#### Tarde (2-3 horas)

**Tarea 1.2: Stores de Zustand**
```
Prompt:

Crea los 3 stores de Zustand:
1. mobile-app/src/store/auth.store.js
   (con persistencia en SecureStore)
2. mobile-app/src/store/asociado.store.js
3. mobile-app/src/store/pagos.store.js
```

**Tarea 1.3: Navegación**
```
Prompt:

Crea la estructura de navegación:
1. src/navigation/AuthNavigator.js (Stack)
2. src/navigation/MainNavigator.js (Bottom Tabs)
3. src/navigation/index.js (decide cuál mostrar)
4. Actualiza App.js
```

**Checkpoint:**
- [ ] Stores creados
- [ ] Navegación configurada
- [ ] App alterna entre Auth y Main según token
- [ ] App corre sin errores

---

### DÍA 2-3: Pantallas de Autenticación (Martes-Miércoles)
**Tiempo:** 8-12 horas

**Tarea 2.1: LoginScreen**
```
@mobile-app/CLAUDE.md @design-tokens/colors.json

Crea LoginScreen.js con:
- Campos: cédula y contraseña
- Botón "Ingresar" → auth.store.login()
- Loading state con ActivityIndicator
- Diseño siguiendo colors.primary
```

**Tarea 2.2: RegisterScreen (3 pasos)**
```
Crea RegisterScreen.js con formulario multi-paso:
Paso 1: Nombre, cédula, password
Paso 2: Teléfono, correo, municipio
Paso 3: Datos de finca
```

**Checkpoint:**
- [ ] Login funciona y guarda token
- [ ] Registro completo funciona
- [ ] Navegación cambia tras login exitoso
- [ ] Diseño coherente con design system

---

### DÍA 4-5: Pantallas Principales (Jueves-Viernes)
**Tiempo:** 8-12 horas

**Tarea 3.1: HomeScreen**
```
@design-tokens/colors.json

Crea HomeScreen.js:
- Saludo con nombre del asociado
- Badge de estado (AL_DIA/EN_MORA/INACTIVO)
- Banner de mora si aplica
- Accesos rápidos (cards)
```

**Tarea 3.2: EstadoFinancieroScreen**
```
Crea pantalla de estado financiero:
- Lista de últimos 12 meses
- Estado por mes (PAGADO/PENDIENTE)
- Total adeudado
- Botón "Pagar meses pendientes"
```

**Tarea 3.3: PagoScreen**
```
Crea pantalla de pago:
- Checkboxes para seleccionar meses
- Cálculo de total
- Botón "Pagar con Wompi" → abre WebView
```

**Checkpoint:**
- [ ] Home muestra estado correcto
- [ ] Estado financiero carga historial
- [ ] Selección de meses funciona
- [ ] WebView de Wompi abre correctamente

---

### DÍA 6-8: QR, Convenios, Perfil (Semana 4)
**Tiempo:** 12-18 horas

**Tarea 4.1: MiCarneScreen**
```
@design-tokens/colors.json

Crea pantalla de carné QR:
- Si AL_DIA: fondo verde, QR grande
- Si EN_MORA/INACTIVO: QR bloqueado, botón "Pagar"
- Nombre y fecha de vencimiento del QR
```

**Tarea 4.2: ConveniosScreen**
```
Crea pantalla de convenios:
- Lista de convenios activos
- Agrupados por tipo
- Card por convenio (nombre, descuento, dirección)
- Botón "Ver detalle"
```

**Tarea 4.3: PerfilScreen**
```
Crea pantalla de perfil:
- Foto de perfil
- Nombre y cédula
- Botones: Editar datos, Mi finca, Cerrar sesión
```

**Checkpoint:**
- [ ] QR se muestra correctamente
- [ ] QR se bloquea si está en mora
- [ ] Convenios cargan desde API
- [ ] Perfil muestra datos del asociado
- [ ] Logout funciona

---

### DÍA 9-10: Integración y Pulido (Semana 5)
**Tiempo:** 8-12 horas

**Tarea 5.1: NotificacionesScreen**
```
Crea pantalla de notificaciones:
- Lista de notificaciones
- Punto verde en no leídas
- Tap marca como leída
```

**Tarea 5.2: Firebase FCM**
```
Configura push notifications:
1. Instalar expo-notifications
2. Obtener token FCM al login
3. Enviar token al backend (PUT /asociados/:id/fcm-token)
4. Probar recepción de notificaciones
```

**Tarea 5.3: Revisión Completa**
- Probar flujo completo: Login → Home → Pagar → Ver QR → Logout
- Verificar diseño coherente en todas las pantallas
- Corregir bugs detectados

**Checkpoint:**
- [ ] Notificaciones funcionan
- [ ] FCM token se registra
- [ ] Push notifications se reciben
- [ ] Flujo completo funciona sin errores
- [ ] App lista para pruebas con usuarios

**Commit final:**
```bash
git add .
git commit -m "feat: app móvil completa con todas las pantallas - semana 3-5"
git push origin fase-4-mobile
git checkout develop
git merge fase-4-mobile
```

---

## 📅 SEMANA 6-7: Panel Web Admin Completo

### 🎯 Objetivo de las Semanas
Construir el panel web administrativo completo con:
- Dashboard con indicadores
- Gestión de asociados (CRUD)
- Gestión de pagos y reportes
- Gestión de convenios
- Gestión de noticias
- Módulo de notificaciones
- Estadísticas y gráficas

---

### DÍA 1: Setup y Dashboard (Lunes Semana 6)
**Tiempo:** 4-6 horas

#### Mañana (2-3 horas)

**Tarea 1.1: Inicializar Vite + React**
```
Desde la raíz:
npm create vite@latest web-admin -- --template react
cd web-admin
npm install
npm install antd axios zustand react-router-dom react-query recharts
```

**Tarea 1.2: Configurar Ant Design**
```
@web-admin/CLAUDE.md @design-tokens/colors.json

Crea src/theme/antdTheme.js con los tokens del design system.
Configura ConfigProvider en main.jsx.
```

**Checkpoint:**
- [ ] Proyecto React creado
- [ ] Dependencias instaladas
- [ ] Tema Ant Design configurado
- [ ] npm run dev funciona

#### Tarde (2-3 horas)

**Tarea 1.3: Layout Principal**
```
Crea src/components/Layout/MainLayout.jsx:
- Sidebar con menú de navegación
- Header con nombre de usuario y logout
- Content area para las páginas
```

**Tarea 1.4: Dashboard**
```
Crea src/pages/Dashboard/Dashboard.jsx:
- 4 Cards con indicadores:
  * Total asociados
  * % AL_DIA
  * % EN_MORA
  * % INACTIVO
- Últimos 5 pagos recibidos (tabla)
- Últimas 3 noticias publicadas
```

**Checkpoint:**
- [ ] Layout con sidebar funciona
- [ ] Dashboard muestra indicadores
- [ ] Datos cargan desde API
- [ ] Diseño coherente con Ant Design

---

### DÍA 2-3: Gestión de Asociados (Martes-Miércoles)
**Tiempo:** 8-12 horas

**Tarea 2.1: Página de Asociados**
```
Crea src/pages/Asociados/AsociadosPage.jsx:
- Tabla con todas las columnas del modelo
- Búsqueda por nombre/cédula
- Filtro por estado (dropdown)
- Paginación (10 por página)
- Botón "Nuevo Asociado" → abre modal
```

**Tarea 2.2: Modal de Crear/Editar**
```
Crea src/pages/Asociados/AsociadoModal.jsx:
- Form de Ant Design con todos los campos
- Validación en cliente
- Submit → POST o PUT según modo
- Success message
```

**Tarea 2.3: Vista de Detalle**
```
Crea src/pages/Asociados/DetalleAsociado.jsx:
- Datos personales
- Información de finca
- Historial de pagos (tabla)
- Estado actual (badge)
- Botones: Editar, Cambiar estado
```

**Checkpoint:**
- [ ] Tabla de asociados funciona
- [ ] Búsqueda y filtros funcionan
- [ ] Modal de crear/editar funciona
- [ ] Vista de detalle completa
- [ ] Cambiar estado funciona

---

### DÍA 4: Gestión de Pagos (Jueves)
**Tiempo:** 4-6 horas

**Tarea 3.1: Página de Pagos**
```
Crea src/pages/Pagos/PagosPage.jsx:
- Tabla de aportes con filtros:
  * Por mes
  * Por año
  * Por estado (PAGADO/PENDIENTE)
- Botón "Registrar Pago Manual" (efectivo)
```

**Tarea 3.2: Reporte de Morosos**
```
Crea src/pages/Pagos/ReporteMorosos.jsx:
- Tabla de asociados en mora
- Columnas: Nombre, Cédula, Meses adeudados, Monto total
- Botones: Exportar Excel, Exportar PDF
```

**Checkpoint:**
- [ ] Tabla de pagos funciona
- [ ] Filtros funcionan
- [ ] Registro manual de pago funciona
- [ ] Reporte de morosos carga
- [ ] Exportación a Excel funciona

---

### DÍA 5: Convenios y Noticias (Viernes)
**Tiempo:** 4-6 horas

**Tarea 4.1: Página de Convenios**
```
Crea src/pages/Convenios/ConveniosPage.jsx:
- Tabla CRUD completa
- Filtro por tipo
- Toggle activo/inactivo
- Modal de crear/editar
```

**Tarea 4.2: Página de Noticias**
```
Crea src/pages/Noticias/NoticiasPage.jsx:
- Lista de noticias (publicadas y borradores)
- Botón "Nueva Noticia"
- Acciones: Editar, Eliminar, Publicar/Despublicar
```

**Tarea 4.3: Editor de Noticia**
```
Crea src/pages/Noticias/EditorNoticia.jsx:
- Form con: Título, Contenido, Imagen URL, Categoría
- Vista previa
- Botón "Guardar como borrador" y "Publicar"
```

**Checkpoint:**
- [ ] CRUD convenios completo
- [ ] CRUD noticias completo
- [ ] Publicar/despublicar funciona
- [ ] Upload de imagen funciona

---

### DÍA 6: Notificaciones (Lunes Semana 7)
**Tiempo:** 4-6 horas

**Tarea 5.1: Página de Notificaciones**
```
Crea src/pages/Notificaciones/NotificacionesPage.jsx:
- Form de envío:
  * Destinatarios (TODOS, EN_MORA, AL_DIA, ESPECIFICO)
  * Título
  * Mensaje
  * Botón "Enviar Notificación"
- Historial de notificaciones enviadas
```

**Checkpoint:**
- [ ] Envío de notificaciones funciona
- [ ] Selección de destinatarios funciona
- [ ] Historial se actualiza
- [ ] Push notifications se reciben en la app

---

### DÍA 7: Estadísticas (Martes)
**Tiempo:** 4-6 horas

**Tarea 6.1: Página de Estadísticas**
```
Crea src/pages/Estadisticas/EstadisticasPage.jsx con Recharts:

1. Indicadores principales (Cards):
   - Total cabezas de ganado
   - Total hectáreas
   - Total asociados activos

2. Gráfica de torta:
   - Distribución por tipo de producción

3. Gráfica de barras:
   - Asociados por vereda (top 10)

4. Gráfica de línea:
   - Recaudo mensual últimos 12 meses
```

**Checkpoint:**
- [ ] Indicadores cargan desde API
- [ ] Gráficas renderizan correctamente
- [ ] Datos actualizados
- [ ] Diseño responsive

---

### DÍA 8: Pulido y Testing (Miércoles)
**Tiempo:** 4-6 horas

**Tarea 7.1: Revisión Completa**
- Probar flujo completo de cada módulo
- Verificar responsive design
- Corregir bugs detectados
- Optimizar performance

**Tarea 7.2: Documentación**
- Crear README.md del panel web
- Documentar variables de entorno
- Guía de despliegue

**Checkpoint:**
- [ ] Todos los módulos funcionan
- [ ] Responsive en mobile, tablet, desktop
- [ ] Sin errores en consola
- [ ] Panel listo para producción

**Commit final:**
```bash
git add .
git commit -m "feat: panel web admin completo - semana 6-7"
git push origin fase-4.5-web-admin
git checkout develop
git merge fase-4.5-web-admin
```

---

## 📅 SEMANA 8: Noticias y Notificaciones

### DÍA 1-2: Firebase y Backend (Lunes-Martes)
**Tiempo:** 8-12 horas

**Tarea 1.1: Firebase Admin SDK**
```
Prompt del Manual_Fases 5.1:

1. npm install firebase-admin
2. Crear backend/src/services/firebase.service.js
3. Configurar credenciales de Firebase
4. Implementar enviarNotificacion() y enviarMasiva()
```

**Tarea 1.2: Controller de Notificaciones**
```
Crea backend/src/controllers/notificaciones.controller.js:
- enviarMasiva (POST /admin/notificaciones/enviar)
- historial (GET /asociados/:id/notificaciones)
- marcarLeida (PATCH /notificaciones/:id/leida)
```

**Checkpoint:**
- [ ] Firebase configurado
- [ ] Envío individual funciona
- [ ] Envío masivo funciona
- [ ] Historial se guarda en BD

---

### DÍA 3-4: Integración con App y Panel (Miércoles-Jueves)
**Tiempo:** 8-12 horas

**Tarea 2.1: Feed de Noticias en App**
```
Crea mobile-app/src/screens/noticias/NoticiasScreen.js:
- Lista de noticias publicadas
- Imagen, título, categoría, fecha
- Paginación infinita (scroll)
- Tap → navega a DetalleNoticiaScreen
```

**Tarea 2.2: Notificación Automática en Cron**
```
Actualiza backend/src/jobs/estado.job.js:
Cuando un asociado pasa a EN_MORA:
- Envía push notification
- Guarda en colección Notificacion
```

**Checkpoint:**
- [ ] Feed de noticias en app funciona
- [ ] Notificaciones automáticas se envían
- [ ] Centro de notificaciones en app funciona
- [ ] Push se reciben correctamente

---

### DÍA 5: Pruebas End-to-End (Viernes)
**Tiempo:** 4-6 horas

**Escenario de prueba completo:**
1. Crear noticia en panel web
2. Publicar noticia
3. Verificar que aparece en app móvil
4. Enviar notificación masiva desde panel
5. Verificar recepción en app
6. Marcar notificación como leída

**Checkpoint:**
- [ ] Flujo completo funciona
- [ ] Sincronización correcta
- [ ] Sin errores

**Commit:**
```bash
git add .
git commit -m "feat: noticias y notificaciones completas - semana 8"
git push origin fase-5-comunicacion
git checkout develop
git merge fase-5-comunicacion
```

---

## 📅 SEMANA 9-10: Testing, Deploy y Capacitación

### DÍA 1-3: Testing (Lunes-Miércoles Semana 9)
**Tiempo:** 12-18 horas

**Tarea 1.1: Tests de Backend**
```
Prompt del Manual_Fases 6.2:

Crea suite de tests con Jest + Supertest:
1. tests/setup.js
2. tests/auth.test.js
3. tests/asociados.test.js
4. tests/pagos.test.js

Objetivo: >80% cobertura
```

**Tarea 1.2: Tests de Integración**
- Probar flujo completo de pago
- Probar flujo de QR
- Probar notificaciones

**Checkpoint:**
- [ ] Suite de tests completa
- [ ] Cobertura >80%
- [ ] Todos los tests pasan
- [ ] CI/CD configurado (GitHub Actions)

---

### DÍA 4-5: Deploy Backend y Web (Jueves-Viernes)
**Tiempo:** 8-12 horas

**Tarea 2.1: Deploy Backend en Railway**
```
1. Crear cuenta en Railway
2. Conectar repositorio GitHub
3. Configurar variables de entorno
4. Deploy automático desde develop
5. Verificar endpoint /health
```

**Tarea 2.2: Deploy Panel Web en Vercel**
```
1. Crear cuenta en Vercel
2. Conectar repositorio GitHub
3. Configurar VITE_API_URL
4. Deploy automático
5. Verificar dominio
```

**Checkpoint:**
- [ ] Backend en Railway funciona
- [ ] Panel web en Vercel funciona
- [ ] SSL activo
- [ ] Dominio personalizado configurado

---

### DÍA 6-7: Build y Publicación App Móvil (Semana 10)
**Tiempo:** 8-12 horas

**Tarea 3.1: Build con EAS**
```
1. npx eas build --platform android --profile preview
2. Esperar build (30-60 min)
3. Descargar APK
4. Probar en dispositivo físico
```

**Tarea 3.2: Publicación en Google Play**
```
1. Crear cuenta Google Play Developer
2. Build de producción con EAS
3. Subir a Google Play Console
4. Completar ficha de la app
5. Enviar a revisión
```

**Checkpoint:**
- [ ] APK de prueba funciona
- [ ] Build de producción exitoso
- [ ] App publicada en Google Play
- [ ] App aprobada y disponible

---

### DÍA 8-9: Documentación y Capacitación (Lunes-Martes Semana 10)
**Tiempo:** 8-12 horas

**Tarea 4.1: Documentación Técnica**
- README.md completo en cada carpeta
- Documentación de endpoints (Swagger/Postman)
- Guías de deployment
- Troubleshooting común

**Tarea 4.2: Manuales de Usuario**
- Manual de usuario de la app móvil (PDF)
- Manual de administrador del panel web (PDF)
- Videos tutoriales (opcionales)

**Tarea 4.3: Capacitación al Cliente**
- Sesión de 2-3 horas con la junta directiva
- Demostración de todas las funcionalidades
- Entrega de credenciales
- Q&A

**Checkpoint:**
- [ ] Documentación completa
- [ ] Manuales creados
- [ ] Capacitación realizada
- [ ] Cliente satisfecho

---

### DÍA 10: Monitoreo y Cierre (Miércoles Semana 10)
**Tiempo:** 4 horas

**Tarea 5.1: Configurar Monitoreo**
- UptimeRobot para la API
- Sentry para errores (opcional)
- Google Analytics en panel web (opcional)

**Tarea 5.2: Merge Final**
```bash
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

**Tarea 5.3: Entrega Final**
- Entrega de código fuente
- Entrega de credenciales
- Entrega de documentación
- Facturación

---

## ✅ CHECKLIST FINAL DEL PROYECTO

### Backend
- [ ] 6 modelos Mongoose funcionando
- [ ] Autenticación JWT completa
- [ ] CRUD de asociados y fincas
- [ ] Módulo de pagos con Wompi
- [ ] Sistema QR firmado HMAC
- [ ] Gestión de convenios
- [ ] Sistema de notificaciones Firebase
- [ ] CRUD de noticias
- [ ] Estadísticas con aggregation pipeline
- [ ] Tests con >80% cobertura
- [ ] Deploy en Railway

### App Móvil
- [ ] Navegación completa (Auth + Main)
- [ ] Login y registro funcionando
- [ ] Home con estado del asociado
- [ ] Módulo de pagos con Wompi
- [ ] Carné QR digital
- [ ] Convenios comerciales
- [ ] Feed de noticias
- [ ] Centro de notificaciones
- [ ] Perfil y configuración
- [ ] Push notifications
- [ ] Publicada en Google Play Store

### Panel Web Admin
- [ ] Dashboard con indicadores
- [ ] Gestión de asociados (CRUD)
- [ ] Gestión de pagos y reportes
- [ ] Gestión de convenios
- [ ] Gestión de noticias
- [ ] Módulo de notificaciones
- [ ] Estadísticas con gráficas Recharts
- [ ] Exportación a Excel/PDF
- [ ] Deploy en Vercel

### Infraestructura
- [ ] MongoDB Atlas configurado
- [ ] Cloudinary para imágenes
- [ ] Firebase Cloud Messaging
- [ ] SSL en todos los servicios
- [ ] UptimeRobot monitoreando
- [ ] CI/CD con GitHub Actions
- [ ] Backups automáticos de BD

### Documentación
- [ ] README.md en cada carpeta
- [ ] Manual de usuario app móvil
- [ ] Manual de administrador panel web
- [ ] Documentación de API
- [ ] Guías de deployment
- [ ] Capacitación al cliente realizada

---

## 📊 ESTIMACIÓN DE HORAS POR FASE

| Fase | Duración | Horas (4-6h/día) |
|------|----------|------------------|
| Entrenamiento (Fases 1-4 + Design) | 1-2 semanas | 20-40h |
| Backend Fundamentos | 2 semanas | 40-60h |
| App Móvil | 3 semanas | 60-90h |
| Panel Web Admin | 2 semanas | 40-60h |
| Noticias + Notificaciones | 1 semana | 20-30h |
| Testing + Deploy | 2 semanas | 40-60h |
| **TOTAL** | **10-12 semanas** | **220-340 horas** |

---

## 🎯 HITOS DEL PROYECTO

```
✅ Semana 2: Backend API funcional
✅ Semana 5: App móvil completa
✅ Semana 7: Panel web admin completo
✅ Semana 8: Sistema de comunicación integrado
✅ Semana 10: Proyecto desplegado en producción
✅ Semana 10: Cliente capacitado y proyecto entregado
```

---

**🚀 Con este cronograma ejecutivo, tienes un plan claro y realista para construir la Plataforma Digital Ganadera desde cero hasta producción en 10-12 semanas.**
