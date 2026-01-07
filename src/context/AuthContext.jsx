import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config/api";
import { isTokenExpired } from "../utils/tokenUtils";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check token validity and handle expiration
  const validateToken = useCallback(() => {
    const token = localStorage.getItem("admin_token");
    const authStatus = localStorage.getItem("admin_authenticated");

    if (!token && authStatus !== "true") {
      setIsAuthenticated(false);
      return false;
    }

    // If token exists, validate it
    if (token) {
      if (isTokenExpired(token)) {
        // Token is expired, clear auth and redirect
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_authenticated");
        setIsAuthenticated(false);
        return false;
      }
      // Token is valid
      setIsAuthenticated(true);
      return true;
    }

    // If only authStatus exists but no token, check if it's still valid
    // This handles cases where token might have been removed but authStatus remains
    if (authStatus === "true" && !token) {
      setIsAuthenticated(false);
      localStorage.removeItem("admin_authenticated");
      return false;
    }

    setIsAuthenticated(true);
    return true;
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
  }, []);

  // Check token on mount
  useEffect(() => {
    validateToken();
    setIsLoading(false);
  }, [validateToken]);

  // Set up interval to check token expiration periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        const token = localStorage.getItem("admin_token");
        if (token && isTokenExpired(token)) {
          logout();
          // Redirect to login if we're in admin area
          if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/admin/login";
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  // Listen for storage changes (e.g., token removed in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "admin_token" || e.key === "admin_authenticated") {
        validateToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [validateToken]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token if provided - check multiple possible field names
        const token =
          data.token ||
          data.accessToken ||
          data.access_token ||
          data.data?.token;
        if (token) {
          localStorage.setItem("admin_token", token);
        }
        localStorage.setItem("admin_authenticated", "true");
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || "Invalid email or password",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Network error. Please try again later.",
      };
    }
  };

  // Handle 401 Unauthorized responses globally
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Check if response is 401 Unauthorized
      if (response.status === 401) {
        // Get the URL from the request (handle both string and Request object)
        const url = typeof args[0] === 'string' 
          ? args[0] 
          : args[0]?.url || '';
        
        // Only handle 401 for API calls
        if (url.includes(API_BASE_URL)) {
          // Token is invalid or expired
          logout();
          // Only redirect if we're in admin area
          if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/admin/login";
          }
        }
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading, validateToken }}>
      {children}
    </AuthContext.Provider>
  );
};
