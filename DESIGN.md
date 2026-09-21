---
name: AquaRural Pro
description: Panel de control Hydro-Tech para administrar acueductos veredales — oscuro, preciso, con acentos de energía cian y esmeralda.
colors:
  background-obsidian: "#090D16"
  surface-slate-950: "#020617"
  surface-slate-900: "#0F172A"
  surface-slate-800: "#1E293B"
  surface-slate-700: "#334155"
  border-slate-800: "#1E293B"
  cian-hidraulico: "#0EA5E9"
  cian-hidraulico-container: "#0369A1"
  esmeralda-vital: "#10B981"
  esmeralda-vital-container: "#047857"
  aqua-electrico: "#06B6D4"
  ambar-mora: "#F59E0B"
  rojo-inactivo: "#EF4444"
  texto-claro: "#F8FAFC"
  texto-tenue: "#94A3B8"
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
    backgroundColor: "{colors.cian-hidraulico}"
    textColor: "{colors.surface-slate-950}"
    rounded: "{rounded.xl}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.aqua-electrico}"
  card:
    backgroundColor: "{colors.surface-slate-900}"
    textColor: "{colors.texto-claro}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-slate-950}"
    textColor: "{colors.texto-claro}"
    rounded: "{rounded.lg}"
    padding: "10px 14px"
---

# Design System: AquaRural Pro

## Overview

**Creative North Star: "The Hydro-Tech Control Room"**

AquaRural Pro se ve y se siente como la sala de control de una infraestructura vital: oscura, precisa, sin ruido visual, con acentos de energía que se activan cuando algo importa (un cobro confirmado, un estado "al día", una acción disponible). No es un panel administrativo genérico con un logo de agua encima — el lenguaje visual completo (fondo obsidiana, orbes de resplandor cian/esmeralda difuminados en el fondo, degradados sky→cyan→emerald en los CTAs principales) está construido alrededor de la metáfora del flujo: datos y dinero moviéndose con la misma claridad con la que debería moverse el agua en un acueducto bien gestionado.

El panel es oscuro por defecto (modo claro existe pero es secundario) y prioriza legibilidad y jerarquía sobre decoración. La superficie base nunca es negro puro — siempre un slate/obsidiana con temperatura azulada — y la profundidad se construye por capas de superficie (slate-950 → slate-900 → slate-800) más resplandor de color, no por sombras neutras clásicas.

