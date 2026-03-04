import { v7 as uuidv7 } from 'uuid';

import { Quiz } from '../types';
import mockQuiz from '../examples/quiz.json';
import { mapToQuiz } from '../helpers/mappers'; // mock quiz

export const createQuiz = (): Quiz => mapToQuiz(mockQuiz);
