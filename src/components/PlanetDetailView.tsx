import { useState, useEffect } from 'react';
// --- Import a spinner ---
import { ClipLoader } from "react-spinners";
// ---

interface PlanetDetailViewProps {
  selectedPlanet: string;
  onBack: () => void; // Function to go back
}

// Define an interface for the expected data structure (based on the API response)
interface PlanetData {
  englishName: string;
  mass: { massValue: number; massExponent: number } | null;
  meanRadius: number;
  gravity: number;
  discoveredBy: string;
  discoveryDate: string;
  moons: { moon: string; rel: string }[] | null;
}

export function PlanetDetailView({ selectedPlanet, onBack }: PlanetDetailViewProps) {
  // State variables for NASA data
  const [planetData, setPlanetData] = useState<PlanetData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // State variables for description
  const [description, setDescription] = useState<string | null>(null);
  const [isDescriptionLoading, setIsDescriptionLoading] = useState<boolean>(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // State variables for landscape image
  const [landscapeImageUrl, setLandscapeImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // --- Add state for NASA images ---
  const [nasaImages, setNasaImages] = useState<{url: string, title: string}[]>([]);
  const [isNasaImagesLoading, setIsNasaImagesLoading] = useState<boolean>(false);
  const [nasaImagesError, setNasaImagesError] = useState<string | null>(null);
  // --- ---

  // --- Add state for YouTube Videos ---
  const [youtubeVideos, setYoutubeVideos] = useState<{videoId: string, title: string, thumbnailUrl: string}[]>([]);
  const [isVideosLoading, setIsVideosLoading] = useState<boolean>(false);
  const [videosError, setVideosError] = useState<string | null>(null);
  // --- ---

  // --- Add state for Species ---
  const [speciesData, setSpeciesData] = useState<any[]>([]); // Use a proper type/interface later
  const [isSpeciesLoading, setIsSpeciesLoading] = useState<boolean>(false);
  const [speciesError, setSpeciesError] = useState<string | null>(null);
  // --- ---

  // useEffect for all fetches
  useEffect(() => {
    if (!selectedPlanet) return;

    // Fetch NASA Data
    const fetchPlanetData = async () => {
      console.log(`Frontend: Fetching data for ${selectedPlanet}`);
      setIsLoading(true);
      setError(null);
      setPlanetData(null);

      try {
        const response = await fetch(`/api/getPlanetInfo?planet=${selectedPlanet}`);
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {}
          throw new Error(errorMsg);
        }
        const data: PlanetData = await response.json();
        setPlanetData(data);
        console.log(`Frontend: Received data for ${selectedPlanet}:`, data);
      } catch (e: any) {
        console.error("Frontend: Failed to fetch planet data:", e);
        setError(`Failed to load data for ${selectedPlanet}. (${e.message})`);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch OpenAI Description
    const fetchDescription = async () => {
      console.log(`Frontend: Fetching description for ${selectedPlanet}`);
      setIsDescriptionLoading(true);
      setDescriptionError(null);
      setDescription(null);

      try {
        const response = await fetch(`/api/getPlanetDescription?planet=${selectedPlanet}`);
        if (!response.ok) {
          let errorMsg = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setDescription(data.description);
        console.log(`Frontend: Received description for ${selectedPlanet}`);
      } catch (e: any) {
        console.error("Frontend: Failed to fetch description:", e);
        setDescriptionError(`Failed to load description. (${e.message})`);
      } finally {
        setIsDescriptionLoading(false);
      }
    };

    // Fetch NASA Images
    const fetchNasaImages = async () => {
      if (!selectedPlanet) return; // Should not happen if called from useEffect, but safe check
      console.log(`Frontend: Fetching NASA images for ${selectedPlanet}`);
      setIsNasaImagesLoading(true);
      setNasaImagesError(null);
      setNasaImages([]); // Clear previous images

      try {
          const response = await fetch(`/api/getNasaImages?planet=${selectedPlanet}`);
          if (!response.ok) {
              let errorMsg = `NASA Image Fetch error! Status: ${response.status}`;
              try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
              throw new Error(errorMsg);
          }
          const data = await response.json();
          setNasaImages(data.images || []); // Set images, default to empty array if missing
          console.log(`Frontend: Received ${data.images?.length || 0} NASA images for ${selectedPlanet}`);
      } catch (e: any) {
          console.error("Frontend: Failed to fetch NASA images:", e);
          setNasaImagesError(`Failed to load NASA images. (${e.message})`);
      } finally {
          setIsNasaImagesLoading(false);
      }
    };

    // --- Add Fetch Function ---
    const fetchYouTubeVideos = async () => {
        if (!selectedPlanet) return;
        console.log(`Frontend: Fetching YouTube videos for ${selectedPlanet}`);
        setIsVideosLoading(true);
        setVideosError(null);
        setYoutubeVideos([]);

        try {
            const response = await fetch(`/api/getPlanetVideos?planet=${selectedPlanet}`);
            if (!response.ok) {
                let errorMsg = `YouTube Video Fetch error! Status: ${response.status}`;
                try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch (e) {}
                throw new Error(errorMsg);
            }
            const data = await response.json();
            setYoutubeVideos(data.videos || []);
            console.log(`Frontend: Received ${data.videos?.length || 0} YouTube videos`);
        } catch (e: any) {
            console.error("Frontend: Failed to fetch YouTube videos:", e);
            setVideosError(`Failed to load YouTube videos. (${e.message})`);
        } finally {
            setIsVideosLoading(false);
        }
    };
    // --- ---

    fetchPlanetData();
    fetchDescription();
    fetchNasaImages(); // Call the new function
    fetchYouTubeVideos(); // <-- Call the new function

    // Clear previous image state when planet changes
    setLandscapeImageUrl(null);
    setIsImageLoading(false);
    setImageError(null);

  }, [selectedPlanet]);

  // --- Handler function for the Generate button ---
  const handleGenerateLandscapeClick = async () => {
    if (!selectedPlanet) return;

    try {
      console.log(`Frontend: Requesting landscape for ${selectedPlanet}`);
      setIsImageLoading(true);
      setImageError(null);
      setLandscapeImageUrl(null);

      const response = await fetch(`/api/generateLandscape?planet=${selectedPlanet}`);

      if (!response.ok) {
        let errorMsg = `Backend error! Status: ${response.status}`;
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch(e){}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const finalImageUrl = data?.imageUrl;

      if (data.message && !finalImageUrl) {
        console.log(`Frontend: Image generation skipped by backend: ${data.message}`);
        setImageError(data.message);
      } else if (!finalImageUrl) {
        throw new Error('Backend did not return an image URL.');
      } else {
        setLandscapeImageUrl(finalImageUrl);
        console.log(`Frontend: Received landscape URL for ${selectedPlanet}`);
      }

    } catch (e: any) {
      console.error("Frontend: Failed to generate landscape:", e);
      setImageError(`Failed to load landscape. (${e.message})`);
    } finally {
      setIsImageLoading(false);
    }
  };
  // --- End of handler function ---

  // --- NEW: Handler function for the Generate Species button ---
  const handleGenerateSpeciesClick = async () => {
    if (!selectedPlanet) return;
  
    try {
      console.log(`Frontend: Requesting species for ${selectedPlanet}`);
      setIsSpeciesLoading(true);
      setSpeciesError(null);
      setSpeciesData([]); // Clear previous species
  
      const response = await fetch(`/api/generateSpecies?planet=${selectedPlanet}`);
  
      if (!response.ok) {
           let errorMsg = `Species Gen error! Status: ${response.status}`;
           try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch(e){}
           throw new Error(errorMsg);
      }
  
      const data = await response.json();
  
      if (!data.species || !Array.isArray(data.species) || data.species.length === 0) {
          throw new Error('Backend did not return valid species data.');
      }
  
      setSpeciesData(data.species); // Set the array of species objects
      console.log(`Frontend: Received species data for ${selectedPlanet}`);
      if(data.image_error) { // Check if backend reported image errors
           setSpeciesError(`Descriptions loaded, but image generation failed: ${data.image_error}`);
      }
  
    } catch (e: any) {
        console.error("Frontend: Failed to generate species:", e);
        setSpeciesError(`Failed to load species. (${e.message})`);
    } finally {
        setIsSpeciesLoading(false);
    }
  };
  // --- End of new handler function ---

  // --- Render Logic ---
  return (
    <div className="planet-detail-container"> {/* Add a class for styling */}
        {/* Header */}
        <div className="detail-header">
            <h1>{selectedPlanet}</h1>
            <button onClick={onBack} className="back-button">Back to Solar System</button>
        </div>

        {/* Main Content Grid/Flex Container */}
        <div className="detail-content">

            {/* Description Section */}
            <section className="detail-section description-section">
                <h2>Description</h2>
                {isDescriptionLoading && <div style={{ textAlign: 'center', padding: '20px' }}><ClipLoader color="#ffffff" loading={isDescriptionLoading} size={35} aria-label="Loading Description" /></div>}
                {descriptionError && <p className="error-message">{descriptionError}</p>}
                {description && !isDescriptionLoading && <p><i>{description}</i></p>}
            </section>

            {/* NASA Images Section */}
            <section className="detail-section nasa-image-section">
                <h3>Real Images from NASA</h3>
                {isNasaImagesLoading && <div style={{ textAlign: 'center', padding: '20px' }}><ClipLoader color="#ffffff" loading={isNasaImagesLoading} size={35} aria-label="Loading NASA Images" /></div>}
                {nasaImagesError && <p className="error-message">{nasaImagesError}</p>}
                {!isNasaImagesLoading && nasaImages.length > 0 && (
                    <div className="nasa-gallery">
                        {nasaImages.map((img, index) => (
                            <div key={index} className="nasa-gallery-item">
                                <img src={img.url} alt={img.title} title={img.title} />
                            </div>
                        ))}
                    </div>
                )}
                {!isNasaImagesLoading && nasaImages.length === 0 && !nasaImagesError && <p>No relevant NASA images found.</p>}
            </section>

            {/* Hypothetical Landscape Section */}
            <section className="detail-section landscape-section">
                <h3>Hypothetical Landscape</h3>
                <button onClick={handleGenerateLandscapeClick} disabled={isImageLoading} className="generate-button">
                    {isImageLoading ? 'Generating...' : 'Imagine Landscape?'}
                </button>
                {isImageLoading && <div style={{ textAlign: 'center', padding: '20px' }}><ClipLoader color="#ffffff" loading={isImageLoading} size={35} aria-label="Generating Landscape" /></div>}
                {imageError && <p className="error-message">{imageError}</p>}
                {landscapeImageUrl && !isImageLoading && (
                    <img src={landscapeImageUrl} alt={`Hypothetical landscape of ${selectedPlanet}`} className="landscape-image" />
                )}
            </section>

            {/* Hypothetical Species Section */}
            <section className="detail-section species-section">
                <h3>Hypothetical Species</h3>
                <button onClick={handleGenerateSpeciesClick} disabled={isSpeciesLoading} className="generate-button">
                    {isSpeciesLoading ? 'Generating...' : 'Generate Species Concepts'}
                </button>
                {isSpeciesLoading && <div style={{ textAlign: 'center', padding: '20px' }}><ClipLoader color="#ffffff" loading={isSpeciesLoading} size={35} aria-label="Generating Species" /></div>}
                {speciesError && <p className="error-message">{speciesError}</p>}
                {speciesData.length > 0 && !isSpeciesLoading && (
                    <div className="species-grid">
                        {speciesData.map((species, index) => (
                            <div key={index} className="species-card">
                                <h4>{species.name} <em>({species.category})</em></h4>
                                {species.imageUrl ? (
                                    <img src={species.imageUrl} alt={`Hypothetical ${species.category} ${species.name}`} />
                                ) : (
                                    <div className="image-placeholder">Image failed</div>
                                )}
                                <p>{species.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Related Videos Section */}
            <section className="detail-section videos-section">
                <h3>Related Videos</h3>
                {isVideosLoading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <ClipLoader color="#ffffff" loading={isVideosLoading} size={35} aria-label="Loading Videos" />
                    </div>
                )}
                {videosError && <p className="error-message">{videosError}</p>}
                {!isVideosLoading && youtubeVideos.length === 0 && !videosError && <p>No relevant videos found.</p>}
                {youtubeVideos.length > 0 && (
                    <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '10px', gap: '10px' }}>
                        {youtubeVideos.map((video) => (
                            <div key={video.videoId} style={{ flex: '0 0 auto', textAlign: 'center' }}>
                                <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        title={video.title}
                                        style={{ width: '160px', height: 'auto', border: '1px solid grey' }}
                                    />
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Facts Section */}
            <section className="detail-section facts-section">
                <h3>Facts & Figures</h3>
                {isLoading && <div style={{ textAlign: 'center', padding: '20px' }}><ClipLoader color="#ffffff" loading={isLoading} size={35} aria-label="Loading Facts" /></div>}
                {error && <p className="error-message">{error}</p>}
                {planetData && !isLoading && (
                    <div>
                        <p><strong>Mean Radius:</strong> {planetData.meanRadius?.toLocaleString()} km</p>
                        <p><strong>Mass (kg):</strong> {planetData.mass ? `${planetData.mass.massValue} x 10^${planetData.mass.massExponent}` : 'N/A'}</p>
                        <p><strong>Gravity (m/s²):</strong> {planetData.gravity}</p>
                        <p><strong>Discovered By:</strong> {planetData.discoveredBy || 'N/A'}</p>
                        <p><strong>Discovery Date:</strong> {planetData.discoveryDate || 'N/A'}</p>
                        {planetData.moons && planetData.moons.length > 0 && (
                            <div>
                                <strong>Moons ({planetData.moons.length}):</strong>
                                <ul>
                                    {planetData.moons.slice(0, 10).map(moon => <li key={moon.moon}>{moon.moon}</li>)}
                                    {planetData.moons.length > 10 && <li>...and more</li>}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </section>

        </div> {/* End detail-content */}
    </div> // End planet-detail-container
);
}
