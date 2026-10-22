import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProceduralLaboratory({ isReducedMotion = false }) {
  const nodesGroupRef = useRef();

  useFrame(({ clock }) => {
    if (isReducedMotion || !nodesGroupRef.current) return;
    const t = clock.getElapsedTime();
    nodesGroupRef.current.rotation.y = t * 0.08;
  });

  return (
    <group position={[0, 0, -36]}>
      {/* Laboratory Ambient Platform Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[18, 19, 0.8, 16]} />
        <meshStandardMaterial color="#0A0D15" roughness={0.8} />
      </mesh>

      {/* Floating Server Racks flanking central view */}
      {[-7, 7].map((xPos, idx) => (
        <group key={idx} position={[xPos, 3.2, 0]}>
          {/* Outer Black Chassis */}
          <mesh>
            <boxGeometry args={[2.2, 5.5, 2.2]} />
            <meshStandardMaterial color="#070910" roughness={0.7} metalness={0.4} />
          </mesh>
          {/* Inner Emissive Blade Servers with LED Strips */}
          {Array.from({ length: 6 }).map((_, bIdx) => (
            <group key={bIdx} position={[0, -2.0 + bIdx * 0.8, 1.11]}>
              <mesh>
                <boxGeometry args={[1.9, 0.6, 0.05]} />
                <meshStandardMaterial color="#121622" />
              </mesh>
              {/* Green Activity LED */}
              <mesh position={[-0.7, 0, 0.04]}>
                <boxGeometry args={[0.08, 0.08, 0.02]} />
                <meshBasicMaterial color="#A3FF12" />
              </mesh>
              {/* Orange Activity LED */}
              <mesh position={[-0.5, 0, 0.04]}>
                <boxGeometry args={[0.08, 0.08, 0.02]} />
                <meshBasicMaterial color="#FF7518" />
              </mesh>
              {/* Cyan Status Strip */}
              <mesh position={[0.2, 0, 0.04]}>
                <boxGeometry args={[0.8, 0.06, 0.02]} />
                <meshBasicMaterial color="#C8CDD8" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Central Cloud Node Cluster (Icosahedron Nodes & Connection Lines) */}
      <group ref={nodesGroupRef} position={[0, 4.2, 0]}>
        {/* Core Cloud Hub Node */}
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.4, 1]} />
          <meshStandardMaterial
            color="#A3FF12"
            emissive="#A3FF12"
            emissiveIntensity={0.6}
            wireframe
            toneMapped={false}
          />
        </mesh>

        {/* Orbiting Satellite Data Nodes */}
        {[
          [3.2, 1.2, -1.5],
          [-3.0, -1.0, 1.8],
          [1.5, -2.2, -2.4],
          [-1.8, 2.4, 2.0]
        ].map((pos, nIdx) => (
          <group key={nIdx} position={pos}>
            <mesh>
              <icosahedronGeometry args={[0.65, 0]} />
              <meshStandardMaterial
                color="#C8CDD8"
                emissive="#A3FF12"
                emissiveIntensity={0.4}
                wireframe
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Floating Glass Interface Panels with Abstract Wireframe Glyphs (No Fake Numbers) */}
      {[-3.6, 3.6].map((xPos, idx) => (
        <group key={idx} position={[xPos, 2.4, 4]} rotation={[0, idx === 0 ? 0.3 : -0.3, 0]}>
          {/* Glass Plane */}
          <mesh>
            <planeGeometry args={[2.6, 3.4]} />
            <meshStandardMaterial
              color="#0A101C"
              transparent
              opacity={0.45}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
          {/* Abstract Wireframe Ring Glyph */}
          <mesh position={[0, 0.6, 0.02]}>
            <ringGeometry args={[0.5, 0.54, 24]} />
            <meshBasicMaterial color="#A3FF12" />
          </mesh>
          {/* Abstract Grid Glyphs */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((yOffset, gIdx) => (
            <mesh key={gIdx} position={[0, -0.8 + yOffset, 0.02]}>
              <planeGeometry args={[1.8, 0.06]} />
              <meshBasicMaterial color="#C8CDD8" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Green Data Conduits */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.5, 5.7, 32]} />
        <meshBasicMaterial color="#A3FF12" />
      </mesh>
    </group>
  );
}
