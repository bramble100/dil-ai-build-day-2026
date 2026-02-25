import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../responses';

export const createHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok({ message: event.path, event });
};

export default createHandler;
