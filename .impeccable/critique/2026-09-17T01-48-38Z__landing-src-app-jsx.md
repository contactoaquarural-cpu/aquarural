---
target: landing de AquaRural Pro
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\Julian Andres\\OneDrive\\Documents\\AquaRural\\landing\\src\\App.jsx"
target_fingerprint: "sha256:77f1b062d51dbaead0b584bae53f1b7336b72eedc3fd138f6a32324f99debeed"
target_path: "C:\\Users\\Julian Andres\\OneDrive\\Documents\\AquaRural\\landing\\src\\App.jsx"
timestamp: 2026-09-17T01-48-38Z
slug: landing-src-app-jsx
---
## Design Health Score

| # | Heurística | Score | Hallazgo clave |
|---|---|---|---|
| 1 | Visibilidad del estado del sistema | 3 | Simuladores en vivo bien; formulario de Contacto nunca confirma el envío (`enviado` es estado muerto) |
| 2 | Correspondencia sistema-mundo real | 4 | Terminología 100% del dominio rural colombiano |
| 3 | Control y libertad del usuario | 3 | Sin forma de deshacer envío, pero es acción de bajo riesgo |
| 4 | Consistencia y estándares | 2 | `index.css` reintroduce a propósito el anti-patrón de tema que el propio DESIGN.md prohíbe |
| 5 | Prevención de errores | 3 | Sin validación de formato en teléfono; placeholder ambiguo |
| 6 | Reconocimiento antes que recuerdo | 3 | Navegación por anclas visible y persistente (en desktop) |
| 7 | Flexibilidad y eficiencia | n/a | No aplica a landing de una sola visita |
| 8 | Estética y diseño minimalista | 3 | Sección de Planes sobrecargada; confirmado por detector (`nested-cards` ×22) |
| 9 | Reconocer y recuperarse de errores | 2 | Validación HTML5 nativa sin estilo de marca |
| 10 | Ayuda y documentación | n/a | No aplica a marketing |

**Total: 26/32 (81% → Good)**

## Veredicto de Design-Specificity

Mixto — y el detector lo confirma con números. El copy y los datos de dominio (vereda, fontanero, mora, matrícula ACU-0101, planes Manantial/Caudal/Cuenca/Acuífero) están genuinamente anclados a AquaRural. Pero visualmente, la landing no hereda "The Hydro-Tech Control Room" de DESIGN.md: falta el glow de acento en reposo, falta la firma del punto pulsante con propósito semántico, y las 4 tarjetas de precio son el patrón Stripe/Notion estándar.

El detector corrobora esto de forma independiente: `ai-color-palette` disparó 79 veces en el overlay en vivo. Sumado a `dark-glow` (×6), `gpt-thin-border-wide-shadow` (×5) y `gradient-text` (×4 en vivo, confirmado también por el CLI en `Hero.jsx:24`), el patrón es consistente: la landing usa el vocabulario decorativo genérico de interfaces "hechas por IA" en vez del lenguaje de marca específico que el propio panel admin ya estableció.

Escaneo CLI (`impeccable detect --json`): 4 hallazgos — 3 de 4 falsos positivos razonados (el detector empareja `text-*`/`bg-*` de la misma línea sin respetar el variant `selection:` o el contraste real). El único genuino: `gradient-text` en `Hero.jsx:24`.

Overlay en vivo: 237 detecciones individuales contadas (la herramienta reportó "186" en su resumen — discrepancia sin reconciliar, declarada). Dominado por `ai-color-palette` (79), `tiny-text`/`undersized-ui-text` (66 combinadas), `low-contrast` (38), `nested-cards` (22). Visible en Hero, Modulos, Contacto y Footer por igual.

## Impresión General

La landing tiene un copy y una lógica de negocio genuinamente pensados para acueductos veredales (el simulador de recaudo es sobresaliente), pero su piel visual no suena a AquaRural Pro — suena a una landing SaaS genérica con buenos textos encima.

## Lo que funciona

1. `SimuladorRecaudo.jsx` — rangos realistas del dominio, feedback inmediato, traduce cifras a beneficios emocionalmente relevantes para una junta escéptica.
2. Copy de dominio específico — "cobro manual puerta a puerta", "Fontanero (Lecturas en Campo)".
3. `WaterRippleEffect` — el único detalle verdaderamente original y de marca, aunque infrautilizado.

## Problemas prioritarios

**[P0] El formulario de contacto no confirma nada al usuario.**
Por qué importa: `Contacto.jsx:13` fija `setEnviado(true)` pero ningún JSX lee ese estado. Si el navegador bloquea el popup de WhatsApp, quien completó el formulario no ve ninguna señal de éxito ni error.
Fix: renderizar un estado de confirmación visible y un fallback si `window.open` falla.
Comando sugerido: $impeccable harden

**[P1] Sin menú de navegación en móvil.**
`Navbar.jsx:56` oculta todos los enlaces bajo `hidden md:flex` sin botón hamburguesa alternativo.
Comando sugerido: $impeccable adapt

**[P1] Deuda de especificidad visual: la landing no suena a Hydro-Tech, suena a "hecha por IA".**
Confirmado en dos frentes: (a) `index.css` reintroduce el anti-patrón de tema que DESIGN.md prohíbe explícitamente; (b) el detector dispara `ai-color-palette` 79 veces, más `dark-glow`, hairline-border-wide-shadow y gradient-text repetidos.
Comando sugerido: $impeccable polish

**[P2] Sección de Planes cognitivamente sobrecargada justo antes del CTA de conversión.**
4 tarjetas × 7-9 ítems + calculadora adicional con input de suscriptores que no comparte estado con el simulador de arriba. Detector corrobora con `nested-cards` ×22.
Comando sugerido: $impeccable distill

**[P3] Bug visual: el emoji de bandera colombiana se recorta en el badge del Hero.**
Se lee "...de Colombia co" en vez de 🇨🇴, en ambos temas.
Comando sugerido: $impeccable polish

## Persona Red Flags

**Jordan (primerizo confundido):** ve 4 planes sin saber cuál le corresponde; la calculadora que resolvería esto está después de las tarjetas. Campo "N° de Suscriptores" es texto libre sin rango sugerido. Sin señal si falla el popup de WhatsApp.

**Riley (stress tester):** puede meter cifras absurdas en la calculadora de inversión sin tope. Tooltip de error nativo no usa el lenguaje visual de marca.

**Casey (móvil distraído):** sin menú móvil, debe scrollear todo. CTAs abren `wa.me` en `_blank` sin fallback si no tiene WhatsApp.

## Observaciones menores

- Lógica completa de PWA install prompt en `Navbar.jsx` sin botón que la dispare — código muerto.
- `Noticias.jsx`/`Stats.jsx` (huérfanos) todavía tienen clases y copy del proyecto ganadero anterior.
- Botón "Panel Admin" apunta a `http://localhost:5173/login` hardcodeado.
- Vista móvil no pudo forzarse en las herramientas de navegador de ninguno de los dos assessments (limitación de tooling); el hallazgo de navegación móvil se sostiene por evidencia de código.

## Preguntas para considerar

1. Si el Creative North Star es la sala de control de una infraestructura vital, ¿por qué la landing es la que menos lo usa?
2. ¿Los 4 planes completos responden a una necesidad real, o la calculadora ya resuelve mejor lo que la junta necesita saber?
3. ¿Qué mecanismo de confianza legítimo puede reforzar el formulario de contacto sin testimonios inventados?
