import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import ProceduralSkyAndMoon from './ProceduralSkyAndMoon';
import ProceduralMansion from './ProceduralMansion';
import ProceduralGraveyard from './ProceduralGraveyard';
import ProceduralTreesAndGate from './ProceduralTreesAndGate';
import ProceduralPumpkins from './ProceduralPumpkins';
import ProceduralGhosts from './ProceduralGhosts';
import ProceduralLaboratory from './ProceduralLaboratory';
import ProceduralChambers from './ProceduralChambers';
import ProceduralChronicles from './ProceduralChronicles';
import ProceduralJudges from './ProceduralJudges';
import ProceduralVault from './ProceduralVault';
import ProceduralAlliance from './ProceduralAlliance';
import ProceduralPortal from './ProceduralPortal';
import ProceduralParticles from './ProceduralParticles';
import ProceduralSideDecorations from './ProceduralSideDecorations';
import CameraRig from './CameraRig';

// Component to signal when first WebGL frame has rendered successfully
function FirstFrameNotifier({ onRendered }) {
  const rendered = useRef(false);
  useFrame(() => {
    if (!rendered.current) {
      rendered.current = true;
      if (onRendered) onRendered();
    }
  });
  return null;
}

// Real-time performance tracker capturing live FPS, frame deltas, and WebGL render stats
function PerformanceTracker() {
  const frameTimes = useRef([]);
  useFrame(({ gl }) => {
    const now = performance.now();
    frameTimes.current.push(now);
    if (frameTimes.current.length > 60) {
      frameTimes.current.shift();
      const first = frameTimes.current[0];
      const elapsed = now - first;
      const count = frameTimes.current.length - 1;
      const measuredFps = Math.round((count / elapsed) * 1000);
      window.__HACKATHON_METRICS__ = {
        fps: measuredFps,
        avgDeltaMs: +(elapsed / count).toFixed(2),
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures
      };
      if (document.body) {
        document.body.setAttribute('data-measured-fps', String(measuredFps));
        document.body.setAttribute('data-draw-calls', String(gl.info.render.calls));
        document.body.setAttribute('data-triangles', String(gl.info.render.triangles));
      }
    }
  });
  return null;
}

export default function SceneCanvas({
  scrollProgress = 0,
  activeTrackIdx = 0,
  tier = 'high',
  isReducedMotion = false,
  onLoaded
}) {
  const containerRef = useRef();

  // Compute gate opening progress between 0.10 and 0.25 of scroll
  const gateOpenProgress = THREE.MathUtils.clamp((scrollProgress - 0.08) / 0.16, 0, 1);

  // Zone visibility based on scroll progress (Section 6: mount or enable only current & neighbor zones)
  const isExteriorVisible = scrollProgress < 0.38;
  const isLabVisible = scrollProgress >= 0.18 && scrollProgress < 0.52;
  const isChambersVisible = scrollProgress >= 0.36 && scrollProgress < 0.68;
  const isChroniclesVisible = scrollProgress >= 0.52 && scrollProgress < 0.80;
  const isJudgesVisible = scrollProgress >= 0.65 && scrollProgress < 0.88;
  const isVaultVisible = scrollProgress >= 0.74 && scrollProgress < 0.92;
  const isAllianceVisible = scrollProgress >= 0.80 && scrollProgress < 0.98;
  const isPortalVisible = scrollProgress >= 0.86;

  // DPR based on quality tier (Section 6 Tier table)
  const dpr = tier === 'low' ? 1.0 : tier === 'medium' ? 1.5 : Math.min(window.devicePixelRatio || 2, 2);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: '#050505',
        touchAction: 'pan-y'
      }}
    >
      <Canvas
        camera={{ position: [0, 2.4, 34], fov: 48, near: 0.1, far: 350 }}
        dpr={dpr}
        gl={{
          antialias: tier !== 'low',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#050505', 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        eventPrefix="client"
      >
        <FirstFrameNotifier onRendered={onLoaded} />
        <PerformanceTracker />

        {/* Global Lighting */}
        <ambientLight intensity={0.4} color="#080D1A" />
        <hemisphereLight intensity={0.3} color="#C8CDD8" groundColor="#050505" />

        {/* Camera Rig (Smooth path & pointer parallax) */}
        <CameraRig
          scrollProgress={scrollProgress}
          activeTrackIdx={activeTrackIdx}
          isReducedMotion={isReducedMotion}
          tier={tier}
        />

        {/* Procedural Sky, Luminous Moon and Distant Stars (Always Present) */}
        <ProceduralSkyAndMoon isReducedMotion={isReducedMotion} />

        {/* Continuous Peripheral 3D Halloween Side Decorations */}
        <ProceduralSideDecorations
          scrollProgress={scrollProgress}
          tier={tier}
          isReducedMotion={isReducedMotion}
        />

        {/* ZONE 1: Exterior World (Mansion, Graveyard, Gate, Trees, Pumpkins, Ghosts) */}
        {isExteriorVisible && (
          <group visible={isExteriorVisible}>
            <ProceduralMansion tier={tier} isReducedMotion={isReducedMotion} />
            <ProceduralGraveyard tier={tier} />
            <ProceduralTreesAndGate gateOpenProgress={gateOpenProgress} isReducedMotion={isReducedMotion} />
            <ProceduralPumpkins isReducedMotion={isReducedMotion} />
            <ProceduralGhosts tier={tier} isReducedMotion={isReducedMotion} />
            <ProceduralParticles tier={tier} isReducedMotion={isReducedMotion} />
          </group>
        )}

        {/* ZONE 2: The Mysterious Laboratory */}
        {isLabVisible && (
          <group visible={isLabVisible}>
            <ProceduralLaboratory isReducedMotion={isReducedMotion} />
          </group>
        )}

        {/* ZONE 3: The Four Challenge Chambers */}
        {isChambersVisible && (
          <group visible={isChambersVisible}>
            <ProceduralChambers activeTrackIdx={activeTrackIdx} isReducedMotion={isReducedMotion} />
          </group>
        )}

        {/* ZONE 4: The Event Chronicles */}
        {isChroniclesVisible && (
          <group visible={isChroniclesVisible}>
            <ProceduralChronicles />
          </group>
        )}

        {/* ZONE 5: The Judges' Chamber */}
        {isJudgesVisible && (
          <group visible={isJudgesVisible}>
            <ProceduralJudges />
          </group>
        )}

        {/* ZONE 6: The Prize Vault */}
        {isVaultVisible && (
          <group visible={isVaultVisible}>
            <ProceduralVault />
          </group>
        )}

        {/* ZONE 7: The Alliance Hall */}
        {isAllianceVisible && (
          <group visible={isAllianceVisible}>
            <ProceduralAlliance />
          </group>
        )}

        {/* ZONE 8: The Final Portal */}
        {isPortalVisible && (
          <group visible={isPortalVisible}>
            <ProceduralPortal isReducedMotion={isReducedMotion} />
          </group>
        )}
      </Canvas>
    </div>
  );
}
