import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, MathUtils } from 'three';
import { Edges } from '@react-three/drei';
import { PartConfig } from '../types';

interface AnimatedPartProps {
  config: PartConfig;
  progressRef: React.MutableRefObject<number>;
}

export const AnimatedPart: React.FC<AnimatedPartProps> = ({ config, progressRef }) => {
  const meshRef = useRef<Mesh>(null);
  
  // Pre-calculate vectors to avoid garbage collection per frame
  const startVec = useMemo(() => new Vector3(...config.explodedPos), [config.explodedPos]);
  const endVec = useMemo(() => new Vector3(...config.assembledPos), [config.assembledPos]);

  useFrame(() => {
    if (!meshRef.current) return;

    // Calculate local progress for this specific part based on delay/duration
    const globalP = progressRef.current;
    
    let localP = (globalP - config.delay) / config.duration;
    localP = MathUtils.clamp(localP, 0, 1);
    
    // Smoother cubic easing
    const t = localP < 0.5 ? 4 * localP * localP * localP : 1 - Math.pow(-2 * localP + 2, 3) / 2;

    meshRef.current.position.lerpVectors(startVec, endVec, t);
  });

  return (
    <mesh
      ref={meshRef}
      rotation={config.rotation ? [config.rotation[0], config.rotation[1], config.rotation[2]] : [0, 0, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={config.args} />
      <meshStandardMaterial
        color={config.color}
        transparent={config.opacity !== undefined && config.opacity < 1}
        opacity={config.opacity ?? 1}
        metalness={config.metalness ?? 0.2}
        roughness={config.roughness ?? 0.8}
      />
      {/* Adds the black technical drawing outlines */}
      <Edges 
        threshold={15} // Only render edges for angles > 15 degrees
        color="#101010"
        scale={1.001} // Slight offset to prevent z-fighting
      />
    </mesh>
  );
};