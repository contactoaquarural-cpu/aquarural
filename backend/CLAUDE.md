# CLAUDE.md — Backend
> Contexto específico del backend de la Plataforma Digital Ganadera.
> Claude Code lee este archivo automáticamente al trabajar en la carpeta `backend/`.

---

## 📍 Ubicación en el Monorepo

```
plataforma-digital-ganadera/
└── backend/        ← Estás aquí
    ├── CLAUDE.md
    ├── src/
    │   ├── app.js              ← Express app (middlewares, rutas)
    │   ├── server.js           ← Punto de entrada, conecta MongoDB
    │   ├── routes/             ← Definición de rutas por módulo
    │   ├── controllers/        ← Lógica de negocio por módulo
    │   ├── middleware/         ← Auth, validación, manejo de errores
    │   ├── models/             ← Schemas de Mongoose
    │   ├── jobs/               ← Cron jobs (estado, notificaciones)
    │   ├── services/           ← Lógica reutilizable (Wompi, Firebase, QR)
    │   └── utils/              ← Helpers (jwt, seed, cloudinary)
    ├── tests/                  ← Jest + Supertest
    ├── .env                    ← Variables de entorno (NO en git)
    ├── .env.example            ← Plantilla de variables (SÍ en git)
    └── package.json
```

---

## ⚙️ Stack del Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | v20 LTS | Runtime |
| Express.js | v4.x | Framework HTTP |
| Mongoose | v8.x | ODM para MongoDB |
| MongoDB Atlas | M0 Free | Base de datos cloud |
| jsonwebtoken | v9.x | Tokens JWT |
| bcryptjs | v2.x | Hash de contraseñas |
| Zod | v3.x | Validación de datos |
| node-cron | v3.x | Tareas programadas |
| node-cache | v5.x | Cache en memoria |
| Firebase Admin | v12.x | Push notifications |
| Wompi API | REST v2 | Pasarela de pagos colombiana |
| qrcode | v1.5.x | Generación de QR |
| Cloudinary SDK | v2.x | Gestión de imágenes |
| Nodemailer | v6.x | Envío de correos |
| Winston | v3.x | Sistema de logs |
| Jest + Supertest | v29.x | Pruebas |

---

## 🗄️ Modelos de Base de Datos

### Asociado
```javascript
{
  nombre:        String, required, trim
  cedula:        String, required, unique, trim
  telefono:      String, trim
  correo:        String, lowercase, trim
  municipio:     String, default: 'Garzón'
  estado:        enum ['AL_DIA', 'EN_MORA', 'INACTIVO'], default: 'AL_DIA'
  foto:          String  // URL Cloudinary
  password:      String, required  // bcrypt hash
  fcmToken:      String  // Token de Firebase para push notifications
  fechaIngreso:  Date, default: Date.now
  timestamps:    true
}
```

### Finca
```javascript
{
  asociadoId:      ObjectId, ref: 'Asociado', required
  nombre:          String, required
  hectareas:       Number, min: 0
  cabezasGanado:   Number, min: 0
  tipoProduccion:  enum ['CARNE', 'LECHE', 'DOBLE'], required
  vereda:          String
  timestamps:      true
}
```

### Aporte
```javascript
{
  asociadoId:      ObjectId, ref: 'Asociado', required
  mes:             Number, min: 1, max: 12, required
  año:             Number, required
  monto:           Number, required
  estado:          enum ['PAGADO', 'PENDIENTE'], default: 'PENDIENTE'
  fechaPago:       Date
  referenciaPago:  String
  metodoPago:      String
  timestamps:      true
}
```

### Convenio
```javascript
{
  nombre:               String, required
  tipo:                 enum ['AGROPECUARIO', 'VETERINARIA', 'INSUMOS', 'OTRO'], required
  descuentoPorcentaje:  Number, min: 0, max: 100
  descripcion:          String
  direccion:            String
  telefono:             String
  activo:               Boolean, default: true
  timestamps:           true
}
```

### Noticia
```javascript
{
  titulo:           String, required
  contenido:        String, required
  imagen:           String  // URL Cloudinary
  categoria:        enum ['GOBIERNO', 'SANIDAD', 'PRECIOS', 'EVENTO', 'INSTITUCIONAL']
  publicado:        Boolean, default: false
  fechaPublicacion: Date
  timestamps:       true
}
```

### Notificacion
```javascript
{
  asociadoId:  ObjectId, ref: 'Asociado', required
  titulo:      String, required
  mensaje:     String, required
  leido:       Boolean, default: false
  tipo:        enum ['MORA', 'NOTICIA', 'CONVENIO', 'SISTEMA']
  timestamps:  true
}
```

---

## 🛣️ Mapa de Endpoints de la API

### Autenticación
```
POST   /auth/login              → Login con cédula y password
POST   /auth/refresh            → Renovar access token
POST   /auth/logout             → Cerrar sesión
POST   /auth/recuperar          → Solicitar reset de password por email
GET    /auth/reset/:token       → Validar token de reset
PUT    /auth/cambiar-password   → Cambiar password (requiere auth)
```

### Asociados
```
POST   /asociados               → Registrar nuevo asociado (público)
GET    /asociados               → Listar con paginación y filtros (auth)
GET    /asociados/:id           → Obtener asociado por ID (auth)
PUT    /asociados/:id           → Actualizar datos personales (auth)
PATCH  /asociados/:id/estado    → Cambiar estado manualmente (auth admin)
POST   /asociados/:id/foto      → Subir foto de perfil a Cloudinary (auth)
GET    /asociados/:id/qr        → Obtener carné QR como base64 (auth)
GET    /asociados/:id/aportes   → Historial de pagos (auth)
GET    /asociados/:id/notificaciones → Historial de notificaciones (auth)
```

