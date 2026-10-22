import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { getProceduralCloudTexture } from './proceduralTextures';

export default function ProceduralGraveyard({ tier = 'high' }) {
  const instancedMeshRef = useRef();
  const fogTex = useMemo(() => getProceduralCloudTexture(), []);

  // Determine tombstone count based on performance tier
  const count = tier === 'low' ? 14 : tier === 'medium' ? 24 : 36;

  // Generate varied tombstone transforms (positions, slight rotational tilts)
  const tombTransforms = useMemo(() => {
    const list = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      // Place tombstones on left and right flanks, keeping central approach path clear
      const isLeft = i % 2 === 0;
      const xSign = isLeft ? -1 : 1;
      const x = xSign * (6.5 + Math.random() * 14);
      const z = 8 + Math.random() * 22;
      const y = 0.55;

      dummy.position.set(x, y, z);
      // Small random tilts (crooked graveyard aesthetic)
      dummy.rotation.x = (Math.random() - 0.5) * 0.15;
      dummy.rotation.y = (Math.random() - 0.5) * 0.4;
      dummy.rotation.z = (Math.random() - 0.5) * 0.18;

      const scaleY = 0.8 + Math.random() * 0.5;
      dummy.scale.set(1, scaleY, 1);
      dummy.updateMatrix();
      list.push(dummy.matrix.clone());
    }
    return list;
  }, [count]);

  useEffect(() => {
    if (!instancedMeshRef.current) return;
    tombTransforms.forEach((matrix, i) => {
      instancedMeshRef.current.setMatrixAt(i, matrix);
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [tombTransforms]);

  return (
    <group>
      {/* Dark Ground Plane */}
      <mesh position={[0, -0.01, 15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[120, 100, 16, 16]} />
        <meshStandardMaterial
          color="#060910"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Central Cobblestone Approach Path */}
      <mesh position={[0, 0.01, 16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.2, 32]} />
        <meshStandardMaterial
          color="#101420"
          roughness={0.9}
        />
      </mesh>

      {/* Instanced Tombstones */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[null, null, count]}
      >
        <boxGeometry args={[0.9, 1.3, 0.25]} />
        <meshStandardMaterial
          color="#161B28"
          roughness={0.9}
          metalness={0.1}
        />
      </instancedMesh>

      {/* Low Iron Fence Segments flanking path */}
      {[-4.5, 4.5].map((xPos, idx) => (
        <group key={idx} position={[xPos, 0.5, 16]}>
          {/* Horizontal rails */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.08, 0.08, 24]} />
            <meshStandardMaterial color="#0E121B" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <boxGeometry args={[0.08, 0.08, 24]} />
            <meshStandardMaterial color="#0E121B" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Vertical Picketing */}
          {Array.from({ length: 16 }).map((_, pIdx) => (
            <mesh key={pIdx} position={[0, 0.45, -11 + pIdx * 1.5]}>
              <cylinderGeometry args={[0.04, 0.04, 1.1, 4]} />
              <meshStandardMaterial color="#0E121B" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Multi-layered Ground Fog Planes */}
      {[0.4, 0.8, 1.2].map((yHeight, idx) => (
        <mesh
          key={idx}
          position={[0, yHeight, 18 + idx * 4]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[65, 35]} />
          <meshBasicMaterial
            map={fogTex}
            transparent
            opacity={0.35 - idx * 0.08}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
