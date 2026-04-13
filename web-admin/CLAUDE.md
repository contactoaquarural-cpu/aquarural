# CLAUDE.md — Panel Web Administrativo
> Contexto específico del panel web de la Plataforma Digital Ganadera.
> Claude Code lee este archivo automáticamente al trabajar en `web-admin/`.

---

## 📍 Ubicación en el Monorepo

```
plataforma-digital-ganadera/
└── web-admin/          ← Estás aquí
    ├── CLAUDE.md
    ├── src/
    │   ├── main.jsx            ← Punto de entrada de React
    │   ├── App.jsx             ← Router principal
    │   ├── pages/              ← Vistas completas (una por sección)
    │   │   ├── Login/
    │   │   ├── Dashboard/
    │   │   ├── Asociados/
    │   │   ├── Pagos/
    │   │   ├── Convenios/
    │   │   ├── Noticias/
    │   │   ├── Notificaciones/
    │   │   └── Estadisticas/
    │   ├── components/         ← Componentes reutilizables
    │   │   ├── Layout/         ← Sidebar, Header, MainLayout
    │   │   ├── QRPreview/      ← Vista previa de QR de asociado
    │   │   ├── EstadoBadge/    ← Badge de estado AL_DIA/EN_MORA/INACTIVO
    │   │   └── charts/         ← Componentes de Recharts
    │   ├── store/              ← Zustand stores
    │   │   ├── auth.store.js
    │   │   └── ui.store.js
    │   ├── services/           ← Llamadas a la API
    │   │   ├── api.service.js  ← Instancia de Axios configurada
    │   │   ├── asociados.service.js
    │   │   ├── pagos.service.js
    │   │   ├── convenios.service.js
    │   │   ├── noticias.service.js
    │   │   └── estadisticas.service.js
    │   ├── hooks/              ← Custom hooks de React Query
    │   └── utils/              ← Helpers (formateo de fechas, moneda, etc.)
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Stack del Panel Web

| Tecnología | Versión | Uso |
|---|---|---|
| React.js | v18 | Framework UI |
| Vite | latest | Bundler y servidor de desarrollo |
| Ant Design (antd) | v5.x | Librería de componentes UI |
| Zustand | v4.x | Estado global |
| React Query | v5.x | Fetching y caché de datos del servidor |
| Axios | v1.x | Cliente HTTP |
| React Router | v6.x | Navegación entre páginas |
| Recharts | v2.x | Gráficas de estadísticas |
| xlsx | latest | Exportar reportes a Excel |
| jsPDF | latest | Exportar reportes a PDF |

---

## 🖥️ Páginas del Panel Web

### Login (`/login`)
- Formulario de cédula y contraseña
- Llama a `POST /auth/login` de la API
- Guarda token en Zustand + localStorage
- Redirige a `/dashboard` si ya hay sesión

### Dashboard (`/dashboard`)
- Indicadores principales: total asociados, % AL_DIA, % EN_MORA, % INACTIVO
- Últimos 5 pagos recibidos
- Últimas 3 noticias publicadas
- Accesos rápidos a las secciones principales

### Asociados (`/asociados`)
- Tabla con búsqueda por nombre/cédula, filtro por estado, paginación
- Botón "Nuevo Asociado" abre modal con formulario
- Acciones por fila: Ver detalle, Editar, Cambiar estado
- Vista detalle incluye finca y historial de pagos

### Pagos (`/pagos`)
- Tabla global de aportes con filtros: mes, año, estado
- Registro manual de pago en efectivo
- Reporte de morosos exportable a Excel/PDF

### Convenios (`/convenios`)
- Tabla CRUD de convenios con toggle activo/inactivo
- Formulario de creación y edición en modal
- Filtro por tipo (AGROPECUARIO, VETERINARIA, INSUMOS, OTRO)

### Noticias (`/noticias`)
- Lista de noticias con estado publicado/borrador
- Editor de contenido con campo de imagen
- Acciones: publicar, despublicar, editar, eliminar

### Notificaciones (`/notificaciones`)
- Panel para enviar notificación masiva o individual
- Selección de destinatarios: TODOS, EN_MORA, AL_DIA, específico
- Historial de notificaciones enviadas

### Estadísticas (`/estadisticas`)
- Indicadores: total cabezas, total hectáreas, total asociados activos
- Gráfica de torta: distribución por tipo de producción
- Gráfica de barras: asociados por vereda
- Gráfica de línea: recaudo mensual últimos 12 meses

---

## 🔌 Configuración de la API

```javascript
// src/services/api.service.js
import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
});

