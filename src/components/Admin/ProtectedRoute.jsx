import { Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { isTokenExpired } from "../../utils/tokenUtils";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, validateToken, logout } = useAuth();

  // Validate token on mount and when route changes
  useEffect(() => {
    if (!isLoading) {
      const token = localStorage.getItem("admin_token");

      // Check if token exists and is not expired
      if (token && isTokenExpired(token)) {
        // Token is expired, logout and redirect
        logout();
      } else {
        // Validate token state
        validateToken();
      }
    }
  }, [isLoading, validateToken, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
