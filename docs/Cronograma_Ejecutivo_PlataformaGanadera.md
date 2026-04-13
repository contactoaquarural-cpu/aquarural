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

## 🌿 ESTRATEGIA GIT DEL PROYECTO

### Estructura de Ramas

```
main                    → Producción (solo merges desde develop)
develop                 → Rama base de integración
├── fase-1-backend      → Modelos + Autenticación (Semana 1-2)
├── fase-2-pagos        → Módulo de Pagos Wompi (Semana 1-2)
├── fase-3-qr           → Sistema QR + Convenios (Semana 1-2)
├── fase-4-mobile       → App Móvil Completa (Semana 3-5)
├── fase-4.5-web-admin  → Panel Web Admin (Semana 6-7)
├── fase-5-noticias     → Noticias + Notificaciones (Semana 8)
└── fase-6-deploy       → Testing + Deploy (Semana 9-10)
```

### Flujo de Trabajo por Fase

**Al INICIAR una fase:**
```bash
# Cambia a la rama de la fase
git checkout fase-X-nombre

# Asegúrate de tener lo último (si trabajas en múltiples máquinas)
git pull origin fase-X-nombre
```

**DURANTE el día (cada 1-2 horas):**
```bash
# Commits WIP frecuentes
git add .
git commit -m "wip: [descripción breve de lo que hiciste]"

# Ejemplos:
# git commit -m "wip: crear modelo Asociado"
# git commit -m "wip: agregar validaciones a Finca"
```

**Al TERMINAR el día:**
```bash
# Commit final descriptivo
git add .
git commit -m "feat: [logro principal del día] - día X"

# Ejemplos:
# git commit -m "feat: crear todos los modelos Mongoose - día 1"
# git commit -m "feat: implementar autenticación JWT - día 2"

# Push al servidor
git push origin fase-X-nombre
```

**Al COMPLETAR la fase:**
```bash
# Cambiar a develop
git checkout develop

# Actualizar develop
git pull origin develop

# Merge de la fase completada
git merge fase-X-nombre

# Push a develop
git push origin develop

# Opcional: Crear tag de milestone
git tag fase-X-completada
git push origin fase-X-completada
```

**Al FINALIZAR el MVP (Semana 10):**
```bash
# Merge de develop a main
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

### Tipos de Commits (Conventional Commits)

| Prefijo | Cuándo Usarlo | Ejemplo |
|---------|---------------|---------|
| `feat:` | Nueva funcionalidad completa | `feat: implementar CRUD de asociados` |
| `fix:` | Corrección de bug | `fix: corregir validación de cédula` |
| `refactor:` | Mejorar código sin cambiar funcionalidad | `refactor: extraer lógica de estado a servicio` |
| `docs:` | Cambios en documentación | `docs: actualizar README con endpoints` |
| `test:` | Agregar o modificar tests | `test: agregar tests de autenticación` |
| `chore:` | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `wip:` | Trabajo en progreso (commits intermedios) | `wip: avance en HomeScreen` |

### Reglas de Oro de Git

1. **Commit frecuente** — Cada 1-2 horas de trabajo
2. **Push diario** — Al final de cada día de trabajo
3. **Mensajes descriptivos** — Que expliquen QUÉ hiciste, no CÓMO
4. **Un commit = una cosa** — No mezcles múltiples cambios
5. **Nunca hacer push a main directamente** — Siempre desde develop
6. **Probar antes de commit** — Que no haya errores de sintaxis
7. **Revisar antes de merge** — Verifica que todo funciona

---

## 🔄 SISTEMA DE SINCRONIZACIÓN DE ESTADO

### El Problema: Pérdida de Memoria de Claude

```
Claude pierde memoria entre sesiones
        ↓
No sabe qué fase estás trabajando
        ↓
No sabe qué archivos ya existen
        ↓
Tienes que re-explicar contexto cada día
```

### La Solución: Sistema de Estado Multi-Capa

```
CAPA 1: CLAUDE.md actualizado (Estado general)
CAPA 2: Checklist Diario en /daily-logs/ (Estado detallado)
CAPA 3: Prompt de Inicio Estandarizado (Recordatorio explícito)
```

---

### 📝 CAPA 1: Actualizar CLAUDE.md al Completar Cada Fase

#### Regla de Oro:
```
Actualiza SOLO:
1. /CLAUDE.md (raíz) ← SIEMPRE
2. El CLAUDE.md de la carpeta donde trabajaste ← SOLO ESE
```

#### Tabla de Qué Actualizar:

| Fase Completada | Archivos a Actualizar |
|-----------------|----------------------|
| Fase 1-3 (Backend) | `/CLAUDE.md` + `/backend/CLAUDE.md` |
| Fase 4 (App Móvil) | `/CLAUDE.md` + `/mobile-app/CLAUDE.md` |
| Fase 4.5 (Panel Web) | `/CLAUDE.md` + `/web-admin/CLAUDE.md` |
| Fase 5 (Noticias) | `/CLAUDE.md` + `/backend/CLAUDE.md` + `/mobile-app/CLAUDE.md` |
| Fase 6 (Deploy) | `/CLAUDE.md` solamente |

#### Sección a Agregar en Cada CLAUDE.md:

**En `/CLAUDE.md` (raíz):**

```markdown
## 🚦 Estado Actual del Proyecto

> **Última actualización:** [FECHA]
> **Fase activa:** [Número y nombre]
> **Rama Git activa:** [nombre-rama]

| Fase | Descripción | Estado | Fecha |
|------|-------------|--------|-------|
| Fase 1 | Modelos + Auth | ✅ Completado | 20/04/2026 |
| Fase 2 | Pagos Wompi | 🔄 En progreso | - |
| Fase 3 | QR + Convenios | ⬜ Pendiente | - |
| Fase 4 | App Móvil | ⬜ Pendiente | - |
| Fase 4.5 | Panel Web | ⬜ Pendiente | - |
| Fase 5 | Noticias | ⬜ Pendiente | - |
| Fase 6 | Deploy | ⬜ Pendiente | - |
```

**En `/backend/CLAUDE.md`:**

```markdown
## 🚦 Estado del Backend

> **Última actualización:** [FECHA]
> **Progreso:** 35% completado

### Modelos Implementados:
- ✅ Asociado.js (100%)
- ✅ Finca.js (100%)
- ✅ Aporte.js (100%)
- ⬜ Convenio.js
- ⬜ Noticia.js
- ⬜ Notificacion.js

### Endpoints Funcionando:
- ✅ POST /auth/login
- ✅ POST /auth/refresh
- ✅ GET /asociados
- ✅ POST /asociados
- 🔄 POST /pagos/iniciar (en desarrollo)

### Próximos Pasos:
1. Completar integración Wompi
2. Implementar webhook
3. Crear cron job de estado
```

**En `/mobile-app/CLAUDE.md`:**

```markdown
## 🚦 Estado de la App Móvil

> **Última actualización:** [FECHA]
> **Progreso:** 0% (no iniciada)

### Pantallas Implementadas:
- ⬜ LoginScreen
- ⬜ RegisterScreen
- ⬜ HomeScreen
- ⬜ EstadoFinancieroScreen
- ⬜ PagoScreen
- ⬜ MiCarneScreen
- ⬜ ConveniosScreen
- ⬜ PerfilScreen

### Navegación:
- ⬜ Auth Stack
- ⬜ Main Tabs
- ⬜ Integración con backend

### Próximos Pasos:
1. Inicializar proyecto Expo
2. Configurar navegación
3. Crear stores de Zustand
```

**En `/web-admin/CLAUDE.md`:**

```markdown
## 🚦 Estado del Panel Web

> **Última actualización:** [FECHA]
> **Progreso:** 0% (no iniciado)

