/**
 * API base URL for backend requests.
 *
 * Resolution order:
 * 1. VITE_API_BASE_URL env var (set at build time)
 * 2. Runtime config.json (deployed to S3 by postdeploy-config.mjs)
 * 3. http://localhost:3000 in dev mode
 */

let cachedBase: string | null = null;

export async function getApiBase(): Promise<string> {
  if (cachedBase !== null) {
    return cachedBase;
  }

  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv) {
    cachedBase = fromEnv;
    return cachedBase;
  }

  if (import.meta.env.DEV) {
    cachedBase = "http://localhost:3000";
    return cachedBase;
  }

  try {
    const res = await fetch("./config.json");

    if (!res.ok) {
      throw new Error(`config.json returned ${res.status}`);
    }

    const config = await res.json();
    cachedBase = config.apiBaseUrl ?? "";
  } catch {
    cachedBase = "";
  }

  return cachedBase ?? "";
}
