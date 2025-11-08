// src/utils/jwtUtils.ts

/**
 * Retrieves the JWT token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('jwtToken');
};

/**
 * Extracts username from JWT token
 * @returns username or null if extraction fails
 */
export const getUsernameFromToken = (): string | null => {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || payload.sub || null;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Checks if user is authenticated and redirects to login if not
 * @returns username if authenticated, null otherwise
 */
export const checkAuthAndRedirect = (): string | null => {
  const token = getAuthToken();
  if (!token) {
    alert('No authentication token found. Please login.');
    window.location.href = '/login';
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const username = payload.username || payload.sub || '';
    
    if (!username) {
      throw new Error('Username not found in token');
    }
    
    return username;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    alert('Invalid session. Please login again.');
    window.location.href = '/login';
    return null;
  }
};

/**
 * Checks if the token is expired
 * @returns true if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (): boolean => {
  const token = getAuthToken();
  if (!token) {
    return true;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    
    if (!exp) {
      return false; // No expiration claim
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime > exp;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Removes the JWT token from localStorage (for logout)
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem('jwtToken');
};

/**
 * Stores the JWT token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('jwtToken', token);
};