### Páginas Implementadas:
- ⬜ Dashboard
- ⬜ AsociadosPage
- ⬜ PagosPage
- ⬜ ConveniosPage
- ⬜ NoticiasPage
- ⬜ NotificacionesPage
- ⬜ EstadisticasPage

### Componentes Base:
- ⬜ Layout principal
- ⬜ Sidebar
- ⬜ Header

### Próximos Pasos:
1. Inicializar Vite + React
2. Configurar Ant Design
3. Crear layout principal
```

---

### 📝 CAPA 2: Checklist Diario como Memoria Persistente

#### Crear Carpeta de Logs:

```bash
mkdir -p daily-logs/semana-01
mkdir -p daily-logs/semana-02
# ... (hasta semana-10)
```

#### Guardar Checklist al Final del Día:

**Cada día, guarda el checklist completado:**

```
daily-logs/
├── semana-01/
│   ├── 2026-04-15-dia-01.md
│   ├── 2026-04-16-dia-02.md
│   ├── 2026-04-17-dia-03.md
│   ├── 2026-04-18-dia-04.md
│   └── 2026-04-19-dia-05.md
├── semana-02/
│   └── ...
```

---

### 📝 CAPA 3: Prompts Estandarizados

#### 🌅 PROMPT DE INICIO DEL DÍA (Ejecutar cada mañana)

```
@/CLAUDE.md @backend/CLAUDE.md @daily-logs/semana-X/YYYY-MM-DD-dia-anterior.md

Hola Claude. Hoy es el Día X del proyecto - Semana Y.

Contexto rápido:
- Ayer completamos: [logro principal del día anterior]
- Hoy trabajaremos en: [objetivo del día según cronograma]
- Rama Git activa: fase-X-nombre

Lee los archivos CLAUDE.md y el checklist de ayer para conocer el estado actual.
¿Listo para empezar?
```

#### 🏁 PROMPT DE ACTUALIZACIÓN DE ESTADO (Al completar fase)

**Para Fases 1-3 (Backend):**

```
@/CLAUDE.md @backend/CLAUDE.md

Acabamos de completar la Fase X: [nombre de la fase].

Actualiza SOLO estos 2 archivos:

1. /CLAUDE.md (raíz):
   - Marca Fase X como ✅ Completado con fecha de hoy
   - Cambia Fase X+1 a 🔄 En progreso
   - Actualiza "Fase activa" y "Rama Git activa"

2. backend/CLAUDE.md:
   - Actualiza porcentaje de progreso
   - Marca como ✅ los modelos/controllers/endpoints creados esta fase
   - Actualiza "Próximos Pasos"

NO toques mobile-app/CLAUDE.md ni web-admin/CLAUDE.md.

Muéstrame los cambios antes de aplicarlos.
```

**Para Fase 4 (App Móvil):**

```
@/CLAUDE.md @mobile-app/CLAUDE.md

Acabamos de completar la Fase 4: App Móvil Completa.

Actualiza SOLO estos 2 archivos:

1. /CLAUDE.md (raíz):
   - Marca Fase 4 como ✅ Completado con fecha de hoy
   - Cambia Fase 4.5 a 🔄 En progreso

2. mobile-app/CLAUDE.md:
   - Actualiza progreso a 100%
   - Marca todas las pantallas como ✅
   - Marca navegación como ✅
   - Actualiza "Próximos Pasos" (integración, testing)

NO toques backend/CLAUDE.md ni web-admin/CLAUDE.md.
```

**Para Fase 4.5 (Panel Web):**

```
@/CLAUDE.md @web-admin/CLAUDE.md

Acabamos de completar la Fase 4.5: Panel Web Administrativo.

Actualiza SOLO estos 2 archivos:

1. /CLAUDE.md (raíz):
   - Marca Fase 4.5 como ✅ Completado con fecha de hoy
   - Cambia Fase 5 a 🔄 En progreso

2. web-admin/CLAUDE.md:
   - Actualiza progreso a 100%
   - Marca todas las páginas como ✅
   - Marca componentes base como ✅

