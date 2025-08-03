// Base URL for API requests
export const API_BASE_URL = '/api';

// Helper function to get the full API URL
export const getApiUrl = (path: string): string => {
  // Remove leading slash from path if it exists
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};
