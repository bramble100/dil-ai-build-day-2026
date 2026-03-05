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
  explanation: string; // max 1000 characters
}

export interface QuizUserSubmission {
  quizId: string; // guid v7
  answers: QuestionUserSubmission[];
}

export interface QuestionUserSubmission {
  questionId: string; // guid v7
  selectedChoice: ChoiceKey;
}

export interface QuizEvaluationDto {
  quizId: string; // guid v7
  topic: string; // max 100 characters
  difficulty: Difficulty;
  correctAnswerCount: number;
  evaluatedAnswers: QuizAnswerEvaluationDto[];
}

export interface QuizAnswerEvaluationDto {
  questionId: string; // guid v7
  questionText: string; // max 500 chars
  correctChoice: ChoiceKey;
  selectedChoice?: ChoiceKey; // user can skip it
  isCorrect: boolean; // false if user has not answered the question
  explanation: string; // max 1000 characters
}