### Fincas
```
POST   /fincas                  → Crear finca (auth)
GET    /fincas/:id              → Obtener finca por ID (auth)
PUT    /fincas/:id              → Actualizar finca (auth)
GET    /asociados/:id/fincas    → Fincas de un asociado (auth)
```

### Pagos
```
POST   /pagos/iniciar           → Iniciar pago en Wompi (auth)
POST   /pagos/webhook           → Webhook de confirmación Wompi (público)
```

### QR
```
POST   /qr/verificar            → Verificar QR en comercio aliado (público)
```

### Convenios
```
GET    /convenios               → Listar convenios activos (público)
GET    /convenios/:id           → Detalle de convenio (público)
POST   /convenios               → Crear convenio (auth admin)
PUT    /convenios/:id           → Actualizar convenio (auth admin)
PATCH  /convenios/:id/toggle    → Activar/desactivar convenio (auth admin)
```

### Noticias
```
GET    /noticias                → Listar noticias publicadas (público)
GET    /noticias/:id            → Detalle de noticia (público)
POST   /noticias                → Crear noticia (auth admin)
PUT    /noticias/:id            → Actualizar noticia (auth admin)
DELETE /noticias/:id            → Eliminar noticia (auth admin)
```

### Admin
```
GET    /admin/reportes/morosos          → Reporte de asociados en mora (auth admin)
POST   /admin/notificaciones/enviar     → Enviar notificación masiva (auth admin)
```

### Estadísticas
```
GET    /estadisticas/sector      → Estadísticas del sector ganadero (público)
GET    /estadisticas/financiero  → Estadísticas financieras (auth admin)
```

### Sistema
```
GET    /health                   → Health check para Railway (público)
```

---

## 📐 Formato Estándar de Respuestas

**SIEMPRE usar este formato en todos los endpoints. Sin excepciones.**

### Respuesta exitosa
```javascript
res.status(200).json({
  success: true,
  data: resultado,       // objeto o array con los datos
  message: 'Descripción en español'
});
```

### Respuesta con paginación
```javascript
res.status(200).json({
  success: true,
  data: resultados,
  message: 'Asociados obtenidos',
  pagination: {
    total: 150,
    page: 1,
    limit: 10,
    totalPages: 15
  }
});
```

### Respuesta de error
```javascript
res.status(400).json({
  success: false,
  data: null,
  message: 'Mensaje de error claro en español'
});
```

### Códigos de estado usados
```
200 → OK (GET, PUT, PATCH, DELETE exitosos)
201 → Created (POST exitoso que crea un recurso)
400 → Bad Request (validación fallida)
401 → Unauthorized (sin token o token inválido)
403 → Forbidden (sin permisos para esta acción)
404 → Not Found (recurso no encontrado)
409 → Conflict (cédula duplicada, mes ya pagado, etc.)
500 → Internal Server Error (error inesperado del servidor)
```

---

## 🔒 Middleware de Autenticación

```javascript
// Uso en rutas protegidas
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/asociados', verifyToken, controller.obtenerTodos);

// El middleware agrega req.user con:
// { id, cedula, nombre, estado, iat, exp }
```

---

## ✅ Validación con Zod

```javascript
// Ejemplo de validación en controller
const schema = z.object({
  nombre: z.string().min(3, 'Nombre muy corto'),
  cedula: z.string().min(5).max(10),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  correo: z.string().email().optional(),
});

const resultado = schema.safeParse(req.body);
if (!resultado.success) {
  return res.status(400).json({
    success: false,
    data: null,
    message: resultado.error.errors[0].message
  });
}
```

---

## 🔄 Cron Jobs

### Job de estado (ejecuta diariamente a las 6:00 AM)
```
Archivo: src/jobs/estado.job.js
Lógica:
  - 1 mes sin pagar  → EN_MORA
  - 3+ meses sin pagar → INACTIVO
  - Al día en pagos  → AL_DIA
  - Si cambia a EN_MORA → enviar push notification automática
```

---

## 📏 Convenciones del Backend

### Estructura de un controller
```javascript
// Siempre: try/catch, formato estándar, no exponer password
exports.obtenerPorId = async (req, res) => {
  try {
    const asociado = await Asociado.findById(req.params.id)
      .select('-password')
      .populate('fincas');

    if (!asociado) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Asociado no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: asociado,
      message: 'Asociado obtenido exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error interno del servidor'
    });
  }
};
```

### Reglas de código
- **Nunca** exponer el campo `password` en respuestas → usar `.select('-password')`
- **Siempre** validar con Zod antes de guardar en MongoDB
- **Siempre** usar `async/await` con `try/catch`, nunca callbacks
- **Nunca** hardcodear valores — usar variables de entorno con `process.env`
- **Siempre** sanitizar inputs con `.trim()` en los schemas de Mongoose

---

## 🧪 Comandos del Backend

```bash
npm run dev        # Servidor de desarrollo con nodemon
npm start          # Servidor de producción
npm test           # Ejecutar suite de tests con cobertura
npm run test:watch # Tests en modo watch
npm run seed       # Poblar base de datos con datos de prueba
```

---

## ⛔ Reglas específicas del Backend

1. **Nunca modificar `.env`** — solo `.env.example`
2. **Nunca exponer `password`** en ninguna respuesta de la API
3. **Nunca eliminar tests** existentes en `tests/`
4. **El webhook de Wompi** (`POST /pagos/webhook`) debe ser público — sin `verifyToken`
5. **El endpoint `POST /qr/verificar`** debe ser público — para comercios aliados
6. **Cache de estadísticas:** siempre 1 hora con `node-cache`
7. **Logs con Winston** en todos los jobs y errores críticos
