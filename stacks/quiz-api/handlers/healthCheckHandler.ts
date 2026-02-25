import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../responses';

export const healthCheckHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok({ message: event.path, body: 'Ok' });
};

export default healthCheckHandler;
