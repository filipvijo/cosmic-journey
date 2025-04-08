import { useState } from 'react'; // Remove React from this line
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei'; // Add Stars
import { SolarSystemScene } from './components/SolarSystemScene';
import { PlanetDetailView } from './components/PlanetDetailView';
import './App.css';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  const handleBackToSystem = () => {
    setSelectedPlanet(null);
  };

  return (
    <div className="App">
      {/* Container for the 3D Canvas */}
      <div className={`view-container ${selectedPlanet === null ? 'visible' : 'hidden'}`}>
        <Canvas camera={{ position: [0, 10, 20], fov: 75 }}>
          {/* --- Add Stars component --- */}
          <Stars
            radius={100} // Radius of the inner sphere (default=100)
            depth={50} // Depth of overlap (default=50)
            count={5000} // Number of stars (default=5000)
            factor={4} // Size factor (default=4)
            saturation={0} // Saturation 0 = white stars (default=0)
            fade // Fades stars towards periphery (default=false)
            speed={1} // Animation speed (default=1)
          />
          {/* --- End Stars --- */}

          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} target-position={[0, 0, 0]} />
          {/* Pass only onPlanetSelect now */}
          <SolarSystemScene onPlanetSelect={setSelectedPlanet} />
          <OrbitControls /> {/* Back to OrbitControls */}
        </Canvas>
      </div>

      {/* Container for the Detail View */}
      {selectedPlanet !== null && (
        <div className={`view-container ${selectedPlanet !== null ? 'visible' : 'hidden'}`}>
          <PlanetDetailView
            selectedPlanet={selectedPlanet}
            onBack={handleBackToSystem}
          />
        </div>
      )}
    </div>
  );
}

export default App;