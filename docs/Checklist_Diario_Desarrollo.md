# Checklist Diario de Desarrollo
> Plantilla para tracking diario del progreso del proyecto
> **Proyecto:** Plataforma Digital Ganadera | **Empresa:** MetaDevelopment Ltd

---

## 📋 Cómo Usar Este Checklist

1. **Copia esta plantilla** al inicio de cada día de trabajo
2. **Marca las tareas** con ✅ cuando las completes
3. **Anota problemas** en la sección de Notas del Día
4. **Haz commit** al final del día con el resumen
5. **Archiva** en una carpeta `/daily-logs/` (opcional)

---

## 🗓️ PLANTILLA DIARIA

```markdown
# DÍA [X] — [FECHA: DD/MM/AAAA]

**Semana:** [Número de semana del cronograma]
**Fase:** [Backend / App Móvil / Panel Web / Testing / Deploy]
**Objetivo del día:** [Descripción breve del objetivo principal]
**Tiempo estimado:** [4-6 horas]
**Tiempo real:** [Completar al final del día]

---

## 🌅 MORNING SESSION (2-3 horas)

### Tareas Planeadas:
☐ [Tarea 1 de la mañana]
☐ [Tarea 2 de la mañana]
☐ [Tarea 3 de la mañana]

### Prompts de Claude Code Usados:
```
[Pega aquí los prompts que usaste en la mañana]
```

### Archivos Creados/Modificados:
- [ ] archivo1.js
- [ ] archivo2.js
- [ ] archivo3.js

---

## 🌆 AFTERNOON SESSION (2-3 horas)

### Tareas Planeadas:
☐ [Tarea 1 de la tarde]
☐ [Tarea 2 de la tarde]
☐ [Tarea 3 de la tarde]

### Prompts de Claude Code Usados:
```
[Pega aquí los prompts que usaste en la tarde]
```

### Archivos Creados/Modificados:
- [ ] archivo4.js
- [ ] archivo5.js

---

## ✅ CHECKPOINT DEL DÍA

### Verificaciones Técnicas:
☐ Todos los archivos creados están en la ubicación correcta
☐ No hay errores de sintaxis (ESLint/TypeScript)
☐ Código sigue las convenciones del CLAUDE.md
☐ Endpoints probados en Thunder Client/Postman (si aplica)
☐ Componentes renderizados sin errores (si aplica)
☐ Tests pasan (si aplica)

### Verificaciones de Integración:
☐ Frontend conecta con backend correctamente (si aplica)
☐ Tokens de autenticación funcionan (si aplica)
☐ Navegación entre pantallas funciona (si aplica)
☐ Datos se guardan en MongoDB correctamente (si aplica)

---

## 🐛 PROBLEMAS ENCONTRADOS

| Problema | Solución | Tiempo perdido |
|----------|----------|----------------|
| [Descripción del problema 1] | [Cómo se resolvió] | [X minutos] |
| [Descripción del problema 2] | [Cómo se resolvió] | [X minutos] |

---

## 💡 APRENDIZAJES DEL DÍA

1. [Algo nuevo que aprendiste sobre el stack tecnológico]
2. [Un patrón de código que funcionó muy bien]
3. [Una mejor práctica que aplicaste]

---

## 📝 NOTAS PARA MAÑANA

**Pendientes para el próximo día:**
- [ ] [Tarea pendiente 1]
- [ ] [Tarea pendiente 2]

**Recordatorios:**
- [Algo importante que no debes olvidar]
- [Configuración que hay que verificar]

---

## 🔄 GIT COMMIT

**Branch actual:** `[nombre-de-la-rama]`

**Commit del día:**
```bash
git add .
git commit -m "[tipo]: [descripción breve] - día [X]"
git push origin [nombre-de-la-rama]
```

**Ejemplo:**
```bash
git add .
git commit -m "feat: crear modelos Mongoose completos - día 1"
git push origin fase-1-backend
```

---

## 📊 PROGRESO GENERAL

**Horas acumuladas esta semana:** [X/30 horas]
**Días completados del cronograma:** [X/50 días]
**Porcentaje del proyecto:** [X%]

**Estado emocional:** 😊 / 😐 / 😓
**Nivel de energía:** Alta / Media / Baja

---
```

