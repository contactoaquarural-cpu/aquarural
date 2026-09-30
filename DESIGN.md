---
name: AquaRural Pro
description: Panel administrativo y portal claro para acueductos veredales — confiable, ordenado, con un único azul de marca como acento de acción.
colors:
  surface-white: "#FFFFFF"
  surface-slate-50: "#F8FAFC"
  border-slate-200: "#E2E8F0"
  border-gray-100: "#F3F4F6"
  text-slate-800: "#1E293B"
  text-slate-500: "#64748B"
  text-slate-400: "#94A3B8"
  azul-marca: "#1D4ED8"
  azul-marca-hover: "#1E3A8A"
  emerald-exito: "#10B981"
  emerald-exito-bg: "#ECFDF5"
  amber-advertencia: "#F59E0B"
  amber-advertencia-bg: "#FFFBEB"
  rojo-error: "#DC2626"
  rojo-error-bg: "#FEF2F2"
  indigo-superadmin: "#4F46E5"
typography:
  headline:
    fontFamily: "Outfit, sans-serif"
    fontWeight: 800
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, sans-serif"
    fontWeight: 400
  mono:
    fontFamily: "ui-monospace, monospace"
    fontWeight: 700
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  full: "9999px"
spacing:
  sm: "0.75rem"
  md: "1.5rem"
  lg: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.azul-marca}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.azul-marca-hover}"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.text-slate-800}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.text-slate-800}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
---

# Design System: AquaRural Pro

## Overview

**Creative North Star: "La Oficina del Acueducto, Digitalizada"**

AquaRural Pro se ve y se siente como una oficina bien administrada, no como una sala de control futurista: fondo blanco, un único azul de marca (`#1D4ED8`) que codifica "esto es acción", y bloques de estado en colores pastel (verde/ámbar/rojo) que se leen de un vistazo sin necesidad de interpretar un código de colores complejo. Es un sistema pensado para juntas directivas de acueductos veredales, tesoreros y fontaneros de campo — usuarios que necesitan confianza y claridad inmediata, no un lenguaje visual "tech" que hay que aprender.

El sistema es monocromo claro por diseño en las cuatro superficies activas del producto (web-admin, landing, y la app del suscriptor que hereda la misma identidad). Existe infraestructura de modo oscuro heredada de una iteración visual anterior (tokens `Hydro-Tech` en `tailwind.config.js`, reglas `html.light` en `index.css`, clases `.hydro-shimmer-*` en landing) que **no está en uso por ninguna página real** — es deuda técnica documentada, no el estándar a seguir.

**Rechazos confirmados:** sin Ant Design ni ningún kit de componentes prefabricado (regla dura del proyecto); sin negro puro en texto (`text-slate-800` es el tono más oscuro real); sin degradados multicolor en botones (el azul de marca es sólido).

**Key Characteristics:**
- Fondo blanco/`slate-50` en todas las páginas activas, con tarjetas blancas sobre borde `slate-200`/`gray-100`.
- Un solo azul de acción (`#1D4ED8` → hover `#1E3A8A`) — no hay una paleta de acentos múltiple compitiendo por atención.
- Estados semánticos en fondo pastel (`*-50`) + borde a juego + texto saturado del mismo color — nunca fondo sólido saturado.
- Radios de esquina generosos y consistentes por rol de elemento (contenedor de página → `3xl`; tarjeta/tabla → `2xl`; input/botón de nav → `xl`; badge/píldora → `full`).
- Sombra sutil (`shadow-sm`) como única señal de elevación — sin resplandor de color, sin sombras oscuras dramáticas.
- Tipografía Outfit (títulos/labels) + Inter (cuerpo) + monoespaciada para cédulas, matrículas, medidores y montos en COP.

## Colors

Paleta clara y neutra con un solo acento de marca; los colores de estado son siempre pastel + borde + texto del mismo tono, nunca fondos saturados.

### Primary
- **Azul de Marca** (`#1D4ED8`, hover `#1E3A8A`): único color de acción del sistema — botones primarios, enlaces activos, íconos de marca, elementos seleccionados. Es el color que dice "esto es AquaRural" y "esto se puede accionar ahora" a la vez; no compite con ningún otro acento de acción.

### Secondary
- **Esmeralda Éxito** (`#10B981`, fondo `#ECFDF5`/`emerald-50`): estado positivo — "Al día", "Pagada", confirmaciones, avatar de rol Tesorero. Nunca se usa para acción, solo para estado.

