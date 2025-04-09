import React from 'react'; // <-- Added import
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

// Type definition fixed (removed GLTF & and animations)
type GLTFResult = {
    nodes: {
        Cube: THREE.Mesh;
        Circle: THREE.Mesh;
    };
    materials: {
        ['Material.001']: THREE.MeshStandardMaterial;
        ['Material.002']: THREE.MeshBasicMaterial;
    };
};

// Props type fixed
export function Model(props: React.ComponentProps<'group'>) {
    // Path looks correct, added 'as unknown' for safety based on previous fixes
    const { nodes, materials } = useGLTF('/models/saturn.glb') as unknown as GLTFResult;
    return (
        <group dispose={null}>
            <mesh name="Cube" castShadow receiveShadow geometry={nodes.Cube.geometry} material={materials['Material.001']} />
            <mesh name="Circle" castShadow receiveShadow geometry={nodes.Circle.geometry} material={materials['Material.002']} />
        </group>
    );
}

useGLTF.preload('/models/saturn.glb');