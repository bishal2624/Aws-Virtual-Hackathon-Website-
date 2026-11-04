# Hack - To - ween Design System

## Product Overview
- **Product type**: Entertainment/Event website - horror-themed hackathon
- **Target audience**: College students, developers, tech community members
- **Stack**: React 19 + Vite + Three.js
- **Key routes**: `/` (Intro), `/hack` (Main experience), `/admin` (Organizer dashboard)

## Color Palette (Primary — Inherited from Existing Code)

| Role | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Background (darkest) | `#030303` | `--bg-darkest` | Page/section backgrounds |
| Background (dark) | `#050505` | `--bg-dark` | Cards, modals, navs |
| Surface (lightest) | `#0B0D17` | `--bg-lighter` | Subtle overlays |
| Surface (light) | `#121520` | `--bg-light` | Panels, modals |
| Accent (primary) | `#FF7518` | `--accent-orange` | Buttons, highlights, interactive |
| Accent (secondary) | `#C1121F` | `--accent-ember` | Decorative elements |
| Deep red | `#6B0F14` | `--bg-deep-red` | UI depth, subtle tints |
| Bone/cream | `#F2EFEA` | `--bone-text` | Primary body text |
| Muted text | `#B8B2AA` | `--muted-text` | Secondary text, captions |
| Subtle divider | `#2A0508` | `--divider-subtle` | Borders, separators |
| Success green | `#A3FF12` | `--accent-green` | Success states |
| Table header bg | `#171717` | `--table-bg` | Data tables |

## Typography Scale

| Scale | Size | Line Height | Font Weight | Usage |
|-------|------|-------------|-------------|-------|
| `--font-display` | `clamp(1.6rem, 3.5vw, 2.6rem)` | 1 | 400 | Large numbers (timers, counters) |
| `--font-heading` | `clamp(1.8rem, 3vw, 2.4rem)` | 1.05 | 700 | H1/H2 headings |
| `--font-body` | `clamp(1rem, 1.6vw, 1rem)` | 1.6 | 400 | Body text |
| `--font-mono` | `clamp(0.875rem, 1.3vw, 0.875rem)` | 1 | 400 | Code, reference IDs, form labels |
| `--font-mono-small` | `0.75rem` | 1.2 | 500 | Meta text, tags, uppercase |

**Font families**:
- `--font-display`: `var(--font-horror-gothic)` — decorative, display-only
- `--font-heading`: system UI + fallback `Georgia`, `serif`
- `--font-body`: `var(--font-body)`, system UI sans
- `--font-mono`: `var(--font-mono)`, ui-monospace

## Spacing Scale

| Scale | Value | Usage |
|-------|-------|-------|
| `--space-tiny` | `4px` | Micro spacing |
| `--space-small` | `8px` | Compact spacing |
| `--space-md` | `16px` | Standard spacing |
| `--space-large` | `24px` | Section spacing |
| `--space-xlarge` | `32px` | Major section spacing |
| `--space-container` | `clamp(24px, 5vw, 56px)` | Panel/container max width |

## Border Radius

| Scale | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Input borders, small elements |
| `--radius-md` | `12px` | Modals, panels, cards |
| `--radius-lg` | `20px` | Large containers, hero panels |
| `--radius-full` | `9999px` | Pills, avatars |

## Box Shadows

| Name | Value | Usage |
|------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Input outlines |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.3)` | Modals, panels |
| `--shadow-lg` | `0 0 28px rgba(255,117,24,0.14)` | Hero panels, CTA |
| `--shadow-inset` | `inset 0 1px 1px rgba(255,255,255,0.1)` | Panel interiors |

## Component States

### Buttons
- **Primary**: Background `#FF7518`, white text, hover `#FF8E32`, active `#FF6B33`
- **Secondary**: Transparent bg, orange border/text `#FF7518`, hover darker orange
- **Ghost**: No bg, text color, hover with subtle bg
- **Disabled**: Opacity `0.4`, cursor `not-allowed`

### Inputs/Selects
- **Default**: `#050505` bg, `#F4F1EB` text, `1px solid rgba(200,205,216,0.2)` border
- **Focus**: `0 0 0 2px rgba(255,117,24,0.15)` ring, border `#FF7518`
- **Error**: `1px solid #FF6B6B`, text `#FF6B6B`, bg `rgba(255,60,60,0.12)`
- **Success**: `1px solid #A3FF12`, text `#A3FF12`

### Modals/Drawers
- Background: `rgba(5,5,5,0.88)` with `backdrop-filter: blur(10px)`
- Border: `1px solid rgba(200,205,216,0.16)`
- Radius: `var(--radius-lg)` = `20px`
- Max width: `560px` (registration), `640px` (submission), `600px` (legal)

## Animation Principles

- **Duration**: Subtle `150-250ms`, Standard `250-350ms`, Complex `350-500ms`
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for most transitions
- **Reduce motion**: Respect `prefers-reduced-motion` — instant state changes, no unnecessary animations
- **Spatial continuity**: Animations should follow the interaction path
- **No looping animations on intro page** that can't be paused

## Accessibility (WCAG AA)

- **Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus visible**: `outline: 2px solid var(--accent-orange)` + `outline-offset: 2px`
- **Focus not obscured**: Focus ring must be visible above all overlay layers
- **Keyboard navigation**: All interactive elements reachable via Tab, `Escape` closes modals/drawers
- **ARIA labels**: All interactive elements have meaningful labels
- **Screen reader friendly**: Dynamic content announced live where appropriate

## Responsive Breakpoints

| Breakpoint | Width | Context |
|------------|-------|---------|
| `--breakpoint-xs` | `< 640px` | Mobile phones |
| `--breakpoint-sm` | `≥ 640px` | Small devices |
| `--breakpoint-md` | `≥ 768px` | Tablets |
| `--breakpoint-lg` | `≥ 1024px` | Laptops |
| `--breakpoint-xl` | `≥ 1280px` | Desktops |

Mobile-first approach — all layouts stack vertically below `640px`.

## Iconography

- **Icon set**: `lucide-react` (consistent 24px stroke width)
- **Color**: CurrentColor (inherits from text color), `#FF7518` for active states
- **Size**: `16-24px` depending on context
- **No emoji as icons** — use SVG icons only
- **Accessible**: `aria-label` or visible text always provided

## Dark Mode

- Already implemented via `rgba(5,5,5,0.88)` backgrounds
- No separate `prefers-color-scheme` media queries needed
- All colors are dark-mode compatible by design

## Animation / GSAP Guidance

- Use context-aware timing (priority 7 from UX guidelines)
- Avoid animating width/height — use transform/scale instead
- Respect `prefers-reduced-motion`
- Standard GSAP scroll reveals with staggered children
- Simple fade/slide transitions for modals

---
*Design system established using UI UX Pro Max skill guidance. All color/spacing/typography values sourced from existing project code to maintain consistency.*