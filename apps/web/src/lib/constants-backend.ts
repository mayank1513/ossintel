// Backend-only Constants
export const GITHUB_APP_PAGE_SIZE = 100;
export const GITHUB_APP_CACHE_TTL = 3600; // 1 hour in seconds
export const BACKEND_CACHE_VERSION = 4;
export const AUTO_UPDATE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
export const CACHE_SAFETY_NET_TTL = 365 * 24 * 60 * 60; // 365 days in seconds
export const GITHUB_API_TIMEOUT_MS = 5000; // 5 seconds

// Cache Tags & Keys
export const GITHUB_APP_INSTALLATIONS_CACHE_TAG = "github-app-installations";
export const GITHUB_APP_INSTALLATIONS_CACHE_KEY = "github-app-installations";

// Webhook Headers
export const GITHUB_WEBHOOK_EVENT_HEADER = "x-github-event";
export const GITHUB_WEBHOOK_SIGNATURE_HEADER = "x-hub-signature-256";
