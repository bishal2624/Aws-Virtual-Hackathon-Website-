# DESIGN SYSTEM SPECIFICATION: HALLOWEEN 3D EXPERIENTIAL SYSTEM
## AWS Virtual Hackathon 2026

### 1. Color Palette Tokens
All color tokens are implemented as CSS variables and exported as JavaScript constants in `src/constants/theme.js`.

| Token | Hex | Role | Contrast Ratio (WCAG) |
|---|---|---|---|
| `--color-obsidian` | `#050505` | Background canvas, base shell | Base background |
| `--color-midnight` | `#080D1A` | Atmospheric sky, fog horizon, deep depth | 18.2:1 against off-white |
| `--color-charcoal` | `#171717` | Card surfaces, stone panels, container fills | 14.6:1 against off-white |
| `--color-moonlight` | `#C8CDD8` | Secondary body text, celestial highlights | 13.1:1 on obsidian (AAA) |
| `--color-pumpkin` | `#FF7518` | Primary button fill, glowing eyes, key highlights | 5.8:1 on obsidian (AA) |
| `--color-amber` | `#FFB000` | Pipeline markers, warning/alert status | 9.4:1 on obsidian (AAA) |
| `--color-acid` | `#A3FF12` | Serverless pulses, data activity, supernatural accent | 12.8:1 on obsidian (AAA) |
| `--color-purple` | `#8B5CF6` | Generative AI nodes, host chapter accent (flat color) | 5.2:1 on obsidian (AA) |

*Strict rule*: No purple gradients, and no gradient fills on UI buttons, text, or borders. Purple is purely a flat color.

### 2. Typography System (Offline Self-Hosted)
Four font families are installed via `@fontsource` packages and bundled locally (zero third-party CDN calls, zero external web requests):
- **Display Serif**: `Playfair Display` (`@fontsource/playfair-display`) for Chapter titles and dramatic editorial numbers.
- **Headings & Primary UI**: `Space Grotesk` (`@fontsource/space-grotesk`) for section headers and button typography.
- **Body**: `Inter` (`@fontsource/inter`) for readable copy, descriptions, and accessible text. Minimum 16px on mobile.
- **Mono**: `JetBrains Mono` (`@fontsource/jetbrains-mono`) for dates, status tags, tech stacks, and technical labels.

#### Fluid Type Scale (clamp-based)
- `display-hero`: `clamp(2.8rem, 8vw, 6.4rem)` / Line height: 0.95
- `display-chapter`: `clamp(2.0rem, 5vw, 4.2rem)` / Line height: 1.05
- `h2`: `clamp(1.6rem, 3.5vw, 2.8rem)` / Line height: 1.15
- `h3`: `clamp(1.2rem, 2.2vw, 1.8rem)` / Line height: 1.25
- `body-lg`: `clamp(1.05rem, 1.4vw, 1.25rem)` / Line height: 1.65
- `body`: `clamp(0.95rem, 1.1vw, 1.05rem)` / Line height: 1.6 (min 16px on mobile viewports)
- `caption-mono`: `clamp(0.75rem, 0.9vw, 0.85rem)` / Line height: 1.4

### 3. Spacing, Geometry & Radii
Based on an explicit 4px grid:
- Base units: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`, `128px`.
- **Button Radius**: Exactly `6px` (no pill buttons).
- **Badge / Tag Radius**: Exactly `4px` (no pill badges).
- **Card / Glass Panel Radius**: Exactly `8px`.
- Minimum touch target: `44px x 44px`.

### 4. Component States & Interaction
- **Default**: Defined border `1px solid rgba(200, 205, 216, 0.12)`, background dark glass or solid charcoal fallback.
- **Hover**: Border color brightens to `rgba(255, 117, 24, 0.45)`, subtle translation (`transform: translateY(-2px)`).
- **Focus-Visible**: High-contrast `2px solid #FF7518` with `2px offset`. Visible on every interactive control for keyboard accessibility.
- **Active / Pressed**: Scaled slightly (`transform: scale(0.98)`).
- **Disabled**: Opacity 0.45, `cursor: not-allowed`, no hover transformation.

### 5. Motion Durations
- Micro-interactions: `120ms`
- Component transitions (dropdowns, tabs): `200ms`
- Modal & drawer reveals: `300ms`
- Camera easing: `CatmullRomCurve3` interpolation with critically damped smoothing (`damping: 0.08`).
- Under `prefers-reduced-motion: reduce`: All camera travel cuts instantly between fixed compositions; particle drift, ghost oscillation, and window flickering are halted.

### 6. Breakpoints
- `320px`: Small mobile (compact typography, single column, stacked metrics)
- `375px`: Standard mobile (iPhone SE / compact smartphones)
- `390px`: Modern mobile (iPhone 13/14/15/16)
- `768px`: Tablet portrait (2-column layouts, adapted camera FOV)
- `1024px`: Tablet landscape / compact laptop
- `1440px`: Desktop widescreen
- `1920px`: Ultra-wide monitor viewports
Strict requirement: `document.documentElement.scrollWidth <= clientWidth` at all breakpoints. Zero horizontal overflow.
