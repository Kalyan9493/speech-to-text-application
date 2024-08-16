import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const HomePage = () => {
  const handleGenerateLink = () => {
    const link = generateShareableLink();
    // Optionally, copy the link to clipboard or display it
    alert(`Shareable link: ${link}`);
  };

  return (
    <div>
      <h1>Welcome to the Speech-to-Text App</h1>
      <button onClick={handleGenerateLink}>Generate Shareable Link</button>
    </div>
  );
};

const generateShareableLink = () => {
    const sessionId = uuidv4(); // Generate a unique session ID
    const shareableLink = `${window.location.origin}/transcription/${sessionId}`;
    console.log('Share this link:', shareableLink);
    return shareableLink;
  };

export default HomePage;
