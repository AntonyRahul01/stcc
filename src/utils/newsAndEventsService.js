// News and Events service to manage news and events via API
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

// Get all news and events with pagination
export const getNewsAndEvents = async (page = 1, limit = 10) => {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/news-and-events?${queryParams}`,
      {
        method: "GET",
        headers,
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news and events");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching news and events:", error);
    throw error;
  }
};

// Create a new news/event
export const createNewsAndEvent = async (formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, browser will set it with boundary
    const response = await fetch(`${API_BASE_URL}/news-and-events`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create news/event");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating news/event:", error);
    throw error;
  }
};

// Update a news/event
export const updateNewsAndEvent = async (id, formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/news-and-events/${id}`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update news/event");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating news/event:", error);
    throw error;
  }
};

// Delete a news/event
export const deleteNewsAndEvent = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/news-and-events/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete news/event");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting news/event:", error);
    throw error;
  }
};

// Get public news and events with pagination (for user side)
export const getPublicNewsAndEvents = async (page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/news-and-events/public?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news and events");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public news and events:", error);
    throw error;
  }
};

// Get a single public news/event by ID (for user side)
export const getPublicNewsAndEventById = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/news-and-events/public/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news/event");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public news/event:", error);
    throw error;
  }
};