// Interceptor: agrega token automáticamente en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: maneja 401 (sesión expirada)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🗃️ Store de Autenticación (Zustand)

```javascript
// src/store/auth.store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      },
    }),
    { name: 'auth-storage' }
  )
);
```

---

## 🎨 Sistema de Diseño

### Colores principales
```javascript
// Paleta de colores de MetaDevelopment
const colors = {
  primary:     '#1A7A3C',  // Verde principal
  primaryDark: '#155C2E',  // Verde oscuro
  primaryLight:'#E8F5EE',  // Verde claro (fondos)
  white:       '#FFFFFF',
  grayText:    '#444444',
  grayLight:   '#F5F5F5',
  grayBorder:  '#CCCCCC',
  success:     '#52c41a',  // AL_DIA
  warning:     '#faad14',  // EN_MORA
  error:       '#ff4d4f',  // INACTIVO
};
```

### Configuración de tema Ant Design
```javascript
// En main.jsx — siempre usar este tema
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';

<ConfigProvider
  locale={esES}
  theme={{
    token: {
      colorPrimary: '#1A7A3C',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      borderRadius: 6,
      fontFamily: 'Arial, sans-serif',
    },
  }}
>
```

### Badge de estado (componente reutilizable)
```javascript
// Siempre usar este componente para mostrar el estado de un asociado
// Estados: AL_DIA → green, EN_MORA → orange, INACTIVO → red
<Tag color={estado === 'AL_DIA' ? 'green' : estado === 'EN_MORA' ? 'orange' : 'red'}>
  {estado}
</Tag>
```

---

## 📐 Convenciones del Panel Web

### Estructura de una página
```javascript
// Todas las páginas siguen este patrón
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Space } from 'antd';
import api from '../../services/api.service';

const AsociadosPage = () => {
  // 1. Fetching de datos con React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['asociados'],
    queryFn: () => api.get('/asociados').then(r => r.data),
  });

  // 2. Columnas de la tabla Ant Design
  const columns = [...];

  // 3. Render
  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary">Nuevo Asociado</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default AsociadosPage;
```

### Manejo de errores en formularios Ant Design
```javascript
// Siempre usar Form de Ant Design para formularios
import { Form, Input, Button, message } from 'antd';

const [form] = Form.useForm();

const onFinish = async (values) => {
  try {
    await api.post('/asociados', values);
    message.success('Asociado creado exitosamente');
    form.resetFields();
  } catch (error) {
    message.error(error.response?.data?.message || 'Error al crear el asociado');
  }
};
```

---

## 🧪 Comandos del Panel Web

```bash
npm run dev       # Servidor de desarrollo (puerto 5173)
npm run build     # Build de producción
npm run preview   # Preview del build de producción
```

---

## ⛔ Reglas específicas del Panel Web

1. **Siempre usar componentes de Ant Design** — no crear estilos desde cero
2. **Todo el texto en español** — botones, labels, mensajes, tooltips
3. **Siempre confirmar acciones destructivas** con `Modal.confirm()` de Ant Design
4. **Nunca guardar datos sensibles** en localStorage excepto el token JWT
5. **Siempre mostrar feedback** al usuario: `message.success()` o `message.error()`
6. **React Query para todos los fetches** — no usar `useEffect` con `fetch` directamente
7. **El token expira** — el interceptor de Axios maneja el 401 automáticamente
