import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styling/LoginPage.css';

function LoginPage({ setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);

    const payload = { email, password };

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data) {
        if (data.message) {
            alert(data.message);
        }
      }


      if (data.token) {
        localStorage.setItem('authToken', data.token);
        console.log('Token saved to localStorage');
        
        setLoggedIn(true);
        navigate('/');
      } else {
        console.error('No token received');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Prisijungti</h2>
        <div className="form-group">
          <label htmlFor="email">El. paštas</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Įrašykite savo el. paštą"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Slaptažodis</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Įrašykite savo slaptažodį"
            required
          />
        </div>
        <button type="submit" className="login-button">Prisijungti</button>
        <Link to="/register">
          Arba prisiregistruoti
        </Link>
      </form>
    </div>
  );
}

export default LoginPage;
