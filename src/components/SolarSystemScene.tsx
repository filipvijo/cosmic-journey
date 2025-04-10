import { useRef } from 'react'; 
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Model as EarthModel } from './EarthModel';
import { Model as SunModel } from './SunModel';
import { Model as MarsModel } from './MarsModel';
import { Model as JupiterModel } from './JupiterModel';
import { Model as SaturnModel } from './SaturnModel';
import { Model as VenusModel } from './VenusModel';
import { Model as MercuryModel } from './MercuryModel';
import { Model as UranusModel } from './UranusModel';
import { Model as NeptuneModel } from './NeptuneModel';

interface SolarSystemSceneProps {
  onPlanetSelect: (planetName: string) => void;
}

const earthOrbitSpeed = 0.5;
const earthOrbitRadius = 5;
const marsOrbitSpeed = 0.3;
const marsOrbitRadius = 8;
const jupiterOrbitRadius = 15;
const jupiterOrbitSpeed = 0.003;
const saturnOrbitRadius = 25;
const saturnOrbitSpeed = 0.0015;
const venusOrbitRadius = 3.5; // Example radius
const venusOrbitSpeed = 0.8;  // Example speed (faster than Earth)
const mercuryOrbitRadius = 2;  // Example radius
const mercuryOrbitSpeed = 1.2; // Example speed (fastest inner)
const uranusOrbitRadius = 35;
const uranusOrbitSpeed = 0.0008;
const neptuneOrbitRadius = 45;
const neptuneOrbitSpeed = 0.0005;

