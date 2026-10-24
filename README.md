# Hack - To - ween: Immersive 3D Experience

Official production repository for **Hack - To - ween**, an online, national flagship student-builder cloud hackathon.

**Collaboration Banner:** `AWS SBG IITJ × AWS SBG GSMCOE`  
**Organizers:** Organized by AWS Student Builder Groups, IIT Jodhpur, and GSMCOE.  
**Dates:** October 31 to November 5, 2026 (Registration closes October 30, 2026 at 23:59 IST).  
**Evaluation Standard:** Published 60-Point Judging Rubric.

---

## 1. Project Architecture & 3D Experiential Structure

The web application is built on React 19, Vite, Three.js, and React Three Fiber (R3F), coupled with an Express and Zod backend.

### Dual-Layer Rendering System
1. **Persistent Full-Viewport 3D Canvas (`position: fixed; inset: 0; z-index: 0`)**:
   - Staged inside an art-directed Victorian gothic mansion environment at midnight under a luminous moon.
   - Procedural geometry (mansion, graveyard, wrought-iron gate, jack-o'-lanterns, ghosts, server racks, challenge pedestals, alliance arch, final portal) with zero external 3D models or CDN assets.
   - Smooth CatmullRomCurve3 camera travel driven by native scrolling.
   - R3F `eventPrefix="client"` enables pointer hover and click through DOM overlays.
2. **Accessible DOM Overlays (`position: relative; z-index: 10`)**:
   - 100% of readable copy, dates, rubric metrics, and interactive forms live as semantic HTML in the DOM.
   - Instant first paint with a layered SVG silhouette poster background; the 3D bundle is code-split (`React.lazy`) and crossfades in once the first WebGL frame renders.
   - Full 2D fallback mode if WebGL is unavailable or when the user enables Low Graphics Mode.

### Spatial Metaphor & Zones
- **Zone 1: Hero & Exterior Estate (z=34 to 13)**: The Haunted Mansion, glowing pumpkin lights, flickering windows, framing gnarled trees, and opening iron gate.
- **Zone 2: The Mysterious Laboratory (z=-26 to -48)**: Floating server racks, LED blade servers, and icosahedron cloud nodes.
- **Zone 3: Challenge Chambers (z=-82)**: Four distinct challenge domains (Generative AI, Cloud-Native, DevOps, Open Innovation).
- **Zone 4: Event Chronicles (z=-150 to -190)**: Winding timeline path with six milestone markers.
- **Zone 5: The Judges' Chamber (z=-212 to -228)**: Six pillars scaled proportionally to the rubric point maximums (10, 10, 15, 5, 10, 10).
- **Zone 6: The Prize Vault (z=-240 to -252)**: Pedestals with trophy-inspired geometry and spotlight cones.
- **Zone 7: The Alliance Hall (z=-262 to -276)**: Monumental stone arch displaying `AWS SBG IITJ × AWS SBG GSMCOE`.
- **Zone 8: The Final Portal (z=-286 to -306)**: Glowing torus gateway leading to registration and the integrated footer.

---

## 2. Route Architecture & Media Directory Structure

### Client Route Map
- `/`: Cinematic Horror Intro Page (`src/pages/Intro/IntroPage.jsx`). A lightweight route that mounts zero WebGL or 3D canvas elements, keeping the initial paint fast.
- `/hack`: The full immersive hackathon site (`src/pages/MainSite.jsx`), code-split and loaded via `React.lazy()` upon clicking "ENTER THE HACK" or navigating directly.
- Legacy Hash Redirect: Visits to `/` with an anchor hash (such as `/#gate` or `/#chambers`) automatically perform a `history.replaceState` redirection to `/hack#gate` or `/hack#chambers`.

### Media Directory Structure
All video and poster assets reside in `public/assets/videos/` and are configured through the single source of truth in `src/config/media.js`:

```text
public/assets/videos/
├── horror-intro.mp4             (Cinematic intro video, H.264, 1920x1080)
├── joker-background.mp4         (Controlled backdrop video, H.264, 1080x1920)
├── horror-intro-poster.jpg      (Fallback poster for intro stage)
└── joker-background-poster.jpg  (Fallback poster for backdrop layer)
```

Public asset URLs are resolved using `import.meta.env.BASE_URL` to guarantee compatibility with both root and subdirectory deployments. Video playback is managed by `useManagedVideo` and `ManagedVideo`, handling autoplay restrictions, visibility changes, low-graphics fallback, and decoder release on unmount.

---

## 3. Quality Tiers & Performance Optimization

Hardware concurrency, device memory, viewport width, and pointer coarseness are evaluated on startup:

| Setting | High (Desktop) | Medium (Tablet / Laptop) | Low (Mobile / Low Graphics) |
|---|---|---|---|
| **DPR Cap** | 2.0 | 1.5 | 1.0 |
| **Shadows / Lighting** | Full lighting & point lights | Directional & ambient only | Ambient & hemisphere only |
| **Particles** | 140 embers, 45 fireflies | 70 embers, 24 fireflies | 35 embers, 12 fireflies |
| **Mansion Geometry** | Full detail | Reduced | Simplified |
| **Specters / Ghosts** | 5 ghosts | 3 ghosts | 2 ghosts |

Users can manually toggle **Low 3D** mode or **Reduced Motion** mode directly from the top navigation bar.

---

## 4. Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd "AWS SBJ IITJ HACKATHON WEBSITE"

# Install dependencies (deduplicated Three.js and self-hosted fonts)
npm install
```

### Development
```bash
# Start backend API server (port 4000)
npm run server

# In a separate terminal, start frontend dev server (port 5173)
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 5. Available Scripts

- `npm run dev`: Starts Vite dev server with `/api` proxy to `localhost:4000`.
- `npm run build`: Compiles production bundle with code-split 3D chunks and self-hosted fonts.
- `npm run preview`: Locally previews the production build.
- `npm run test`: Executes unit and integration test suites with Vitest.
- `npm run server`: Launches the Express backend server.
- `npm run check:links`: Validates all internal navigation targets.
- `npm run check:launch`: Executes launch gate checks (verifies zero em/en dashes, zero emoji, zero secrets, valid `.gitignore`, and `.env.example`).

---

## 6. Environment Variables & Secret Safety

Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `PORT` | Backend server port | `4000` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | *Optional in memory mode* |
| `SESSION_SECRET` | Secret key for session management | *Placeholder in dev* |

> **Security Note:** `.env` is ignored in `.gitignore`. Never commit credentials, AWS access keys (`AKIA...`), or private keys. The backend rejects any submission containing AWS access keys or private key blocks.

---

## 7. Official 60-Point Judging Rubric

Defined in `src/data/rubric.js` and imported across frontend, backend, and test suites:

1. **Event Theme (10 pts)**: Alignment with hackathon objectives, relevance, thematic focus.
2. **AWS Implementation / Deployment (10 pts)**: AWS service integration, cloud architecture, serverless capabilities, live deployment.
3. **Idea and Problem Statement (15 pts)**: Originality, impact, problem clarity, novelty, solution effectiveness.
4. **UI / UX (5 pts)**: Visual design, usability, accessibility, navigation, interface polish.
5. **Business Model / Scale (10 pts)**: Market opportunity, financial viability, scalability, practical application, growth potential.
6. **Codebases and README (10 pts)**: Code quality, structure, repository organization, documentation, setup instructions, README quality.

**Total:** Exactly 60 points.

---

## 8. Legal Notice & Governance

This hackathon is organized by student builder chapters: **AWS SBG IITJ** (Indian Institute of Technology Jodhpur) and **AWS SBG GSMCOE** (Genba Sopanrao Moze College of Engineering).

AWS and Amazon Web Services are trademarks of Amazon.com, Inc. or its affiliates. This is an independent academic community initiative and does not imply official AWS sponsorship. Privacy and Terms documents are provided as initial drafts for participant transparency and should be reviewed by legal representatives prior to full-scale public deployment.
