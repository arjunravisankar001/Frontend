import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateToken } from '../../api/authApi';
import { isAPIError } from '../../utils/apiError';

const AuthChecker: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  const checkAuthenticationStatus = async () => {
    try {
      // Check if we have a stored JWT token
      const token = localStorage.getItem('jwtToken');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        console.log('No stored credentials found, redirecting to login');
        redirectToLogin();
        return;
      }

      // Validate the token with the server
      const isValid = await validateTokenWithServer(token);

      if (isValid) {
        console.log('Valid token found, redirecting to dashboard');
        redirectToDashboard(username);
      } else {
        console.log('Invalid token, clearing storage and redirecting to login');
        clearStoredAuth();
        redirectToLogin();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      clearStoredAuth();
      redirectToLogin();
    }
  };

  const validateTokenWithServer = async (token: string): Promise<boolean> => {
    try {
      const result = await validateToken(token);
      return !isAPIError(result) && result.valid === true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  const redirectToLogin = () => {
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const redirectToDashboard = (username: string) => {
    setTimeout(() => {
      navigate(`/dashboard?user=${encodeURIComponent(username)}`);
    }, 1000);
  };

  const clearStoredAuth = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('username');
    localStorage.removeItem('refreshToken');
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.3)',
          borderTop: '5px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <div style={{
          fontSize: '1.2em',
          marginBottom: '10px'
        }}>Checking Authentication...</div>
        <div style={{
          fontSize: '0.9em',
          opacity: 0.8
        }}>Please wait while we verify your session</div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthChecker;