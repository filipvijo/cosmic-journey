import { useRef } from 'react'; // Remove useState if it's still there
import * as THREE from 'three'; // Keep for type hints
import { useFrame } from '@react-three/fiber';
import { Model as EarthModel } from './EarthModel';
import { Model as SunModel } from './SunModel';
import { Model as MarsModel } from './MarsModel';

// Update props interface
interface SolarSystemSceneProps {
  onPlanetSelect: (planetName: string) => void;
  // controlsRef removed
}

const earthOrbitSpeed = 0.5;
const earthOrbitRadius = 5;
const marsOrbitSpeed = 0.3;
const marsOrbitRadius = 8;

export function SolarSystemScene({ onPlanetSelect }: SolarSystemSceneProps) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const marsGroupRef = useRef<THREE.Group>(null);
  const sunGroupRef = useRef<THREE.Group>(null);

  const handlePlanetClick = (planetName: string) => {
    console.log(`Clicked on: ${planetName} - Triggering view switch.`);
    onPlanetSelect(planetName); // Directly call the function passed from App
  };

  useFrame(({ clock }) => {
    console.log("Orbit useFrame running, time:", clock.getElapsedTime()); // <-- ADD THIS LINE
    const elapsedTime = clock.getElapsedTime();

    // Earth orbit
    if (earthGroupRef.current) {
      const earthAngle = elapsedTime * earthOrbitSpeed;
      earthGroupRef.current.position.x = Math.cos(earthAngle) * earthOrbitRadius;
      earthGroupRef.current.position.z = Math.sin(earthAngle) * earthOrbitRadius;
      console.log(`Earth Position - X: ${earthGroupRef.current.position.x}, Z: ${earthGroupRef.current.position.z}`); // Log Earth coordinates
    }

    // Mars orbit
    if (marsGroupRef.current) {
      const marsAngle = elapsedTime * marsOrbitSpeed;
      marsGroupRef.current.position.x = Math.cos(marsAngle) * marsOrbitRadius;
      marsGroupRef.current.position.z = Math.sin(marsAngle) * marsOrbitRadius;
      console.log(`Mars Position - X: ${marsGroupRef.current.position.x}, Z: ${marsGroupRef.current.position.z}`); // Log Mars coordinates
    }
  });

  return (
    <>
      <group ref={sunGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Sun'); }}>
        <SunModel scale={3} />
      </group>
      <group ref={earthGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Earth'); }}>
        <EarthModel scale={0.2} />
      </group>
      <group ref={marsGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Mars'); }}>
        <MarsModel scale={0.3} />
      </group>
    </>
  );
}
