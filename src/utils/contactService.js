// Contact service to submit contact form and manage contacts
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

// Submit contact form (public)
export const submitContact = async (contactData) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(contactData),
    });

    if (response.ok) {
      const apiResponse = await response.json();
      return {
        success: true,
        data: apiResponse.data,
        message: apiResponse.message || "Contact form submitted successfully",
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || "Failed to submit contact form",
      };
    }
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      success: false,
      error: "Network error. Please try again later.",
    };
  }
};

// Get all contacts (admin - auth required)
export const getContacts = async (page = 1, limit = 10) => {
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
      `${API_BASE_URL}/contacts?${queryParams}`,
      {
        method: "GET",
        headers,
        credentials: "include",
      }
    );

    if (response.ok) {
      const apiResponse = await response.json();
      return {
        success: true,
        data: apiResponse.data,
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch contacts");
    }
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Delete contact (admin - auth required)
export const deleteContact = async (id) => {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (response.ok) {
      const apiResponse = await response.json();
      return {
        success: true,
        message: apiResponse.message || "Contact deleted successfully",
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete contact");
    }
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};

