# Fase 0 — Design System con Google Stitch
> Guía completa para definir la identidad visual de la Plataforma Digital Ganadera
> **Duración estimada:** 3-4 días (12-16 horas) | **Momento:** ANTES de codear la app móvil y panel web

---

## 🎯 Objetivo de Esta Fase

Crear un **design system profesional y coherente** que:
- Define la identidad visual de MetaDevelopment en el proyecto
- Genera tokens reutilizables (colores, tipografía, espaciado)
- Permite que Claude Code genere componentes siguiendo el diseño
- Evita retrabajos en el frontend (mobile + web)

---

## 🛠️ ¿Qué es Google Stitch?

**Google Stitch** es una herramienta de diseño basada en web que permite:
- Crear componentes de UI sin necesidad de Figma o Sketch
- Exportar tokens de diseño en JSON/CSS
- Colaborar en tiempo real
- Generar código React y React Native

**URL:** https://stitch.withgoogle.com/

---

## 📅 Plan de 3-4 Días

### DÍA 1: Setup, Paleta de Colores y Fundamentos (4 horas)

#### Mañana (2 horas)

**1.1 Crear Proyecto en Google Stitch**
```
1. Ve a https://stitch.withgoogle.com/
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto: "Plataforma Digital Ganadera"
4. Configura el nombre del design system: "MetaDevelopment Ganadero"
```

**1.2 Definir Paleta de Colores Primarios**

Basándote en la identidad de MetaDevelopment:

```javascript
// Colores Primarios (Verde MetaDevelopment)
primary: {
  50:  '#E8F5EE',   // Muy claro (fondos)
  100: '#C2E5D3',
  200: '#9AD5B8',
  300: '#72C59D',
  400: '#4AB582',
  500: '#1A7A3C',   // PRINCIPAL (botones, headers)
  600: '#155C2E',   // Hover states
  700: '#104523',
  800: '#0B2E18',
  900: '#06170C',   // Muy oscuro (texto sobre verde)
}

// Colores de Estado (para badges y alertas)
estados: {
  alDia:     '#52c41a',  // Verde — AL_DIA
  enMora:    '#fa8c16',  // Naranja — EN_MORA
  inactivo:  '#ff4d4f',  // Rojo — INACTIVO
  info:      '#1890ff',  // Azul — Info general
  warning:   '#faad14',  // Amarillo — Advertencias
}

// Grises (neutrales)
grays: {
  50:  '#FAFAFA',
  100: '#F5F5F5',
  200: '#E8E8E8',
  300: '#D9D9D9',
  400: '#BFBFBF',
  500: '#8C8C8C',
  600: '#666666',   // Texto secundario
  700: '#434343',
  800: '#262626',
  900: '#1A1A1A',   // Texto principal
}
```

**Tarea en Stitch:**
1. Crea la paleta completa en Stitch
2. Nombra cada color con el formato: `color-nivel` (ej: `primary-500`)
3. Verifica contraste de accesibilidad (WCAG AA)

#### Tarde (2 horas)

**1.3 Exportar Tokens de Colores**

Exporta los colores como JSON:

```json
{
  "colors": {
    "primary": {
      "50": "#E8F5EE",
      "500": "#1A7A3C",
      "600": "#155C2E"
    },
    "estados": {
      "alDia": "#52c41a",
      "enMora": "#fa8c16",
      "inactivo": "#ff4d4f"
    },
    "grays": {
      "900": "#1A1A1A",
      "600": "#666666"
    }
  }
}
```

**1.4 Integrar en CLAUDE.md**

Actualiza `mobile-app/CLAUDE.md` y `web-admin/CLAUDE.md`:

