// Top Banner service to manage top banner data
import { API_BASE_URL } from "../config/api";

// Get authentication token
const getAuthToken = () => {
  const token =
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("admin_token") ||
    sessionStorage.getItem("token");

  return token;
};

// Storage key for localStorage fallback
const STORAGE_KEY = "stcc_top_banner_data";
const PUBLIC_STORAGE_KEY = "stcc_public_top_banner_data";

// Get top banner data (public - no auth required)
export const getPublicTopBanner = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/top-banner/public`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.topBanner
        let topBannerItem = null;
        if (apiResponse.success && apiResponse.data) {
          if (apiResponse.data.topBanner) {
            topBannerItem = apiResponse.data.topBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the topBanner object
            topBannerItem = apiResponse.data;
          }
          
          if (topBannerItem && topBannerItem.status === "active") {
            // Save to localStorage as backup
            localStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify(topBannerItem));
            return {
              success: true,
              data: topBannerItem,
            };
          }
        }
        return {
          success: true,
          data: null,
        };
      } else if (response.status === 404) {
        // No top banner exists yet
        return {
          success: true,
          data: null,
        };
      }
    } catch (apiError) {
      console.log("API not available, using fallback");
    }

    // Fallback: Use localStorage
    const stored = localStorage.getItem(PUBLIC_STORAGE_KEY);
    if (stored) {
      const storedData = JSON.parse(stored);
      if (storedData.status === "active") {
        return {
          success: true,
          data: storedData,
        };
      }
    }

    // Return null if no data
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Error fetching public top banner:", error);
    // Return null on error
    return {
      success: true,
      data: null,
    };
  }
};

// Get top banner data (admin - auth required)
export const getTopBanner = async () => {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/top-banner`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.topBanner
        let topBannerItem = null;
        if (apiResponse.success && apiResponse.data) {
          if (apiResponse.data.topBanner) {
            topBannerItem = apiResponse.data.topBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the topBanner object
            topBannerItem = apiResponse.data;
          }
          
          if (topBannerItem) {
            // Save to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(topBannerItem));
            return {
              success: true,
              data: topBannerItem,
            };
          }
        }
        return apiResponse;
      } else if (response.status === 404) {
        // No top banner exists yet
        return {
          success: true,
          data: null,
        };
      }
    } catch (apiError) {
      console.log("API not available, using fallback");
    }

    // Fallback: Use localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return {
        success: true,
        data: JSON.parse(stored),
      };
    }

    // Return null if no data
    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Error fetching top banner:", error);
    // Return null on error
    return {
      success: true,
      data: null,
    };
  }
};

// Upsert top banner data (FormData with images)
export const upsertTopBanner = async (formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/top-banner`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData, // FormData - don't set Content-Type, browser will set it with boundary
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.topBanner or response.data directly
        let topBannerItem = null;
        if (apiResponse.data) {
          if (apiResponse.data.topBanner) {
            topBannerItem = apiResponse.data.topBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the topBanner object
            topBannerItem = apiResponse.data;
          }
          
          if (topBannerItem) {
            // Update localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(topBannerItem));
          }
        }
        return {
          success: true,
          data: topBannerItem || apiResponse.data?.topBanner || apiResponse.data,
          message: apiResponse.message || "Top banner saved successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save top banner");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
      throw apiError;
    }
  } catch (error) {
    console.error("Error upserting top banner:", error);
    throw error;
  }
};

