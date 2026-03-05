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

export type ChoiceKey = "A" | "B" | "C" | "D";

export type Question = {
  id: string;
  questionText: string;
  choices: Record<string, string>;
  correctChoice: string;
  explanation?: string;
};

export type Quiz = {
  id: string;
  topic: string;
  difficulty: string;
  questions: Question[];
};

export type QuizAnswerEvaluation = {
  questionId: string;
  questionText: string;
  correctChoice: string;
  selectedChoice?: string;
  isCorrect: boolean;
  explanation: string;
};

export type QuizEvaluation = {
  quizId: string;
  topic: string;
  difficulty: string;
  correctAnswerCount: number;
  totalQuestions?: number;
  overallFeedback?: string;
  verdict?: string;
  evaluatedAnswers: QuizAnswerEvaluation[];
};

export const api = {
  healthz: () => request<HealthzResponse>("/healthz"),

  createQuiz: (body: CreateQuizRequest) =>
    request<{ quiz: Quiz }>("/create", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  submitQuiz: (quizId: string, answers: { questionId: string; selectedChoice: string }[]) =>
    request<{ output: unknown }>(`/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ quizId, answers }),
    }),

  evaluateQuiz: (quizId: string) =>
    request<{ evaluation: QuizEvaluation }>(`/${quizId}/evaluate`),
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