```markdown
## 🎨 Sistema de Diseño

### Colores (importar de design-tokens/colors.json)
```javascript
export const colors = {
  primary:      '#1A7A3C',
  primaryDark:  '#155C2E',
  primaryLight: '#E8F5EE',
  // ... resto de la paleta
};
```

**Checkpoint Día 1:**
- [ ] Proyecto creado en Stitch
- [ ] Paleta de colores completa definida
- [ ] Archivo `colors.json` exportado
- [ ] Tokens integrados en CLAUDE.md de mobile-app y web-admin

---

### DÍA 2: Tipografía, Espaciado y Iconos (4 horas)

#### Mañana (2 horas)

**2.1 Sistema de Tipografía**

Define 6 niveles de texto usando el sistema 8pt:

```javascript
typography: {
  // Títulos
  h1: {
    fontSize: 32,      // 4 × 8pt
    fontWeight: '700',
    lineHeight: 40,    // 5 × 8pt
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,      // 3 × 8pt
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  
  // Cuerpo
  body: {
    fontSize: 16,      // 2 × 8pt
    fontWeight: '400',
    lineHeight: 24,    // 3 × 8pt
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  // Labels y auxiliares
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
}
```

**Fuentes recomendadas:**
- **App Móvil:** System fonts (San Francisco iOS, Roboto Android)
- **Panel Web:** Inter o Roboto (desde Google Fonts)

**2.2 Escala de Espaciado (8pt Grid)**

```javascript
spacing: {
  xs:   4,    // 0.5 × 8pt
  sm:   8,    // 1 × 8pt
  md:   16,   // 2 × 8pt
  lg:   24,   // 3 × 8pt
  xl:   32,   // 4 × 8pt
  xxl:  48,   // 6 × 8pt
  xxxl: 64,   // 8 × 8pt
}
```

#### Tarde (2 horas)

**2.3 Exportar Tokens de Tipografía y Espaciado**

```json
{
  "typography": {
    "h1": {
      "fontSize": 32,
      "fontWeight": "700",
      "lineHeight": 40
    }
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16
  }
}
```

**2.4 Definir Iconografía**

Para la app móvil, usarás **Lucide React** (ya incluido en el stack):

Iconos principales a usar:
```
Home:         home
Pagos:        credit-card
Mi Carné:     qr-code
Beneficios:   gift
Perfil:       user
Notificaciones: bell
Configuración: settings
Logout:       log-out
Estado AL_DIA: check-circle
Estado EN_MORA: alert-circle
Estado INACTIVO: x-circle
```

**Checkpoint Día 2:**
- [ ] Sistema de tipografía definido (6 niveles)
- [ ] Escala de espaciado (8pt grid)
- [ ] Archivo `typography.json` exportado
- [ ] Archivo `spacing.json` exportado
- [ ] Lista de iconos documentada

---

### DÍA 3: Componentes Base (4 horas)

#### Mañana (2 horas)

**3.1 Botones (4 variantes)**

Define en Stitch:

```javascript
// Primary Button
Button.Primary {
  backgroundColor: colors.primary[500],
  color: '#FFFFFF',
  fontSize: typography.body.fontSize,
  fontWeight: '600',
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.lg,
  borderRadius: 8,
  
  // Estados
  hover: {
    backgroundColor: colors.primary[600],
  },
  active: {
    backgroundColor: colors.primary[700],
  },
  disabled: {
    backgroundColor: colors.grays[300],
    color: colors.grays[500],
  },
}

// Secondary Button (outline)
Button.Secondary {
  backgroundColor: 'transparent',
  borderWidth: 2,
  borderColor: colors.primary[500],
  color: colors.primary[500],
  // ... mismo padding y borderRadius
}

// Destructive Button
Button.Destructive {
  backgroundColor: colors.estados.inactivo,
  // ... resto igual que Primary
}

// Text Button (sin fondo)
Button.Text {
  backgroundColor: 'transparent',
  color: colors.primary[500],
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
}
```

**3.2 Inputs y Forms**

```javascript
Input {
  backgroundColor: colors.grays[50],
  borderWidth: 1,
  borderColor: colors.grays[300],
  borderRadius: 8,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.md,
  fontSize: typography.body.fontSize,
  color: colors.grays[900],
  
  // Estados
  focus: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  error: {
    borderColor: colors.estados.inactivo,
  },
  disabled: {
    backgroundColor: colors.grays[100],
    color: colors.grays[500],
  },
}

// Label para inputs
InputLabel {
  fontSize: typography.label.fontSize,
  fontWeight: typography.label.fontWeight,
  color: colors.grays[700],
  marginBottom: spacing.xs,
}

// Mensaje de error
InputError {
  fontSize: typography.bodySmall.fontSize,
  color: colors.estados.inactivo,
  marginTop: spacing.xs,
}
```

#### Tarde (2 horas)

**3.3 Cards**

```javascript
Card {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: spacing.lg,
  shadowColor: '#000000',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  
  // Variante con borde
  bordered: {
    borderWidth: 1,
    borderColor: colors.grays[200],
  },
}
```

**3.4 Badges de Estado**

```javascript
// Badge AL_DIA
Badge.AlDia {
  backgroundColor: colors.estados.alDia + '20', // 20% opacity
  color: colors.estados.alDia,
  fontSize: typography.label.fontSize,
  fontWeight: '600',
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  borderRadius: 16,
}

// Badge EN_MORA
Badge.EnMora {
  backgroundColor: colors.estados.enMora + '20',
  color: colors.estados.enMora,
  // ... resto igual
}

// Badge INACTIVO
Badge.Inactivo {
  backgroundColor: colors.estados.inactivo + '20',
  color: colors.estados.inactivo,
  // ... resto igual
}
```

**3.5 Exportar Componentes**

Exporta como JSON:

```json
{
  "components": {
    "button": {
      "primary": {
        "backgroundColor": "#1A7A3C",
        "padding": "16px 24px",
        "borderRadius": "8px"
      }
    },
    "input": {
      "default": {
        "borderColor": "#D9D9D9",
        "borderRadius": "8px"
      }
    }
  }
}
```

**Checkpoint Día 3:**
- [ ] 4 variantes de botones diseñadas
- [ ] Sistema de inputs y forms completo
- [ ] Card component creado
- [ ] 3 badges de estado (AL_DIA, EN_MORA, INACTIVO)
- [ ] Archivo `components.json` exportado

---

### DÍA 4: Integración con Claude Code (4 horas)

#### Mañana (2 horas)

**4.1 Actualizar CLAUDE.md de Mobile App**

Agrega esta sección en `mobile-app/CLAUDE.md`:

```markdown
## 🎨 Design System Tokens

Los tokens de diseño están en `/design-tokens/`:
- `colors.json` — Paleta de colores completa
- `typography.json` — Sistema de tipografía
- `spacing.json` — Escala de espaciado
- `components.json` — Definición de componentes

### Uso con Claude Code

Al crear componentes, siempre referencia los tokens:

```javascript
// Importar tokens
import { colors, typography, spacing } from '../utils/designTokens';

// Usar en componentes
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
```
```

**4.2 Actualizar CLAUDE.md de Web Admin**

Agrega en `web-admin/CLAUDE.md`:

```markdown
## 🎨 Design System con Ant Design

### Configuración del Tema

Ant Design debe configurarse con los tokens del design system:

```javascript
// src/theme/antdTheme.js
import { colors } from './designTokens';

export const antdTheme = {
  token: {
    colorPrimary: colors.primary[500],
    colorSuccess: colors.estados.alDia,
    colorWarning: colors.estados.enMora,
    colorError: colors.estados.inactivo,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
};
```

### Uso en ConfigProvider

```javascript
import { ConfigProvider } from 'antd';
import { antdTheme } from './theme/antdTheme';

<ConfigProvider theme={antdTheme}>
  <App />
</ConfigProvider>
```
```

#### Tarde (2 horas)

**4.3 Crear Archivo de Tokens Centralizado**

Crea `design-tokens/index.js`:

```javascript
// design-tokens/index.js
export const colors = {
  primary: {
    50: '#E8F5EE',
    500: '#1A7A3C',
    600: '#155C2E',
  },
  estados: {
    alDia: '#52c41a',
    enMora: '#fa8c16',
    inactivo: '#ff4d4f',
  },
  grays: {
    50: '#FAFAFA',
    600: '#666666',
    900: '#1A1A1A',
  },
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  label: { fontSize: 12, fontWeight: '600', lineHeight: 16 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
```

**4.4 Probar con Claude Code**

Prueba que Claude Code entiende los tokens:

```
@colors.json @typography.json

Crea un componente Button en React Native que siga 
el design system. Debe tener 3 variantes: primary, 
secondary y destructive.

Usa los tokens de colors.json para los colores 
y typography.json para el texto.
```

**Checkpoint Día 4:**
- [ ] CLAUDE.md de mobile-app actualizado con tokens
- [ ] CLAUDE.md de web-admin actualizado con tema Ant Design
- [ ] Archivo `design-tokens/index.js` creado
- [ ] Claude Code probado con los tokens
- [ ] Componente de prueba generado correctamente

---

## 📦 Entregables de la Fase 0

Al completar esta fase, debes tener:

### Archivos en `/design-tokens/`
```
design-tokens/
├── colors.json
├── typography.json
├── spacing.json
├── components.json
└── index.js (exports centralizados)
```

### Documentación Actualizada
```
mobile-app/CLAUDE.md    → Sección de Design System agregada
web-admin/CLAUDE.md     → Configuración de tema Ant Design agregada
docs/DesignSystem.md    → Guía completa del design system (opcional)
```

### En Google Stitch
```
✅ Proyecto "Plataforma Digital Ganadera" completo
✅ Paleta de colores definida
✅ Sistema de tipografía
✅ Componentes base diseñados
✅ Tokens exportados
```

---

## 🎯 Prompts para Claude Code

Una vez completada la Fase 0, usa estos prompts:

### Para crear un componente en Mobile:
```
@mobile-app/CLAUDE.md @design-tokens/colors.json @design-tokens/typography.json

Crea el componente EstadoBadge.js en mobile-app/src/components/.

Debe mostrar el estado del asociado (AL_DIA, EN_MORA, INACTIVO) 
con los colores del design system.

Usa los tokens de colors.estados para los colores de fondo y texto.
```

### Para crear una página en Web:
```
@web-admin/CLAUDE.md @design-tokens/colors.json

Crea la página Dashboard.jsx en web-admin/src/pages/.

Usa componentes de Ant Design con el tema configurado.
Incluye 4 cards con indicadores: total asociados, % AL_DIA, 
% EN_MORA, % INACTIVO.

Los colores de los badges deben usar colors.estados.
```

---

## ⚠️ Errores Comunes a Evitar

1. **No definir suficientes variantes de colores**
   - Necesitas al menos primary-500 (base), primary-600 (hover), primary-50 (backgrounds)

2. **No respetar el 8pt grid en espaciado**
   - Todos los valores de padding/margin deben ser múltiplos de 8

3. **Olvidar los estados de los componentes**
   - Botones necesitan: default, hover, active, disabled

4. **No verificar contraste de accesibilidad**
   - Usa herramientas como WebAIM para verificar WCAG AA

5. **No integrar los tokens en CLAUDE.md**
   - Si Claude no conoce los tokens, generará código genérico

---

## ✅ Checklist Final

Antes de pasar a la construcción del proyecto:

- [ ] Paleta de colores completa (primary + estados + grays)
- [ ] Sistema de tipografía (6 niveles)
- [ ] Escala de espaciado (8pt grid)
- [ ] Componentes base diseñados (botones, inputs, cards, badges)
- [ ] Todos los tokens exportados a JSON
- [ ] CLAUDE.md de mobile-app actualizado
- [ ] CLAUDE.md de web-admin actualizado
- [ ] Claude Code probado con los tokens
- [ ] Componente de prueba creado exitosamente

---

**🎨 Con esta fase completada, tendrás un design system profesional que guiará toda la construcción del frontend, asegurando coherencia visual y acelerando el desarrollo.**
