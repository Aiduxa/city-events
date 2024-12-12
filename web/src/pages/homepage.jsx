import React, { useState, useEffect } from 'react';
import "../App.css";

function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3001/events');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleRateEvent = async (eventId, rating) => {
    const authToken = localStorage.getItem('authToken'); 
    if (!authToken) {
      alert('You must be logged in to rate events!');
      return;
    }

    const payload = {
      token: authToken,
      rating,
      id: eventId
    };

    try {
      const response = await fetch('http://localhost:3001/events/rate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const data = await response.json();
      alert(data.message);  
      
      
      setEvents(events.map(event => 
        event.id === eventId ? { ...event, rating: { value: rating } } : event
      ));
    } catch (error) {
      console.error('Error during rating submission:', error);
      alert('There was an error submitting your rating.');
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Miesto renginiai</h1>
      <div className="events-grid">
        {events.map((event) => (
          <div key={event.id} className="event-card">

            <div className="event-info">
              <h2>{event.title}</h2>
              <p>{event.description}</p>
              <p>Lokacija: {event.location}</p>
              <div>
                <strong>Įvertinimas:</strong>
                {event.rating ? (
                  <div>
                    <span>Token: {event.rating.token}</span>
                    <span>Rating: {event.rating.value}</span>
                  </div>
                ) : (
                  <span>No rating available</span>
                )}
              </div>
            </div>

            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (event.rating?.value || 0) ? 'filled' : ''}`}
                  onClick={() => handleRateEvent(event.id, star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
