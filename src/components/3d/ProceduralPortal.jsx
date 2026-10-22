import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProceduralPortal({ isReducedMotion = false }) {
  const torusRef = useRef();
  const innerRingRef = useRef();

  useFrame(({ clock }) => {
    if (isReducedMotion) return;
    const t = clock.getElapsedTime();
    if (torusRef.current) {
      torusRef.current.rotation.z = t * 0.35;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 0.55;
    }
  });

  return (
    <group position={[0, 4, -298]}>
      {/* Outer Stone & Iron Torus Gateway */}
      <mesh ref={torusRef}>
        <torusGeometry args={[5.2, 0.45, 12, 48]} />
        <meshStandardMaterial
          color="#0C0F18"
          roughness={0.7}
          metalness={0.6}
        />
      </mesh>

      {/* Swirling Acid Green & Orange Energy Ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[4.6, 0.12, 8, 36]} />
        <meshBasicMaterial
          color="#A3FF12"
          wireframe
        />
      </mesh>

      {/* Portal Event Horizon (Translucent glowing disc) */}
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[4.5, 32]} />
        <meshBasicMaterial
          color="#FF7518"
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
