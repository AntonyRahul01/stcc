// Footer Banner service to manage footer banner data
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
const STORAGE_KEY = "stcc_footer_banner_data";
const PUBLIC_STORAGE_KEY = "stcc_public_footer_banner_data";

// Get footer banner data (public - no auth required)
export const getPublicFooterBanner = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/footer-banner/public`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.footerBanner
        let footerBannerItem = null;
        if (apiResponse.success && apiResponse.data) {
          if (apiResponse.data.footerBanner) {
            footerBannerItem = apiResponse.data.footerBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the footerBanner object
            footerBannerItem = apiResponse.data;
          }
          
          if (footerBannerItem && footerBannerItem.status === "active") {
            // Save to localStorage as backup
            localStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify(footerBannerItem));
            return {
              success: true,
              data: footerBannerItem,
            };
          }
        }
        return {
          success: true,
          data: null,
        };
      } else if (response.status === 404) {
        // No footer banner exists yet
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
    console.error("Error fetching public footer banner:", error);
    // Return null on error
    return {
      success: true,
      data: null,
    };
  }
};

// Get footer banner data (admin - auth required)
export const getFooterBanner = async () => {
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
      const response = await fetch(`${API_BASE_URL}/footer-banner`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.footerBanner
        let footerBannerItem = null;
        if (apiResponse.success && apiResponse.data) {
          if (apiResponse.data.footerBanner) {
            footerBannerItem = apiResponse.data.footerBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the footerBanner object
            footerBannerItem = apiResponse.data;
          }
          
          if (footerBannerItem) {
            // Save to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(footerBannerItem));
            return {
              success: true,
              data: footerBannerItem,
            };
          }
        }
        return apiResponse;
      } else if (response.status === 404) {
        // No footer banner exists yet
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
    console.error("Error fetching footer banner:", error);
    // Return null on error
    return {
      success: true,
      data: null,
    };
  }
};

// Upsert footer banner data (FormData with images)
export const upsertFooterBanner = async (formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/footer-banner`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData, // FormData - don't set Content-Type, browser will set it with boundary
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.footerBanner or response.data directly
        let footerBannerItem = null;
        if (apiResponse.data) {
          if (apiResponse.data.footerBanner) {
            footerBannerItem = apiResponse.data.footerBanner;
          } else if (apiResponse.data.id) {
            // If data is directly the footerBanner object
            footerBannerItem = apiResponse.data;
          }
          
          if (footerBannerItem) {
            // Update localStorage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(footerBannerItem));
          }
        }
        return {
          success: true,
          data: footerBannerItem || apiResponse.data?.footerBanner || apiResponse.data,
          message: apiResponse.message || "Footer banner saved successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save footer banner");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
      throw apiError;
    }
  } catch (error) {
    console.error("Error upserting footer banner:", error);
    throw error;
  }
};

