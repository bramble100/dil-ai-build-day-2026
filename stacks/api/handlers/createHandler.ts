import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../responses';
import { Difficulty, QuizConfig } from '../types';
import { createQuiz } from '../bedrock/createQuiz';
import saveQuiz from '../dynamodb/saveQuiz';

const defaultConfig: QuizConfig = {
  topic: 'AWS Lambda',
  difficulty: 'beginner' as Difficulty,
  questionCount: 20,
};

export const createHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const config = {
    ...defaultConfig,
    ...event.queryStringParameters,
  };

  const quiz = createQuiz();
  const result = await saveQuiz(quiz);

  return ok({ quiz, result });
};

export default createHandler;
