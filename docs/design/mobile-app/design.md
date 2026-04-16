# Design System Document: High-End Editorial for Agriculture (Dark Mode Edition)

## 1. Overview & Creative North Star: "The Digital Agronomist"
This design system moves away from the "utility-first" look of typical agricultural software and toward a "Digital Agronomist" aesthetic—a high-end, editorial experience that balances the raw heritage of livestock farming with the precision of modern data science.

**The Creative North Star** is defined by **Organic Precision**. In this dark-themed interface, we leverage deep tonal shifts and illuminated accents to create an immersive, low-glare environment. By using intentional asymmetry and high-contrast typography scales against a dark canvas, we make the user feel they are engaging with a premium, nocturnal dashboard for modern land management.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in deep silvan greens and fertile earth tones, set against a dark, atmospheric background optimized for low-light focus and reduced eye strain.

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning or grouping. Boundaries must be defined solely through background color shifts. Use `surface-container-high` for sections sitting on a `surface` background. This creates a "soft UI" that feels more natural and less mechanical in dark environments.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of dark, textured soil or midnight foliage. 
*   **Background:** The deep, dark base canvas derived from the neutral palette.
*   **Surface-Container-Low:** Used for large secondary content areas to provide subtle depth.
*   **Surface-Container-High:** Reserved for high-priority cards or "floating" data points to create a clean, illuminated effect against the dark background.

### The "Glass & Gradient" Rule
To elevate the app's tech-forward identity:
*   **Glassmorphism:** For top navigation bars or floating action buttons, use dark `surface` colors at 80% opacity with a `20px` backdrop-blur. This allows the underlying vibrant greens to bleed through with a soft, neon-like glow.
*   **Signature Textures:** Use subtle linear gradients for CTAs, transitioning from `primary` (#1B4332) to a lighter `primary_container` variant at a 135-degree angle.

---

## 3. Typography: The Editorial Scale
We use a dual-font system to contrast "Humanity" with "Precision."

*   **Display & Headlines (Manrope):** A geometric sans-serif that feels modern and authoritative. Use `display-lg` for impactful data highlights to create an editorial focal point.
*   **Body & Labels (Inter):** Chosen for its exceptional legibility. In dark mode, Inter provides the necessary clarity for reading dense data without the vibration often seen in high-contrast serif fonts.

**Hierarchy as Identity:** 
High contrast is key. Pair a `headline-sm` in `primary` with a `body-sm` in `on_surface_variant` to create a clear "Title/Caption" relationship that mimics a high-end digital journal.

---

## 4. Elevation & Depth: Tonal Layering
In a dark theme, depth is achieved through luminosity and elevation shifts rather than traditional shadows.

*   **The Layering Principle:** Instead of a dark shadow (which is invisible in dark mode), place a `surface-container-high` card on a `surface` background. The shift to a lighter hex code provides the eye with enough contrast to perceive a physical lift.
*   **Ambient Glow:** Where floating is required (e.g., a "Report an Incident" FAB), use a "shadow" that acts as a very subtle outer glow with a color of `primary` at 15% opacity to create a bioluminescent effect.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Refined Utility

### Buttons (The Signature CTA)
*   **Primary:** Gradient of `primary` (#1B4332) to its container variant. Moderate roundedness (Level 2). No border.
*   **Secondary:** `surface-container-highest` background with `on_surface` text. This feels "embedded" rather than "floating."

### Input Fields (The Security Standard)
*   **Style:** Background-filled using `surface-container-low`. 
*   **Focus State:** Transition the background to `surface_container_high` and add a 2px `surface_tint` bottom-bar.

### Cards & Lists (The Editorial Feed)
*   **Rule:** Forbid divider lines.
*   **Implementation:** Use `normal` spacing (Level 2) between list items. Use a subtle `tertiary_container` background for "High Priority" alerts to provide an earthy, urgent accent that pops against the dark theme.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical margins. For example, a headline might have a 24pt left margin, while the body text below it is indented to 32pt.
*   **Do** use `tertiary` (earthy accents like #A47148) sparingly for financial data or soil health metrics.
*   **Do** leverage the luminous `primary` against the dark background for maximum readability and visual punch.

### Don't:
*   **Don't** use pure black (#000000). Use the dark neutral base to keep the palette organic and maintain depth.
*   **Don't** use standard "Folder" icons. Use custom line-art icons that feel thin and sophisticated.
*   **Don't** crowd the screen. High-end design requires the "luxury of space," which is essential in dark mode to prevent the UI from feeling heavy or claustrophobic.