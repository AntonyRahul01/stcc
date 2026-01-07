// Leader Banner service to manage leader banner data
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
const STORAGE_KEY = "stcc_leader_banner_data";
const PUBLIC_STORAGE_KEY = "stcc_public_leader_banner_data";

// Get leader banner data (public - no auth required)
export const getPublicLeaderBanner = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/leader-banner/public`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.leaderBanner
        let leaderBannerItem = null;
        if (apiResponse.success && apiResponse.data) {
          if (apiResponse.data.leaderBanner) {
            leaderBannerItem = apiResponse.data.leaderBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the leaderBanner object
            leaderBannerItem = apiResponse.data;
          }
          
          if (leaderBannerItem && leaderBannerItem.status === "active") {
            // Save to localStorage as backup
            localStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify(leaderBannerItem));
            return {
              success: true,
              data: leaderBannerItem,
            };
          }
        }
        return {
          success: true,
          data: null,
        };
      } else if (response.status === 404) {
        // No leader banner exists yet
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
    console.error("Error fetching public leader banner:", error);
    // Return null on error
    return {
      success: true,
      data: null,
    };
  }
};

// Get leader banner data (admin - auth required)
export const getLeaderBanner = async () => {
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
      const response = await fetch(`${API_BASE_URL}/leader-banner`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.leaderBanner
        let leaderBannerItem = null;
        if (apiResponse.success && apiResponse.data) {
          if (apiResponse.data.leaderBanner) {
            leaderBannerItem = apiResponse.data.leaderBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the leaderBanner object
            leaderBannerItem = apiResponse.data;
          }
          
          if (leaderBannerItem) {
            // Save to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderBannerItem));
            return {
              success: true,
              data: leaderBannerItem,
            };
          }
        }
        return apiResponse;
      } else if (response.status === 404) {
        // No leader banner exists yet
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
    console.error("Error fetching leader banner:", error);
    // Return null on error
    return {
      success: true,
      data: null,
    };
  }
};

// Upsert leader banner data (FormData with images)
export const upsertLeaderBanner = async (formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/leader-banner`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData, // FormData - don't set Content-Type, browser will set it with boundary
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.leaderBanner or response.data directly
        let leaderBannerItem = null;
        if (apiResponse.data) {
          if (apiResponse.data.leaderBanner) {
            leaderBannerItem = apiResponse.data.leaderBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the leaderBanner object
            leaderBannerItem = apiResponse.data;
          }
          
          if (leaderBannerItem) {
            // Update localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderBannerItem));
          }
        }
        return {
          success: true,
          data: leaderBannerItem || apiResponse.data?.leaderBanner || apiResponse.data,
          message: apiResponse.message || "Leader banner saved successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save leader banner");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
      throw apiError;
    }
  } catch (error) {
    console.error("Error upserting leader banner:", error);
    throw error;
  }
};

