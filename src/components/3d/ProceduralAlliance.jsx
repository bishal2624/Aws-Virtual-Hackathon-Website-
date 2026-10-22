import React from 'react';

export default function ProceduralAlliance() {
  return (
    <group position={[0, 0, -270]}>
      {/* Stone Archway Base Ground */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[18, 0.6, 14]} />
        <meshStandardMaterial color="#0A0C14" roughness={0.9} />
      </mesh>

      {/* Monumental Stone Archway */}
      {/* Left Column */}
      <mesh position={[-4.5, 3.5, 0]}>
        <boxGeometry args={[1.6, 7.0, 1.6]} />
        <meshStandardMaterial color="#141824" roughness={0.8} />
      </mesh>
      {/* Right Column */}
      <mesh position={[4.5, 3.5, 0]}>
        <boxGeometry args={[1.6, 7.0, 1.6]} />
        <meshStandardMaterial color="#141824" roughness={0.8} />
      </mesh>
      {/* Archway Lintel Crossbar */}
      <mesh position={[0, 7.2, 0]}>
        <boxGeometry args={[11.2, 1.2, 1.8]} />
        <meshStandardMaterial color="#0E121B" roughness={0.85} />
      </mesh>

      {/* Emissive Chapter Accent Trim (Purple on Left, Orange on Right) */}
      <mesh position={[-4.5, 0.8, 0.85]}>
        <boxGeometry args={[1.2, 0.15, 0.05]} />
        <meshBasicMaterial color="#8B5CF6" />
      </mesh>
      <mesh position={[4.5, 0.8, 0.85]}>
        <boxGeometry args={[1.2, 0.15, 0.05]} />
        <meshBasicMaterial color="#FF7518" />
      </mesh>
    </group>
  );
}
