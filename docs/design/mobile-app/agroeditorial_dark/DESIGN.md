# Design System Document: High-End Editorial Mobile Experience

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Agrarian Curator."** 

This is not a utility-first dashboard; it is a premium editorial experience that treats agricultural data with the same reverence as a high-fashion magazine or a bespoke architectural portfolio. We move away from the "industrial" feel of standard enterprise apps toward a sophisticated, dark-mode aesthetic that mirrors the depth of fertile soil and the precision of modern agrotechnology. 

The experience is defined by **intentional asymmetry**, high-contrast typography scales, and a rejection of traditional structural lines. We use space and tonal shifts rather than borders to define hierarchy, creating a UI that feels "grown" and organic rather than "built."

---

## 2. Colors & Tonal Depth

Our palette is rooted in the "After Hours" of the field—deep mossy greens, rich earth tones, and midnight neutrals.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Traditional dividers make a UI look "templated" and rigid. 
- **The Alternative:** Boundaries must be defined solely through background color shifts. 
- **Application:** A `surface-container-low` (#191c1c) card sitting on a `background` (#111414) creates a natural edge through contrast alone.

### Surface Hierarchy & Nesting
Treat the mobile screen as a series of physical layers. Use the surface tiers to create "nested" depth:
- **Level 0 (Base):** `background` (#111414)
- **Level 1 (Cards/Sections):** `surface-container-low` (#191c1c)
- **Level 2 (In-card elements):** `surface-container-high` (#282a2a)
- **Level 3 (Floating/Active):** `surface-container-highest` (#333535)

### Signature Textures & Gradients
To avoid a "flat" digital feel, all Primary CTAs and key Hero elements must use a **135-degree linear gradient** starting from `primary-container` (#1b4332). This adds a subtle "soul" to the interface, mimicking the way light hits a leaf or a furrowed field.

---

## 3. Typography: The Editorial Voice

We utilize a high-contrast pairing to establish an authoritative yet modern voice.

*   **Headlines (Manrope):** Our "Display" and "Headline" levels use Manrope. Its geometric yet slightly warm character provides the professional "Editorial" look. Use wide tracking for `label` styles and tight tracking for `display-lg`.
*   **Body (Inter):** Chosen for its unparalleled readability on mobile screens. Inter handles the heavy lifting of data, lists, and long-form descriptions.

### Typography Scale
| Level | Font | Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display-LG** | Manrope | 3.5rem | 700 | Hero Stats/Large Headlines |
| **Headline-SM** | Manrope | 1.5rem | 600 | Card Titles / Section Headers |
| **Body-MD** | Inter | 0.875rem | 400 | General Content / Data |
| **Label-MD** | Inter | 0.75rem | 600 | Overline Text / Metadata |

---

## 4. Elevation & Depth

In this design system, elevation is a matter of **Tonal Layering** rather than traditional drop shadows.

### The Layering Principle
Depth is achieved by "stacking." Place a `surface-container-highest` element on top of a `surface-container-low` background to create a lift. This mimics natural light falling on varied terrain.

### Glassmorphism & Ambient Light
For floating elements (like Bottom Sheets or Navigation Bars):
- **Glassmorphism:** Use `sidebar/navbar` (#022c22) at 85% opacity with a `backdrop-filter: blur(12px)`.
- **Ambient Shadows:** Only use shadows for "Floating Action Buttons" or critical overlays. Shadows must be extra-diffused (Blur: 20px+) and low-opacity (4%-6%), using a tinted version of `on-surface`.
- **The Ghost Border:** If accessibility requires a stroke (e.g., in high-sunlight scenarios), use `outline-variant` (#414844) at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** 135deg gradient (`#1b4332` base), `on-primary` (#0e3727) text. Shape: `xl` rounded (1.5rem).
*   **Secondary:** `surface-container-high` background, no border.
*   **Tertiary:** No background, `primary` (#c0ecd4) text, bold weight.

### Cards & Lists
*   **Cards:** Must use `surface-container-low` (#191c1c) with `2xl` (2.0rem) rounded corners.
*   **Lists:** Forbid divider lines. Separate items using 12px or 16px of vertical white space or a subtle shift to `surface-container-lowest` (#0c0f0f) for alternating items.

### Chips
*   **Status Chips:** Use `primary-container` for "Active" and `tertiary-container` (#59320e) for "Alerts." Use a `sm` (0.25rem) radius for a more technical, "stamped" look.

### Input Fields
*   **Style:** Filled containers using `surface-container-highest`. 
*   **Indicators:** Use a 2px bottom-heavy accent of `primary` only when focused. No full-frame borders.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., 24px left, 16px right) on hero sections to create a "magazine" feel.
*   **Do** use `tertiary` (#f7ba8b) sparingly as a "soil" accent to highlight organic growth or financial value.
*   **Do** rely on Material Symbols (Outlined) with a consistent weight of 200 or 300 for a lightweight, premium look.

### Don't
*   **Don't** use 1px solid lines to separate content; it breaks the "organic" immersion.
*   **Don't** use pure white (#ffffff) for text. Always use `on-surface` (#e1e3e2) to reduce eye strain in dark mode.
*   **Don't** use standard `md` rounding for main containers. Embrace the `xl` and `2xl` scales to make the UI feel soft and approachable.