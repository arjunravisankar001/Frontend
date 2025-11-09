import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateToken } from '../../api/authApi';
import { isAPIError } from '../../utils/apiError';

const AuthDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [authStatus, setAuthStatus] = useState({ isValid: true, message: '✅ Authenticated & Token Valid' });

  useEffect(() => {
    initializeDashboard();
    
    // Periodic token validation (every 5 minutes)
    const interval = setInterval(validateCurrentSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const initializeDashboard = async () => {
    const user = getUsername();
    const token = getToken();

    if (!user || !token) {
      // No credentials, redirect to auth checker
      navigate('/auth-check');
      return;
    }

    // Update UI with user information
    setUsername(user);
    displayTokens();

    // Validate token in background
    await validateCurrentSession();
  };

  const getUsername = (): string => {
    return searchParams.get('user') || localStorage.getItem('username') || '';
  };

  const getToken = (): string => {
    return localStorage.getItem('jwtToken') || '';
  };

  const getRefreshToken = (): string => {
    return localStorage.getItem('refreshToken') || '';
  };

  const displayTokens = () => {
    const token = getToken();
    const refresh = getRefreshToken();

    if (token) {
      setAccessToken(token);
    }

    if (refresh) {
      setRefreshToken(refresh);
    }
  };

  const validateCurrentSession = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const result = await validateToken(token);
      
      if (!isAPIError(result)) {
        updateAuthStatus(result.valid);
      } else {
        updateAuthStatus(false);
      }
    } catch (error) {
      console.error('Session validation error:', error);
      updateAuthStatus(false);
    }
  };

  const updateAuthStatus = (isValid: boolean) => {
    if (isValid) {
      setAuthStatus({
        isValid: true,
        message: '✅ Authenticated & Token Valid'
      });
    } else {
      setAuthStatus({
        isValid: false,
        message: '❌ Session Invalid or Expired'
      });

      // If token is invalid, redirect to login after a delay
      setTimeout(() => {
        handleLogout();
      }, 3000);
    }
  };

  const handleValidateToken = async () => {
    const token = getToken();
    if (!token) {
      alert('No token available');
      return;
    }

    try {
      const result = await validateToken(token);

      if (!isAPIError(result)) {
        if (result.valid) {
          alert(`✅ Token is valid!\nUsername: ${result.username}\nMessage: ${result.message}`);
        } else {
          alert(`❌ Token is invalid!\nMessage: ${result.message}`);
        }
      } else {
        alert('❌ Error validating token');
      }
    } catch (error) {
      alert('❌ Error validating token: ' + error);
    }
  };

  const handleCopyToken = () => {
    const token = getToken();
    if (token) {
      navigator.clipboard.writeText(token).then(() => {
        alert('✅ Access token copied to clipboard!');
      }).catch(() => {
        alert('❌ Failed to copy token');
      });
    } else {
      alert('❌ No token available to copy');
    }
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleTestAuth = async () => {
    const token = getToken();

    if (!token) {
      alert('❌ No authentication token available');
      return;
    }

    try {
      const result = await validateToken(token);

      if (!isAPIError(result)) {
        const resultText = `Authentication Test Results:

✅ Service Status: Connected
🎫 Token Status: ${result.valid ? 'Valid' : 'Invalid'}
👤 Username: ${result.username || 'N/A'}
📝 Message: ${result.message || 'N/A'}
⏰ Timestamp: ${new Date().toLocaleString()}`;

        alert(resultText);
      } else {
        alert('❌ Authentication test failed');
      }
    } catch (error) {
      alert(`❌ Authentication test failed:\n${error}`);
    }
  };

  const handleViewProfile = () => {
    const user = getUsername();
    const token = getToken();

    const profileInfo = `User Profile Information:

👤 Username: ${user}
🔑 Token Status: ${token ? 'Active' : 'Not Available'}
⏰ Login Time: ${new Date().toLocaleString()}
🌐 Session: Active
🔒 Security: JWT Protected`;

    alert(profileInfo);
  };

  const handleOpenTestInterface = () => {
    navigate('/auth/test');
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('refreshToken');

    alert('You have been signed out successfully.');
    navigate('/login');
  };

  const getUserAvatar = () => {
    return username.charAt(0).toUpperCase();
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: '#f5f6fa',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px 0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <h1 style={{ fontSize: '1.8em', fontWeight: 600 }}>🔐 Choroid Authentication Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1em' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2em',
                fontWeight: 'bold'
              }}>
                {getUserAvatar()}
              </div>
              <span>Welcome, {username}!</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        {/* Welcome Section */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '40px',
          marginBottom: '30px',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '2.5em', marginBottom: '15px', color: '#333' }}>🎉 Welcome to Your Dashboard!</h2>
          <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '30px' }}>
            You have successfully authenticated using JWT tokens. Your session is secure and protected.
          </p>
          <div style={{
            background: '#f8f9fa',
            borderRadius: '10px',
            padding: '20px',
            marginTop: '20px'
          }}>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>Authentication Status</h4>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              background: authStatus.isValid ? '#d4edda' : '#f8d7da',
              color: authStatus.isValid ? '#155724' : '#721c24'
            }}>
              {authStatus.message}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🔑 JWT Authentication
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Your login session is secured using JSON Web Tokens (JWT). The token contains your identity and is validated on each request.
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🛡️ Secure Session
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              Your authentication tokens are stored securely in your browser's local storage and automatically validated.
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.3em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚡ Auto-Login
            </h3>
            <p style={{ color: '#666', lineHeight: 1.6 }}>
              When you return, you'll be automatically logged in if your session is still valid, providing a seamless experience.
            </p>
          </div>
        </div>

        {/* Token Section */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#333', marginBottom: '20px', fontSize: '1.5em' }}>🎫 Your Authentication Tokens</h3>

          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <h4 style={{ color: '#495057', marginBottom: '10px', fontSize: '1em' }}>Access Token</h4>
            <textarea
              value={accessToken}
              readOnly
              placeholder="Access token will be displayed here..."
              style={{
                width: '100%',
                height: '80px',
                border: 'none',
                background: 'transparent',
                fontFamily: "'Courier New', monospace",
                fontSize: '11px',
                color: '#495057',
                resize: 'vertical',
                padding: '5px'
              }}
            />
          </div>

          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px'
          }}>
            <h4 style={{ color: '#495057', marginBottom: '10px', fontSize: '1em' }}>Refresh Token</h4>
            <textarea
              value={refreshToken}
              readOnly
              placeholder="Refresh token will be displayed here..."
              style={{
                width: '100%',
                height: '80px',
                border: 'none',
                background: 'transparent',
                fontFamily: "'Courier New', monospace",
                fontSize: '11px',
                color: '#495057',
                resize: 'vertical',
                padding: '5px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={handleValidateToken}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                background: '#667eea',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#5a67d8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Validate Token
            </button>
            <button
              onClick={handleCopyToken}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                background: '#6c757d',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#545b62';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#6c757d';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Copy Access Token
            </button>
            <button
              onClick={handleRefreshPage}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                background: '#6c757d',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#545b62';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#6c757d';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Refresh Session
            </button>
          </div>
        </div>

        {/* Actions Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2em' }}>🔄 Test Authentication</h4>
            <p style={{ color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
              Test your current authentication status and token validity with the backend service.
            </p>
            <button
              onClick={handleTestAuth}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                background: '#667eea',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#5a67d8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Test Authentication
            </button>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2em' }}>👥 User Management</h4>
            <p style={{ color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
              Access user management features and view your account information and settings.
            </p>
            <button
              onClick={handleViewProfile}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                background: '#667eea',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#5a67d8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              View Profile
            </button>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '25px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '1.2em' }}>🧪 API Testing</h4>
            <p style={{ color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
              Access the comprehensive API testing interface to test all authentication endpoints.
            </p>
            <button
              onClick={handleOpenTestInterface}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                background: '#667eea',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#5a67d8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#667eea';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Open Test Interface
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .header-content {
            flex-direction: column !important;
            gap: 15px !important;
          }
          
          .user-info {
            flex-direction: column !important;
            gap: 10px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthDashboard;