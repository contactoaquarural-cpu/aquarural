---
name: AquaRural Pro — Landing
description: Landing de venta B2B para juntas de acueductos veredales — clara, de confianza, "la prueba, no el ambiente".
colors:
  trust: "#1D4ED8"
  trust-dark: "#1E3A8A"
  tint-blue: "#EFF6FF"
  tint-mint: "#ECFDF5"
  tint-violet: "#F5F3FF"
  ink: "#0F172A"
  ink-muted: "#64748B"
  surface-border: "#E2E8F0"
  glow-cyan: "#06B6D4"
  glow-cyan-deep: "#0EA5E9"
typography:
  headline:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontWeight: 700
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 400
  mono:
    fontFamily: "ui-monospace, monospace"
    fontWeight: 700
  icon:
    fontFamily: "Material Symbols Outlined"
    fontWeight: 400
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.trust}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.trust-dark}"
  card:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "28px"
  input:
    backgroundColor: "#F8FAFC"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
---

# Design System: AquaRural Pro — Landing

## Overview

**Creative North Star: "Prueba, no Ambiente"**

Esta landing existe para convencer a una junta directiva escéptica —evaluando gastar dinero comunitario en software— de que AquaRural Pro es real y funciona. Cada decisión visual sirve a esa tesis: fotografía real en vez de íconos genéricos, cifras del cliente piloto en vez de placeholders, y un vocabulario de "software empresarial serio" (fondo claro, un solo azul de confianza, tarjetas planas con borde fino) en vez de la estética de folleto de marketing agropecuario.

Es deliberadamente distinta del panel administrativo (`web-admin/DESIGN.md`, "The Hydro-Tech Control Room" — oscuro, con acentos de energía cian/esmeralda). La landing es la puerta de venta; el panel es la herramienta de operación diaria. No comparten paleta ni tono a propósito: uno vende, el otro opera.

**Rechazos confirmados:** sin modo oscuro (se retiró explícitamente — una landing de venta no lo necesitaba y duplicaba mantenimiento); sin gradient-text; sin animaciones decorativas en loop infinito (el shimmer de las tarjetas y botones solo se dispara en hover); sin emojis como iconografía (Material Symbols Outlined en su lugar); sin imágenes de cultivos/ganado/tractores (aunque la referencia de inspiración era de un sitio agrícola, el material se tradujo a temas de agua).

**Key Characteristics:**
- Fondo blanco continuo de principio a fin — las secciones se separan por borde y tarjeta, nunca por bloques de color de fondo.
- Un solo azul de confianza (`trust`) como color de acción; los tonos pastel (`tint-blue`/`tint-mint`/`tint-violet`) solo aparecen dentro de tarjetas pequeñas, nunca como fondo de sección completa.
- El navbar es un overlay transparente sobre la foto del hero, y se vuelve una barra blanca sólida al hacer scroll — nunca hay una barra opaca separada encima de la foto.
- Fotografía real de agua como prueba de marca, no ilustración ni renders genéricos.
- Tarjetas planas: borde fino, sin sombra en reposo, sin escalado/elevación al hover.
- Tipografía Outfit (títulos) + Inter (cuerpo) + monoespaciada para cifras en COP, heredada del sistema del panel admin para mantener continuidad de marca entre ambas superficies.

## Colors

Paleta restringida a propósito: un azul de acción, tres tintes pastel de apoyo, y la escala neutra de slate de Tailwind. Nunca se usa color por decoración — cada uno tiene un rol fijo.

### Primary
- **Azul de Confianza** (`#1D4ED8` / `trust`): único color de acción — todos los botones primarios, focus rings de inputs, enlaces activos. Es el color que dice "esto convierte".

### Secondary
- **Esmeralda** (`emerald-500`/`600` de Tailwind, sin token propio): estado positivo y diferenciación de plan de entrada — confirmaciones, "ahorras X al año", el interruptor de pago anual.

### Tertiary
- **Cian y Ámbar** (`cyan-600`, `amber-600` de Tailwind): reservados exclusivamente para diferenciar visualmente los planes de precios por nivel (Manantial/Caudal = cian, Cuenca = teal, Acuífero = ámbar) — nunca se usan fuera de esa tabla de planes.

