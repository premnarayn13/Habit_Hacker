// Centralized API configuration for Mobile / Web LAN access
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const host = window.location.hostname;
    return `http://${host}:8080`;
  }
  return 'http://localhost:8080';
};

export const API_BASE_URL = getApiBaseUrl();