NO toques backend/CLAUDE.md ni mobile-app/CLAUDE.md.
```

---

### 🔄 FLUJO COMPLETO DÍA A DÍA

```
🌅 INICIO DEL DÍA (8:00 AM):
1. git checkout fase-X-nombre
2. git pull origin fase-X-nombre
3. Ejecutar "Prompt de Inicio del Día"
4. Claude confirma que leyó el estado

💻 DURANTE EL DÍA (8:30 AM - 2:00 PM):
5. Trabajar en las tareas del cronograma
6. Commits WIP cada 1-2 horas
7. Actualizar checklist conforme avanzas

🌆 FIN DEL DÍA (2:00 PM):
8. Completar checklist del día
9. Guardar checklist en /daily-logs/semana-X/
10. git add . && git commit -m "feat: [logro del día]"
11. git push origin fase-X-nombre

🏁 AL COMPLETAR FASE (Viernes o día final):
12. Ejecutar "Prompt de Actualización de Estado"
13. Claude actualiza los CLAUDE.md correspondientes
14. Verificar cambios y confirmar
15. git add . && git commit -m "docs: actualizar estado - fase X completada"
16. git checkout develop && git merge fase-X-nombre
17. git tag fase-X-completada && git push --all && git push --tags
```

---

### 📊 EJEMPLO COMPLETO: Día 5 (Final de Semana 1)

**Al Terminar el Día 5:**

```bash
# 1. Guardar checklist
cp checklist-dia-5.md daily-logs/semana-01/2026-04-19-dia-05.md

# 2. Commit final del día
git add .
git commit -m "feat: implementar sistema QR y convenios - día 5"
git push origin fase-1-backend

# 3. Actualizar estado (porque se completó la fase)
```

**Ejecutar en Claude Code:**

```
@/CLAUDE.md @backend/CLAUDE.md

Acabamos de completar la Fase 1: Backend Fundamentos.

Actualiza estos 2 archivos:

1. /CLAUDE.md:
   - Fase 1 → ✅ Completado (19/04/2026)
   - Fase 2 → 🔄 En progreso
   - Fase activa: Fase 2 - Módulo de Pagos
   - Rama Git: fase-2-pagos

2. backend/CLAUDE.md:
   - Progreso: 35% → 40%
   - Modelos: Marcar Asociado, Finca, Aporte como ✅
   - Endpoints: Marcar auth y asociados como ✅
   - Próximos pasos: Integración Wompi

Muéstrame los cambios.
```

**Claude responde mostrando los diffs. Tú confirmas. Claude aplica cambios.**

```bash
# 4. Commit de actualización de estado
git add CLAUDE.md backend/CLAUDE.md
git commit -m "docs: actualizar estado del proyecto - fase 1 completada"
git push origin fase-1-backend

# 5. Merge a develop
git checkout develop
git pull origin develop
git merge fase-1-backend
git push origin develop

# 6. Tag de milestone
git tag backend-semana-1-completado
git push origin backend-semana-1-completado
```

**Listo. El lunes inicias Semana 2 con estado sincronizado.**

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

#### 🔄 PROMPT DE INICIO DEL DÍA

```
@/CLAUDE.md @backend/CLAUDE.md

Hola Claude. Hoy es el Día 1 del proyecto - Semana 1.

Es el primer día de construcción. Hoy inicializaremos el backend 
y crearemos los primeros modelos Mongoose.

Rama Git activa: fase-1-backend

¿Listo para empezar?
```

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

**Flujo Git del día:**
```bash
# Al iniciar (ya deberías estar en develop)
git checkout fase-1-backend

# Durante el día (cada 1-2 horas)
git add .
git commit -m "wip: inicializar proyecto backend"
git commit -m "wip: crear modelo Asociado"
git commit -m "wip: crear modelos Finca y Aporte"

# Al terminar el día
git add .
git commit -m "feat: crear modelos Mongoose y seed de datos - día 1"
git push origin fase-1-backend

