import React from 'react';

// Define expected structure of APOD data
interface ApodData {
  title: string;
  explanation: string;
  date: string;
  url: string;
  hdurl?: string; // Optional high-res URL
  media_type: 'image' | 'video';
  copyright?: string;
}

interface ApodModalProps {
  data: ApodData | null;
  onClose: () => void; // Function to close the modal
}

// Basic styling for modal (inline, move to CSS later)
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)', // Semi-transparent black
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000, // Ensure it's on top
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#1a1a1a', // Dark background for content
  color: 'white',
  padding: '25px',
  borderRadius: '5px',
  maxWidth: '80vw', // Max width
  maxHeight: '85vh', // Max height
  overflowY: 'auto', // Scroll if content overflows
  position: 'relative', // For positioning close button
  border: '1px solid var(--border-color)',
};

const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '1.5rem',
    cursor: 'pointer',
};

export function ApodModal({ data, onClose }: ApodModalProps) {
  if (!data) return null; // Don't render if no data

  return (
    <div style={modalOverlayStyle} onClick={onClose}> {/* Close on overlay click */}
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking content */}
        <button style={closeButtonStyle} onClick={onClose} title="Close">&times;</button>
        <h2>Astronomy Picture of the Day: {data.title}</h2>
        <p><em>{data.date}</em></p>

        {data.media_type === 'image' && (
          <a href={data.hdurl || data.url} target="_blank" rel="noopener noreferrer">
            <img
              src={data.url} // Use standard URL for preview
              alt={data.title}
              style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '15px 0' }}
            />
          </a>
        )}

        {data.media_type === 'video' && (
          <div style={{marginTop: '15px'}}>
             <p>Today's APOD is a video. <a href={data.url} target="_blank" rel="noopener noreferrer">Watch it here</a>.</p>
             {/* Or attempt to embed if it's YouTube/Vimeo - more complex */}
             {/* Example for YouTube (requires parsing URL): */}
             {/* <iframe width="560" height="315" src={`https://www.youtube.com/embed/...`} title="YouTube video player" frameBorder="0" allowFullScreen></iframe> */}
          </div>
        )}

        <p style={{fontSize: '0.9em', lineHeight: '1.5'}}>{data.explanation}</p>
        {data.copyright && <p style={{fontSize: '0.8em', color: '#aaa', marginTop: '15px'}}>Copyright: {data.copyright}</p>}
      </div>
    </div>
  );
}