---

## 📌 EJEMPLOS DE CHECKLISTS COMPLETOS

### Ejemplo 1: Día de Backend

```markdown
# DÍA 1 — 15/04/2026

**Semana:** 1
**Fase:** Backend — Fundamentos
**Objetivo del día:** Crear todos los modelos Mongoose
**Tiempo estimado:** 6 horas
**Tiempo real:** 5.5 horas

---

## 🌅 MORNING SESSION (3 horas)

### Tareas Planeadas:
✅ Inicializar proyecto backend con npm
✅ Instalar todas las dependencias
✅ Crear estructura de carpetas
✅ Configurar scripts en package.json

### Prompts de Claude Code Usados:
```
@backend/CLAUDE.md

Inicializa el proyecto backend de Node.js siguiendo 
las instrucciones del Manual_Fases 1.1
```

### Archivos Creados/Modificados:
- [x] package.json
- [x] src/app.js
- [x] src/server.js
- [x] .env.example

---

## 🌆 AFTERNOON SESSION (2.5 horas)

### Tareas Planeadas:
✅ Crear modelo Asociado.js
✅ Crear modelo Finca.js
✅ Crear modelo Aporte.js
✅ Verificar relaciones entre modelos

### Prompts de Claude Code Usados:
```
@backend/CLAUDE.md

Crea los modelos Mongoose en src/models/:
- Asociado.js
- Finca.js
- Aporte.js

Sigue las especificaciones exactas del CLAUDE.md
```

### Archivos Creados/Modificados:
- [x] src/models/Asociado.js
- [x] src/models/Finca.js
- [x] src/models/Aporte.js

---

## ✅ CHECKPOINT DEL DÍA

### Verificaciones Técnicas:
✅ Todos los archivos creados están en la ubicación correcta
✅ No hay errores de sintaxis (ESLint/TypeScript)
✅ Código sigue las convenciones del CLAUDE.md
☐ Endpoints probados en Thunder Client/Postman (N/A hoy)
☐ Componentes renderizados sin errores (N/A hoy)
☐ Tests pasan (N/A hoy)

### Verificaciones de Integración:
☐ Frontend conecta con backend correctamente (N/A hoy)
☐ Tokens de autenticación funcionan (N/A hoy)
☐ Navegación entre pantallas funciona (N/A hoy)
✅ Datos se guardan en MongoDB correctamente (verificado con seed)

---

## 🐛 PROBLEMAS ENCONTRADOS

| Problema | Solución | Tiempo perdido |
|----------|----------|----------------|
| npm install falló por problema de red | Cambié a npm install con --legacy-peer-deps | 15 min |
| Mongoose no reconocía el enum en estado | Faltaban comillas en los valores del enum | 10 min |

---

## 💡 APRENDIZAJES DEL DÍA

1. Los enums en Mongoose requieren array de strings, no objetos
2. El campo timestamps: true agrega createdAt y updatedAt automáticamente
3. Es mejor validar en el schema de Mongoose que en el controller

---

## 📝 NOTAS PARA MAÑANA

**Pendientes para el próximo día:**
- [ ] Crear modelos restantes (Convenio, Noticia, Notificacion)
- [ ] Implementar autenticación JWT
- [ ] Probar conexión a MongoDB Atlas

**Recordatorios:**
- Verificar que JWT_SECRET esté en .env antes de implementar auth
- Revisar documentación de bcrypt para hashear passwords

---

## 🔄 GIT COMMIT

**Branch actual:** `fase-1-backend`

**Commit del día:**
```bash
git add .
git commit -m "feat: crear primeros 3 modelos Mongoose (Asociado, Finca, Aporte) - día 1"
git push origin fase-1-backend
```

---

## 📊 PROGRESO GENERAL

**Horas acumuladas esta semana:** 5.5/30 horas
**Días completados del cronograma:** 1/50 días
**Porcentaje del proyecto:** 2%

**Estado emocional:** 😊 (muy productivo)
**Nivel de energía:** Alta

---
```

---

### Ejemplo 2: Día de App Móvil

