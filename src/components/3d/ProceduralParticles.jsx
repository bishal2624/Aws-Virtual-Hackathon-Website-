import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProceduralParticles({ tier = 'high', isReducedMotion = false }) {
  const embersRef = useRef();
  const firefliesRef = useRef();

  // Determine counts based on tier
  const emberCount = tier === 'low' ? 35 : tier === 'medium' ? 70 : 140;
  const fireflyCount = tier === 'low' ? 12 : tier === 'medium' ? 24 : 45;

  // Initialize embers positions
  const [emberPositions, emberVelocities] = useMemo(() => {
    const pos = new Float32Array(emberCount * 3);
    const vel = new Float32Array(emberCount * 3);
    for (let i = 0; i < emberCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = Math.random() * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40 + 10;

      vel[i * 3] = (Math.random() - 0.5) * 0.2;
      vel[i * 3 + 1] = 0.4 + Math.random() * 0.8; // Rising upwards
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    return [pos, vel];
  }, [emberCount]);

  // Initialize firefly positions
  const fireflyPositions = useMemo(() => {
    const pos = new Float32Array(fireflyCount * 3);
    for (let i = 0; i < fireflyCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 32;
      pos[i * 3 + 1] = 0.5 + Math.random() * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 36 + 12;
    }
    return pos;
  }, [fireflyCount]);

  useFrame((state, delta) => {
    if (isReducedMotion) return;

    // Animate embers rising
    if (embersRef.current) {
      const positions = embersRef.current.geometry.attributes.position.array;
      for (let i = 0; i < emberCount; i++) {
        positions[i * 3 + 1] += emberVelocities[i * 3 + 1] * delta;
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.01;
        // Reset when reaching top
        if (positions[i * 3 + 1] > 14) {
          positions[i * 3 + 1] = 0.1;
          positions[i * 3] = (Math.random() - 0.5) * 36;
        }
      }
      embersRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate fireflies gentle hover
    if (firefliesRef.current) {
      const positions = firefliesRef.current.geometry.attributes.position.array;
      const t = state.clock.elapsedTime;
      for (let i = 0; i < fireflyCount; i++) {
        positions[i * 3 + 1] += Math.sin(t * 1.5 + i) * 0.005;
        positions[i * 3] += Math.cos(t * 0.8 + i) * 0.005;
      }
      firefliesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Orange Rising Embers */}
      <points ref={embersRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[emberPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#FF7518"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Acid Green Fireflies */}
      <points ref={firefliesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[fireflyPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.18}
          color="#A3FF12"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
