import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraRig({
  scrollProgress = 0,
  activeTrackIdx = 0,
  isReducedMotion = false,
  tier = 'high'
}) {
  const { camera, size } = useThree();
  const pointerParallax = useRef({ x: 0, y: 0 });
  const smoothedTarget = useRef(new THREE.Vector3(0, 6, 0));
  const isMobile = size.width < 768;

  // Build CatmullRomCurve3 curves for camera position and look-at
  const { posCurve, lookCurve } = useMemo(() => {
    // Desktop vs Mobile keyframe positions
    const posPoints = isMobile
      ? [
          new THREE.Vector3(0, 3.2, 42),     // Hero (pulled back for mobile vertical FOV)
          new THREE.Vector3(0, 2.2, 16),     // A: Gate
          new THREE.Vector3(0, 2.0, 3),      // A to B: Door approach
          new THREE.Vector3(0, 2.4, -9),     // A to B: Interior
          new THREE.Vector3(0, 3.5, -28),    // B: Laboratory
          new THREE.Vector3(0, 3.5, -78),    // C: Chambers overview
          new THREE.Vector3(0, 3.5, -165),   // D: Chronicles
          new THREE.Vector3(0, 4.0, -214),   // E: Judges
          new THREE.Vector3(0, 3.0, -242),   // F: Vault
          new THREE.Vector3(0, 3.5, -264),   // G: Alliance
          new THREE.Vector3(0, 3.5, -290)    // H: Portal
        ]
      : [
          new THREE.Vector3(0, 2.4, 34),     // Hero wide view
          new THREE.Vector3(0, 1.8, 13),     // A: Gate
          new THREE.Vector3(0, 1.8, 1),      // A to B: Door
          new THREE.Vector3(0, 2.2, -10),    // A to B: Interior
          new THREE.Vector3(0, 3.0, -26),    // B: Laboratory
          new THREE.Vector3(0, 3.0, -76),    // C: Chambers overview
          new THREE.Vector3(0, 3.0, -165),   // D: Chronicles
          new THREE.Vector3(0, 3.5, -212),   // E: Judges
          new THREE.Vector3(0, 2.5, -240),   // F: Vault
          new THREE.Vector3(0, 3.0, -262),   // G: Alliance
          new THREE.Vector3(0, 3.0, -286)    // H: Portal
        ];

    const lookPoints = isMobile
      ? [
          new THREE.Vector3(0, 8.5, 0),      // Hero Look (offset upward so title has clean sky)
          new THREE.Vector3(0, 3.5, 0),      // A: Gate
          new THREE.Vector3(0, 2.8, -30),    // Door
          new THREE.Vector3(0, 2.8, -30),    // Interior
          new THREE.Vector3(0, 3.5, -48),    // Laboratory
          new THREE.Vector3(0, 3.5, -84),    // Chambers
          new THREE.Vector3(0, 3.5, -180),   // Chronicles
          new THREE.Vector3(0, 4.2, -228),   // Judges
          new THREE.Vector3(0, 3.0, -252),   // Vault
          new THREE.Vector3(0, 4.2, -276),   // Alliance
          new THREE.Vector3(0, 4.2, -306)    // Portal
        ]
      : [
          new THREE.Vector3(0, 6.0, 0),      // Hero Look
          new THREE.Vector3(0, 3.0, 0),      // A: Gate
          new THREE.Vector3(0, 2.5, -30),    // Door
          new THREE.Vector3(0, 2.5, -30),    // Interior
          new THREE.Vector3(0, 3.0, -48),    // Laboratory
          new THREE.Vector3(0, 3.0, -84),    // Chambers
          new THREE.Vector3(0, 3.0, -180),   // Chronicles
          new THREE.Vector3(0, 4.0, -228),   // Judges
          new THREE.Vector3(0, 2.5, -252),   // Vault
          new THREE.Vector3(0, 4.0, -276),   // Alliance
          new THREE.Vector3(0, 4.0, -306)    // Portal
        ];

    return {
      posCurve: new THREE.CatmullRomCurve3(posPoints),
      lookCurve: new THREE.CatmullRomCurve3(lookPoints)
    };
  }, [isMobile]);

  // Pointer move handler on desktop for subtle parallax (bounded to a fraction of a unit)
  useEffect(() => {
    if (isMobile) return;

    const handlePointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerParallax.current.x = x * 0.8;
      pointerParallax.current.y = y * 0.4;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [isMobile]);

  useFrame((state, delta) => {
    // If reduced motion is enabled, snap camera to current progress directly
    const progress = THREE.MathUtils.clamp(scrollProgress, 0, 1);

    // Compute curve sample point
    const targetCamPos = posCurve.getPoint(progress);
    const targetLookAt = lookCurve.getPoint(progress);

    // Lateral camera shift during chamber section (progress around 0.45 to 0.55)
    if (progress > 0.42 && progress < 0.58) {
      // Offset x based on active track
      const trackXOffsets = [-12, -4, 4, 12];
      const targetX = trackXOffsets[activeTrackIdx] || 0;
      targetCamPos.x = THREE.MathUtils.lerp(targetCamPos.x, targetX, 0.35);
      targetLookAt.x = targetCamPos.x;
    }

    // Add pointer parallax on desktop or subtle sway on mobile
    if (!isReducedMotion) {
      if (isMobile) {
        // Slow sway on touch devices
        const sway = Math.sin(state.clock.elapsedTime * 0.6) * 0.25;
        targetCamPos.x += sway;
      } else {
        targetCamPos.x += pointerParallax.current.x;
        targetCamPos.y += pointerParallax.current.y;
      }
    }

    // Critically damped smoothing
    if (isReducedMotion) {
      camera.position.copy(targetCamPos);
      smoothedTarget.current.copy(targetLookAt);
    } else {
      camera.position.lerp(targetCamPos, 0.08);
      smoothedTarget.current.lerp(targetLookAt, 0.08);
    }

    camera.lookAt(smoothedTarget.current);
  });

  return null;
}
