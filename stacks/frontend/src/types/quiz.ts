export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type ChoiceKey = "A" | "B" | "C" | "D";

export type QuizMode = "ai" | "upload" | "mcp";

export type McpTopic = "csuszka" | "panir";

export interface ClientQuestion {
  id: string;
  questionText: string;
  choices: Record<ChoiceKey, string>;
}

export interface CreateQuizRequest {
  topic: string;
  difficulty?: Difficulty;
  count?: number;
}

export interface CreateMcpQuizRequest {
  topic: McpTopic;
  difficulty?: Difficulty;
  count?: number;
}

export interface UploadQuizRequest {
  file: string; // base64-encoded PDF
  topic?: string;
  difficulty?: Difficulty;
  count?: number;
}

export interface CreateQuizResponse {
  quizId: string;
  topic: string;
  difficulty: Difficulty;
  questions: ClientQuestion[];
}

export interface SubmitAnswersRequest {
  quizId: string;
  answers: Record<string, ChoiceKey>;
}

export interface QuestionResult {
  questionId: string;
  questionText: string;
  correctChoice: ChoiceKey;
  correctAnswerText: string;
  userChoice: ChoiceKey | null;
  userAnswerText: string | null;
  isCorrect: boolean;
}

export interface QuizEvaluation {
  score: number;
  totalQuestions: number;
  percentage: number;
  evaluation: string;
  results: QuestionResult[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  topic: string;
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
}
