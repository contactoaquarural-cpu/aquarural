# CLAUDE.md — Panel Web Administrativo
> Contexto específico del panel web de la Plataforma Digital Ganadera.
> Claude Code lee este archivo automáticamente al trabajar en `web-admin/`.

---

## 📍 Ubicación en el Monorepo

```
plataforma-digital-ganadera/
└── web-admin/
    ├── CLAUDE.md
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── pages/
        │   ├── Login/LoginPage.jsx
        │   ├── Dashboard/DashboardPage.jsx
        │   ├── Asociados/AsociadosPage.jsx
        │   ├── Asociados/ExpedientePage.jsx
        │   ├── Convenios/ConveniosPage.jsx
        │   └── Reportes/ReportesPage.jsx
        ├── components/
        │   └── Layout/
        │       ├── Sidebar.jsx
        │       ├── TopBar.jsx
        │       └── MainLayout.jsx
        ├── store/
        │   └── auth.store.js
        └── services/
            └── api.service.js
```

---

## ⚙️ Stack del Panel Web

| Tecnología | Versión | Uso |
|---|---|---|
| React.js | v18 | Framework UI |
| Vite | v5.x | Bundler y servidor de desarrollo |
| **Tailwind CSS** | v3.x | Estilos — NO usar Ant Design |
| Material Symbols Outlined | Google Fonts | Iconografía |
| Manrope + Inter | Google Fonts | Tipografía |
| Zustand | v4.x | Estado global (auth) |
| React Query | v5.x | Fetching y caché de datos |
| Axios | v1.x | Cliente HTTP |
| React Router | v6.x | Navegación entre páginas |
| Recharts | v2.x | Gráficas de estadísticas |

---

## 🎨 Design System (Dark Mode Editorial)

### Paleta de colores (tokens Tailwind)
```
background / surface:          #111414
surface-container-low:         #191c1c
surface-container:             #1d2020
surface-container-high:        #282a2a
surface-container-highest:     #333535
primary (texto/acento):        #a5d0b9
primary-container (verde):     #1b4332
on-surface (texto principal):  #e1e3e2
on-surface-variant (gris):     #c1c8c2
tertiary (tierra/urgente):     #f7ba8b
tertiary-container:            #59320e
error:                         #ffb4ab
sidebar (emerald-950):         #022c22
```

### Reglas de diseño
1. **Sin bordes 1px** — profundidad solo por cambio de color de fondo
2. **Sin negro puro** — usar `#111414` como base más oscura
3. **Botones CTA:** gradiente `from-primary-container to-primary-container/70` con texto `text-primary`
4. **Cards:** `bg-surface-container-low rounded-2xl` o `rounded-3xl` — sin divisores
5. **Sidebar:** siempre `bg-emerald-950` con texto `text-emerald-50/100`
6. **TopBar:** `glass-effect` (80% opacidad + backdrop-blur)
7. **Estados:** AL_DIA → `text-emerald-400`, EN_MORA → `text-error`, INACTIVO → `text-outline`

### Tipografía
- Títulos/Headlines: `font-headline` (Manrope)
- Cuerpo/Labels: `font-body` o `font-label` (Inter)

### Iconos
- Usar siempre: `<span className="material-symbols-outlined">nombre_icono</span>`
- Iconos con fill: agregar `style={{ fontVariationSettings: "'FILL' 1" }}`

---

## 🖥️ Páginas del Panel Web

| Ruta | Archivo | Descripción |
|---|---|---|
| `/login` | `Login/LoginPage.jsx` | Login split-screen editorial |
| `/dashboard` | `Dashboard/DashboardPage.jsx` | Métricas bento + últimos registros |
| `/asociados` | `Asociados/AsociadosPage.jsx` | Tabla con filtros y paginación |
| `/asociados/:id` | `Asociados/ExpedientePage.jsx` | Expediente completo del asociado |
| `/convenios` | `Convenios/ConveniosPage.jsx` | Cards + drawer lateral CRUD |
| `/reportes` | `Reportes/ReportesPage.jsx` | Analítica + tabla morosos |

---

## 🔌 Configuración de la API

```javascript
// src/services/api.service.js
// BaseURL: VITE_API_URL o http://localhost:3000
// Interceptor request: agrega Bearer token automáticamente
// Interceptor response: redirige a /login en 401
```

Crear `.env` local copiando `.env.example`:
```
VITE_API_URL=http://localhost:3000
```

---

## 🗃️ Store de Autenticación

```javascript
// src/store/auth.store.js — Zustand con persist
// Estado: { user, token, refreshToken, isAuthenticated }
// Acciones: login(user, token, refreshToken), logout(), setUser(user)
// Persistido en localStorage con clave 'asoga-auth'
```

---

## 📐 Convenciones

### Estructura de una página
```javascript
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.service';

const MiPagina = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['clave-unica'],
    queryFn: () => api.get('/endpoint').then((r) => r.data),
  });

  if (isLoading) return <LoadingState />;

  return <div className="pt-8 pb-12 px-8 max-w-7xl mx-auto">...</div>;
};
```

### Patrón de mutación (crear/editar)
```javascript
const mutation = useMutation({
  mutationFn: (payload) => api.post('/endpoint', payload),
  onSuccess: () => queryClient.invalidateQueries(['clave']),
  onError: (err) => setError(err.response?.data?.message || 'Error'),
});
```

---

## 🧪 Comandos

```bash
# Desde web-admin/
npm install       # Instalar dependencias
npm run dev       # Servidor de desarrollo (puerto 5173)
npm run build     # Build de producción
npm run preview   # Preview del build
```

---

## ⛔ Reglas específicas del Panel Web

1. **Nunca usar Ant Design** — el design system es Tailwind CSS puro
2. **Todo el texto en español** — botones, labels, mensajes, tooltips
3. **Siempre usar React Query** para fetches — no `useEffect` con `fetch`
4. **Respetar los tokens de color** del tailwind.config.js — no hardcodear colores
5. **El token expira** — el interceptor de Axios maneja el 401 automáticamente
6. **Confirmar acciones destructivas** con `window.confirm()` o modal propio
7. **Nunca guardar datos sensibles** en localStorage excepto el token JWT (vía Zustand persist)