```markdown
# DÍA 12 — 26/04/2026

**Semana:** 3
**Fase:** App Móvil — Pantallas Principales
**Objetivo del día:** Crear HomeScreen y EstadoFinancieroScreen
**Tiempo estimado:** 6 horas
**Tiempo real:** 6.5 horas

---

## 🌅 MORNING SESSION (3 horas)

### Tareas Planeadas:
✅ Crear HomeScreen con saludo y estado
✅ Implementar badge de estado (AL_DIA/EN_MORA/INACTIVO)
✅ Agregar banner de mora condicional
✅ Crear cards de accesos rápidos

### Prompts de Claude Code Usados:
```
@mobile-app/CLAUDE.md @design-tokens/colors.json

Crea HomeScreen.js en src/screens/home/:
- Saludo personalizado con nombre del asociado
- Badge de estado usando colors.estados
- Banner de mora si estado === 'EN_MORA'
- 4 cards de accesos rápidos
```

### Archivos Creados/Modificados:
- [x] src/screens/home/HomeScreen.js
- [x] src/components/EstadoBadge.js (reutilizable)
- [x] src/components/AccesoRapidoCard.js

---

## 🌆 AFTERNOON SESSION (3.5 horas)

### Tareas Planeadas:
✅ Crear EstadoFinancieroScreen
✅ Implementar lista de últimos 12 meses
✅ Mostrar estado por mes (PAGADO/PENDIENTE)
✅ Calcular y mostrar total adeudado
☐ Agregar botón "Pagar meses pendientes" (dejado para mañana)

### Prompts de Claude Code Usados:
```
@mobile-app/CLAUDE.md

Crea EstadoFinancieroScreen.js:
- FlatList con últimos 12 meses
- Cada item muestra: mes, año, monto, estado
- Total adeudado en card superior
- Diseño coherente con design system
```

### Archivos Creados/Modificados:
- [x] src/screens/pagos/EstadoFinancieroScreen.js
- [x] src/components/MesAporteItem.js

---

## ✅ CHECKPOINT DEL DÍA

### Verificaciones Técnicas:
✅ Todos los archivos creados están en la ubicación correcta
✅ No hay errores de sintaxis (ESLint/TypeScript)
✅ Código sigue las convenciones del CLAUDE.md
☐ Endpoints probados en Thunder Client/Postman (N/A hoy)
✅ Componentes renderizados sin errores
☐ Tests pasan (N/A hoy)

### Verificaciones de Integración:
✅ Frontend conecta con backend correctamente
✅ Tokens de autenticación funcionan
✅ Navegación entre pantallas funciona
✅ Datos se cargan desde API correctamente

---

## 🐛 PROBLEMAS ENCONTRADOS

| Problema | Solución | Tiempo perdido |
|----------|----------|----------------|
| FlatList no renderizaba nada | Faltaba el keyExtractor con _id de Mongo | 20 min |
| Badge de estado no tenía los colores correctos | Importé mal los tokens, corregí import path | 10 min |
| API retornaba 401 en EstadoFinanciero | Token expirado, implementé refresh automático | 30 min |

---

## 💡 APRENDIZAJES DEL DÍA

1. FlatList siempre necesita keyExtractor cuando usas datos de Mongo
2. Los tokens de diseño deben importarse desde utils/designTokens, no directamente
3. Es mejor implementar refresh automático del token que pedirle al usuario que haga login de nuevo

---

## 📝 NOTAS PARA MAÑANA

**Pendientes para el próximo día:**
- [ ] Agregar botón "Pagar meses pendientes" en EstadoFinanciero
- [ ] Crear PagoScreen con checkboxes para seleccionar meses
- [ ] Integrar WebView de Wompi

**Recordatorios:**
- Revisar documentación de WebView en Expo
- Probar flujo de pago en sandbox de Wompi primero

---

## 🔄 GIT COMMIT

**Branch actual:** `fase-4-mobile`

**Commit del día:**
```bash
git add .
git commit -m "feat: crear HomeScreen y EstadoFinancieroScreen - día 12"
git push origin fase-4-mobile
```

---

## 📊 PROGRESO GENERAL

**Horas acumuladas esta semana:** 19/30 horas
**Días completados del cronograma:** 12/50 días
**Porcentaje del proyecto:** 24%

**Estado emocional:** 😊 (avance sólido)
**Nivel de energía:** Media (cansado pero satisfecho)

---
```

