import { getApiBase } from "./config";
import type {
  ChatRequest,
  ChatResponse,
  CreateMcpQuizRequest,
  CreateQuizRequest,
  CreateQuizResponse,
  QuizEvaluation,
  SubmitAnswersRequest,
  UploadQuizRequest,
} from "./types/quiz";

export type HealthzResponse = {
  status: string;
  timestamp: string;
};

export const api = {
  healthz: () => request<HealthzResponse>("/healthz"),

  createQuiz: (body: CreateQuizRequest) =>
    request<CreateQuizResponse>("/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createMcpQuiz: (body: CreateMcpQuizRequest) =>
    request<CreateQuizResponse>("/create-mcp", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  uploadQuiz: (body: UploadQuizRequest) =>
    request<CreateQuizResponse>("/upload", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  submitAnswers: (body: SubmitAnswersRequest) =>
    request<{ message: string }>("/submit", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  evaluate: (quizId: string) =>
    request<QuizEvaluation>("/evaluate", {
      method: "POST",
      body: JSON.stringify({ quizId }),
    }),

  chat: (body: ChatRequest) =>
    request<ChatResponse>("/chat", {
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
    const errorBody = await res.json().catch(() => null);
    throw new Error(
      errorBody?.error ??
        `${init?.method ?? "GET"} ${path} failed: ${res.status} ${res.statusText}`,
    );
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json() as Promise<T>;
  }

  return res.text() as Promise<T>;
}
