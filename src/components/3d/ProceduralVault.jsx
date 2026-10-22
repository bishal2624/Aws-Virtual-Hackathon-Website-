import React from 'react';

export default function ProceduralVault() {
  const pedestals = [-6, -2, 2, 6];

  return (
    <group position={[0, 0, -246]}>
      {/* Stone Foundation */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[20, 0.6, 12]} />
        <meshStandardMaterial color="#0A0C14" roughness={0.9} />
      </mesh>

      {/* Four Trophy Pedestals */}
      {pedestals.map((xPos, idx) => (
        <group key={idx} position={[xPos, 0, 0]}>
          {/* Base Plinth */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[1.0, 1.2, 1.2, 8]} />
            <meshStandardMaterial color="#141824" roughness={0.7} metalness={0.3} />
          </mesh>

          {/* Trophy-Inspired Lathe Cup / Ring */}
          <mesh position={[0, 1.7, 0]}>
            <torusGeometry args={[0.5, 0.1, 8, 24]} />
            <meshStandardMaterial
              color="#FFB000"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.2, 0.4, 0.6, 8]} />
            <meshStandardMaterial
              color="#FF7518"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>

          {/* Vertical Spotlight Cone (Translucent) */}
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[1.6, 4.5, 16, 1, true]} />
            <meshBasicMaterial
              color="#C8CDD8"
              transparent
              opacity={0.08}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
