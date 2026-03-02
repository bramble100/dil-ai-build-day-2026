import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../responses';

export const healthCheckHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok(event, { status: 'healthy', timestamp: new Date().toISOString() });
};

export default healthCheckHandler;
