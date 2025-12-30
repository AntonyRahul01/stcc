import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// const API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'http://192.168.1.2:3000/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const token = localStorage.getItem('admin_token');
    const authStatus = localStorage.getItem('admin_authenticated');
    if (token || authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token if provided - check multiple possible field names
        const token = data.token || data.accessToken || data.access_token || data.data?.token;
        if (token) {
          localStorage.setItem('admin_token', token);
        }
        localStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || 'Invalid email or password' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again later.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

