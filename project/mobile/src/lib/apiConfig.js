// Centralized API configuration for Mobile / Web LAN / Production access
export const getApiBaseUrl = () => {
  // 1. Check for explicit Expo public env variable
  if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // 2. Fallback to current browser location / LAN IP
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    return `http://${host}:8080`;
  }
  // 3. Fallback default
  return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
