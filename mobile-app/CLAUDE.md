# CLAUDE.md — App Móvil
> Contexto específico de la aplicación móvil de la Plataforma Digital Ganadera.
> Claude Code lee este archivo automáticamente al trabajar en `mobile-app/`.

---

## 📍 Ubicación en el Monorepo

```
plataforma-digital-ganadera/
└── mobile-app/         ← Estás aquí
    ├── CLAUDE.md
    ├── App.js                  ← Punto de entrada, decide Auth vs Main
    ├── src/
    │   ├── screens/            ← Pantallas organizadas por módulo
    │   │   ├── auth/
    │   │   │   ├── LoginScreen.js
    │   │   │   ├── RegisterScreen.js
    │   │   │   └── ForgotPasswordScreen.js
    │   │   ├── home/
    │   │   │   └── HomeScreen.js
    │   │   ├── pagos/
    │   │   │   ├── EstadoFinancieroScreen.js
    │   │   │   ├── PagoScreen.js
    │   │   │   └── HistorialPagosScreen.js
    │   │   ├── qr/
    │   │   │   └── MiCarneScreen.js
    │   │   ├── convenios/
    │   │   │   ├── ConveniosScreen.js
    │   │   │   └── DetalleConvenioScreen.js
    │   │   ├── noticias/
    │   │   │   ├── NoticiasScreen.js
    │   │   │   └── DetalleNoticiaScreen.js
    │   │   ├── perfil/
    │   │   │   ├── PerfilScreen.js
    │   │   │   ├── EditarPerfilScreen.js
    │   │   │   └── DatosFincaScreen.js
    │   │   └── notificaciones/
    │   │       └── NotificacionesScreen.js
    │   ├── navigation/
    │   │   ├── AuthNavigator.js    ← Stack para Login/Registro
    │   │   ├── MainNavigator.js    ← Bottom tabs para app principal
    │   │   └── index.js            ← Decide qué navigator mostrar
    │   ├── store/                  ← Zustand stores
    │   │   ├── auth.store.js       ← Sesión del usuario
    │   │   ├── asociado.store.js   ← Datos del asociado actual
    │   │   └── pagos.store.js      ← Estado de pagos
    │   ├── services/
    │   │   ├── api.service.js      ← Instancia de Axios + interceptores
    │   │   └── notifications.service.js ← Firebase FCM
    │   └── components/             ← Componentes reutilizables
    │       ├── EstadoBadge.js      ← Badge AL_DIA/EN_MORA/INACTIVO
    │       ├── LoadingSpinner.js   ← Indicador de carga
    │       ├── ErrorMessage.js     ← Mensaje de error con retry
    │       └── OfflineBanner.js    ← Aviso sin conexión
    ├── app.json                    ← Configuración de Expo
    └── package.json
```

---

## ⚙️ Stack de la App Móvil

| Tecnología | Versión | Uso |
|---|---|---|
| React Native | v0.74+ | Framework móvil |
| Expo | latest | Toolchain y build |
| React Navigation | v6.x | Navegación entre pantallas |
| Zustand | v4.x | Estado global |
| Axios | v1.x | Cliente HTTP |
| Expo SecureStore | latest | Almacenamiento seguro del token |
| Expo Camera | latest | Escáner de QR |
| Expo Image Picker | latest | Selección de foto de perfil |
| Firebase Cloud Messaging | v20.x | Push notifications |
| Expo EAS Build | latest | Compilación para stores |

---

## 📱 Pantallas de la App

### Flujo de Autenticación (sin sesión)
```
Splash → Onboarding (3 slides) → Login
                               ↓
                           Registro (3 pasos)
                               ↓
                      Finca (vinculado al registro)
```

### Navegación Principal (con sesión — Bottom Tabs)
```
Tab 1: Inicio    → HomeScreen (estado, accesos rápidos)
Tab 2: Pagos     → EstadoFinancieroScreen
Tab 3: Mi Carné  → MiCarneScreen (QR grande)
Tab 4: Beneficios → ConveniosScreen
Tab 5: Perfil    → PerfilScreen
```

---

## 🎨 Sistema de Diseño de la App

### Colores
```javascript
export const colors = {
  primary:      '#1A7A3C',  // Verde MetaDevelopment
  primaryDark:  '#155C2E',
  primaryLight: '#E8F5EE',
  white:        '#FFFFFF',
  black:        '#1A1A1A',
  grayText:     '#666666',
  grayLight:    '#F5F5F5',
  grayBorder:   '#E0E0E0',
  // Estados del asociado
  alDia:        '#52c41a',  // Verde — AL_DIA
  enMora:       '#fa8c16',  // Naranja — EN_MORA
  inactivo:     '#ff4d4f',  // Rojo — INACTIVO
};
```

