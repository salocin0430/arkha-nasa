'use client';

import { useGLTF } from '@react-three/drei';

// A basic space module component
export default function Module({ position = [0, 0.5, 0] as [number, number, number], modelUrl = '' }: { position?: [number, number, number]; modelUrl?: string }) {

    // A simple box as a placeholder
    return (
        <mesh position={position}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
                color={"#5e7da8"}
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    )
}

// TODO: Implement GLTF loading and preloading
// useGLTF.preload(modelUrl); // Example of preloading
