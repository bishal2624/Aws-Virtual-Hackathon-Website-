import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProceduralTreesAndGate({ gateOpenProgress = 0, isReducedMotion = false }) {
  const leftGateRef = useRef();
  const rightGateRef = useRef();

  useFrame(() => {
    // Smooth gate swing rotation (0 rad = closed, ~1.3 rad = swung outward)
    const targetAngle = isReducedMotion
      ? (gateOpenProgress > 0.2 ? 1.3 : 0)
      : gateOpenProgress * 1.35;

    if (leftGateRef.current) {
      leftGateRef.current.rotation.y = THREE.MathUtils.lerp(
        leftGateRef.current.rotation.y,
        -targetAngle,
        0.1
      );
    }
    if (rightGateRef.current) {
      rightGateRef.current.rotation.y = THREE.MathUtils.lerp(
        rightGateRef.current.rotation.y,
        targetAngle,
        0.1
      );
    }
  });

  return (
    <group>
      {/* Twisted Gnarled Framing Trees Left (x=-14 to -18, z=20 to 28) */}
      <group position={[-16, 0, 24]}>
        {/* Main Trunk */}
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.7, 1.4, 8, 8]} />
          <meshStandardMaterial color="#06080E" roughness={0.95} />
        </mesh>
        {/* Arching Branches into upper frame */}
        <mesh position={[2.5, 7.5, 0]} rotation={[0, 0, -Math.PI / 3]}>
          <cylinderGeometry args={[0.35, 0.7, 6, 6]} />
          <meshStandardMaterial color="#06080E" roughness={0.95} />
        </mesh>
        <mesh position={[4.5, 9.8, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.15, 0.35, 4, 5]} />
          <meshStandardMaterial color="#06080E" roughness={0.95} />
        </mesh>
      </group>

      {/* Twisted Gnarled Framing Trees Right (x=14 to 18, z=20 to 28) */}
      <group position={[16, 0, 24]}>
        {/* Main Trunk */}
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[0.7, 1.4, 8, 8]} />
          <meshStandardMaterial color="#06080E" roughness={0.95} />
        </mesh>
        {/* Arching Branches into upper frame */}
        <mesh position={[-2.5, 7.5, 0]} rotation={[0, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.35, 0.7, 6, 6]} />
          <meshStandardMaterial color="#06080E" roughness={0.95} />
        </mesh>
        <mesh position={[-4.5, 9.8, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.15, 0.35, 4, 5]} />
          <meshStandardMaterial color="#06080E" roughness={0.95} />
        </mesh>
      </group>

      {/* Wrought-Iron Estate Gate Structure at z=13 */}
      <group position={[0, 0, 13]}>
        {/* Left Stone Gate Pillar */}
        <mesh position={[-2.6, 2.2, 0]}>
          <boxGeometry args={[1.2, 4.4, 1.2]} />
          <meshStandardMaterial color="#10141F" roughness={0.85} />
        </mesh>
        {/* Pillar Cap with Lantern */}
        <mesh position={[-2.6, 4.6, 0]}>
          <coneGeometry args={[0.9, 0.6, 4]} />
          <meshStandardMaterial color="#0A0D15" roughness={0.9} />
        </mesh>
        {/* Left Pillar Lantern Light */}
        <mesh position={[-2.6, 5.1, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color="#FFB000"
            emissive="#FF7518"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>

        {/* Right Stone Gate Pillar */}
        <mesh position={[2.6, 2.2, 0]}>
          <boxGeometry args={[1.2, 4.4, 1.2]} />
          <meshStandardMaterial color="#10141F" roughness={0.85} />
        </mesh>
        {/* Pillar Cap with Lantern */}
        <mesh position={[2.6, 4.6, 0]}>
          <coneGeometry args={[0.9, 0.6, 4]} />
          <meshStandardMaterial color="#0A0D15" roughness={0.9} />
        </mesh>
        {/* Right Pillar Lantern Light */}
        <mesh position={[2.6, 5.1, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial
            color="#FFB000"
            emissive="#FF7518"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>

        {/* Left Swinging Iron Gate Leaf (Pivot at x=-2.0) */}
        <group ref={leftGateRef} position={[-2.0, 0, 0]}>
          {/* Gate Leaf Mesh (offset so rotation occurs around pillar hinge) */}
          <group position={[0.95, 1.8, 0]}>
            {/* Horizontal Frame Bars */}
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[1.9, 0.08, 0.08]} />
              <meshStandardMaterial color="#080B12" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.9, 0.08, 0.08]} />
              <meshStandardMaterial color="#080B12" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -1.4, 0]}>
              <boxGeometry args={[1.9, 0.08, 0.08]} />
              <meshStandardMaterial color="#080B12" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Vertical Spikes */}
            {[-0.8, -0.4, 0, 0.4, 0.8].map((xOffset, sIdx) => (
              <mesh key={sIdx} position={[xOffset, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 3.2, 6]} />
                <meshStandardMaterial color="#080B12" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>
        </group>

        {/* Right Swinging Iron Gate Leaf (Pivot at x=2.0) */}
        <group ref={rightGateRef} position={[2.0, 0, 0]}>
          <group position={[-0.95, 1.8, 0]}>
            <mesh position={[0, 1.4, 0]}>
              <boxGeometry args={[1.9, 0.08, 0.08]} />
              <meshStandardMaterial color="#080B12" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[1.9, 0.08, 0.08]} />
              <meshStandardMaterial color="#080B12" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, -1.4, 0]}>
              <boxGeometry args={[1.9, 0.08, 0.08]} />
              <meshStandardMaterial color="#080B12" metalness={0.9} roughness={0.2} />
            </mesh>
            {[-0.8, -0.4, 0, 0.4, 0.8].map((xOffset, sIdx) => (
              <mesh key={sIdx} position={[xOffset, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 3.2, 6]} />
                <meshStandardMaterial color="#080B12" metalness={0.9} roughness={0.2} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
}
