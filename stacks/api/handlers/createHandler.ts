import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../responses';
import { Difficulty, QuizConfig } from '../types';
import { createQuiz } from '../bedrock/createQuiz';
import saveQuiz from '../dynamodb/saveQuiz';

const DEFAULT_CONFIG: QuizConfig = {
  topic: 'AWS Lambda',
  difficulty: 'beginner' as Difficulty,
  questionCount: 5,
};

const createHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = event.body ? JSON.parse(event.body) : {};

  const config: QuizConfig = {
    topic: body.topic ?? DEFAULT_CONFIG.topic,
    difficulty: body.difficulty ?? DEFAULT_CONFIG.difficulty,
    questionCount: body.count ?? DEFAULT_CONFIG.questionCount,
  };

  const quiz = await createQuiz(config);
  await saveQuiz(quiz);

  return ok(event, { quiz });
};

export default createHandler;
