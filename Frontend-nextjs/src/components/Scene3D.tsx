'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { Suspense } from 'react';
import Module from './Module';

interface Scene3DProps {
  missionId: string;
  mode: 'edit' | 'view';
}

export default function Scene3D({ mode }: Scene3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ 
          position: [10, 10, 10], 
          fov: 50 
        }}
        style={{ background: 'linear-gradient(135deg, #0042A6 0%, #07173F 100%)' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          {/* Environment */}
          <Environment preset="night" />
          
          {/* Grid */}
          <Grid 
            args={[20, 20]} 
            position={[0, -1, 0]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#EAFE07"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#0042A6"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            infiniteGrid={true}
          />
          
          {/* Test Module */}
          <Module position={[0, 0, 0]} mode={mode} />
          
          {/* Controls */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
