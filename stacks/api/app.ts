import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCorsHeaders } from './cors';
import createHandler from './handlers/createHandler';
import evaluateHandler from './handlers/evaluateHandler';
import getByIdHandler from './handlers/getByIdHandler';
import healthCheckHandler from './handlers/healthCheckHandler';
import submitHandler from './handlers/submitHandler';
import { notFound } from './responses';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const routes: Record<string, () => any> = {
      '/create': () => createHandler(event),
      '/{id}': () => getByIdHandler(event),
      '/{id}/submit': () => submitHandler(event),
      '/{id}/evaluate': () => evaluateHandler(event),
      '/healthz': () => healthCheckHandler(event),
    };

    return routes[(event as any).resource ?? event.path]?.() ?? notFound(event, event.path);
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(event),
      },
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
};
