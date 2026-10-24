# ASSET & RESOURCE SPECIFICATION
## Hack - To - ween

All visual and audio assets in this project are either 100% procedural (generated at runtime via Three.js shaders and HTML5 Canvas API) or self-hosted via permissive open-source packages. No external CDN requests, no proprietary fonts, and no third-party runtime dependencies exist.

### 1. Procedural 3D Geometry
- **Haunted Mansion**: Handcrafted procedural Three.js primitives (`BoxGeometry`, `ConeGeometry`, `CylinderGeometry`, `ExtrudeGeometry`) composed into gothic architectural elements:
  - Stone main hall, gabled wings, and corner spire.
  - Arched entryway and stone porch steps.
  - Windows with custom emissive shader materials flickering via multi-octave noise.
  - Stone chimneys.
- **Wrought-Iron Gate**: Procedural bar and scrollwork geometry hinged on dual pivot nodes, rotating dynamically based on scroll progress and user interaction.
- **Graveyard & Terrain**:
  - Instanced tombstones (`InstancedMesh`) with pseudo-random rotational tilts and weathering angles.
  - Ground plane with a procedural noise height/dark texture map.
  - Multi-planar ground mist layers with alpha gradient falloffs.
- **Twisted Trees**: Procedural branching silhouette geometries positioned to frame viewport edges without obstructing text readability.
- **Jack-o'-Lanterns**: Procedural lathe geometry with segmented ribs and carved emissive face stencil.
- **Ghosts**: Procedural lathe translucent shroud meshes with oscillating opacity and figure-eight orbital kinematics.
- **Laboratory Infrastructure**:
  - Instanced server rack blades with pulsing status LEDs.
  - Icosahedron cloud network nodes with animated spline connection conduits.
- **Challenge Chambers & Archways**:
  - Chamber 1: Neural graph nodes and connecting line segments.
  - Chamber 2: Serverless block architecture with trigger pulse rings.
  - Chamber 3: Mechanical pipeline rails with moving deployment packets.
  - Chamber 4: Orbital polyhedron rings.
  - Alliance Arch: Monumental stone portal displaying the collaboration banner.
  - Final Portal: Torus geometry with custom swirling vortex cloud shader.

### 2. Procedural Textures & Shaders
- **Moon Surface**: Procedural crater texture generated on an offscreen HTML5 `<canvas>` (512x512) and uploaded to GPU as a `CanvasTexture`. Reused without per-frame memory allocation.
- **Cloud Banks & Mist**: Procedural alpha falloff textures generated via radial canvas gradients and noise.
- **Embers & Fireflies**: Instanced GPU point sprites animated in vertex shaders with uniform time inputs.

### 3. Ambient Audio Synthesis (Zero External Audio Files)
- **Engine**: Pure Web Audio API procedural synthesis.
- **Implementation**: `src/utils/audio.js` synthesizes a soft, atmospheric wind bed using an audio buffer of white noise passed through a resonant bandpass/lowpass filter with slow Low-Frequency Oscillator (LFO) gain modulation.
- **Controls**: Off by default. Explicit user-click activation only. Automatically pauses on browser tab visibility loss (`document.visibilitychange`). Zero external audio downloads.

### 4. Self-Hosted Typography
- `@fontsource/playfair-display` (OFL - Open Font License)
- `@fontsource/space-grotesk` (OFL - Open Font License)
- `@fontsource/inter` (OFL - Open Font License)
- `@fontsource/jetbrains-mono` (Apache 2.0 License)
All font files are bundled into `dist/assets/` during the Vite production build. No Google Fonts or Adobe Fonts CDN calls are executed at runtime.
