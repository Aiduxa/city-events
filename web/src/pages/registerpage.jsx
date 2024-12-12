import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styling/LoginPage.css';

function RegisterPage({ setLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const navigate = useNavigate(); // Correct placement for useNavigate

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Username:', username);

        const payload = { email, password, username };

        try {
            const response = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.message) {
                alert(data.message);  // Show message to the user
            }

            if (data.token) {
                // Save the token in localStorage
                localStorage.setItem('authToken', data.token);
                console.log('Token saved to localStorage');

                // Update loggedIn state to true
                setLoggedIn(true);

                // Redirect to home page
                navigate('/');
            } else {
                console.error('No token received');
            }
        } catch (error) {
            console.error('Error during registration:', error);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Registracija</h2>
                <div className="form-group">
                    <label htmlFor="username">Slapyvardis</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Įrašykite savo slapyvardį"
                        required
                    />
                </div>
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
                <button type="submit" className="login-button">Registruotis</button>
                <Link to="/login">
                    Arba prisijungti
                </Link>
            </form>
        </div>
    );
}

export default RegisterPage;
    