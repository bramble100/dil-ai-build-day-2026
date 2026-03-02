import { getApiBase } from "./config";

export type HealthzResponse = {
  status: string;
  timestamp: string;
};

export const api = {
  healthz: () => request<HealthzResponse>("/healthz"),
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = await getApiBase();

  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    throw new Error(
      `${init?.method ?? "GET"} ${path} failed: ${res.status} ${
        res.statusText
      }`,
    );
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }

  return res.text() as Promise<T>;
}
