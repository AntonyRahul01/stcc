// API Configuration
// Get API base URL from environment variables
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api.tccswiss.org/api";

// Image base URL (derived from API base URL)
// Replace only the trailing '/api' with '/public/uploads'
// This ensures we don't replace 'api' in the domain name
export const IMAGE_BASE_URL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL.replace(/\/api$/, "/public/uploads")
  : `${API_BASE_URL.replace(/\/$/, "")}/public/uploads`;