# Verificar
git log --oneline -5
```

**Estado esperado:**
- ✅ Rama fase-1-backend tiene commits del día
- ✅ Código subido a GitHub
- ✅ develop aún sin cambios (harás merge al completar Semana 1)

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

**Flujo Git del día:**
```bash
# Al iniciar (continúas en fase-1-backend)
git status  # Verificar que estás en la rama correcta

# Durante el día
git add .
git commit -m "wip: crear middleware de autenticación"
git commit -m "wip: implementar JWT utils"
git commit -m "wip: crear controller de auth"

# Al terminar el día
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

**Flujo Git del día:**
```bash
# Durante el día
git add .
git commit -m "wip: crear controller de asociados"
git commit -m "wip: implementar validación Zod"
git commit -m "wip: crear CRUD de fincas"

# Al terminar
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

**Flujo Git del día:**
```bash
# Durante el día
git add .
git commit -m "wip: crear servicio Wompi"
git commit -m "wip: implementar webhook"
git commit -m "wip: agregar cron job de estado"

# Al terminar
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

**Flujo Git del día:**
```bash
# Durante el día
git add .
git commit -m "wip: implementar sistema QR"
git commit -m "wip: crear CRUD de convenios"

# Al terminar
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

#### 🔄 PROMPT DE ACTUALIZACIÓN DE ESTADO

**Ejecuta este prompt al completar la Semana 1:**

```
@/CLAUDE.md @backend/CLAUDE.md

Acabamos de completar las Fases 1, 2 y 3 del backend:
- Fase 1: Modelos + Autenticación ✅
- Fase 2: Pagos con Wompi ✅
- Fase 3: Sistema QR + Convenios ✅

Actualiza estos 2 archivos:

1. /CLAUDE.md (raíz):
   - Marca Fase 1, 2, 3 como ✅ Completado con fecha de hoy
   - Cambia Fase 4 a 🔄 En progreso
   - Fase activa: "Fase 4 - App Móvil"
   - Rama Git activa: "fase-4-mobile"

2. backend/CLAUDE.md:
   - Actualiza progreso a 100%
   - Marca TODOS los modelos como ✅
   - Marca TODOS los endpoints como ✅
   - Próximos pasos: "Backend completo. Esperando integración con frontends"

Muéstrame los cambios antes de aplicarlos.
```

**Después de que Claude actualice los archivos:**

**Merge a develop (IMPORTANTE - No olvidar):**
```bash
# Commit de actualización de estado
git add CLAUDE.md backend/CLAUDE.md
git commit -m "docs: actualizar estado del proyecto - backend completo"
git push origin fase-3-qr

# Verificar que todo está committed
git status

# Cambiar a develop
git checkout develop

# Actualizar develop (por si acaso)
git pull origin develop

# Merge de las 3 fases del backend
git merge fase-1-backend
git merge fase-2-pagos
git merge fase-3-qr

# Si hay conflictos, resuélvelos y luego:
# git add .
# git commit -m "merge: integrar backend completo a develop"

# Push a develop
git push origin develop

# Tags de milestone
git tag backend-semana-1-completado
git tag fase-1-completada
git tag fase-2-completada
git tag fase-3-completada
git push origin --tags

# Volver a develop para seguir trabajando
git checkout develop
```

**Verificación post-merge:**
```bash
# Ver historial de commits
git log --oneline --graph -15

# Verificar que develop tiene todo
git diff main..develop --stat
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
```

**Merge a develop:**
```bash
# Cambiar a develop
git checkout develop
git pull origin develop

# Merge de la app móvil
git merge fase-4-mobile

# Push a develop
git push origin develop

# Tag de milestone
git tag app-movil-completada
git push origin app-movil-completada
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
```

**Merge a develop:**
```bash
# Cambiar a develop
git checkout develop
git pull origin develop

# Merge del panel web
git merge fase-4.5-web-admin

# Push a develop
git push origin develop

# Tag de milestone
git tag panel-web-completado
git push origin panel-web-completado
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
