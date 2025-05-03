'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const [username, setUsername] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    // Store username in localStorage
    localStorage.setItem('username', username.trim());
    
    // Redirect to home/rooms page
    router.push('/');
  };
  
  return (
    <div className="login-container">
      <h2>Enter a Username to Join</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="form-control"
          />
          {error && <p className="error-message">{error}</p>}
        </div>
        <button type="submit" className="btn-login">
          Join Chat
        </button>
      </form>
    </div>
  );
};

export default LoginForm;