### Tipografía
```javascript
export const typography = {
  h1:    { fontSize: 24, fontWeight: 'bold',   color: colors.black },
  h2:    { fontSize: 20, fontWeight: 'bold',   color: colors.black },
  body:  { fontSize: 16, fontWeight: 'normal', color: colors.grayText },
  small: { fontSize: 14, fontWeight: 'normal', color: colors.grayText },
  label: { fontSize: 12, fontWeight: '600',    color: colors.grayText },
};
```

### Espaciado
```javascript
export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
};
```

---

## 🗃️ Stores de Zustand

### auth.store.js
```javascript
// Estado de autenticación — persiste en SecureStore
{
  user: null,          // Datos del asociado logueado
  token: null,         // JWT access token
  refreshToken: null,  // JWT refresh token
  isLoading: false,

  // Acciones
  login(cedula, password)  → llama a POST /auth/login, guarda tokens
  logout()                 → limpia store y SecureStore
  refreshSession()         → llama a POST /auth/refresh
}
```

### asociado.store.js
```javascript
// Datos completos del asociado — se carga al hacer login
{
  asociado: null,   // Objeto completo del asociado
  finca: null,      // Finca principal del asociado

  // Acciones
  cargarDatos()          → GET /asociados/:id + GET /fincas
  actualizarPerfil(data) → PUT /asociados/:id
  actualizarFinca(data)  → PUT /fincas/:id
}
```

### pagos.store.js
```javascript
// Estado de pagos del asociado
{
  aportes: [],          // Historial de aportes
  mesesPendientes: [],  // Meses sin pagar
  isLoading: false,

  // Acciones
  cargarHistorial()           → GET /asociados/:id/aportes
  iniciarPago(meses, monto)   → POST /pagos/iniciar → retorna URL Wompi
}
```

---

## 🔌 Configuración de la API

```javascript
// src/services/api.service.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 15000,  // 15 segundos (conexiones rurales más lentas)
});

// Interceptor: agrega token automáticamente
api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: maneja 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🧭 Estructura de Navegación

```javascript
// navigation/index.js — decide qué navigator mostrar
const RootNavigator = () => {
  const { token } = useAuthStore();

  return token ? <MainNavigator /> : <AuthNavigator />;
};

// navigation/MainNavigator.js — Bottom Tabs
const MainNavigator = () => (
  <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#1A7A3C' }}>
    <Tab.Screen name="Inicio"     component={HomeScreen} />
    <Tab.Screen name="Pagos"      component={EstadoFinancieroScreen} />
    <Tab.Screen name="Mi Carné"   component={MiCarneScreen} />
    <Tab.Screen name="Beneficios" component={ConveniosScreen} />
    <Tab.Screen name="Perfil"     component={PerfilScreen} />
  </Tab.Navigator>
);
```

---

## 📐 Convenciones de la App Móvil

### Estructura de una pantalla
```javascript
// Todas las pantallas siguen este patrón
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api.service';
import { colors, spacing, typography } from '../../utils/theme';

const HomeScreen = ({ navigation }) => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/endpoint');
      setDatos(data.data);
    } catch (err) {
      setError('No se pudo cargar la información');
      Alert.alert('Error', err.response?.data?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator color={colors.primary} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* contenido */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
  },
});

export default HomeScreen;
```

### Pantalla del Carné QR
```javascript
// MiCarneScreen — muestra el QR grande y el estado del asociado
// Si el asociado está EN_MORA o INACTIVO:
//   - Fondo rojo/naranja con mensaje de mora
//   - QR deshabilitado (imagen gris)
//   - Botón "Pagar ahora" que navega a PagoScreen
// Si el asociado está AL_DIA:
//   - Fondo verde con QR grande en base64
//   - Nombre del asociado y fecha de vencimiento del QR
```

---

## 🧪 Comandos de la App Móvil

```bash
npx expo start              # Inicia el servidor de desarrollo
npx expo start --android    # Abre en emulador Android
npx expo start --ios        # Abre en simulador iOS (solo Mac)
npx expo start --tunnel     # Modo túnel (para probar en dispositivo físico)
eas build --platform android --profile preview  # Build APK de prueba
eas build --platform android --profile production # Build producción Play Store
eas submit --platform android                   # Subir a Google Play
```

---

## ⛔ Reglas específicas de la App Móvil

1. **Siempre usar `SafeAreaView`** como contenedor raíz de cada pantalla
2. **Siempre manejar estado de carga** con `ActivityIndicator` mientras se hace un request
3. **Siempre manejar errores de red** — mostrar `Alert` con el mensaje del servidor
4. **Pantalla offline** — detectar pérdida de red con `NetInfo` y mostrar `OfflineBanner`
5. **Nunca guardar el token en `AsyncStorage`** — usar `expo-secure-store` (más seguro)
6. **El QR solo se muestra si estado === 'AL_DIA'** — verificar antes de renderizarlo
7. **Timeout de 15 segundos** en Axios — conexiones rurales del Huila son más lentas
8. **Siempre usar `StyleSheet.create()`** para los estilos — nunca objetos inline
9. **El flujo de pago de Wompi** se hace en un `WebView` — no redirigir fuera de la app
