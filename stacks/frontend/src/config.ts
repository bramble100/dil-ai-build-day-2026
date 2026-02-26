/**
 * API base URL for backend requests.
 * Set VITE_API_BASE_URL in .env for production (e.g. API Gateway URL).
 * In dev, falls back to localhost when running SAM local.
 */
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:3000" : "");
