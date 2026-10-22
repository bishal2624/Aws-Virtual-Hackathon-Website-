import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getProceduralMoonTexture, getProceduralCloudTexture } from './proceduralTextures';

export default function ProceduralSkyAndMoon({ isReducedMotion = false }) {
  const moonTex = useMemo(() => getProceduralMoonTexture(), []);
  const cloudTex = useMemo(() => getProceduralCloudTexture(), []);
  const cloudsRef = useRef();

  // Create subtle, sparse star field (instanced points)
  const [starPositions, starCount] = useMemo(() => {
    const count = 280;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Place in upper hemisphere dome behind the mansion
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0) * 0.45; // upper dome only
      const r = 180 + Math.random() * 20;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 15;
      positions[i * 3 + 2] = -Math.abs(r * Math.sin(phi) * Math.sin(theta)) - 40;
    }
    return [positions, count];
  }, []);

  // Cloud drift animation in useFrame
  useFrame((state, delta) => {
    if (isReducedMotion || !cloudsRef.current) return;
    cloudsRef.current.children.forEach((cloud, idx) => {
      cloud.position.x += (0.25 + idx * 0.08) * delta;
      if (cloud.position.x > 70) {
        cloud.position.x = -70;
      }
    });
  });

  return (
    <group>
      {/* Sky Dome - Flat midnight background */}
      <mesh position={[0, 0, -100]}>
        <sphereGeometry args={[220, 24, 24]} />
        <meshBasicMaterial color="#080D1A" side={THREE.BackSide} />
      </mesh>

      {/* Sparse Starfield */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.8}
          color="#C8CDD8"
          transparent
          opacity={0.65}
          sizeAttenuation
        />
      </points>

      {/* Luminous Full Moon (Anchored behind the Mansion) */}
      <group position={[0, 22, -65]}>
        {/* Soft Moon Halo Sprite */}
        <mesh position={[0, 0, -1]}>
          <planeGeometry args={[36, 36]} />
          <meshBasicMaterial
            color="#C8CDD8"
            transparent
            opacity={0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Moon Sphere with Procedural Crater Map */}
        <mesh>
          <sphereGeometry args={[11, 32, 32]} />
          <meshStandardMaterial
            map={moonTex}
            color="#E6EAEE"
            emissive="#B0B6C4"
            emissiveIntensity={0.6}
            roughness={0.9}
            toneMapped={false}
          />
        </mesh>

        {/* Cold Directional Moonlight */}
        <directionalLight
          position={[5, 15, 10]}
          intensity={1.2}
          color="#C8CDD8"
          castShadow={false}
        />
      </group>

      {/* Drifting Layered Alpha Cloud Planes */}
      <group ref={cloudsRef} position={[0, 16, -45]}>
        {[
          { x: -35, y: 4, z: -2, scale: [48, 14, 1], opacity: 0.7 },
          { x: 10, y: -2, z: 2, scale: [56, 16, 1], opacity: 0.8 },
          { x: -50, y: -6, z: 0, scale: [44, 12, 1], opacity: 0.65 },
          { x: 42, y: 7, z: -4, scale: [52, 15, 1], opacity: 0.75 }
        ].map((cfg, idx) => (
          <mesh
            key={idx}
            position={[cfg.x, cfg.y, cfg.z]}
            scale={cfg.scale}
          >
            <planeGeometry />
            <meshBasicMaterial
              map={cloudTex}
              transparent
              opacity={cfg.opacity}
              depthWrite={false}
              blending={THREE.NormalBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
