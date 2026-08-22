# CLAUDE.md — Backend AquaRural Pro
> Contexto específico del backend de AquaRural Pro (Plataforma SaaS Multi-inquilino).

---

## 📍 Ubicación en el Monorepo

```
aquarural/
└── backend/        ← API REST Node.js + Express + MongoDB Atlas
    ├── CLAUDE.md
    ├── src/
    │   ├── app.js              ← Express app (helmet, cors, rateLimit, middlewares, rutas)
    │   ├── server.js           ← Punto de entrada, conecta a MongoDB Atlas
    │   ├── routes/             ← Definición de rutas por módulo (auth, superadmin, configuracion, etc.)
    │   ├── controllers/        ← Lógica de negocio por módulo
    │   ├── middleware/         ← Auth (JWT), validación Zod, manejo de errores
    │   ├── models/             ← Schemas de Mongoose (Acueducto, Suscriptor, FacturaSaaS)
    │   ├── services/           ← Lógica reutilizable (Wompi, Email)
    │   └── utils/              ← Helpers (jwt, crypto AES-256)
    ├── .env                    ← Variables de entorno (NO en git)
    └── package.json
```

---

## ⚙️ Stack del Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | v20 LTS | Runtime |
| Express.js | v4.x | Framework HTTP |
| Mongoose | v8.x | ODM para MongoDB Atlas |
| MongoDB Atlas | M0 Free | Base de datos Cloud |
| jsonwebtoken | v9.x | Tokens JWT Multi-tenant |
| bcryptjs | v2.x | Hash de contraseñas |
| Zod | v3.x | Validación de esquemas |
| Wompi API | REST v2 | Pasarela de recaudo digital colombiana |
| Winston / Console | v3.x | Sistema de registros y logs |

---

## 🗄️ Modelos de Base de Datos (MongoDB Atlas)

### Acueducto (Colección: `acueductos`)
```javascript
{
  nombre:                    String, required, trim
  nit:                       String, required, unique, trim
  departamento:              String, default: 'Huila'
  municipio:                 String, required, trim
  vereda:                    String, trim
  direccion:                 String, trim
  telefono:                  String, trim
  email:                     String, lowercase, trim
  representanteLegal:        String, trim
  logoUrl:                   String, default: ''
  colorPrimario:             String, default: '#0EA5E9'
  colorSecundario:           String, default: '#10B981'
  estado:                    enum ['ACTIVO', 'SUSPENDIDO'], default: 'ACTIVO'
  planSaaS:                  enum ['MANANTIAL', 'CAUDAL', 'CUENCA', 'ACUIFERO'], default: 'CAUDAL'
  frecuenciaPagoSaaS:        enum ['MENSUAL', 'ANUAL'], default: 'ANUAL'
  costoMensualSaaS:          Number, default: 100000
  fechaInicioLicencia:       Date, default: Date.now
  fechaVencimientoGratis:    Date
  fechaVencimientoMembresia: Date
  esPrimerAnoGratis:          Boolean, default: true
  estadoPagoSaaS:            enum ['PENDIENTE_EMISION', 'MES_GRATIS_PRUEBA', 'AL_DIA', 'POR_COBRAR', 'VENCIDO'], default: 'MES_GRATIS_PRUEBA'
  
  // Tarifas de agua independientes por acueducto
  tipoTarifa:                enum ['TARIFA_FIJA', 'HIBRIDO', 'MEDIDOR'], default: 'HIBRIDO'
  tarifaBaseMensual:         Number, default: 0
  cargoFijoMensual:          Number, default: 0
  valorMetroCubico:          Number, default: 0
  consumoBasicoIncluido:     Number, default: 0
  montoRecargoMora:          Number, default: 0
  diaLimitePago:             Number, default: 15

  // Pasarela Wompi cifrada AES-256
  wompiPublicKey:            String, default: ''
  wompiPrivateKeyEncrypted:  String
  wompiEventsSecretEncrypted: String
  wompiIntegritySecretEncrypted: String
  wompiSandbox:              Boolean, default: true
  timestamps:                true
}
```