### Neutral
- **Blanco** (`#FFFFFF`): fondo de página, único fondo de sección en toda la landing.
- **Slate 50** (`#F8FAFC`): fondo de inputs y de sub-bloques dentro de tarjetas (ej. panel de la calculadora).
- **Slate 200** (`#E2E8F0`): único tono de borde de tarjeta permitido.
- **Slate 900** (`#0F172A`): texto principal.
- **Slate 500** (`#64748B`): texto secundario/metadatos.

### Tintes de acento (solo dentro de tarjetas pequeñas)
- **Tint Blue** (`#EFF6FF`): fondo de tarjetas de dato relacionadas con recaudo/costo del plan.
- **Tint Mint** (`#ECFDF5`): fondo de tarjetas de dato relacionadas con ahorro/beneficio.
- **Tint Violet** (`#F5F3FF`): fondo de tarjetas de dato secundarias (ej. identidad de suscriptor).

### Acento heredado (micro-interacciones)
- **Glow Cyan** (`#06B6D4`) y **Glow Cyan Profundo** (`#0EA5E9`): únicos colores fuera de la paleta principal — alimentan el barrido de luz en hover de `.hydro-shimmer-card`/`.hydro-shimmer-btn`, heredado del panel admin. No se usan en ningún otro lugar; si se retira esa micro-interacción, estos colores se retiran con ella.

### Named Rules
**La Regla de la Sección Blanca.** Ninguna `<section>` de la landing (footer incluido) tiene un fondo de color distinto a blanco. La diferenciación entre secciones viene de tipografía, espaciado y tarjetas con borde — nunca de pintar el fondo completo de un color.

## Typography

**Display/Headline Font:** Outfit (con fallback `system-ui, sans-serif`) — clase `font-headline`.
**Body Font:** Inter (con fallback `system-ui, sans-serif`) — clase `font-body`.
**Mono/Cifras:** fuente monoespaciada del sistema — clase `font-mono`, reservada a valores en COP y códigos de referencia.
**Íconos:** Material Symbols Outlined — toda la iconografía de la landing (nunca emoji).

**Character:** Outfit extrabold en titulares grandes da el peso de "afirmación", no de decoración; Inter mantiene el cuerpo legible a densidad de lectura B2B; la mono marca cualquier cifra de dinero como un dato verificable, heredando la misma regla del panel admin.

### Hierarchy
- **Display** (extrabold, `text-4xl`–`text-6xl`, tracking-tight): titular del Hero, sobre la foto.
- **Headline** (extrabold, `text-3xl`–`text-4xl`): título de cada sección.
- **Title** (extrabold, `text-xl`–`text-2xl`): título de tarjeta (plan, módulo).
- **Body** (regular, `text-xs`–`text-base`): párrafos y descripciones.
- **Cifra** (extrabold, `text-2xl`–`text-3xl`, `font-mono`): precios y resultados de calculadora.

## Layout