### Estados semánticos
- **Éxito** → Esmeralda (`emerald-50` fondo / `emerald-200` borde / `emerald-700`–`800` texto).
- **Advertencia / pendiente / mora** → Ámbar (`amber-50` fondo / `amber-200` borde / `amber-600`–`700` texto).
- **Error / inactivo** → Rojo (`red-50` fondo / `red-200` borde / `red-600`–`700` texto; variante reforzada `border-2 border-red-300 text-red-800` para alertas críticas, ej. inconsistencias de lectura).

### Roles (avatares e identificadores de acceso)
Cada rol de usuario tiene su propio color de identificación, usado en avatares e íconos de perfil — no en botones de acción:
- **SuperAdmin** → Índigo (`#4F46E5`).
- **Administrador de acueducto** → Azul de marca (`#1D4ED8`).
- **Tesorero** → Esmeralda (`emerald-600`).
- **Fontanero** → Ámbar (`amber-600`).

### Neutral
- **Fondo de página** (`white` / `slate-50`): base de toda la aplicación.
- **Superficie de tarjeta** (`white`): fondo de tarjetas, modales, filas de tabla en hover.
- **Borde** (`slate-200` o `gray-100` según sección): siempre 1px, sutil, nunca a contraste alto salvo en foco.
- **Texto principal** (`slate-800`/`slate-900`): títulos y contenido primario.
- **Texto secundario** (`slate-500`/`slate-400`): labels, metadatos, placeholders.

### Named Rules
**La Regla del Azul Único.** No hay una paleta de acentos de acción múltiple — el azul de marca es el único color que significa "puedes actuar aquí". Verde/ámbar/rojo comunican exclusivamente estado, nunca invitan a una acción.

**La Regla del Texto Blanco Explícito.** Los botones primarios fijan el color de texto con `style={{ color: '#ffffff' }}` en vez de la clase `text-white` de Tailwind — es un workaround necesario por reglas legacy `html.light .text-white { color: #0f172a !important }` que sobreviven en `index.css` de web-admin. Mantener este patrón en código nuevo de esa app hasta que esa deuda CSS se limpie; no aplica a landing, que no tiene ese legacy.

## Typography

**Display/Headline Font:** Outfit (con fallback `sans-serif`) — clase utilitaria `font-headline`.
**Body Font:** Inter (con fallback `sans-serif`) — clase utilitaria `font-body`.
**Mono/Cifras:** fuente monoespaciada del sistema — clase `font-mono`, reservada a cédulas, matrículas, números de medidor, códigos de factura/referencia y montos en COP.

**Character:** Outfit aporta peso geométrico a títulos y micro-etiquetas (extrabold, uppercase con tracking amplio en labels/badges); Inter mantiene el cuerpo legible y neutro; la mono marca visualmente "esto es un dato que se puede verificar" (identificadores, dinero).

### Hierarchy
- **Headline** (extrabold 800, `text-xl`–`text-2xl`, tracking-tight): títulos de página (`font-headline`).
- **Title** (extrabold, `text-base`–`text-lg`, `font-headline`): encabezados de tarjeta/módulo dentro de una página.
- **Label** (bold/extrabold, `text-[10px]`–`text-xs`, uppercase, tracking-wider, `font-headline`): badges de estado, encabezados de tabla, micro-etiquetas ("TOTAL", "PENDIENTE").
- **Body** (regular/medium, `text-xs`–`text-sm`, `font-body` o sin clase explícita): párrafos, descripciones, texto de formulario.
- **Cifra** (bold/extrabold, `text-lg`–`text-3xl`, `font-mono`): valores monetarios, cédulas, matrículas y códigos de factura/referencia.

### Named Rules
**La Regla de la Cifra Monoespaciada.** Todo valor en pesos colombianos, cédula, matrícula, número de medidor o código de referencia se renderiza en `font-mono`; el resto del contenido nunca la usa. Es la señal visual de "esto es un identificador o dato financiero verificable".

## Layout

Contenedor de página estándar en web-admin: `p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto` (o `p-8 space-y-8` en páginas más densas como Lecturas). Las grillas de métricas (KPIs) usan `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` con `gap-5`; los paneles de contenido principal usan `grid-cols-12` con combinaciones típicas de `col-span-5`/`col-span-7` o `col-span-6`/`col-span-6` según el peso relativo de cada bloque. El sidebar de navegación es fijo (`fixed left-0 top-0 w-64 h-screen`, colapsable a `w-20`), con overlay en móvil. La densidad es media-alta: tarjetas y tablas usan `gap-5`–`gap-6`, sin llegar a espaciado editorial extremo.

