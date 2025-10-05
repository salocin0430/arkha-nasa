'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import Module from './Module';

export default function Scene() {
    return (
        <Canvas 
            camera={{ position: [0, 2, 10], fov: 50 }}
            className="w-full h-full"
        >
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <Environment preset="sunset" />

            {/* Controls */}
            <OrbitControls 
                makeDefault 
                minDistance={2} 
                maxDistance={50} 
                maxPolarAngle={Math.PI / 2.1} 
            />

            {/* Helpers */}
            <Grid
                infiniteGrid
                fadeDistance={50}
                fadeStrength={5}
                cellSize={1}
                sectionSize={5}
                sectionColor={"#40557d"}
                cellColor={"#2c3e50"}
            />

            {/* TODO: Add Space Modules */}
            <Module position={[-2, 0.5, 0]} />
            <Module position={[0, 0.5, -2]} />
            <Module position={[2, 0.5, 0]} />


        </Canvas>
    );
}
