import React, { useState, useEffect, useRef } from 'react';
import './SpeechToText.css';

const SpeechToText = () => {
  const [text, setText] = useState([]); // Text to display on both sender and receiver sides
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [role, setRole] = useState(null); // 'sender' or 'receiver'
  const recognitionRef = useRef(null);
  const socketRef = useRef(null);
  const lastTextRef = useRef(null);

  useEffect(() => {
    if (role) {
      socketRef.current = new WebSocket('ws://localhost:5000'); // Adjust URL as needed

      socketRef.current.onmessage = async (event) => {
        try {
          const data = await event.data.text(); // Convert Blob to text
          const receivedData = JSON.parse(data);

          if (receivedData.type === 'final') {
            setText((prevText) => [...prevText, receivedData.text]);
            setInterimText(''); // Clear interim text once the final text is received
          } else if (receivedData.type === 'interim') {
            setInterimText(receivedData.text); // Update interim text
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      return () => {
        socketRef.current.close();
      };
    }
  }, [role]);

  useEffect(() => {
    if (role === 'sender') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true; // Keep listening even after pauses
        recog.interimResults = true;
        recog.lang = 'en-IN';

        recog.onresult = (event) => {
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim();
            if (event.results[i].isFinal) {
              setText((prevText) => [...prevText, transcript]);
              socketRef.current.send(JSON.stringify({ type: 'final', text: transcript }));
            } else {
              interimTranscript += transcript + ' ';
              socketRef.current.send(JSON.stringify({ type: 'interim', text: interimTranscript }));
            }
          }

          setInterimText(interimTranscript);
        };

        recog.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };

        recog.onend = () => {
          if (isListening) {
            recog.start(); // Restart listening if it's still active
          }
        };

        recognitionRef.current = recog;
      } else {
        alert('Your browser does not support speech recognition.');
      }
    }
  }, [isListening, role]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (lastTextRef.current) {
      lastTextRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [text]);

  return (
    <div className="speech-to-text-container">
      {role === null && (
        <div className="role-selection">
          <button onClick={() => setRole('sender')} className="role-button">
            Start as Sender
          </button>
          <button onClick={() => setRole('receiver')} className="role-button">
            Start as Receiver
          </button>
        </div>
      )}
      {role && (
        <div className="role-content">
          {role === 'sender' && (
            <div>
              <div className="role-selection">
                <button onClick={isListening ? stopListening : startListening} className="listen-button">
                  {isListening ? 'Stop Listening' : 'Start Listening'}
                </button>
              </div>
              <div className="text-output sender">
                {text.map((line, index) => (
                  <p key={index} ref={index === text.length - 1 ? lastTextRef : null}>
                    {line}
                  </p>
                ))}
                {interimText && <p style={{ color: 'gray' }}>{interimText}</p>}
              </div>
            </div>
          )}
          {role === 'receiver' && (
            <div className="text-output receiver">
              {text.map((line, index) => (
                <p key={index} ref={index === text.length - 1 ? lastTextRef : null}>
                  {line}
                </p>
              ))}
              {interimText && <p style={{ color: 'gray' }}>{interimText}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
