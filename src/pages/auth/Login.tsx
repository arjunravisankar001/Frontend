import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/authApi';
import { checkUsernameHasProfile } from '../../api/userApi';
import { isAPIError } from '../../utils/apiError';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('jwtToken');
    const storedUsername = localStorage.getItem('username');
    
    if (token && storedUsername) {
      navigate(`/`);
    }
  }, [navigate]);

  const hideMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
  };

  const checkUserProfileAndRedirect = async (username: string) => {
    try {
      console.log(`Checking user profile for: ${username}`);
      
      const result = await checkUsernameHasProfile(username);
      
      if (result === true) {
        console.log('User profile exists, redirecting to dashboard');
        navigate(`/`);
      } else {
        console.log('User profile not found, redirecting to create profile');
        navigate('/users/create');
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // Fallback to dashboard if there's an error
      navigate(`/dashboard?user=${encodeURIComponent(username)}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      showError('Please fill in both username and password');
      return;
    }

    setIsLoading(true);
    hideMessages();

    try {
      const result = await login({ username: username.trim(), password });

      if (!isAPIError(result)) {
        // Store authentication data
        localStorage.setItem('jwtToken', result.token);
        localStorage.setItem('username', result.username);
        localStorage.setItem('refreshToken', result.refreshToken);

        showSuccess('Login successful! Redirecting...');

        // Check user profile and redirect accordingly
        setTimeout(async () => {
          await checkUserProfileAndRedirect(result.username);
        }, 1500);
      } else {
        showError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Network error. Please check if the service is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    // Trigger form submission
    setTimeout(() => {
      const form = document.getElementById('loginForm') as HTMLFormElement;
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}></div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.2em',
            marginBottom: '10px',
            color: '#333',
            fontWeight: 700
          }}>🔐 Welcome Back</h1>
          <p style={{ color: '#666', fontSize: '1em' }}>Sign in to your account</p>
        </div>

        {errorMessage && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #dc3545',
            fontSize: '14px'
          }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #28a745',
            fontSize: '14px'
          }}>
            {successMessage}
          </div>
        )}

        <form id="loginForm" onSubmit={handleLogin}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#555',
              fontSize: '0.95em'
            }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
              style={{
                width: '100%',
                padding: '15px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                background: '#f8f9fa',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#555',
              fontSize: '0.95em'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '15px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                background: '#f8f9fa',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: isLoading ? 'transparent' : 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              position: 'relative',
              overflow: 'hidden',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '20px',
                height: '20px',
                margin: '-10px 0 0 -10px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
            Sign In
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <h4 style={{
            color: '#666',
            marginBottom: '15px',
            fontSize: '0.9em',
            textAlign: 'center'
          }}>Quick Login (Demo Users)</h4>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => quickLogin('admin', 'admin123')}
              style={{
                flex: 1,
                padding: '10px 15px',
                border: '2px solid #e0e0e0',
                background: 'white',
                borderRadius: '8px',
                color: '#666',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.color = '#666';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Admin
            </button>
            <button
              onClick={() => quickLogin('testuser', 'password123')}
              style={{
                flex: 1,
                padding: '10px 15px',
                border: '2px solid #e0e0e0',
                background: 'white',
                borderRadius: '8px',
                color: '#666',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.color = '#666';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Test User
            </button>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          paddingTop: '30px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p>
            Don't have an account?{' '}
            <a
              href="/signup"
              onClick={(e) => {
                e.preventDefault();
                navigate('/signup');
              }}
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#764ba2';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#667eea';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
          .login-container {
            padding: 30px 25px !important;
            margin: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;