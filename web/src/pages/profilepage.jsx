import React, { useState, useEffect } from 'react';
import "../App.css";  

function ProfilePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      const token = localStorage.getItem('authToken'); 

      if (!token) {
        setError("You need to be logged in to view your events.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/user/events', {
          method: 'POST', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token, 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();

        if (data.message) {
          setError(data.message); 
          setLoading(false);
          return;
        }

        setEvents(data.events);  
        setLoading(false); 
      } catch (error) {
        setError(error.message);
        setLoading(false); 
      }
    };

    fetchUserEvents();  
  }, []);  

  if (loading) {
    return <div>Loading events...</div>;  
  }

  if (error) {
    return <div>Error: {error}</div>;  
  }

  return (
    <div className="profile-container">
      <h2>Your Events</h2>
      {events.length === 0 ? (
        <p>No events found for your profile.</p>
      ) : (
        <div className="events-list">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Start Date:</strong> {new Date(event.happening_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
