// Centralized API configuration for Web PWA
// In production (Vercel): set VITE_API_URL or VITE_API_BASE_URL env var to your Render backend URL
// In local dev: set VITE_API_URL=http://localhost:8080 in your .env file
export const getApiBaseUrl = () => {
  if (import.meta.env) {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  }
  // Local development default fallback
  if (import.meta.env && import.meta.env.DEV) {
    return 'http://localhost:8080';
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