export function SolarSystemScene({ onPlanetSelect }: SolarSystemSceneProps) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const marsGroupRef = useRef<THREE.Group>(null);
  const sunGroupRef = useRef<THREE.Group>(null);
  const jupiterGroupRef = useRef<THREE.Group>(null);
  const saturnGroupRef = useRef<THREE.Group>(null);
  const venusGroupRef = useRef<THREE.Group>(null);
  const mercuryGroupRef = useRef<THREE.Group>(null);
  const uranusGroupRef = useRef<THREE.Group>(null);
  const neptuneGroupRef = useRef<THREE.Group>(null);

  const handlePlanetClick = (planetName: string) => {
    console.log(`Clicked on: ${planetName} - Triggering view switch.`);
    onPlanetSelect(planetName);
  };

  useFrame(({ clock }) => {
    console.log("Orbit useFrame running, time:", clock.getElapsedTime());
    const elapsedTime = clock.getElapsedTime();

    // Earth orbit
    if (earthGroupRef.current) {
      const earthAngle = elapsedTime * earthOrbitSpeed;
      earthGroupRef.current.position.x = Math.cos(earthAngle) * earthOrbitRadius;
      earthGroupRef.current.position.z = Math.sin(earthAngle) * earthOrbitRadius;
      console.log(`Earth Position - X: ${earthGroupRef.current.position.x}, Z: ${earthGroupRef.current.position.z}`);
    }

    // Mars orbit
    if (marsGroupRef.current) {
      const marsAngle = elapsedTime * marsOrbitSpeed;
      marsGroupRef.current.position.x = Math.cos(marsAngle) * marsOrbitRadius;
      marsGroupRef.current.position.z = Math.sin(marsAngle) * marsOrbitRadius;
      console.log(`Mars Position - X: ${marsGroupRef.current.position.x}, Z: ${marsGroupRef.current.position.z}`);
    }

    // Mercury orbit
    if (mercuryGroupRef.current) {
      const mercuryAngle = elapsedTime * mercuryOrbitSpeed;
      const newX = Math.cos(mercuryAngle) * mercuryOrbitRadius;
      const newZ = Math.sin(mercuryAngle) * mercuryOrbitRadius;
      mercuryGroupRef.current.position.x = newX;
      mercuryGroupRef.current.position.z = newZ;
    }

    // Venus orbit
    if (venusGroupRef.current) {
      const venusAngle = elapsedTime * venusOrbitSpeed;
      const newX = Math.cos(venusAngle) * venusOrbitRadius;
      const newZ = Math.sin(venusAngle) * venusOrbitRadius;
      venusGroupRef.current.position.x = newX;
      venusGroupRef.current.position.z = newZ;
    }

    // Jupiter orbit
    if (jupiterGroupRef.current) {
      const jupiterAngle = elapsedTime * jupiterOrbitSpeed;
      const newX = Math.cos(jupiterAngle) * jupiterOrbitRadius;
      const newZ = Math.sin(jupiterAngle) * jupiterOrbitRadius;
      jupiterGroupRef.current.position.x = newX;
      jupiterGroupRef.current.position.z = newZ;
    }

    // Saturn orbit
    if (saturnGroupRef.current) {
      const saturnAngle = elapsedTime * saturnOrbitSpeed;
      const newX = Math.cos(saturnAngle) * saturnOrbitRadius;
      const newZ = Math.sin(saturnAngle) * saturnOrbitRadius;
      saturnGroupRef.current.position.x = newX;
      saturnGroupRef.current.position.z = newZ;
    }

    // Uranus orbit
    if (uranusGroupRef.current) {
      const uranusAngle = elapsedTime * uranusOrbitSpeed;
      const newX = Math.cos(uranusAngle) * uranusOrbitRadius;
      const newZ = Math.sin(uranusAngle) * uranusOrbitRadius;
      uranusGroupRef.current.position.x = newX;
      uranusGroupRef.current.position.z = newZ;
    }

    // Neptune orbit
    if (neptuneGroupRef.current) {
      const neptuneAngle = elapsedTime * neptuneOrbitSpeed;
      const newX = Math.cos(neptuneAngle) * neptuneOrbitRadius;
      const newZ = Math.sin(neptuneAngle) * neptuneOrbitRadius;
      neptuneGroupRef.current.position.x = newX;
      neptuneGroupRef.current.position.z = newZ;
    }
  });

  return (
    <>
      {/* Sun */}
      <group ref={sunGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Sun'); }} scale={3}>
        <SunModel />
        {/* --- Add Point Light for Glow --- */}
        <pointLight
          intensity={300}      // How bright? May need large values depending on scale/renderer settings
          distance={15}       // How far the light reaches (approx Jupiter's orbit radius?) - Adjust!
          color="#FFDAAA"     // Warm yellowish color
          decay={2}           // How light falls off with distance (2 is physically realistic)
        />
        {/* --- End Point Light --- */}
      </group>

      {/* Mercury */}
      <group ref={mercuryGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Mercury'); }} scale={0.2}>
        <MercuryModel />
      </group>

      {/* Venus */}
      <group ref={venusGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Venus'); }} scale={0.3}>
        <VenusModel />
      </group>

      {/* Earth */}
      <group ref={earthGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Earth'); }} scale={0.2}>
        <EarthModel />
      </group>

      {/* Mars */}
      <group ref={marsGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Mars'); }} scale={0.1}>
        <MarsModel />
      </group>

      {/* Jupiter */}
      <group
        ref={jupiterGroupRef} onClick={(e) => {
          e.stopPropagation();
          handlePlanetClick('Jupiter');
        }}
        scale={2.5}
      >
        <JupiterModel />
      </group>

      {/* Saturn */}
      <group
        ref={saturnGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          handlePlanetClick('Saturn');
        }}
        scale={2.2}
      >
        <SaturnModel />
      </group>

      {/* Uranus */}
      <group ref={uranusGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Uranus'); }} scale={1.5}> {/* Adjust scale */}
        <UranusModel />
      </group>
      
      {/* Neptune */}
      <group ref={neptuneGroupRef} onClick={(e) => { e.stopPropagation(); handlePlanetClick('Neptune'); }} scale={1.45}> {/* Adjust scale */}
        <NeptuneModel />
      </group>
    </>
  );
}
