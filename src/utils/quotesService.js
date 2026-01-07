// Quotes service to manage quotes data
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
const STORAGE_KEY = "stcc_quotes_data";
const PUBLIC_STORAGE_KEY = "stcc_public_quotes_data";

// Get quotes data (public - no auth required)
export const getPublicQuotes = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/public`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure
        if (
          apiResponse.success &&
          apiResponse.data &&
          apiResponse.data.quotes &&
          Array.isArray(apiResponse.data.quotes)
        ) {
          // Filter only active quotes
          const activeQuotes = apiResponse.data.quotes.filter(
            (quote) => quote.status === "active"
          );
          // Save to localStorage as backup
          localStorage.setItem(
            PUBLIC_STORAGE_KEY,
            JSON.stringify(activeQuotes)
          );
          return {
            success: true,
            data: activeQuotes,
          };
        }
        return {
          success: true,
          data: [],
        };
      }
    } catch (apiError) {
      console.log("API not available, using fallback");
    }

    // Fallback: Use localStorage
    const stored = localStorage.getItem(PUBLIC_STORAGE_KEY);
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
    console.error("Error fetching public quotes:", error);
    // Return empty array on error
    return {
      success: true,
      data: [],
    };
  }
};

// Get quotes data (admin - auth required)
export const getQuotes = async (page = 1, limit = 10) => {
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
      const response = await fetch(
        `${API_BASE_URL}/quotes?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers,
          credentials: "include",
        }
      );

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure
        if (
          apiResponse.success &&
          apiResponse.data &&
          apiResponse.data.quotes &&
          Array.isArray(apiResponse.data.quotes)
        ) {
          // Save to localStorage as backup
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(apiResponse.data.quotes)
          );
          return {
            success: true,
            data: {
              quotes: apiResponse.data.quotes,
              pagination: apiResponse.data.pagination,
            },
          };
        }
        return apiResponse;
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
          quotes: Array.isArray(storedData) ? storedData : [storedData],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: Array.isArray(storedData) ? storedData.length : 1,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false,
          },
        },
      };
    }

    // Return empty array if no data
    return {
      success: true,
      data: {
        quotes: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching quotes:", error);
    // Return empty array on error
    return {
      success: true,
      data: {
        quotes: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: limit,
          hasNext: false,
          hasPrev: false,
        },
      },
    };
  }
};

// Create quote data
export const createQuote = async (quoteData) => {
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
      const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure
        let quoteItem = null;
        if (apiResponse.data) {
          quoteItem = apiResponse.data;
          // Update localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          const storedData = stored ? JSON.parse(stored) : [];
          storedData.push(quoteItem);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
        }
        return {
          success: true,
          data: quoteItem || apiResponse.data,
          message: apiResponse.message || "Quote created successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create quote");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
      throw apiError;
    }
  } catch (error) {
    console.error("Error creating quote:", error);
    throw error;
  }
};

// Update quote data
export const updateQuote = async (id, quoteData) => {
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
      const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Handle API response structure
        let quoteItem = null;
        if (apiResponse.data) {
          quoteItem = apiResponse.data;
          // Update localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const storedData = JSON.parse(stored);
            const updatedData = storedData.map((item) =>
              item.id === id ? quoteItem : item
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
          }
        }
        return {
          success: true,
          data: quoteItem || apiResponse.data,
          message: apiResponse.message || "Quote updated successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update quote");
      }
    } catch (apiError) {
      console.log("API not available, using localStorage");
      throw apiError;
    }
  } catch (error) {
    console.error("Error updating quote:", error);
    throw error;
  }
};

// Delete quote data
export const deleteQuote = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try API first
    try {
      const response = await fetch(`${API_BASE_URL}/quotes/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // Remove from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const storedData = JSON.parse(stored);
          const filteredData = storedData.filter((item) => item.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData));
        }
        return {
          success: true,
          message: apiResponse.message || "Quote deleted successfully",
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete quote");
      }
    } catch (apiError) {
      console.log("API not available, cannot delete from localStorage");
      throw apiError;
    }
  } catch (error) {
    console.error("Error deleting quote:", error);
    throw error;
  }
};

