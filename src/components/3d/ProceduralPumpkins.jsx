import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function SinglePumpkin({ position = [0, 0, 0], scale = 1, rotationY = 0, isReducedMotion = false }) {
  const groupRef = useRef();
  const faceMatRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (isReducedMotion || !groupRef.current) return;
    const t = clock.getElapsedTime();
    // Subtle idle bobbing (small amplitude)
    groupRef.current.position.y = position[1] + Math.sin(t * 1.6 + position[0]) * 0.04;

    if (faceMatRef.current) {
      const targetIntensity = hovered ? 2.4 : 1.2 + Math.sin(t * 3.0) * 0.25;
      faceMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        faceMatRef.current.emissiveIntensity,
        targetIntensity,
        0.1
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      rotation={[0, rotationY, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); setHovered(h => !h); }}
    >
      {/* Pumpkin Body (Segmented Lathe / Squashed Spheres) */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial
          color="#FF7518"
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>
      {/* Rib Segments */}
      <mesh position={[0, 0.45, 0]} scale={[1.1, 0.95, 0.85]}>
        <sphereGeometry args={[0.52, 16, 12]} />
        <meshStandardMaterial color="#E65A00" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.45, 0]} scale={[0.85, 0.95, 1.1]}>
        <sphereGeometry args={[0.52, 16, 12]} />
        <meshStandardMaterial color="#E65A00" roughness={0.7} />
      </mesh>

      {/* Stem */}
      <mesh position={[0, 0.98, 0]} rotation={[0.15, 0, 0.1]}>
        <cylinderGeometry args={[0.06, 0.09, 0.28, 6]} />
        <meshStandardMaterial color="#354A18" roughness={0.9} />
      </mesh>

      {/* Glowing Carved Eyes & Grin */}
      {/* Left Eye */}
      <mesh position={[-0.18, 0.54, 0.48]} rotation={[0, -0.3, 0]}>
        <coneGeometry args={[0.08, 0.12, 3]} />
        <meshStandardMaterial
          ref={faceMatRef}
          color="#FFB000"
          emissive="#FF7518"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      {/* Right Eye */}
      <mesh position={[0.18, 0.54, 0.48]} rotation={[0, 0.3, 0]}>
        <coneGeometry args={[0.08, 0.12, 3]} />
        <meshStandardMaterial
          color="#FFB000"
          emissive="#FF7518"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      {/* Jagged Grin */}
      <mesh position={[0, 0.32, 0.5]}>
        <boxGeometry args={[0.26, 0.08, 0.04]} />
        <meshStandardMaterial
          color="#FFB000"
          emissive="#FF7518"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function ProceduralPumpkins({ isReducedMotion = false }) {
  return (
    <group>
      {/* Pumpkins near entrance and along path */}
      <SinglePumpkin position={[-3.2, 0, 11.5]} scale={1.1} rotationY={0.4} isReducedMotion={isReducedMotion} />
      <SinglePumpkin position={[3.4, 0, 11.8]} scale={0.95} rotationY={-0.5} isReducedMotion={isReducedMotion} />
      <SinglePumpkin position={[-1.8, 0, 7.5]} scale={0.85} rotationY={0.2} isReducedMotion={isReducedMotion} />
      <SinglePumpkin position={[2.0, 0, 7.8]} scale={1.05} rotationY={-0.3} isReducedMotion={isReducedMotion} />
    </group>
  );
}
