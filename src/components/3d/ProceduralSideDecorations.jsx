import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural 3D Sinister Jack-o'-lantern for peripheral margins.
 * Reuses segmented geometry with glowing emissive carved eyes and mouth.
 */
function MarginPumpkin({
  position = [0, 0, 0],
  scale = 1,
  rotationY = 0,
  expression = 'sinister',
  tier = 'high',
  isReducedMotion = false
}) {
  const groupRef = useRef();
  const faceMatRef = useRef();

  useFrame(({ clock }) => {
    if (isReducedMotion || !groupRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle subtle breathing bob
    groupRef.current.position.y = position[1] + Math.sin(t * 1.4 + position[0] * 2) * 0.025;

    // Organic candle flicker inside the carved face
    if (faceMatRef.current) {
      const flicker = Math.sin(t * 4.2 + position[2]) * 0.18 + Math.cos(t * 6.8) * 0.12;
      faceMatRef.current.emissiveIntensity = 1.3 + flicker;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      rotation={[0, rotationY, 0]}
    >
      {/* Root/Rock Pedestal */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.55, 0.75, 0.22, 7]} />
        <meshStandardMaterial color="#0A0D14" roughness={0.96} />
      </mesh>

      {/* Pumpkin Body (Segmented Spheres) */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.58, tier === 'low' ? 10 : 16, tier === 'low' ? 8 : 12]} />
        <meshStandardMaterial
          color="#FF7518"
          roughness={0.68}
          metalness={0.08}
        />
      </mesh>
      {/* Rib Overlay Spheres for Organic Gourd Shape */}
      <mesh position={[0, 0.5, 0]} scale={[1.12, 0.94, 0.88]}>
        <sphereGeometry args={[0.55, tier === 'low' ? 8 : 14, tier === 'low' ? 6 : 10]} />
        <meshStandardMaterial color="#D95300" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.5, 0]} scale={[0.88, 0.94, 1.12]}>
        <sphereGeometry args={[0.55, tier === 'low' ? 8 : 14, tier === 'low' ? 6 : 10]} />
        <meshStandardMaterial color="#D95300" roughness={0.75} />
      </mesh>

      {/* Twisted Dark Stem */}
      <mesh position={[0, 1.05, 0]} rotation={[0.2, 0, 0.15]}>
        <cylinderGeometry args={[0.05, 0.09, 0.32, 5]} />
        <meshStandardMaterial color="#1E2A10" roughness={0.95} />
      </mesh>

      {/* Carved Glowing Eyes (Sinister Slanted Cones) */}
      <mesh
        position={[-0.19, 0.60, 0.51]}
        rotation={[0.1, -0.32, expression === 'wide' ? -0.2 : 0.25]}
      >
        <coneGeometry args={[0.09, 0.14, 3]} />
        <meshStandardMaterial
          ref={faceMatRef}
          color="#FFB000"
          emissive="#FF7518"
          emissiveIntensity={1.3}
          toneMapped={false}
        />
      </mesh>
      <mesh
        position={[0.19, 0.60, 0.51]}
        rotation={[0.1, 0.32, expression === 'wide' ? 0.2 : -0.25]}
      >
        <coneGeometry args={[0.09, 0.14, 3]} />
        <meshStandardMaterial
          color="#FFB000"
          emissive="#FF7518"
          emissiveIntensity={1.3}
          toneMapped={false}
        />
      </mesh>

      {/* Sinister Jagged Carved Grin */}
      <mesh position={[0, 0.36, 0.53]} rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.32, 0.09, 0.04]} />
        <meshStandardMaterial
          color="#FFB000"
          emissive="#FF7518"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* Jagged Fangs */}
      <mesh position={[-0.08, 0.33, 0.54]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.035, 0.06, 3]} />
        <meshStandardMaterial color="#FFB000" emissive="#FF7518" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 0.33, 0.54]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.035, 0.06, 3]} />
        <meshStandardMaterial color="#FFB000" emissive="#FF7518" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.39, 0.54]}>
        <coneGeometry args={[0.035, 0.06, 3]} />
        <meshStandardMaterial color="#FFB000" emissive="#FF7518" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Gnarled Thorny Side Roots reaching inward from peripheral boundaries.
 */
function SideRootCluster({ position = [0, 0, 0], flip = false }) {
  const dir = flip ? -1 : 1;
  return (
    <group position={position}>
      {/* Primary root arch */}
      <mesh position={[dir * 0.8, 0.8, 0]} rotation={[0, 0, dir * 0.45]}>
        <cylinderGeometry args={[0.18, 0.38, 2.2, 6]} />
        <meshStandardMaterial color="#080B12" roughness={0.96} />
      </mesh>
      {/* Secondary branch */}
      <mesh position={[dir * 1.5, 1.4, 0.3]} rotation={[0.2, dir * 0.3, dir * 0.8]}>
        <cylinderGeometry args={[0.08, 0.18, 1.6, 5]} />
        <meshStandardMaterial color="#080B12" roughness={0.96} />
      </mesh>
      {/* Thorny projection */}
      <mesh position={[dir * 1.2, 1.1, -0.2]} rotation={[dir * 0.5, 0, dir * 1.1]}>
        <coneGeometry args={[0.05, 0.4, 4]} />
        <meshStandardMaterial color="#05070A" roughness={0.98} />
      </mesh>
    </group>
  );
}

