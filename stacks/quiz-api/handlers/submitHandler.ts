import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from '../responses';

const submitHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return ok({ message: event.path, event });
};

export default submitHandler;
