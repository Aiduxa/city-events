import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import LoginPage from './pages/loginpage';
import RegisterPage from './pages/registerpage';
import HomePage from './pages/homepage';
import "./App.css"
import CreateEventPage from './pages/createeventpage';
import ProfilePage from './pages/profilepage';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      setLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setLoggedIn(false);
  };

  return (
    <Router>
      <nav className="navbar">
        <div className="navbar-links">
          <Link to="/" className="navbar-link">Pagrindinis</Link>
          {loggedIn ? (
            <>
              <Link to="/create-event" className="navbar-link">Sukurti renginį</Link>
              <Link to="/profilis" className="navbar-link">Mano profilis</Link>
              <button onClick={handleLogout} className="logout-btn">Atsijungti</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Prisijungti</Link>
              <Link to="/register" className="navbar-link">Prisiregistruoti</Link>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage setLoggedIn={setLoggedIn} />} />
        <Route path="/register" element={<RegisterPage setLoggedIn={setLoggedIn} />} />
        <Route path="/create-event" element={<CreateEventPage />} />
        <Route path="/profilis" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