---

## 📌 PLANTILLA RÁPIDA (Para Copiar y Pegar)

```markdown
# DÍA __ — __/__/____
**Semana:** __
**Fase:** __________
**Objetivo:** _______________
**Tiempo estimado:** __ horas
**Tiempo real:** __ horas

## 🌅 MORNING (2-3h)
☐ Tarea 1
☐ Tarea 2
☐ Tarea 3

Prompts usados:
```
[prompts]
```

Archivos:
- [ ] archivo1
- [ ] archivo2

## 🌆 AFTERNOON (2-3h)
☐ Tarea 1
☐ Tarea 2

Prompts usados:
```
[prompts]
```

Archivos:
- [ ] archivo3

## ✅ CHECKPOINT
☐ Código sin errores
☐ Convenciones respetadas
☐ Funcionalidad probada
☐ Integración funciona

## 🐛 PROBLEMAS
| Problema | Solución | Tiempo |
|----------|----------|--------|
| __ | __ | __ |

## 💡 APRENDIZAJES
1. __
2. __

## 📝 PARA MAÑANA
- [ ] __
- [ ] __

## 🔄 GIT
```bash
git add .
git commit -m "tipo: descripción - día __"
git push origin rama
```

## 📊 PROGRESO
Horas semana: __/30
Días completados: __/50
Proyecto: __%
Estado: 😊/😐/😓
```

---

## 🎯 CONSEJOS PARA USAR EL CHECKLIST EFICIENTEMENTE

### 1. Complétalo en Tiempo Real
- No esperes al final del día
- Marca las tareas conforme las completas
- Anota problemas cuando ocurren (memoria fresca)

### 2. Sé Específico en los Prompts
- Pega los prompts exactos que usaste
- Esto te ayuda a replicar lo que funcionó
- Útil para entrenar a otros developers

### 3. Cuantifica el Tiempo Perdido
- Te ayuda a identificar cuellos de botella
- Puedes ajustar estimaciones futuras
- Identificas áreas donde necesitas más preparación

### 4. Celebra los Aprendizajes
- No solo anotes problemas
- Reconoce lo que aprendiste cada día
- Motiva para el día siguiente

### 5. Commits Descriptivos
- Sigue el formato: `tipo: descripción - día X`
- Tipos: feat, fix, refactor, test, docs, chore
- Ejemplo: `feat: crear sistema de pagos Wompi - día 4`

---

## 📂 ORGANIZACIÓN SUGERIDA

Crea una carpeta en tu proyecto:

```
plataforma-digital-ganadera/
└── daily-logs/
    ├── semana-01/
    │   ├── dia-01-15-04-2026.md
    │   ├── dia-02-16-04-2026.md
    │   └── ...
    ├── semana-02/
    ├── semana-03/
    └── resumen-semanal.md (opcional)
```

---

## ✅ CHECKLIST SEMANAL (Resumen)

Al final de cada semana, crea un resumen:

```markdown
# RESUMEN SEMANA [X] — [FECHA INICIO] a [FECHA FIN]

## 📊 Métricas
- Días trabajados: X/5
- Horas totales: X/30
- Commits realizados: X
- Archivos creados: X
- Problemas resueltos: X

## ✅ Logros de la Semana
- [ ] Objetivo principal cumplido
- [ ] Todos los checkpoints pasados
- [ ] Sin deuda técnica acumulada

## 🚧 Pendientes para Semana Siguiente
- [ ] Pendiente 1
- [ ] Pendiente 2

## 💡 Aprendizaje Clave de la Semana
[El aprendizaje más importante]

## 📈 Progreso del Proyecto
- Porcentaje completado: __%
- Siguiente hito: __________
- Fecha estimada de término: __/__/____
```

---

**📋 Con este checklist diario, mantendrás un tracking preciso de tu progreso, identificarás patrones en tu productividad, y tendrás un registro detallado de todo el proceso de desarrollo.**
