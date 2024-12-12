import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css"; 

function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [happeningAt, setHappeningAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError("You need to be logged in to create an event");
      return;
    }

    
    const payload = {
      token: authToken,
      title,
      description,
      location,
      happening_at: happeningAt, 
      photos: "{}"
    };

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const data = await response.json();
      alert(data.message || 'Event created successfully!');
      setLoading(false);
      navigate('/');
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="create-event-container">
      <h2>Sukurti naują renginį</h2>
      {error && <div className="error-message">{error}</div>}
      <form className="create-event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Renginio pavadinimas</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Įrašyti renginio pavadinimas"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Renginio aprašymas</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Įrašyti renginio aprašymą"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Renginio lokacija</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Įrašyti renginio lokacija"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="happeningAt">Renginio data</label>
          <input
            type="datetime-local"
            id="happeningAt"
            value={happeningAt}
            onChange={(e) => setHappeningAt(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="create-event-button" disabled={loading}>
          {loading ? 'Kuriamas renginys...' : 'Sukurti renginį'}
        </button>
      </form>
    </div>
  );
}

export default CreateEventPage;
