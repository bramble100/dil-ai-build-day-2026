import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../responses';

const evaluateHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok(event, { message: event.path, event });
};

export default evaluateHandler;
