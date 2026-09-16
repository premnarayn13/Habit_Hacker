// Centralized API configuration for Web PWA / Render / Local Spring Boot Backend
export const getApiBaseUrl = () => {
  // 1. Check for Vite environment variable (Render production or custom dev env)
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // 2. Fallback to current browser location / LAN IP
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    return `http://${host}:8080`;
  }
  // 3. Default local development backend
  return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
