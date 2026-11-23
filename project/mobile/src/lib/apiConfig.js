// Centralized API configuration for Web PWA
// In production (Vercel): set VITE_API_URL or VITE_API_BASE_URL env var to your Render backend URL
// In local dev: set VITE_API_URL=http://localhost:8080 in your .env file
export const getApiBaseUrl = () => {
  if (import.meta.env) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && apiUrl.trim() !== '' && apiUrl !== 'http://localhost:8080') {
      return apiUrl.trim();
    }
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (apiBaseUrl && apiBaseUrl.trim() !== '' && apiBaseUrl !== 'http://localhost:8080') {
      return apiBaseUrl.trim();
    }
  }
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Non-blocking fetch with strict timeout to prevent hanging on sleeping/offline servers.
 * Defaults to 1200ms timeout so UI and Supabase are NEVER delayed or frozen.
 */
export const safeApiFetch = async (url, options = {}, timeoutMs = 1200) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    // Gracefully handle network timeouts or connection refused
    return null;
  }
};
