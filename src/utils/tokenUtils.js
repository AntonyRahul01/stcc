// Utility functions for JWT token validation

/**
 * Decode JWT token without verification (client-side only)
 * @param {string} token - JWT token string
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token string
 * @returns {boolean} - true if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded) return true;

  // Check if token has expiration claim (exp)
  if (decoded.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  // If no expiration claim, assume token is valid (some tokens might not have exp)
  return false;
};

/**
 * Validate token and check expiration
 * @param {string} token - JWT token string
 * @returns {boolean} - true if token is valid and not expired, false otherwise
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  return !isTokenExpired(token);
};

/**
 * Get token expiration time in milliseconds
 * @param {string} token - JWT token string
 * @returns {number|null} - Expiration time in milliseconds or null if invalid
 */
export const getTokenExpirationTime = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return decoded.exp * 1000; // Convert to milliseconds
};
