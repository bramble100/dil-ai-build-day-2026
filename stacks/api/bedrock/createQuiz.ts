import { v7 as uuidv7 } from 'uuid';

import { Quiz } from '../types';

export const createQuiz = (): Quiz => {
  // mock response
  return {
    id: uuidv7(),
    topic: 'AWS Lambda',
    difficulty: 'beginner',
    questions: [],
  };
};
