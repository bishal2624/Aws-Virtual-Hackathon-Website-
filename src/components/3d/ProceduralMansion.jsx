import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProceduralMansion({ tier = 'high', isReducedMotion = false }) {
  const windowMaterialsRef = useRef([]);

  // Create 8 window mesh references with independent flicker noise offsets
  const windowConfigs = useMemo(() => [
    { pos: [-3.2, 5.2, 5.1], size: [1.2, 2.0], offset: 0.1 },
    { pos: [-1.1, 5.2, 5.1], size: [1.2, 2.0], offset: 1.8 },
    { pos: [1.1, 5.2, 5.1], size: [1.2, 2.0], offset: 3.4 },
    { pos: [3.2, 5.2, 5.1], size: [1.2, 2.0], offset: 5.1 },
    { pos: [-3.2, 2.2, 5.1], size: [1.2, 2.0], offset: 2.3 },
    { pos: [3.2, 2.2, 5.1], size: [1.2, 2.0], offset: 4.2 },
    { pos: [6.2, 4.0, 3.1], size: [1.0, 1.8], offset: 0.9 },
    { pos: [0, 8.5, 5.1], size: [1.4, 1.4], offset: 3.0, isRound: true }
  ], []);

  // Low-amplitude non-strobing warm flicker
  useFrame(({ clock }) => {
    if (isReducedMotion) return;
    const t = clock.getElapsedTime();

    windowMaterialsRef.current.forEach((mat, idx) => {
      if (!mat) return;
      const off = windowConfigs[idx]?.offset || 0;
      // Gentle sine combination yielding low-frequency warm flame flicker (amplitude 0.65 to 1.1)
      const noise = Math.sin(t * 1.8 + off) * 0.15 + Math.sin(t * 0.7 + off * 2) * 0.08;
      mat.emissiveIntensity = 0.85 + noise;
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Stone Foundation Base */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[18, 0.8, 12]} />
        <meshStandardMaterial color="#0E121B" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Main Central Stone Hall */}
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[10, 9, 10]} />
        <meshStandardMaterial color="#141722" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Main Roof Gable */}
      <mesh position={[0, 10.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[7.2, 4, 4]} />
        <meshStandardMaterial color="#0A0D15" roughness={0.9} />
      </mesh>

      {/* Left Wing */}
      <mesh position={[-6.5, 3.5, -0.5]}>
        <boxGeometry args={[5, 7, 8]} />
        <meshStandardMaterial color="#12151F" roughness={0.85} />
      </mesh>
      {/* Left Wing Roof */}
      <mesh position={[-6.5, 8.0, -0.5]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[4.2, 3.2, 4]} />
        <meshStandardMaterial color="#0A0D15" roughness={0.9} />
      </mesh>

      {/* Right Tower (Taller Spire) */}
      <mesh position={[6.5, 6, 0]}>
        <cylinderGeometry args={[2.4, 2.6, 12, 8]} />
        <meshStandardMaterial color="#10131D" roughness={0.8} />
      </mesh>
      {/* Right Tower Conical Spire */}
      <mesh position={[6.5, 14, 0]}>
        <coneGeometry args={[2.8, 5, 8]} />
        <meshStandardMaterial color="#080A10" roughness={0.9} />
      </mesh>
      {/* Iron Finial on Spire */}
      <mesh position={[6.5, 17, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.8, 4]} />
        <meshBasicMaterial color="#FF7518" />
      </mesh>

      {/* Stone Chimneys */}
      <mesh position={[-3.5, 10.5, -2]}>
        <boxGeometry args={[0.9, 3.5, 0.9]} />
        <meshStandardMaterial color="#0B0E16" roughness={0.95} />
      </mesh>
      <mesh position={[2.5, 11, -2]}>
        <boxGeometry args={[1.0, 4.0, 1.0]} />
        <meshStandardMaterial color="#0B0E16" roughness={0.95} />
      </mesh>

      {/* Front Entryway Porch & Stone Steps */}
      <mesh position={[0, 1.8, 5.8]}>
        <boxGeometry args={[4, 3.6, 2]} />
        <meshStandardMaterial color="#0E121B" roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.0, 6]}>
        <coneGeometry args={[2.8, 1.6, 4]} />
        <meshStandardMaterial color="#0A0D15" roughness={0.9} />
      </mesh>
      {/* Arched Doorway */}
      <mesh position={[0, 1.2, 6.85]}>
        <planeGeometry args={[1.8, 2.6]} />
        <meshStandardMaterial
          color="#050505"
          emissive="#FF7518"
          emissiveIntensity={0.4}
          roughness={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Emissive Orange Windows */}
      {windowConfigs.map((cfg, idx) => (
        <mesh key={idx} position={cfg.pos}>
          {cfg.isRound ? (
            <circleGeometry args={[cfg.size[0] / 2, 16]} />
          ) : (
            <planeGeometry args={cfg.size} />
          )}
          <meshStandardMaterial
            ref={(el) => (windowMaterialsRef.current[idx] = el)}
            color="#FFB000"
            emissive="#FF7518"
            emissiveIntensity={0.9}
            roughness={0.2}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Architectural Serverless Energy Pulse Line (Acid Green) */}
      <mesh position={[0, 0.2, 5.2]}>
        <cylinderGeometry args={[0.04, 0.04, 14, 8]} />
        <meshBasicMaterial color="#A3FF12" />
      </mesh>

      {/* Warm Point Light for Front Porch on High Tier */}
      {tier === 'high' && (
        <pointLight
          position={[0, 2.5, 7.5]}
          color="#FF7518"
          intensity={2.4}
          distance={14}
          decay={2}
        />
      )}
    </group>
  );
}
