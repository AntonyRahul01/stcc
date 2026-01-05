// Upcoming Events service to manage upcoming events via API
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

// Get all upcoming events with pagination
export const getUpcomingEvents = async (page = 1, limit = 10) => {
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
      `${API_BASE_URL}/upcoming-events?${queryParams}`,
      {
        method: "GET",
        headers,
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch upcoming events");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
};

// Create a new upcoming event
export const createUpcomingEvent = async (formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, browser will set it with boundary
    const response = await fetch(`${API_BASE_URL}/upcoming-events`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create upcoming event");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating upcoming event:", error);
    throw error;
  }
};

// Update an upcoming event
export const updateUpcomingEvent = async (id, formData) => {
  try {
    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upcoming-events/${id}`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update upcoming event");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating upcoming event:", error);
    throw error;
  }
};

// Delete an upcoming event
export const deleteUpcomingEvent = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upcoming-events/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete upcoming event");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting upcoming event:", error);
    throw error;
  }
};

// Get public upcoming events with pagination (for user side)
export const getPublicUpcomingEvents = async (page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/upcoming-events/public?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch upcoming events");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public upcoming events:", error);
    throw error;
  }
};

// Get a single public upcoming event by ID (for user side)
export const getPublicUpcomingEventById = async (id) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/upcoming-events/public/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch upcoming event");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public upcoming event:", error);
    throw error;
  }
};

