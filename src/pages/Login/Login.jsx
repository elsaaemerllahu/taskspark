import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './Login.css';
import bgImg from "../../assets/taskspark-table.png";
import '../../index';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.message === 'Login successful.') {
        const authResponse = await fetch('/backend/auth-status.php', {
          credentials: 'include'
        });
        const authData = await authResponse.json();
        
        if (authData.authenticated) {
          await login({
            id: authData.id,
            username: authData.username,
            username: authData.username
          });
          localStorage.setItem('authenticated', 'true');
          navigate('/dashboard');
        }
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred during login.');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <form onSubmit={handleLogin} className="login-box">
          <div className="login-heading">
            <h1>Welcome back!</h1>
            <p>Please enter your username and password</p>            
          </div>

          <div className="login-info">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p>Forgot password?</p>
          </div>

          <button type="submit">Login</button>
<div className="message-container">
            {message && <p className="login-error">{message}</p>}
          </div>          <div className="create-account">
            <p>Dont have an account?</p>
            <Link to="/signup" className='sign-up-link'>Sign Up</Link>
          </div>

        </form>
      </div>      
      <div
        className="login-right"
        style={{
          backgroundImage: `url(${bgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1>TaskSpark</h1>
        <p>Welcome back! Login to access your dashboard and tasks.</p>
      </div>
    </div>
  );
};

export default Login;
