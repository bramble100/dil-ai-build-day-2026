import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { notFound, ok } from './responses';
import createHandler from './handlers/createHandler';
import uploadHandler from './handlers/uploadHandler';
import evaluateHandler from './handlers/evaluateHandler';
import submitHandler from './handlers/submitHandler';
import healthCheckHandler from './handlers/healthCheckHandler';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const routes: Record<string, () => any> = {
      '/create': () => createHandler(event),
      '/upload': () => uploadHandler(event),
      '/submit': () => submitHandler(event),
      '/evaluate': () => evaluateHandler(event),
      '/healthz': () => healthCheckHandler(event),
    };

    return routes[event.path]?.() ?? notFound(event.path);
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
};
