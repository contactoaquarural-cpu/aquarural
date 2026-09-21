# Cómo probar AquaRural Pro en local

## Direcciones

| Servicio | URL |
|---|---|
| Backend / API | http://localhost:3000 |
| Panel Web Admin | http://localhost:5173 |
| Landing | http://localhost:5174 |

Health check del backend: `GET http://localhost:3000/health`

## Requisitos previos

- MongoDB corriendo en `mongodb://localhost:27017` (local, no Atlas).
- `backend/.env` configurado (copiar de `.env.example` si no existe).
- Dependencias instaladas en cada carpeta (`npm install`), solo la primera vez o tras cambios en `package.json`.

## Cómo levantar los tres servidores

Abrir una terminal por cada uno (o usar `&` en background si es una sola terminal tipo Git Bash):

```bash
# 1. Backend
cd backend
npm run dev

# 2. Panel Web Admin
cd web-admin
npm run dev

# 3. Landing
cd landing
npm run dev
```

Cada uno queda escuchando en su puerto (3000, 5173, 5174 respectivamente) y se recarga solo al guardar cambios (nodemon / Vite HMR).

## Primera vez / base de datos vacía

Si es la primera vez que se levanta el backend contra una base de datos nueva, sembrar el SuperAdmin:

```bash
cd backend
npm run seed:superadmin
```

Lee `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `SUPERADMIN_NOMBRE` desde `.env`.

## Accesos de prueba

Ver `backend/ACCESOS_PRUEBA.md` para el detalle completo (correos, contraseñas, acueductos y asociados ya cargados).

## Verificar que todo está arriba

```bash
curl http://localhost:3000/health
curl -o /dev/null -w "%{http_code}\n" http://localhost:5173
curl -o /dev/null -w "%{http_code}\n" http://localhost:5174
```

Los tres deben responder `200`.
