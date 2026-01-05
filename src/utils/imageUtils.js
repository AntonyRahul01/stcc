// Image utility functions for handling image URLs
import { IMAGE_BASE_URL } from "../config/api";

/**
 * Get full image URL
 * If the image URL is already a full URL (starts with http:// or https://), return it as is
 * Otherwise, prepend the base URL
 * @param {string} imagePath - The image path from API (could be full URL or relative path)
 * @returns {string} Full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  // If already a full URL, return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Remove leading slash if present
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

  // Return full URL
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

/**
 * Get full image URL for cover image
 * @param {string} coverImage - Cover image path from API
 * @returns {string} Full cover image URL
 */
export const getCoverImageUrl = (coverImage) => {
  return getImageUrl(coverImage);
};

/**
 * Get full image URLs for additional images array
 * @param {Array<string>} images - Array of image paths from API
 * @returns {Array<string>} Array of full image URLs
 */
export const getImagesUrls = (images) => {
  if (!images || !Array.isArray(images)) return [];
  return images.map((img) => getImageUrl(img));
};
