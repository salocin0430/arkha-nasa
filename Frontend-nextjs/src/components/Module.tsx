'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface ModuleProps {
  position: [number, number, number];
  mode: 'edit' | 'view';
}

export default function Module({ position, mode }: ModuleProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle rotation only in view mode
      if (mode === 'view') {
        meshRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  const handleClick = () => {
    if (mode === 'edit') {
      setSelected(!selected);
      console.log('Module selected for editing');
    } else {
      console.log('Module clicked for viewing details');
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial 
        color={
          mode === 'edit' 
            ? (selected ? '#EAFE07' : hovered ? '#0042A6' : '#ffffff')
            : (hovered ? '#0042A6' : '#ffffff')
        }
        metalness={0.1}
        roughness={0.2}
        emissive={
          mode === 'edit' && selected 
            ? '#EAFE07' 
            : '#000000'
        }
        emissiveIntensity={
          mode === 'edit' && selected 
            ? 0.3 
            : 0
        }
      />
    </mesh>
  );
}
