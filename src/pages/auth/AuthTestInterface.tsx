import React, { useState, useEffect } from 'react';
import { login, signup, validateToken, getHealth } from '../../api/authApi';
import type { AuthResponse } from '../../types';
import { isAPIError } from '../../utils/apiError';

interface LogEntry {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
}

const AuthTestInterface: React.FC = () => {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([{ 
    message: 'Ready to test authentication service...\nTip: Try logging in with existing users or creating new ones!', 
    type: 'info',
    timestamp: new Date().toLocaleTimeString()
  }]);
  const [currentTokens, setCurrentTokens] = useState<{
    accessToken: string;
    refreshToken: string;
    username: string;
  }>({ accessToken: '', refreshToken: '', username: '' });
  const [serviceStatus, setServiceStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    checkServiceHealth();
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const checkServiceHealth = async () => {
    try {
      addLog('🔍 Checking service health...', 'info');
      const result = await getHealth();

      if (!isAPIError(result)) {
        setServiceStatus('online');
        addLog('✅ Service is healthy and running!', 'success');
        addLog(JSON.stringify(result, null, 2), 'info');
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      setServiceStatus('offline');
      addLog('❌ Service health check failed: ' + error, 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin({ username: loginUsername, password: loginPassword });
  };

  const performLogin = async (credentials: { username: string; password: string }) => {
    try {
      addLog(`🔑 Attempting login for user: ${credentials.username}`, 'info');

      const result = await login(credentials);

      if (!isAPIError(result)) {
        addLog('✅ Login successful!', 'success');
        addLog(JSON.stringify(result, null, 2), 'success');

        // Store tokens
        setCurrentTokens({
          accessToken: result.token,
          refreshToken: result.refreshToken,
          username: result.username
        });

        // Clear form
        setLoginUsername('');
        setLoginPassword('');
      } else {
        addLog(`❌ Login failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog('❌ Network error during login: ' + error, 'error');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    await performSignup({ username: signupUsername, password: signupPassword });
  };

  const performSignup = async (userData: { username: string; password: string }) => {
    try {
      addLog(`📝 Attempting signup for user: ${userData.username}`, 'info');

      const result = await signup(userData);

      if (!isAPIError(result)) {
        addLog('✅ Signup successful!', 'success');
        addLog(JSON.stringify(result, null, 2), 'success');

        // Clear form
        setSignupUsername('');
        setSignupPassword('');
      } else {
        addLog(`❌ Signup failed: ${result.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog('❌ Network error during signup: ' + error, 'error');
    }
  };

  const testValidToken = async () => {
    if (!currentTokens.accessToken) {
      addLog('⚠️ No access token available. Please login first.', 'warning');
      return;
    }

    try {
      addLog('🎫 Testing token validation...', 'info');

      const result = await validateToken(currentTokens.accessToken);

      if (!isAPIError(result)) {
        addLog('✅ Token validation successful!', 'success');
        addLog(JSON.stringify(result, null, 2), 'success');
      } else {
        addLog('❌ Token validation failed!', 'error');
      }
    } catch (error) {
      addLog('❌ Error during token validation: ' + error, 'error');
    }
  };

  const testInvalidCredentials = async () => {
    addLog('🧪 Testing invalid credentials...', 'info');
    await performLogin({ username: 'nonexistentuser', password: 'wrongpassword' });
  };

  const testDuplicateUser = async () => {
    addLog('🧪 Testing duplicate user signup...', 'info');
    await performSignup({ username: 'admin', password: 'newpassword123' });
  };

  const loginAsAdmin = async () => {
    await performLogin({ username: 'admin', password: 'admin123' });
  };

  const loginAsTestUser = async () => {
    await performLogin({ username: 'testuser', password: 'password123' });
  };

  const clearLog = () => {
    setLogs([{ message: 'Log cleared.\n', type: 'info', timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearTokens = () => {
    setCurrentTokens({ accessToken: '', refreshToken: '', username: '' });
    addLog('🧹 Tokens cleared', 'info');
  };

  const exportLog = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-test-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('📄 Log exported successfully', 'success');
  };

  const showApiDocs = () => {
    const docs = `
🔗 API ENDPOINTS:

POST /api/auth/signup
- Body: {"username": "string", "password": "string"}
- Response: 201 Created or 409 Conflict

POST /api/auth/login
- Body: {"username": "string", "password": "string"}
- Response: 200 OK with JWT tokens or 401 Unauthorized

POST /api/auth/validate
- Query: ?token=<jwt_token>
- Response: 200 OK with validation result

GET /api/auth/health
- Response: 200 OK with service status

📋 AUTHENTICATION FLOW:
1. Sign up with new credentials
2. Log in to get JWT tokens
3. Use tokens for authenticated requests
4. Validate tokens as needed

🔒 SECURITY FEATURES:
- BCrypt password hashing
- JWT tokens with expiration
- Input validation
- CORS enabled
- Error handling
    `;
    addLog(docs, 'info');
  };

  const getLogClassName = (type: LogEntry['type']) => {
    const baseClasses = 'response-box';
    return `${baseClasses} ${type}`;
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', color: 'white', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5em', marginBottom: '10px' }}>🔐 Choroid Authentication Service</h1>
          <p style={{ fontSize: '1.2em', opacity: 0.9 }}>Test Frontend for Manual Authentication Testing</p>
          <div>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              marginRight: '8px',
              background: serviceStatus === 'online' ? '#28a745' : '#dc3545',
              boxShadow: serviceStatus === 'online' ? '0 0 5px #28a745' : 'none'
            }}></span>
            <span>{serviceStatus === 'online' ? 'Service Online' : serviceStatus === 'offline' ? 'Service Offline' : 'Checking service status...'}</span>
          </div>
        </div>

        {/* Main Forms */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Login Form */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.8em', textAlign: 'center' }}>🔑 Login</h2>
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>Username:</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>Password:</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Login
              </button>
            </form>
          </div>

          {/* Signup Form */}
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.8em', textAlign: 'center' }}>📝 Sign Up</h2>
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>Username:</label>
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="Choose username (3-50 chars)"
                  required
                  minLength={3}
                  maxLength={50}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#555' }}>Password:</label>
                <input
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Choose password (min 6 chars)"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(245, 87, 108, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>

        {/* Response Log */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.8em', textAlign: 'center' }}>📋 Response Log</h2>
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '15px',
            fontFamily: "'Courier New', monospace",
            fontSize: '14px',
            maxHeight: '300px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}>
            {logs.map((log, index) => (
              <div key={index} style={{
                borderLeft: `4px solid ${
                  log.type === 'success' ? '#28a745' :
                  log.type === 'error' ? '#dc3545' :
                  log.type === 'warning' ? '#ffc107' :
                  '#17a2b8'
                }`,
                paddingLeft: '10px',
                marginBottom: '10px',
                color: log.type === 'success' ? '#155724' :
                       log.type === 'error' ? '#721c24' :
                       log.type === 'warning' ? '#856404' :
                       '#0c5460'
              }}>
                [{log.timestamp}] {log.message}
              </div>
            ))}
          </div>

          {currentTokens.accessToken && (
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ color: '#333', marginBottom: '10px' }}>🎫 Access Token:</h4>
              <textarea
                value={currentTokens.accessToken}
                readOnly
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '12px',
                  resize: 'vertical'
                }}
              />
              <h4 style={{ color: '#333', marginBottom: '10px', marginTop: '10px' }}>🔄 Refresh Token:</h4>
              <textarea
                value={currentTokens.refreshToken}
                readOnly
                style={{
                  width: '100%',
                  height: '100px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '12px',
                  resize: 'vertical'
                }}
              />
            </div>
          )}
        </div>

        {/* Quick Tests */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.3em' }}>🧪 Quick Tests</h3>
            <button onClick={checkServiceHealth} style={buttonStyle('#17a2b8')}>Check Service Health</button>
            <button onClick={testValidToken} style={buttonStyle('#28a745')}>Validate Current Token</button>
            <button onClick={testInvalidCredentials} style={buttonStyle('#ffc107', '#000')}>Test Invalid Login</button>
            <button onClick={testDuplicateUser} style={buttonStyle('#dc3545')}>Test Duplicate Signup</button>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.3em' }}>👥 Sample Users</h3>
            <p style={{ marginBottom: '15px' }}><strong>Test Users (if they exist):</strong></p>
            <ul style={{ marginBottom: '15px', paddingLeft: '20px' }}>
              <li><code>admin</code> / <code>admin123</code></li>
              <li><code>testuser</code> / <code>password123</code></li>
            </ul>
            <button onClick={loginAsAdmin} style={buttonStyle('#6f42c1')}>Quick Login as Admin</button>
            <button onClick={loginAsTestUser} style={buttonStyle('#e83e8c')}>Quick Login as TestUser</button>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#333', marginBottom: '15px', fontSize: '1.3em' }}>🔧 Utilities</h3>
            <button onClick={clearLog} style={buttonStyle('#6c757d')}>Clear Log</button>
            <button onClick={clearTokens} style={buttonStyle('#fd7e14')}>Clear Tokens</button>
            <button onClick={exportLog} style={buttonStyle('#20c997')}>Export Log</button>
            <button onClick={showApiDocs} style={buttonStyle('#343a40')}>API Documentation</button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .main-content {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const buttonStyle = (bgColor: string, textColor: string = 'white') => ({
  padding: '10px 20px',
  margin: '5px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.3s ease',
  background: bgColor,
  color: textColor
});

export default AuthTestInterface;