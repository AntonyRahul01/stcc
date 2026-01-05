// Financial Aid service to manage financial aid data
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
const STORAGE_KEY = "stcc_financial_aid_data";

// Get financial aid data (public - no auth required)
export const getPublicFinancialAid = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/financial-aid/public`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure - may have data.financialAssistance or data directly
        let financialAidItem = null;
        if (
          apiResponse.data &&
          apiResponse.data.financialAssistance &&
          Array.isArray(apiResponse.data.financialAssistance) &&
          apiResponse.data.financialAssistance.length > 0
        ) {
          financialAidItem = apiResponse.data.financialAssistance[0];
        } else if (apiResponse.data) {
          financialAidItem = apiResponse.data;
        }
        
        if (financialAidItem) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(financialAidItem));
          return {
            success: true,
            data: financialAidItem,
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
    console.error("Error fetching financial aid:", error);
    // Return null on error
    return {
      success: true,
      data: null,
    };
  }
};

// Get financial aid data (admin - auth required)
export const getFinancialAid = async () => {
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
      const response = await fetch(`${API_BASE_URL}/financial-aid`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure: response.data.financialAssistance[0]
        if (
          apiResponse.success &&
          apiResponse.data &&
          apiResponse.data.financialAssistance &&
          Array.isArray(apiResponse.data.financialAssistance) &&
          apiResponse.data.financialAssistance.length > 0
        ) {
          const financialAidItem = apiResponse.data.financialAssistance[0];
          // Save to localStorage as backup
          localStorage.setItem(STORAGE_KEY, JSON.stringify(financialAidItem));
          return {
            success: true,
            data: financialAidItem,
            pagination: apiResponse.data.pagination,
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
    console.error("Error fetching financial aid:", error);
    // Return null on error
    return {
      success: true,
      data: null,
    };
  }
};

// Create financial aid data
export const createFinancialAid = async (financialAidData) => {
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
      const response = await fetch(`${API_BASE_URL}/financial-aid`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(financialAidData),
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure - may have data.financialAssistance or data directly
        let financialAidItem = null;
        if (
          apiResponse.data &&
          apiResponse.data.financialAssistance &&
          Array.isArray(apiResponse.data.financialAssistance) &&
          apiResponse.data.financialAssistance.length > 0
        ) {
          financialAidItem = apiResponse.data.financialAssistance[0];
        } else if (apiResponse.data) {
          financialAidItem = apiResponse.data;
        }
        
        if (financialAidItem) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(financialAidItem));
          return {
            success: true,
            data: financialAidItem,
            message: apiResponse.message || "Financial aid data created successfully",
          };
        }
        return apiResponse;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create financial aid data");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
    }

    // Fallback: Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(financialAidData));
    return {
      success: true,
      data: financialAidData,
      message: "Financial aid data created successfully (stored locally)",
    };
  } catch (error) {
    console.error("Error creating financial aid:", error);
    throw error;
  }
};

// Update financial aid data
export const updateFinancialAid = async (id, financialAidData) => {
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
      const response = await fetch(`${API_BASE_URL}/financial-aid/${id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(financialAidData),
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure - may have data.financialAssistance or data directly
        let financialAidItem = null;
        if (
          apiResponse.data &&
          apiResponse.data.financialAssistance &&
          Array.isArray(apiResponse.data.financialAssistance) &&
          apiResponse.data.financialAssistance.length > 0
        ) {
          financialAidItem = apiResponse.data.financialAssistance[0];
        } else if (apiResponse.data) {
          financialAidItem = apiResponse.data;
        }
        
        if (financialAidItem) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(financialAidItem));
          return {
            success: true,
            data: financialAidItem,
            message: apiResponse.message || "Financial aid data updated successfully",
          };
        }
        return apiResponse;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update financial aid data");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
    }

    // Fallback: Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(financialAidData));
    return {
      success: true,
      data: financialAidData,
      message: "Financial aid data updated successfully (stored locally)",
    };
  } catch (error) {
    console.error("Error updating financial aid:", error);
    throw error;
  }
};