En landing, el contenedor estándar es `max-w-7xl mx-auto px-6` con secciones espaciadas por `py-20`–`py-24` (`section-pad`), y el header es `fixed top-0` con transición de transparente a sólido según scroll.

## Elevation & Depth

El sistema es plano en reposo, con `shadow-sm` como única señal de elevación en la inmensa mayoría de tarjetas y contenedores — no hay resplandor de color ni sombras oscuras dramáticas. `shadow-md` aparece solo en hover de botones primarios y en el CTA de login del navbar de landing. `shadow-xl` se reserva para modales/overlays (ej. modal de confirmación de guardado en Lecturas).

### Shadow Vocabulary
- **Elevación estándar** (`shadow-sm`): toda tarjeta, panel, header de página y fila de tabla en reposo.
- **Elevación de interacción** (`shadow-md` en hover): botones primarios y CTAs, para dar sensación de respuesta al pasar el mouse.
- **Elevación de overlay** (`shadow-xl`): modales y diálogos de confirmación, que necesitan separarse claramente del contenido detrás del backdrop.

### Named Rules
**La Regla de la Sombra Sutil.** La jerarquía visual se construye con borde + fondo + tipografía antes que con sombra; `shadow-sm` es un refuerzo casi imperceptible, nunca el mecanismo principal para comunicar que algo "flota" sobre la página.

## Shapes

Los radios de esquina varían según el rol del elemento, no según preferencia estética puntual:
- **`rounded-3xl`** (24px): contenedores de página completa, headers, tarjetas de métricas grandes (KPIs en Lecturas/FontaneroDashboard).
- **`rounded-2xl`** (16px): tarjetas de contenido, tablas, banners de error/éxito, tarjetas KPI de SuperAdmin, footer de usuario del sidebar.
- **`rounded-xl`** (12px): inputs, botones de navegación del sidebar, botones-ícono, ícono de marca.
- **`rounded-full`**: badges de estado tipo píldora, avatares circulares, botones-CTA del navbar de landing.

No hay esquinas rectas en superficies de contenido; los únicos ángulos rectos aparecen en filas internas de tabla, nunca en el contenedor de la tabla. Bordes: siempre 1px, `border-slate-200` (o `border-gray-100` en algunas tablas de SuperAdmin — inconsistencia menor conocida, no un patrón a replicar deliberadamente), reforzado a `border-2` solo en alertas críticas (`border-2 border-red-300`).

## Components

### Buttons
- **Shape:** `rounded-2xl` (16px) en CTAs principales de páginas de gestión; `rounded-xl`/`rounded-full` en botones de navbar/sidebar según contexto.
- **Primary:** fondo sólido `bg-[#1D4ED8]` con `hover:bg-[#1E3A8A]`, texto blanco fijado con `style={{ color: '#ffffff' }}` (ver Named Rules), `shadow-sm` con `hover:shadow-md`.
- **Secondary:** fondo `bg-slate-100`/`bg-white` con borde `border-slate-200`/`border-slate-300`, texto `text-slate-600`/`text-slate-900`, `hover:bg-slate-200`/`hover:bg-slate-100`.
- **Ghost/Icon:** sin fondo en reposo, `text-gray-400`/`text-slate-400` → `hover:text-[#1D4ED8]` + `hover:bg-gray-100`/`hover:bg-blue-50`, usado para acciones secundarias en filas de tabla (editar, eliminar, restablecer contraseña).
- **Interacción:** transición estándar `transition-all` o `transition-colors`, sin pulso de escala dramático; la energía visual viene del cambio de color/fondo, no del movimiento.

### Badges / Pills de estado
- **Shape:** siempre `rounded-full`.
- **Estilo:** fondo pastel del color semántico (`bg-emerald-50`, `bg-amber-50`, `bg-red-50`) + borde del mismo color (`border-emerald-200`) + texto saturado y legible (`text-emerald-700`). Nunca fondo sólido saturado. Texto en `text-[9px]`–`text-[10px]` uppercase bold con `font-headline`.

### Banners de error/éxito (Named Rule confirmada, idéntica entre páginas)
Patrón estandarizado, carácter por carácter, en `LecturasPage.jsx` y `FontaneroDashboardPage.jsx` — usar exactamente así en cualquier página nueva:
```
bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5
flex items-center justify-between text-red-700 text-xs font-headline
shadow-sm animate-fade-in
```
con ícono Material Symbols `error` (`text-lg`) dentro de un `<div className="flex items-center gap-2.5">`, texto en `font-semibold`, y un botón de cerrar (`close`, `text-base`) a la derecha. El de éxito es idéntico cambiando `red` por `emerald` y el ícono a `check_circle`.

