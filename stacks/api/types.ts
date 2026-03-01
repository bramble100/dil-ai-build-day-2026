export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

export interface QuizConfig {
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty: Difficulty;
  questions: Question[];
}

export interface Question {
  id: string;
  questionText: string;
  choices: Record<ChoiceKey, string>;
  correctChoice: ChoiceKey;
  explanation?: string;
}

/** Question shape returned to the client — answer fields omitted. */
export type ClientQuestion = Omit<Question, 'correctChoice' | 'explanation'>;

export const toClientQuestion = ({ correctChoice, explanation, ...rest }: Question): ClientQuestion => rest;

export interface QuestionUserResponse {
  quizId: string;
  questionId: number;
  selectedChoice: ChoiceKey;
  isCorrect: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