**Rechazos confirmados:** sin Ant Design ni ningún kit de componentes prefabricado (regla dura del proyecto); sin bordes visualmente pesados; sin negro absoluto (#000000).

**Key Characteristics:**
- Fondo obsidiana/slate en capas, nunca negro puro.
- Acentos cian-esmeralda-ámbar como codificación semántica de estado (recaudo, al día, mora), no decoración libre.
- Tarjetas y botones muy redondeados (rounded-2xl/3xl), casi sin esquinas rectas.
- Profundidad = capas + resplandor de color, no sombra neutra.
- Tipografía Outfit (títulos/labels) + Inter (cuerpo) + monoespaciada para cifras de dinero.

## Colors

La paleta es fría y oscura por defecto, con tres acentos de energía que codifican significado (no son intercambiables entre sí) sobre una base neutra de grises azulados.

### Primary
- **Cian Hidráulico** (`#0EA5E9`): acción principal — botones CTA, focus rings de inputs, iconografía de pagos/recaudo/Wompi-PSE. Es el color que dice "esto se puede accionar ahora".

### Secondary
- **Esmeralda Vital** (`#10B981`): estado positivo — "Al día", "Pagada", confirmaciones, indicadores de sistema operativo (con punto pulsante `animate-pulse`). Nunca se usa para acción, solo para estado.

### Tertiary
- **Aqua Eléctrico** (`#06B6D4`): paso intermedio en los degradados de marca (`from-sky-500 via-cyan-500 to-emerald-500`) y variante más clara del primario en superficies secundarias. Da el efecto de "energía fluyendo" entre cian y esmeralda.

### Neutral
- **Obsidiana Profunda** (`#090D16` / `slate-950` `#020617`): fondo base de toda la aplicación en modo oscuro.
- **Superficie Slate** (`slate-900` `#0F172A`): fondo de tarjetas, modales, inputs sobre el fondo base.
- **Borde Slate** (`slate-800` `#1E293B`): único tono de borde permitido; siempre sutil, nunca a contraste alto salvo en foco/hover.
- **Texto Claro** (`#F8FAFC` / `slate-100`): texto principal sobre fondo oscuro.
- **Texto Tenue** (`#94A3B8` / `slate-400`): labels secundarios, metadatos, placeholders.

### Estados semánticos (fuera de la escala Material)
- **Al día** → Esmeralda Vital.
- **En mora** → **Ámbar Mora** (`#F59E0B`): alerta, no error — cartera vencida, licencia por vencer.
- **Inactivo / error** → **Rojo Alerta** (`#EF4444` en tokens, `red-400`/`red-500` en implementación): fallos de pago, cuentas inactivas, mensajes de error de formulario.

### Named Rules
**La Regla del Acento con Propósito.** Cian, esmeralda y ámbar nunca son intercambiables por preferencia estética: cian = acción, esmeralda = éxito/al día, ámbar = alerta/mora, rojo = error/inactivo. Cambiar el color de un badge de estado cambia su significado.

## Typography

**Display/Headline Font:** Outfit (con fallback `sans-serif`) — clase utilitaria `font-headline`.
**Body Font:** Inter (con fallback `sans-serif`) — clase utilitaria `font-body`.
**Mono/Cifras:** fuente monoespaciada del sistema — clase `font-mono`, reservada casi exclusivamente para montos en COP y códigos de referencia/factura.

**Character:** Outfit aporta el peso técnico-geométrico de un panel de control (extrabold en títulos, uppercase con tracking amplio en labels/badges); Inter mantiene el cuerpo legible y neutro; la mono marca visualmente "esto es un número que importa" (dinero, códigos).

### Hierarchy
- **Headline** (extrabold 800, `text-2xl`–`text-3xl`, tracking-tight): títulos de página y de sección (`font-headline`).
- **Title** (extrabold, `text-lg`, `font-headline`): encabezados de tarjeta/módulo dentro de una página.
- **Label** (bold/extrabold, `text-[10px]`–`text-xs`, uppercase, tracking-wider, `font-headline`): badges de estado, encabezados de tabla, micro-etiquetas ("RECAUDADO", "EN MORA").
- **Body** (regular/medium, `text-xs`–`text-sm`, `font-body`): párrafos, descripciones, texto de formulario.
- **Cifra** (bold/extrabold, `text-2xl`–`text-3xl`, `font-mono`): valores monetarios y códigos de factura/referencia.

### Named Rules
**La Regla de la Cifra Monoespaciada.** Todo valor en pesos colombianos o código de referencia se renderiza en `font-mono`; el resto del contenido nunca la usa. Es la señal visual de "esto es un dato financiero verificable".

## Layout

Contenedor de página estándar: `p-8 space-y-8 max-w-7xl mx-auto`. Las grillas de métricas (KPIs) usan `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` con `gap-6`; los paneles de contenido principal usan `grid-cols-1 lg:grid-cols-3` con una proporción típica de 2/3 + 1/3 (`lg:col-span-2`). El sidebar de navegación es fijo (`fixed left-0 top-0 w-64 h-screen`), colapsable en móvil mediante overlay con backdrop-blur. La densidad es media: suficiente respiro entre tarjetas (`gap-6`–`gap-8`) sin llegar a espaciado editorial extremo.

## Elevation & Depth

El sistema es plano en reposo. La profundidad no viene de sombras neutras clásicas sino de dos mecanismos combinados: (1) capas de superficie cada vez más claras a medida que un elemento "flota" sobre el fondo (`slate-950` → `slate-900` → `slate-800`), y (2) resplandor de color (`glow`) — orbes difuminados de fondo (`blur-3xl`, `blur-[140px]`) y sombras coloreadas en los CTAs (`shadow-cyan-500/25`, `shadow-emerald-500/20`) en vez de `shadow-black/*`. Las sombras neutras (`shadow-sm`, `shadow-xl`, `shadow-2xl`) sí se usan, pero como refuerzo sutil de separación, nunca como la señal principal de jerarquía.

### Shadow Vocabulary
- **Glow de acento** (`shadow-[color]-500/20` a `/40`): en botones CTA y tarjetas destacadas, casi siempre junto a `hover:shadow-[color]-500/40` para intensificar en interacción.
- **Elevación ambiental** (`shadow-sm` en modo claro, `shadow-xl`/`shadow-2xl` en modo oscuro): separación general de tarjetas sobre el fondo.

### Named Rules
**La Regla de "la Luz es la Sombra".** Cuando un elemento necesita destacar, no se le agrega una sombra oscura: se le agrega resplandor de color. El glow es la unidad de énfasis del sistema.

## Shapes

Todo es marcadamente redondeado: tarjetas y contenedores principales en `rounded-2xl`/`rounded-3xl` (16–24px), botones e inputs en `rounded-2xl`, botones-ícono e inputs pequeños en `rounded-xl`, badges y pills de estado siempre en `rounded-full`. No hay esquinas rectas en superficies de contenido; los únicos ángulos rectos aparecen en tablas (filas, no contenedor). Bordes: siempre 1px, siempre `border-slate-800` (oscuro) o `border-slate-200` (claro), nunca gruesos salvo estados de alerta (`border-2 border-amber-500/50` en el banner de licencia vencida).

## Components

### Buttons
- **Shape:** `rounded-2xl` (16px) en CTAs principales; `rounded-xl` (12px) en botones-ícono secundarios.
- **Primary:** degradado `from-sky-500 via-cyan-500 to-emerald-500`, texto `text-slate-950` extrabold uppercase, `shadow-lg shadow-cyan-500/25` con `hover:shadow-cyan-500/40` y aclarado del degradado en hover (`hover:from-sky-400 ... hover:to-emerald-400`).
- **Secondary:** fondo sólido `bg-slate-900`/`bg-slate-800` con `hover:bg-slate-700`/`hover:bg-slate-800`, texto claro, sin degradado.
- **Ghost/Icon:** sin fondo en reposo, `text-slate-400` → `hover:text-cyan-400` + `hover:bg-slate-800`, usado para acciones secundarias en filas de tabla (editar, eliminar, ver).
- **Interacción:** pulso de energía contenido — `hover:scale-105`/`110` en tarjetas de acceso rápido, intensificación de glow en CTAs, transición estándar `transition-all duration-200`–`300`. En reposo el componente es sobrio; la energía aparece solo al interactuar.

### Badges / Pills de estado
- **Shape:** siempre `rounded-full`.
- **Estilo:** fondo tenue del color semántico (`bg-emerald-500/10`, `bg-amber-500/10`) + borde del mismo color a mayor opacidad (`border-emerald-500/30`) + texto del color a máxima saturación legible (`text-emerald-400`). Nunca fondo sólido saturado.

### Cards / Containers
- **Corner Style:** `rounded-3xl` para tarjetas de nivel superior (KPIs, paneles principales), `rounded-2xl` para sub-bloques dentro de ellas.
- **Background:** `bg-white` (claro) / `bg-slate-900/90` (oscuro), con `border border-slate-200`/`border-slate-800`.
- **Shadow Strategy:** ver Elevation & Depth — `shadow-sm` en claro, `shadow-xl`/`shadow-2xl` en oscuro, refuerzo de `hover:border-[accent]-500/40` en tarjetas interactivas.
- **Internal Padding:** `p-5`–`p-8` según jerarquía (tarjetas KPI ~`p-6`, paneles grandes ~`p-6`–`p-8`).

### Inputs / Fields
- **Style:** `bg-slate-950` sobre tarjeta `bg-slate-900`, `border border-slate-800`, `rounded-2xl`, texto `text-slate-100` con placeholder `text-slate-500`.
- **Focus:** `focus:border-cian-hidraulico` + `focus:ring-1 focus:ring-cian-hidraulico` — nunca un halo genérico azul de navegador.
- **Con ícono:** ícono Material Symbols absoluto a la izquierda (`left-3.5`), input con `pl-10`.

### Navigation (Sidebar)
- **Style:** fondo sólido oscuro fijo (`bg-slate-950`, ancho `w-64`), siempre oscuro incluso si el resto del panel cambia a modo claro (ver Do's and Don'ts).
- **Item activo:** degradado tenue `from-sky-500/20 to-cyan-500/10` + borde `border-cyan-500/30` + texto `text-cyan-300`.
- **Item inactivo:** `text-slate-400` → `hover:text-slate-200 hover:bg-slate-900/60`.
- **Mobile:** colapsa fuera de pantalla (`-translate-x-full`), overlay `bg-slate-950/80 backdrop-blur-sm` al abrir.

### Badge de estado del sistema (firma del panel)
Indicador con punto pulsante (`w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse`) + texto ("Sistema Veredal Operativo", "Sincronizado") — patrón recurrente para comunicar que el backend/sistema está vivo en tiempo real. Es la firma visual más distintiva del panel: úsalo para cualquier nuevo indicador de estado en vivo.

## Do's and Don'ts

### Do:
- **Do** usar la variante `dark:` de Tailwind directamente sobre clases neutras (`bg-white dark:bg-slate-900`) para cualquier página o componente nuevo — es el patrón que ya siguen Dashboard y SuperAdmin y el que debe generalizarse.
- **Do** reservar cian/esmeralda/ámbar/rojo para su significado semántico fijo (acción / éxito-al día / alerta-mora / error-inactivo), nunca por preferencia estética puntual.
- **Do** usar `font-mono` para todo valor monetario o código de referencia.
- **Do** mantener el sidebar siempre oscuro (`bg-slate-950`), sin importar el tema activo del resto del panel — es una decisión de marca, no un olvido.
- **Do** construir jerarquía visual con capas de superficie + resplandor de color antes que con sombras neutras.

### Don't:
- **Don't** usar Ant Design ni ningún kit de componentes prefabricado — el sistema es Tailwind puro (regla dura del proyecto).
- **Don't** usar negro puro (`#000000`) en ningún fondo; la base más oscura siempre tiene temperatura azulada (`slate-950`/`#090D16`).
- **Don't** introducir esquinas rectas en tarjetas, botones o inputs — el vocabulario de forma del sistema es redondeado sin excepción en superficies de contenido.
- **Don't** replicar el patrón heredado de `LoginPage`/`Sidebar`/`TopBar`, que fuerza el modo claro con overrides CSS (`html.light .bg-slate-950 {...}`) en vez del prefijo `dark:` de Tailwind. Es deuda técnica documentada, no el estándar a seguir en código nuevo.
- **Don't** mezclar los tokens nombrados de `tailwind.config.js` (`bg-primary`, `bg-surface`, paleta "Hydro-Tech" declarada pero apenas usada) con las clases crudas de Tailwind (`slate-900`, `cyan-500`) que sí dominan las páginas activas — hoy coexisten sin resolver; cualquier componente nuevo debe seguir el patrón de clases crudas + `dark:` que ya usan Dashboard/SuperAdmin, no los tokens nombrados sin uso real.
