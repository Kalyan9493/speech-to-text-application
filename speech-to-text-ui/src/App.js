import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SpeechToText from './SpeechToText';
import HomePage from './HomePage';

const App = () => (
  <Router>
    <Routes>
      <Route path="/transcription/:sessionId" element={<SpeechToText />} />
      <Route path="/" element={<HomePage />} />
    </Routes>
  </Router>
);

export default App;
