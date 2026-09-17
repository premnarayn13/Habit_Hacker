// Centralized API configuration for Web PWA
// In production (Vercel): set VITE_API_URL env var to your Render backend URL
// In local dev: set VITE_API_URL=http://localhost:8080 in your .env file
export const getApiBaseUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // No fallback to localhost in production — VITE_API_URL must be set
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
