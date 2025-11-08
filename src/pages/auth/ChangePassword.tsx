import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from '../../api/authApi';
import { isAPIError } from '../../utils/apiError';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Auto-populate username if available from storage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    // Client-side validation
    if (!trimmedUsername || !currentPassword || !newPassword || !confirmPassword) {
      showError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      showError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('New password and confirmation do not match');
      return;
    }

    if (currentPassword === newPassword) {
      showError('New password must be different from current password');
      return;
    }

    setIsLoading(true);
    hideMessages();

    try {
      const result = await updatePassword({
        username: trimmedUsername,
        currentPassword,
        newPassword,
        confirmPassword
      });

      if (!isAPIError(result)) {
        showSuccess('Password updated successfully! Redirecting to login page...');

        // Clear form
        setUsername('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Clear any stored authentication data
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        localStorage.removeItem('refreshToken');

        // Redirect to login page after a brief delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showError(result.error || 'Password update failed. Please check your current password.');
      }
    } catch (error) {
      console.error('Update password error:', error);
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
        maxWidth: '450px',
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
          }}>🔐 Update Password</h1>
          <p style={{ color: '#666', fontSize: '1em' }}>Change your account password</p>
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

        <div style={{
          background: '#e2e3f1',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <h4 style={{ color: '#333', marginBottom: '10px' }}>Password Requirements:</h4>
          <ul style={{ color: '#666', paddingLeft: '20px' }}>
            <li style={{ marginBottom: '5px' }}>Minimum 6 characters long</li>
            <li style={{ marginBottom: '5px' }}>Must enter current password for verification</li>
            <li style={{ marginBottom: '5px' }}>New password and confirmation must match</li>
          </ul>
        </div>

        <form onSubmit={handleUpdatePassword}>
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
            }}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
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

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#555',
              fontSize: '0.95em'
            }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
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

          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 600,
              color: '#555',
              fontSize: '0.95em'
            }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
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
            Update Password
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '30px',
          paddingTop: '30px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p>
            Go back to{' '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
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
              Login Page
            </a>
            {' '}or{' '}
            <a
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard');
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
              Dashboard
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
          .update-container {
            padding: 30px 25px !important;
            margin: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;