import { useState } from 'react'; 
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars /*, HemisphereLight*/ } from '@react-three/drei'; // Remove HemisphereLight
import * as THREE from 'three'; // Ensure three.js is imported
import { SolarSystemScene } from './components/SolarSystemScene.js';
import { PlanetDetailView } from './components/PlanetDetailView.js';
import { ApodModal } from './components/ApodModal';
import './App.css';

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [apodData, setApodData] = useState<any>(null); // Use the ApodData interface here too
  const [isApodLoading, setIsApodLoading] = useState<boolean>(false);
  const [apodError, setApodError] = useState<string | null>(null);
  const [showApodModal, setShowApodModal] = useState<boolean>(false);

  const fetchApodData = async () => {
    console.log("Fetching APOD data...");
    setIsApodLoading(true);
    setApodError(null);
    try {
        const response = await fetch('/api/getApod'); // Call your new endpoint
        if (!response.ok) {
            let errorMsg = `APOD Fetch error! Status: ${response.status}`;
            try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
            throw new Error(errorMsg);
        }
        const data = await response.json();
        setApodData(data); // Store the fetched data
        console.log("APOD data received:", data);
        return data; // Return data for handler
    } catch (e: any) {
        console.error("Failed to fetch APOD data:", e);
        setApodError(`Failed to load Picture of the Day. (${e.message})`);
        return null; // Indicate failure
    } finally {
        setIsApodLoading(false);
    }
  };

  const handleBackToSystem = () => {
    setSelectedPlanet(null);
  };

  const handleApodButtonClick = async () => {
    let currentApodData = apodData;
    if (!currentApodData) {
        currentApodData = await fetchApodData();
    }
    if (currentApodData) {
        setShowApodModal(true);
    } else {
        if (!isApodLoading) {
            alert(`Could not load Picture of the Day. ${apodError || 'Please try again.'}`);
        }
    }
  };

  return (
    <div className="App">
      {selectedPlanet === null && (
        <button
          onClick={handleApodButtonClick}
          disabled={isApodLoading}
          className="generate-button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 10,
          }}
          title="Astronomy Picture of the Day"
        >
          {isApodLoading ? 'Loading...' : 'APOD'}
        </button>
      )}

      <div className={`view-container ${selectedPlanet === null ? 'visible' : 'hidden'}`}>
        <Canvas camera={{ position: [0, 10, 20], fov: 75 }}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <ambientLight intensity={0.4} />
          <directionalLight position={[15, 15, 8]} intensity={2.2} color="#FFF8E7" target-position={[0, 0, 0]} />
          
          <primitive
              object={new THREE.HemisphereLight(
                  0x87CEEB, // Sky Color (hex code for the blueish color we used)
                  0x101020, // Ground Color (hex code for dark ground we used)
                  0.3       // Intensity (same as before)
              )}
          />
          
          <SolarSystemScene onPlanetSelect={setSelectedPlanet} />
          <OrbitControls />
        </Canvas>
      </div>

      {selectedPlanet !== null && (
        <div className={`view-container ${selectedPlanet !== null ? 'visible' : 'hidden'}`}>
          <PlanetDetailView
            selectedPlanet={selectedPlanet}
            onBack={handleBackToSystem}
          />
        </div>
      )}

      {showApodModal && apodData && (
        <ApodModal data={apodData} onClose={() => setShowApodModal(false)} />
      )}
    </div>
  );
}

export default App;