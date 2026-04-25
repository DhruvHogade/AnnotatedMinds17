import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 card relative washi-tape">
      <h1 className="text-3xl font-bold mb-6 text-center">New Patron</h1>
      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block font-serif mb-1 text-sm">Pen Name (Username)</label>
          <input 
            type="text" 
            className="input-field" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </div>
        <div>
          <label className="block font-serif mb-1 text-sm">Email Address</label>
          <input 
            type="email" 
            className="input-field" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div>
          <label className="block font-serif mb-1 text-sm">Password</label>
          <input 
            type="password" 
            className="input-field" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="btn-primary w-full text-lg mt-4">Join</button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already a patron? <Link to="/login" className="text-mahogany font-bold hover:underline">Login here</Link>
      </p>
    </div>
  );
}
