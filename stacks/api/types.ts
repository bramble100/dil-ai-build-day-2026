export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

export interface QuizConfig {
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
}

export interface Quiz {
  id: string; // guid v7
  topic: string; // max 100 characters
  difficulty: Difficulty;
  questions: Question[];
}

export interface Question {
  id: string; // guid v7
  questionText: string; // max 500 chars
  choices: Record<ChoiceKey, string>;
  correctChoice: ChoiceKey;
  explanation?: string; // some markdwon text, max 1000 characters
}

/** Question shape returned to the client — answer fields omitted. */
export type ClientQuestion = Omit<Question, 'correctChoice' | 'explanation'>;

export const toClientQuestion = ({ correctChoice, explanation, ...rest }: Question): ClientQuestion => rest;

export interface QuestionUserResponse {
  quizId: string; // guid v7
  questionId: string; // guid v7
  selectedChoice: ChoiceKey;
  isCorrect: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
