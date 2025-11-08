import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../api/authApi';
import { isAPIError } from '../../utils/apiError';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('jwtToken');
    const storedUsername = localStorage.getItem('username');
    
    if (token && storedUsername) {
      navigate(`/dashboard?user=${encodeURIComponent(storedUsername)}`);
    }
  }, [navigate]);

  const hideMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
    window.scrollTo(0, 0);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    window.scrollTo(0, 0);
  };

  const checkPasswordMatch = (value: string) => {
    if (value && password !== value) {
      setPasswordMatchError(true);
    } else {
      setPasswordMatchError(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    // Validation
    if (!trimmedUsername || !password || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      showError('Username must be between 3 and 50 characters');
      return;
    }

    if (password.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    // Check username format
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      showError('Username can only contain letters, numbers, dots, underscores, and hyphens');
      return;
    }

    setIsLoading(true);
    hideMessages();

    try {
      const result = await signup({ username: trimmedUsername, password });

      if (!isAPIError(result)) {
        showSuccess('Account created successfully! Redirecting to login...');

        // Clear the form
        setUsername('');
        setPassword('');
        setConfirmPassword('');

        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Handle different error types
        if (result.error?.includes('409') || result.error?.includes('already exists')) {
          showError('Username already exists. Please choose a different username.');
        } else {
          showError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      showError('Network error. Please check if the service is running.');
    } finally {
      setIsLoading(false);
    }
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
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }}></div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.2em',
            marginBottom: '10px',
            color: '#333',
            fontWeight: 700
          }}>📝 Create Account</h1>
          <p style={{ color: '#666', fontSize: '1em' }}>Join the Choroid Authentication System</p>
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

        <form onSubmit={handleSignup}>
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
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={50}
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
                e.target.style.borderColor = '#f5576c';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'none';
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '5px',
              lineHeight: 1.4
            }}>
              Must be 3-50 characters. Letters, numbers, dots, underscores, and hyphens allowed.
            </div>
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
              placeholder="Choose a secure password"
              required
              minLength={6}
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
                e.target.style.borderColor = '#f5576c';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'none';
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '5px',
              lineHeight: 1.4
            }}>
              Must be at least 6 characters long. Use a strong password for better security.
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#555',
              fontSize: '0.95em'
            }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                checkPasswordMatch(e.target.value);
              }}
              placeholder="Confirm your password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '15px 20px',
                border: `2px solid ${passwordMatchError ? '#dc3545' : '#e0e0e0'}`,
                borderRadius: '10px',
                fontSize: '16px',
                background: '#f8f9fa',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                if (!passwordMatchError) {
                  e.target.style.borderColor = '#f5576c';
                }
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 87, 108, 0.1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onBlur={(e) => {
                if (!passwordMatchError) {
                  e.target.style.borderColor = '#e0e0e0';
                }
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
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 87, 108, 0.4)';
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
            Create Account
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          paddingTop: '30px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p>
            Already have an account?{' '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              style={{
                color: '#f5576c',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#f093fb';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#f5576c';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Sign in here
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
          .signup-container {
            padding: 30px 25px !important;
            margin: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Signup;