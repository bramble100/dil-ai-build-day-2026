import { Quiz, Difficulty, Question, ChoiceKey, QuizUserSubmission, QuestionUserSubmission } from '../types';

const isDifficulty = (value: string): value is Difficulty => {
  return ['beginner', 'intermediate', 'advanced', 'expert'].includes(value);
};

const isChoiceKey = (value: string): value is ChoiceKey => {
  return ['A', 'B', 'C', 'D'].includes(value);
};

export const mapToQuiz = (raw: any): Quiz => {
  if (!isDifficulty(raw.difficulty)) {
    throw new Error(`Invalid difficulty: ${raw.difficulty}`);
  }

  const questions: Question[] = raw.questions.map((q: any) => {
    if (!isChoiceKey(q.correctChoice)) {
      throw new Error(`Invalid correctChoice: ${q.correctChoice}`);
    }

    return {
      id: q.id,
      questionText: q.questionText,
      choices: q.choices,
      correctChoice: q.correctChoice,
      explanation: q.explanation,
    };
  });

  return {
    id: raw.id,
    topic: raw.topic,
    difficulty: raw.difficulty,
    questions,
  };
};

const mapToQuestionUserSubmission = (raw: any): QuestionUserSubmission => {
  return {
    questionId: raw.questionId,
    selectedChoice: raw.selectedChoice,
  };
};

export const mapToQuizUserSubmission = (raw: any): QuizUserSubmission => {
  return {
    quizId: raw.quizId,
    answers: raw.answers.map(mapToQuestionUserSubmission),
  };
};