Contenedor estándar `max-w-7xl mx-auto px-6`. Secciones con `py-20`/`py-24` de respiro vertical. El Hero es la única sección de ancho completo (foto `h-[560px] md:h-[620px]` sin contenedor). Grillas: 6 servicios en `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, 4 planes en `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`. Navbar fijo (`fixed top-0`), transparente sobre el Hero y sólido (`bg-white/90 backdrop-blur-md`) a partir de ~420px de scroll.

## Elevation & Depth

Plano por defecto. Las tarjetas de plan y de módulo no llevan sombra en reposo — solo borde de 1px (`border-slate-200`). La única elevación real de la landing es la barra de navegación al pasar a estado sólido (`backdrop-blur-md`, sin sombra) y el panel de "Comenzar 1er Mes Gratis" que sí usa `shadow-sm` puntualmente en el formulario de contacto. El shimmer de acento (`.hydro-shimmer-card`/`.hydro-shimmer-btn`, heredado del panel admin) se dispara solo en `:hover`, nunca en loop.

### Named Rules
**La Regla del Reposo Plano.** Ninguna tarjeta lleva sombra mientras el usuario no interactúa con ella. La sombra es una respuesta a la interacción, no un estado permanente.

## Shapes

Redondeo moderado, no extremo: tarjetas y botones grandes en `rounded-xl`/`rounded-2xl` (12–16px), inputs y botones pequeños en `rounded-lg`, badges y el CTA de "Iniciar Sesión" en `rounded-full`. Bordes siempre 1px, `border-slate-200`, salvo el borde de 2px que marca el plan recomendado en la tabla de precios (única excepción, con propósito semántico).

## Components

### Buttons
- **Primary:** `bg-trust hover:bg-trust-dark`, texto blanco extrabold, `rounded-xl`, sin degradado.
- **Secondary (sobre foto del Hero):** `bg-white hover:bg-slate-100`, texto `slate-900`.
- **CTA de navegación ("Iniciar Sesión"):** píldora blanca sólida (`rounded-full`), con sombra sutil sobre la foto y borde `slate-300` cuando el navbar ya es blanco — nunca invisible contra su propio fondo.
- **Por plan (tabla de precios):** color sólido del tier (cian/teal/ámbar), mismo peso y forma que el botón primario — el color cambia, la forma no.

### Cards
- **Corner Style:** `rounded-2xl` en tarjetas de nivel superior (planes, módulos, calculadora), `rounded-xl` en sub-bloques.
- **Background:** blanco con `border border-slate-200`. Plan recomendado: mismo blanco, borde de 2px del color del tier + etiqueta "Recomendado para ti".
- **Shadow:** ninguna en reposo.
- **Padding:** `p-6`–`p-10` según jerarquía.

### Inputs
- **Style:** `bg-slate-50` sobre tarjeta blanca, `border border-slate-200`, `rounded-lg`.
- **Focus:** `focus:border-trust focus:ring-1 focus:ring-trust` — nunca el halo azul genérico del navegador.

### Navigation (Navbar)
- **Sobre el Hero:** transparente, texto y logo en blanco, íconos con borde `border-white/30`.
- **Al hacer scroll (>420px):** `bg-white/90 backdrop-blur-md`, texto `slate-600`, transición de 300ms entre ambos estados — nunca un salto brusco.
- **Móvil:** menú hamburguesa con panel desplegable blanco sólido, siempre legible sin importar el scroll.

### Firma de cierre (Footer)
Wordmark "AQUARURAL" gigante (`text-[18vw]`) en `slate-900/[0.04]` de fondo, sobre footer blanco (`bg-white`) — igual que el resto de la landing. No hay ninguna superficie oscura en toda la página; el énfasis de cierre viene del tamaño del wordmark, no de un cambio de tema.

## Do's and Don'ts

### Do:
- **Do** mantener toda sección de contenido sobre fondo blanco; diferenciar con tarjetas y tipografía, no con color de fondo.
- **Do** usar `font-mono` para cifras en COP y códigos de referencia.
- **Do** disparar el shimmer de acento solo en `:hover`, nunca en loop automático.
- **Do** reservar cian/teal/ámbar exclusivamente para diferenciar el nivel de plan en la tabla de precios.
- **Do** usar `trust` como único color de acción/control (botones, toggles, focus) — esmeralda queda reservado para ahorro/éxito, nunca para un control interactivo.

### Don't:
- **Don't** reintroducir el modo oscuro ni ninguna superficie oscura — se retiraron deliberadamente, incluido el footer; esta landing es 100% clara, sin excepciones.
- **Don't** usar imágenes o iconografía de cultivos, ganado o maquinaria agrícola — aunque una referencia de inspiración fuera de ese dominio, el material siempre se traduce a agua/infraestructura rural.
- **Don't** usar emojis como iconografía — Material Symbols Outlined en su lugar.
- **Don't** agregar sombra a una tarjeta en su estado de reposo.
- **Don't** copiar la paleta oscura del panel admin (`web-admin/DESIGN.md`) — son mundos visuales deliberadamente distintos.
