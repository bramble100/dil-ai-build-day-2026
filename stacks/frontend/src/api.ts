import { getApiBase } from "./config";

export type HealthzResponse = {
  status: string;
  timestamp: string;
};

export type CreateQuizRequest = {
  topic: string;
  difficulty: string;
  count: number;
};

export type Quiz = {
  id: string;
  topic: string;
  difficulty: string;
  questions: {
    id: string;
    questionText: string;
    choices: Record<string, string>;
    correctChoice: string;
    explanation?: string;
  }[];
};

export const api = {
  healthz: () => request<HealthzResponse>("/healthz"),
  createQuiz: (body: CreateQuizRequest) =>
    request<{ quiz: Quiz }>("/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),
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
