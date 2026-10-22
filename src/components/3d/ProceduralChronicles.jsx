import React from 'react';

export default function ProceduralChronicles() {
  // Six milestone lantern markers along a winding path between z=-150 and z=-190
  const markers = [
    { x: -3.0, z: -152, phase: 1 },
    { x: 3.2, z: -159, phase: 2 },
    { x: -2.8, z: -166, phase: 3 },
    { x: 2.6, z: -173, phase: 4 },
    { x: -3.2, z: -180, phase: 5 },
    { x: 2.8, z: -187, phase: 6 }
  ];

  return (
    <group>
      {/* Dark Winding Path Ground */}
      <mesh position={[0, -0.4, -170]}>
        <boxGeometry args={[14, 0.6, 46]} />
        <meshStandardMaterial color="#0A0C14" roughness={0.9} />
      </mesh>

      {/* Six Chronicle Lantern Markers */}
      {markers.map((m, idx) => (
        <group key={idx} position={[m.x, 0, m.z]}>
          {/* Stone Plinth */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.4, 0.5, 1.6, 6]} />
            <meshStandardMaterial color="#141824" roughness={0.8} />
          </mesh>
          {/* Lantern Cage */}
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.6, 4]} />
            <meshStandardMaterial color="#0E121C" metalness={0.7} />
          </mesh>
          {/* Glowing Beacon Core */}
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial
              color="#FFB000"
              emissive="#FF7518"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
