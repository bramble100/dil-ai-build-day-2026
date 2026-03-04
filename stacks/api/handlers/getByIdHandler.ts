import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import loadQuiz from '../dynamodb/loadQuiz';
import { notFound, ok } from '../responses';

export const getByIdHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const quizId = event.pathParameters?.id;

  if (quizId) {
    const quiz = await loadQuiz(quizId);

    return ok(event, { quiz });
  }

  return notFound(event, event.path);
};

export default getByIdHandler;
