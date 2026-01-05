// Annual Events service to manage annual events data
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
const STORAGE_KEY = "stcc_annual_events_data";

// Get annual events data (public - no auth required)
export const getPublicAnnualEvents = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/annual-event-schedules/public`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.annualEventSchedules
        if (
          apiResponse.success &&
          apiResponse.data &&
          apiResponse.data.annualEventSchedules &&
          Array.isArray(apiResponse.data.annualEventSchedules)
        ) {
          // Return the array of annual event schedules
          return {
            success: true,
            data: {
              annualEventSchedules: apiResponse.data.annualEventSchedules,
              pagination: apiResponse.data.pagination,
            },
          };
        }
        return apiResponse;
      }
    } catch (apiError) {
      console.log("API not available, using fallback");
    }

    // Fallback: Use localStorage or default JSON
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedData = JSON.parse(stored);
      return {
        success: true,
        data: Array.isArray(storedData) ? storedData : [storedData],
      };
    }

    // Return empty array if no data
    return {
      success: true,
      data: [],
    };
  } catch (error) {
    console.error("Error fetching annual events:", error);
    // Return empty array on error
    return {
      success: true,
      data: [],
    };
  }
};

// Get annual events data (admin - auth required)
export const getAnnualEvents = async () => {
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
      const response = await fetch(`${API_BASE_URL}/annual-event-schedules`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.annualEventSchedules (array)
        let annualEventsArray = [];
        if (
          apiResponse.success &&
          apiResponse.data &&
          apiResponse.data.annualEventSchedules &&
          Array.isArray(apiResponse.data.annualEventSchedules)
        ) {
          annualEventsArray = apiResponse.data.annualEventSchedules;
        } else if (apiResponse.success && apiResponse.data && Array.isArray(apiResponse.data)) {
          annualEventsArray = apiResponse.data;
        }
        
        return {
          success: true,
          data: {
            annualEventSchedules: annualEventsArray,
            pagination: apiResponse.data?.pagination || {},
          },
        };
      }
    } catch (apiError) {
      console.log("API not available, using fallback");
    }

    // Fallback: Use localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedData = JSON.parse(stored);
      return {
        success: true,
        data: {
          annualEventSchedules: Array.isArray(storedData) ? storedData : [storedData],
          pagination: {},
        },
      };
    }

    // Return empty array if no data
    return {
      success: true,
      data: {
        annualEventSchedules: [],
        pagination: {},
      },
    };
  } catch (error) {
    console.error("Error fetching annual events:", error);
    // Return empty array on error
    return {
      success: true,
      data: {
        annualEventSchedules: [],
        pagination: {},
      },
    };
  }
};

// Delete annual events data
export const deleteAnnualEvents = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/annual-event-schedules/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        return {
          success: true,
          message: apiResponse.message || "Annual events data deleted successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete annual events data");
      }
    } catch (apiError) {
      console.log("API not available");
      throw apiError;
    }
  } catch (error) {
    console.error("Error deleting annual events:", error);
    throw error;
  }
};

// Create annual events data (FormData with images)
export const createAnnualEvents = async (formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/annual-event-schedules`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData, // FormData - don't set Content-Type, browser will set it with boundary
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure
        let annualEventsItem = null;
        if (apiResponse.data) {
          annualEventsItem = apiResponse.data;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(annualEventsItem));
        }
        return {
          success: true,
          data: annualEventsItem || apiResponse.data,
          message: apiResponse.message || "Annual events data created successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create annual events data");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
      throw apiError;
    }
  } catch (error) {
    console.error("Error creating annual events:", error);
    throw error;
  }
};

// Update annual events data (FormData with images)
export const updateAnnualEvents = async (id, formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/annual-event-schedules/${id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: formData, // FormData - don't set Content-Type, browser will set it with boundary
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure
        let annualEventsItem = null;
        if (apiResponse.data) {
          annualEventsItem = apiResponse.data;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(annualEventsItem));
        }
        return {
          success: true,
          data: annualEventsItem || apiResponse.data,
          message: apiResponse.message || "Annual events data updated successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update annual events data");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
      throw apiError;
    }
  } catch (error) {
    console.error("Error updating annual events:", error);
    throw error;
  }
};

