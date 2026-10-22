import React from 'react';
import { RUBRIC_CRITERIA } from '../../data/rubric';

export default function ProceduralJudges() {
  // Six pillars scaled proportionally to criteria points (10, 10, 15, 5, 10, 10)
  // Base height factor = 0.35m per point -> 5pts = 1.75m, 10pts = 3.5m, 15pts = 5.25m
  return (
    <group position={[0, 0, -222]}>
      {/* Stone Arena Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[14, 15, 0.8, 16]} />
        <meshStandardMaterial color="#0A0C14" roughness={0.9} />
      </mesh>

      {/* Six Rubric Pillars */}
      {RUBRIC_CRITERIA.map((criterion, idx) => {
        const height = criterion.maxPoints * 0.35;
        const xPos = -7.5 + idx * 3.0;

        return (
          <group key={criterion.id} position={[xPos, 0, 0]}>
            {/* Hexagonal Stone Pillar */}
            <mesh position={[0, height / 2, 0]}>
              <cylinderGeometry args={[0.9, 1.0, height, 6]} />
              <meshStandardMaterial
                color="#121622"
                roughness={0.8}
                metalness={0.2}
              />
            </mesh>
            {/* Emissive Point Ring at Capital */}
            <mesh position={[0, height + 0.1, 0]}>
              <ringGeometry args={[0.65, 0.85, 16]} />
              <meshBasicMaterial
                color={criterion.maxPoints === 15 ? '#FF7518' : '#A3FF12'}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
