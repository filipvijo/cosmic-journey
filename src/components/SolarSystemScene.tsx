import { useRef } from 'react'; // Remove useState if it's still there
import * as THREE from 'three'; // Keep for type hints
import { useFrame } from '@react-three/fiber';
import { Model as EarthModel } from './EarthModel';
import { Model as SunModel } from './SunModel';
import { Model as MarsModel } from './MarsModel';
import { Model as JupiterModel } from './JupiterModel';
import { Model as SaturnModel } from './SaturnModel';

// Update props interface
interface SolarSystemSceneProps {
  onPlanetSelect: (planetName: string) => void;
  // controlsRef removed
}

const earthOrbitSpeed = 0.5;
const earthOrbitRadius = 5;
const marsOrbitSpeed = 0.3;
const marsOrbitRadius = 8;
const jupiterOrbitRadius = 15;
const jupiterOrbitSpeed = 0.003;
const saturnOrbitRadius = 25;
const saturnOrbitSpeed = 0.0015;

export function SolarSystemScene({ onPlanetSelect }: SolarSystemSceneProps) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const marsGroupRef = useRef<THREE.Group>(null);
  const sunGroupRef = useRef<THREE.Group>(null);
  const jupiterGroupRef = useRef<THREE.Group>(null);
  const saturnGroupRef = useRef<THREE.Group>(null);

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

    // --- ADD JUPITER ORBIT LOGIC ---
    if (jupiterGroupRef.current) {
      const jupiterAngle = elapsedTime * jupiterOrbitSpeed; // Use Jupiter's constants
      const newX = Math.cos(jupiterAngle) * jupiterOrbitRadius;
      const newZ = Math.sin(jupiterAngle) * jupiterOrbitRadius;
      jupiterGroupRef.current.position.x = newX;
      jupiterGroupRef.current.position.z = newZ;
    }
    // --- END JUPITER ---

    // --- ADD SATURN ORBIT LOGIC ---
    if (saturnGroupRef.current) {
      const saturnAngle = elapsedTime * saturnOrbitSpeed; // Use Saturn's constants
      const newX = Math.cos(saturnAngle) * saturnOrbitRadius;
      const newZ = Math.sin(saturnAngle) * saturnOrbitRadius;
      saturnGroupRef.current.position.x = newX;
      saturnGroupRef.current.position.z = newZ;
    }
    // --- END SATURN ---
  });

  return (
    <> {/* Opening Fragment Tag */}
      <group ref={sunGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Sun'); }}>
        <SunModel scale={5} />
      </group>
      <group ref={earthGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Earth'); }}>
        <EarthModel scale={0.1} />
      </group>
      <group ref={marsGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Mars'); }}>
        <MarsModel scale={0.3} />
      </group>
      {/* --- Jupiter --- */}
      <group
        ref={jupiterGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          handlePlanetClick('Jupiter');
        }}
      >
        <JupiterModel scale={2.5} /> {/* Adjust scale */}
      </group>

      {/* --- Saturn --- */}
      <group
        ref={saturnGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          handlePlanetClick('Saturn');
        }}
      >
        <SaturnModel scale={2.2} />
      </group>
      </>
  );
}
