import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTones, setSelectedTones] = useState([]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const tones = ["Empathetic", "Optimistic", "Formal", "Informal", "Humorous", "Neutral"];

  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
  };

  const formatResponse = (text) => {
    return text.split('\n\n').map((paragraph, index) => {
      if (paragraph.match(/^\d+\./m)) {
        const items = paragraph.split(/(?=\d+\.)/);
        return (
          <div key={index} className="list-container">
            {items.map((item, itemIndex) => {
              if (!item.trim()) return null;
              return (
                <div key={itemIndex} className="list-item">
                  {formatBoldText(item)}
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <p key={index} className="response-paragraph">
          {formatBoldText(paragraph)}
        </p>
      );
    });
  };

  const handleToneSelection = (tone) => {
    setSelectedTones((prev) => {
      if (prev.includes(tone)) {
        // Deselect tone if already selected
        return prev.filter((t) => t !== tone);
      } else if (prev.length === 2) {
        // Replace the first selected tone with the new one
        return [prev[1], tone];
      }
      // Select new tone if less than 2 are selected
      return [...prev, tone];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let toneMessage = '';
    if (selectedTones.length === 1) {
      toneMessage = `Give the reply in ${selectedTones[0]} tone.`;
    } else if (selectedTones.length === 2) {
      toneMessage = `Give the reply in ${selectedTones[0]} and ${selectedTones[1]} tones.`;
    }

    const defaultLine = "Create me a COVER LETTER for the (Job description) below. Also improvised the COVER LETTER by adding the below message : ";
    const jobDescriptionLine = "(Job description is as mentioned below):";
    
    const modifiedMessage = `${defaultLine}\n${customMessage}\n${toneMessage}\n${jobDescriptionLine}\n${message}`;

    try {
      const res = await axios.post('http://localhost:5000/api/chat', { message: modifiedMessage });
      setResponse(res.data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred while fetching response');
    }

    setLoading(false);
    setMessage('');
    setCustomMessage('');
    setSelectedTones([]);
  };

  const countWords = (text) => text.trim().split(/\s+/).length;

  return (
    <div className="app-container">
      <h1 className="app-title">AI Cover letter Interface</h1>
      <form onSubmit={handleSubmit} className="chat-form">
        <p className="instruction-text">Select Tone (Optional, max 2):</p>
        <div className="tone-buttons">
          {tones.map((tone) => (
            <button
              key={tone}
              type="button"
              className={`tone-button ${selectedTones.includes(tone) ? 'selected' : ''}`}
              onClick={() => handleToneSelection(tone)}
            >
              {tone}
            </button>
          ))}
        </div>

        <p className="instruction-text">Enter any Custom message requirement below : (Optional)</p>
        
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          className="textarea custom-textarea"
          rows="2"
          placeholder="Enter your custom message (default line)..."
        />
        
        <p className="instruction-text">Enter or Copy-Paste your Job Description / Detail below :</p>
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="textarea main-textarea"
          rows="4"
          placeholder="Enter your main message..."
        />
        
        <button
          type="submit"
          className="submit-btn"
          disabled={loading || countWords(message) <= 3}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {response && (
        <div className="response-section">
          <h2 className="response-title">Response:</h2>
          <div className="response-content">
            {formatResponse(response)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;