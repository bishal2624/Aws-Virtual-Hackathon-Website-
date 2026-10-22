import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function SingleGhost({ initialPos = [0, 0, 0], orbitRadius = 3, speed = 0.5, phase = 0, isReducedMotion = false }) {
  const ghostRef = useRef();
  const matRef = useRef();

  useFrame(({ clock }) => {
    if (isReducedMotion || !ghostRef.current) return;
    const t = clock.getElapsedTime() * speed + phase;

    // Figure-8 drift pattern away from central text regions
    const x = initialPos[0] + Math.sin(t) * orbitRadius;
    const y = initialPos[1] + Math.sin(t * 1.8) * 0.6;
    const z = initialPos[2] + Math.sin(t * 2) * (orbitRadius * 0.4);

    ghostRef.current.position.set(x, y, z);
    ghostRef.current.rotation.y = Math.cos(t) * 0.4;

    // Opacity oscillation between 0.25 and 0.55
    if (matRef.current) {
      matRef.current.opacity = 0.38 + Math.sin(t * 2.2) * 0.15;
    }
  });

  return (
    <group ref={ghostRef} position={initialPos}>
      {/* Translucent Spectral Shroud */}
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial
          ref={matRef}
          color="#D2D8E6"
          emissive="#A0A8BC"
          emissiveIntensity={0.4}
          transparent
          opacity={0.45}
          depthWrite={false}
          roughness={0.2}
          blending={THREE.NormalBlending}
        />
      </mesh>
      {/* Flowing Skirt */}
      <mesh position={[0, 0.4, 0]}>
        <coneGeometry args={[0.6, 1.1, 12, 1, true]} />
        <meshStandardMaterial
          color="#C0C6D8"
          emissive="#8B95AE"
          emissiveIntensity={0.3}
          transparent
          opacity={0.35}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hollow Glowing Cyan/Moonlight Eyes */}
      <mesh position={[-0.16, 0.95, 0.48]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#0A0D15" />
      </mesh>
      <mesh position={[0.16, 0.95, 0.48]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshBasicMaterial color="#0A0D15" />
      </mesh>
    </group>
  );
}

export default function ProceduralGhosts({ tier = 'high', isReducedMotion = false }) {
  // Ghost count: 5 on high, 3 on medium, 2 on low (from Section 6 tier table)
  const ghostCount = tier === 'low' ? 2 : tier === 'medium' ? 3 : 5;

  return (
    <group>
      {ghostCount >= 1 && (
        <SingleGhost initialPos={[-9, 3.8, 18]} orbitRadius={3.5} speed={0.45} phase={0.5} isReducedMotion={isReducedMotion} />
      )}
      {ghostCount >= 2 && (
        <SingleGhost initialPos={[9, 4.2, 20]} orbitRadius={4.0} speed={0.4} phase={2.8} isReducedMotion={isReducedMotion} />
      )}
      {ghostCount >= 3 && (
        <SingleGhost initialPos={[-7, 5.5, 4]} orbitRadius={3.0} speed={0.55} phase={1.2} isReducedMotion={isReducedMotion} />
      )}
      {ghostCount >= 4 && (
        <SingleGhost initialPos={[8, 6.0, 2]} orbitRadius={3.8} speed={0.5} phase={4.1} isReducedMotion={isReducedMotion} />
      )}
      {ghostCount >= 5 && (
        <SingleGhost initialPos={[-12, 4.5, 12]} orbitRadius={4.2} speed={0.38} phase={3.4} isReducedMotion={isReducedMotion} />
      )}
    </group>
  );
}
