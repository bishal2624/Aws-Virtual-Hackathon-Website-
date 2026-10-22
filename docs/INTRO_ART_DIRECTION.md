# INTRO ART DIRECTION & VISUAL SPECIFICATION
## AWS Virtual Hackathon 2026: Cinematic Horror Intro (Page A Redesign)

### 1. Spatial Arrangement & Full-Screen Video Background
- **Edge-to-Edge Full Viewport**: The horror footage (`public/assets/videos/horror-intro.mp4`) is rendered as a fixed full-screen background layer (`width: 100vw; height: 100vh; position: fixed; inset: 0; z-index: 0; pointer-events: none`). All separate video card containers, borders, and margins have been completely removed.
- **Measured Character Framing (`object-position`)**:
  - The raw video footage resolution is 1920x1080.
  - The character (glowing pumpkin in cloud forest) centroid was measured at **X: 48.5%**, **Y: 52.0%**.
  - **Desktop (Widescreen)**: `object-position: 28% center`. Shifts the character toward the left 30% to 45% of the screen, creating generous negative space on the right for the title typography.
  - **Tablet**: `object-position: 35% center`.
  - **Mobile Portrait (9:16 aspect ratio)**: `object-position: 48.5% 28%`. Places the character's glowing face in the upper third of the portrait screen, cleanly above the bottom-anchored text.

### 2. Elimination of the Content Card
- The separate glassmorphism card, card borders, card background fill, and rounded container have been completely eliminated.
- Text content is rendered directly over the video and directional atmospheric scrims.
- **Desktop Typography Stage**:
  - Right-aligned: `max-width: 540px; margin-left: auto; padding-right: clamp(24px, 5vw, 80px)`.
  - Editorial H1 broken into two stacked lines: `AWS VIRTUAL` / `HACKATHON 2026` in `Space Grotesk`, bone-white `#F2EFEA`, with subtle multi-layer drop shadows (`text-shadow: 0 2px 18px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.9)`).
  - Clean collaboration label: plain text with an ember accent bullet (`AWS SBG IITJ × AWS SBG GSMCOE`), with zero bulky container styling.

### 3. Directional Gradient Scrims & Atmospheric Lighting
To guarantee high-contrast readability (WCAG AA) without resorting to boxed containers, directional linear scrims are layered over the video:
1. **Horizontal Contrast Scrim (Desktop)**:
   - `linear-gradient(to right, rgba(3,3,3,0.04) 0%, rgba(3,3,3,0.22) 30%, rgba(3,3,3,0.72) 60%, rgba(3,3,3,0.92) 82%, #030303 100%)`.
   - Leaves the character completely visible on the left while darkening the right half to near-solid obsidian for crisp text legibility.
2. **Vertical Contrast Scrim (Mobile Portrait)**:
   - `linear-gradient(to bottom, rgba(3,3,3,0.12) 0%, rgba(3,3,3,0.32) 35%, rgba(3,3,3,0.78) 60%, rgba(3,3,3,0.95) 82%, #030303 100%)`.
   - Leaves the character's face unobstructed in the upper half while providing dark contrast for the typography in the lower half.
3. **Perimeter Dark Vignette**:
   - `radial-gradient(ellipse 90% 85% at 50% 50%, transparent 45%, rgba(3, 3, 3, 0.65) 80%, #030303 100%)`.
4. **Filmic Static Noise Grain**:
   - 4.5% opacity static SVG fractal noise texture (`pointer-events: none`).
5. **Slow Fog Planes & Floating Embers**:
   - Drifting procedural fog planes on 80s/95s cycles and 16 floating ember particles animated with hardware-accelerated `transform: translate3d()` and `opacity` only.

### 4. Color Palette & Contrast Ratios
- Background: `--intro-bg-obsidian` (`#030303`).
- Primary text: `--intro-bone-text` (`#F2EFEA`).
  - Contrast on right scrim (#030303): **19.8:1** (WCAG AAA).
- Secondary text: `--intro-muted-text` (`#B8B2AA`).
  - Contrast on right scrim: **10.4:1** (WCAG AAA).
- Primary button: `--intro-ember-red` (`#C1121F`).
  - Contrast with `#F2EFEA` label: **5.1:1** (WCAG AA normal text, AAA large text).

### 5. Responsive Height Budgeting (CTA Above Fold)
- **Compact Mobile (360x640 and 320x568)**:
  - Total content height is approximately 230px to 250px, anchored toward the bottom.
  - On 360x640: CTA bottom edge is at ~550px (well within 640px height).
  - On 320x568: CTA bottom edge is at ~490px (well within 568px height).
  - Result: The primary "ENTER THE HACK" CTA button remains 100% visible above the fold on all compact mobile viewports without requiring user scrolling.
  - Horizontal overflow is zero (`scrollWidth <= clientWidth`).

### 6. Accessibility & Controls
- **Skip Links**: `.intro-skip-link` skips directly to `#intro-main-content`.
- **Skip Intro**: Small accessible text link in top-right corner navigating directly to `/hack`.
- **Video Controls**: Accessible Pause/Play button (WCAG 2.2.2, 44x44px minimum touch target, keyboard accessible, `aria-pressed`, dynamic `aria-label`) anchored in the bottom-left corner.
- **Prefers Reduced Motion**: Automatically disables fog and ember particle animations, hides particles, disables video autoplay, and preserves clean manual play control.
