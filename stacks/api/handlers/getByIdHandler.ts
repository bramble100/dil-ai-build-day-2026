import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import loadQuiz from '../dynamodb/loadQuiz';
import { notFound, ok } from '../responses';

export const getByIdHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  if (id) {
    const quiz = await loadQuiz(id);

    return ok(event, { quiz });
  }

  return notFound(event, event.path);
};

export default getByIdHandler;