### Cards / Containers
- **Corner Style:** ver Shapes — `rounded-3xl` para nivel de página, `rounded-2xl` para sub-bloques y tablas.
- **Background:** `bg-white`, con `border border-slate-200` (o `border-gray-100` en algunas tablas de SuperAdmin).
- **Shadow Strategy:** `shadow-sm` universal (ver Elevation & Depth).
- **Internal Padding:** `p-5`–`p-8` según jerarquía.

### Inputs / Fields
- **Style:** `bg-white` o `bg-slate-50`, `border border-slate-200`, `rounded-xl`/`rounded-2xl`, texto `text-slate-800` con placeholder `text-slate-400`.
- **Focus:** `focus:border-[#1D4ED8]` — sin ring de color adicional en la mayoría de casos, borde de foco es suficiente.
- **Con ícono:** ícono Material Symbols absoluto a la izquierda, input con padding-left ajustado.

### Iconografía
Material Symbols Outlined (`material-symbols-outlined`, nombres estilo Google: `water_drop`, `error`, `check_circle`, `progress_activity` para spinners) es el único sistema de íconos usado en las cuatro superficies — ningún otro kit (Heroicons, FontAwesome, etc.) aparece en el código activo.

### Navigation (Sidebar — web-admin)
- **Style:** fondo blanco fijo (`bg-white`, ancho `w-64`, colapsable a `w-20`), con borde derecho `border-gray-100`.
- **Item activo:** fondo `bg-blue-50` + texto `text-[#1D4ED8]`.
- **Item inactivo:** `text-gray-500` → `hover:text-[#1D4ED8] hover:bg-gray-50`.
- **Avatar de usuario (footer):** ícono + color según rol (ver sección Roles arriba), con nombre real del usuario (`user.nombre`) y etiqueta de rol debajo.
- **Mobile:** colapsa fuera de pantalla (`-translate-x-full`), overlay con backdrop al abrir.

### Navigation (Navbar — landing)
- **Style:** `fixed top-0`, transparente sobre el Hero, se vuelve `bg-white/90 backdrop-blur-md` al hacer scroll.
- **Link activo:** píldora `bg-trust text-white` (`rounded-full`).
- **CTA "Iniciar Sesión":** píldora blanca sólida con borde sutil cuando el header ya es blanco, sombra `shadow-md` cuando el header sigue transparente.

## Do's and Don'ts

### Do:
- **Do** usar `#1D4ED8`/`#1E3A8A` como el único par de tonos de acción en toda la aplicación — no introducir un segundo azul ni un acento de acción alternativo.
- **Do** reservar verde/ámbar/rojo para su significado semántico fijo (éxito-al día / alerta-mora-pendiente / error-inactivo), nunca por preferencia estética puntual.
- **Do** usar `font-mono` para cédulas, matrículas, medidores, montos y códigos de referencia.
- **Do** replicar el patrón exacto de banners de error/éxito documentado arriba en cualquier página nueva que necesite feedback de acción.
- **Do** asignar el color de rol correspondiente (SuperAdmin índigo / Admin azul / Tesorero esmeralda / Fontanero ámbar) a cualquier nuevo indicador de identidad de usuario.

### Don't:
- **Don't** usar Ant Design ni ningún kit de componentes prefabricado — el sistema es Tailwind puro (regla dura del proyecto).
- **Don't** reintroducir el lenguaje visual "Hydro-Tech" oscuro (fondo obsidiana, acentos cian/esmeralda, degradados sky→cyan→emerald, resplandor de color) — quedó descartado; solo sobrevive como tokens/CSS sin uso en `tailwind.config.js`/`index.css` de web-admin y clases `.hydro-shimmer-*` sin uso confirmado en landing. No es el estándar a seguir en código nuevo.
- **Don't** usar `text-white` de Tailwind en botones primarios de web-admin sin verificar contraste — usar `style={{ color: '#ffffff' }}` hasta que se limpie el CSS legacy que lo sobreescribe (ver Named Rules).
- **Don't** introducir esquinas rectas en tarjetas, botones o inputs — el vocabulario de forma del sistema es redondeado sin excepción en superficies de contenido.
- **Don't** asumir que existe modo oscuro real: aunque `tailwind.config.js` tiene `darkMode: 'class'` y una paleta completa declarada, ninguna página activa la consume — todas están codificadas explícitamente en claro.