### Suscriptor (Colección: `suscriptores`)
```javascript
{
  acueductoId:            ObjectId, ref: 'Acueducto', index: true
  matricula:              String, required, trim
  cedula:                 String, required, index: true
  nombres:                String, required, trim
  apellidos:              String, default: ''
  telefono:               String, trim
  correo:                 String, lowercase, trim
  vereda:                 String, default: 'Centro'
  numeroMedidor:          String, default: 'S/N'
  esMedidorNuevo:         Boolean, default: true
  lecturaInicialArranque: Number, default: 0
  lecturaAnterior:        Number, default: 0
  lecturaActual:          Number, default: 0
  estadoServicio:         enum ['ACTIVO', 'CORTADO', 'SUSPENDIDO', 'RETIRO'], default: 'ACTIVO'
  estadoMoratorio:        enum ['AL_DIA', 'POR_NOTIFICAR', 'EN_MORA', 'CORTE_PROGRAMADO', 'INACTIVO'], default: 'AL_DIA'
  tipoTarifa:             enum ['GENERAL', 'COMERCIAL', 'SUBSIDIADO', 'ADULTO_MAYOR', 'ESPECIAL'], default: 'GENERAL'
  password:               String // bcrypt hash
  rol:                    enum ['SUPERADMIN', 'ADMIN_ACUEDUCTO', 'OPERADOR', 'AFILIADO'], default: 'AFILIADO'
  timestamps:             true
}
```

### FacturaSaaS (Colección: `facturassaas`)
```javascript
{
  acueducto:       ObjectId, ref: 'Acueducto', required, index: true
  nit:             String, required, index: true
  nombreAcueducto: String, required
  codigoFactura:   String, required, unique
  periodo:         String, required // ej. '2026-08'
  plan:            String, required // MANANTIAL, CAUDAL, etc.
  badge:           String
  frecuencia:      enum ['MENSUAL', 'ANUAL'], default: 'ANUAL'
  montoTotal:      Number, required
  fechaEmision:    Date, default: Date.now
  fechaVencimiento: Date, required
  estado:          enum ['PAGADO', 'PENDIENTE', 'ANULADO'], default: 'PAGADO'
  metodoPago:      String, default: 'WOMPI_PSE'
  referenciaWompi: String
  timestamps:      true
}
```

---

## 🛣️ Mapa de Endpoints de la API

### Autenticación
```
POST   /auth/login              → Login multi-tenant (Auto-recuperación de SuperAdmin)
POST   /auth/refresh            → Renovar access token
POST   /auth/logout             → Cerrar sesión
```

### SuperAdmin Global
```
POST   /superadmin/acueductos       → Registrar acueducto y crear cuenta de admin local
GET    /superadmin/acueductos       → Listar todos los acueductos con datos de su admin
GET    /superadmin/acueductos/:id   → Detalle de un acueducto por ID
PUT    /superadmin/acueductos/:id   → Actualizar acueducto y credenciales de su admin
DELETE /superadmin/acueductos/:id   → Eliminar acueducto y cuentas de suscriptores asociadas
GET    /superadmin/metricas         → Métricas globales del SaaS
```

### Configuración Local del Acueducto
```
GET    /configuracion               → Obtener datos oficiales, tarifas y estado de licencia
PATCH  /configuracion               → Guardar parámetros tarifarios del agua del acueducto
POST   /configuracion/confirmar-pago-saas → Registrar factura y renovar membresía SaaS
```

---

## 🔒 Reglas Arquitectónicas Multi-Inquilino

1. **Aislamiento 100% en MongoDB Atlas:**
   Cada acueducto administra sus propias tarifas y datos en su documento de `acueductos` y sus propios usuarios en `suscriptores`.
2. **Auto-Recuperación de SuperAdmin:**
   El SuperAdmin (`contactoaquarural@gmail.com`) se autentica mediante verificación de token JWT y auto-genera su registro en `suscriptores` si la base de datos es reiniciada.
3. **Evaluación Dinámica de Vencimiento de Licencia:**
   El backend calcula dinámicamente si `fechaVencimiento` expiró y marca el estado del SaaS como `POR_COBRAR` o `VENCIDO` automáticamente.
