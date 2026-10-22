import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function ProceduralChambers({ activeTrackIdx = 0, isReducedMotion = false }) {
  const chamber1Ref = useRef();
  const chamber2Ref = useRef();
  const chamber3Ref = useRef();
  const chamber4Ref = useRef();

  useFrame(({ clock }) => {
    if (isReducedMotion) return;
    const t = clock.getElapsedTime();

    if (chamber1Ref.current) {
      chamber1Ref.current.rotation.y = t * 0.2;
    }
    if (chamber2Ref.current) {
      chamber2Ref.current.position.y = 3.0 + Math.sin(t * 1.5) * 0.15;
    }
    if (chamber3Ref.current) {
      chamber3Ref.current.children.forEach((child, i) => {
        if (child.name === 'packet') {
          child.position.z = ((t * 2 + i * 2) % 6) - 3;
        }
      });
    }
    if (chamber4Ref.current) {
      chamber4Ref.current.rotation.x = t * 0.15;
      chamber4Ref.current.rotation.y = t * 0.25;
    }
  });

  return (
    <group position={[0, 0, -82]}>
      {/* Ground Strip across chambers */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[60, 0.6, 16]} />
        <meshStandardMaterial color="#0A0C14" roughness={0.9} />
      </mesh>

      {/* CHAMBER 1 (x=-18): Generative AI & Intelligent Applications (Electric Purple) */}
      <group position={[-18, 0, 0]}>
        {/* Pedestal Base */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[3.2, 3.5, 0.8, 8]} />
          <meshStandardMaterial color="#121520" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <ringGeometry args={[2.8, 3.0, 16]} />
          <meshBasicMaterial color="#8B5CF6" />
        </mesh>

        {/* Neural Web Cluster */}
        <group ref={chamber1Ref} position={[0, 3.2, 0]}>
          <mesh>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial
              color="#8B5CF6"
              emissive="#8B5CF6"
              emissiveIntensity={0.8}
              wireframe
              toneMapped={false}
            />
          </mesh>
          {[
            [1.8, 1.2, 0],
            [-1.8, 0.8, 0],
            [0, -1.6, 1.5],
            [0, 1.6, -1.5]
          ].map((pos, idx) => (
            <mesh key={idx} position={pos}>
              <sphereGeometry args={[0.3, 8, 8]} />
              <meshStandardMaterial
                color="#8B5CF6"
                emissive="#8B5CF6"
                emissiveIntensity={0.9}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* CHAMBER 2 (x=-6): Cloud-Native & Serverless (Acid Green) */}
      <group position={[-6, 0, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[3.2, 3.5, 0.8, 8]} />
          <meshStandardMaterial color="#121520" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <ringGeometry args={[2.8, 3.0, 16]} />
          <meshBasicMaterial color="#A3FF12" />
        </mesh>

        {/* Floating Serverless Cubes and Trigger Ring */}
        <group ref={chamber2Ref} position={[0, 3.0, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.8, 1.8, 1.8]} />
            <meshStandardMaterial
              color="#A3FF12"
              emissive="#A3FF12"
              emissiveIntensity={0.5}
              wireframe
              toneMapped={false}
            />
          </mesh>
          {/* Concentric Event Trigger Rings */}
          <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
            <torusGeometry args={[2.2, 0.05, 8, 24]} />
            <meshBasicMaterial color="#A3FF12" />
          </mesh>
        </group>
      </group>

      {/* CHAMBER 3 (x=6): Automation, DevOps & Developer Productivity (Amber) */}
      <group position={[6, 0, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[3.2, 3.5, 0.8, 8]} />
          <meshStandardMaterial color="#121520" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <ringGeometry args={[2.8, 3.0, 16]} />
          <meshBasicMaterial color="#FFB000" />
        </mesh>

        {/* Mechanical Pipeline Rail with Moving Deployment Packets */}
        <group ref={chamber3Ref} position={[0, 3.0, 0]}>
          {/* Main Pipeline Rail */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 6, 8]} />
            <meshStandardMaterial color="#202430" metalness={0.8} />
          </mesh>
          {/* Gate Arches */}
          {[-2, 0, 2].map((zOffset, aIdx) => (
            <mesh key={aIdx} position={[0, 0, zOffset]} rotation={[0, 0, 0]}>
              <torusGeometry args={[1.4, 0.08, 6, 16, Math.PI]} />
              <meshBasicMaterial color="#FFB000" />
            </mesh>
          ))}
          {/* Moving Packet 1 */}
          <mesh name="packet" position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#FFB000" emissive="#FFB000" emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
          {/* Moving Packet 2 */}
          <mesh name="packet" position={[0, 0, 2]}>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#FFB000" emissive="#FFB000" emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* CHAMBER 4 (x=18): Open Innovation & Real-World Solutions (Pumpkin and Moonlight) */}
      <group position={[18, 0, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[3.2, 3.5, 0.8, 8]} />
          <meshStandardMaterial color="#121520" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <ringGeometry args={[2.8, 3.0, 16]} />
          <meshBasicMaterial color="#FF7518" />
        </mesh>

        {/* Interlinked Polyhedra Orbit */}
        <group ref={chamber4Ref} position={[0, 3.2, 0]}>
          <mesh>
            <dodecahedronGeometry args={[1.4, 0]} />
            <meshStandardMaterial
              color="#FF7518"
              emissive="#FF7518"
              emissiveIntensity={0.7}
              wireframe
              toneMapped={false}
            />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[2.4, 0.04, 8, 32]} />
            <meshBasicMaterial color="#C8CDD8" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