/**
 * Master ProceduralSideDecorations for 3D Camera Path.
 * Strategically placed on left (x negative) and right (x positive) margins
 * matching the key stops of the Catmull-Rom spline camera trajectory.
 */
export default function ProceduralSideDecorations({
  scrollProgress = 0,
  tier = 'high',
  isReducedMotion = false
}) {
  // Define peripheral pairs along the entire journey from Z=26 down to Z=-284
  const marginNodes = useMemo(() => [
    // Hero & Gate approach (Z: 30 to 12)
    { posL: [-12.2, 0.4, 30], posR: [10.8, 0.5, 30], scale: 1.25, rotL: 0.4, rotR: -0.4, expr: 'wide', hasRoot: true },
    { posL: [-11.5, 0, 26], posR: [11.5, 0, 26], scale: 1.15, rotL: 0.35, rotR: -0.35, expr: 'sinister', hasRoot: true },
    { posL: [-9.8, 0, 13], posR: [9.8, 0, 13], scale: 1.05, rotL: 0.5, rotR: -0.45, expr: 'wide', hasRoot: true },

    // Act I Graveyard path (Z: 0 to -12)
    { posL: [-9.2, 0, 0], posR: [9.2, 0, 0], scale: 0.95, rotL: 0.25, rotR: -0.3, expr: 'sinister', hasRoot: false },
    { posL: [-10.2, 0, -12], posR: [10.2, 0, -12], scale: 1.1, rotL: 0.4, rotR: -0.5, expr: 'wide', hasRoot: true },

    // Act II Laboratory & Cloud Crypt (Z: -26 to -45)
    { posL: [-10.8, 0.4, -26], posR: [10.8, 0.4, -26], scale: 1.2, rotL: 0.3, rotR: -0.35, expr: 'sinister', hasRoot: true },
    { posL: [-9.5, 0.4, -45], posR: [9.5, 0.4, -45], scale: 0.9, rotL: 0.45, rotR: -0.4, expr: 'wide', hasRoot: false },

    // Challenge Chambers Zone (Z: -68 to -95)
    { posL: [-12.2, 0.4, -68], posR: [12.2, 0.4, -68], scale: 1.25, rotL: 0.35, rotR: -0.4, expr: 'sinister', hasRoot: true },
    { posL: [-11.5, 0.4, -95], posR: [11.5, 0.4, -95], scale: 1.05, rotL: 0.5, rotR: -0.5, expr: 'wide', hasRoot: true },

    // Event Chronicles Zone (Z: -155 to -180)
    { posL: [-10.5, 0.4, -155], posR: [10.5, 0.4, -155], scale: 1.1, rotL: 0.3, rotR: -0.35, expr: 'sinister', hasRoot: true },
    { posL: [-11.0, 0.4, -180], posR: [11.0, 0.4, -180], scale: 1.0, rotL: 0.4, rotR: -0.45, expr: 'wide', hasRoot: false },

    // Judges Rubric Zone (Z: -208 to -224)
    { posL: [-12.0, 0.4, -208], posR: [12.0, 0.4, -208], scale: 1.3, rotL: 0.35, rotR: -0.4, expr: 'sinister', hasRoot: true },

    // Prize Vault & Alliance Hall (Z: -238 to -262)
    { posL: [-10.2, 0.4, -238], posR: [10.2, 0.4, -238], scale: 1.15, rotL: 0.45, rotR: -0.5, expr: 'wide', hasRoot: true },
    { posL: [-11.5, 0.4, -262], posR: [11.5, 0.4, -262], scale: 1.2, rotL: 0.3, rotR: -0.35, expr: 'sinister', hasRoot: true },

    // Final Portal & Midnight Gateway (Z: -284)
    { posL: [-12.5, 0.4, -284], posR: [12.5, 0.4, -284], scale: 1.45, rotL: 0.4, rotR: -0.45, expr: 'sinister', hasRoot: true }
  ], []);

  // In Low Tier, filter down to every second node to optimize draw calls
  const activeNodes = useMemo(() => {
    if (tier === 'low') {
      return marginNodes.filter((_, idx) => idx % 2 === 0);
    }
    return marginNodes;
  }, [tier, marginNodes]);

  return (
    <group>
      {activeNodes.map((node, i) => (
        <group key={`side-node-${i}`}>
          {/* Left Margin */}
          <MarginPumpkin
            position={node.posL}
            scale={node.scale}
            rotationY={node.rotL}
            expression={node.expr}
            tier={tier}
            isReducedMotion={isReducedMotion}
          />
          {node.hasRoot && (
            <SideRootCluster position={[node.posL[0] + 0.3, node.posL[1], node.posL[2]]} flip={false} />
          )}

          {/* Right Margin */}
          <MarginPumpkin
            position={node.posR}
            scale={node.scale}
            rotationY={node.rotR}
            expression={node.expr}
            tier={tier}
            isReducedMotion={isReducedMotion}
          />
          {node.hasRoot && (
            <SideRootCluster position={[node.posR[0] - 0.3, node.posR[1], node.posR[2]]} flip={true} />
          )}
        </group>
      ))}
    </group>
  );
}
