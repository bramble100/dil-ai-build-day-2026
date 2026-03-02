import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCorsHeaders } from './cors';
import { notFound } from './responses';
import createHandler from './handlers/createHandler';
import createMcpHandler from './handlers/createMcpHandler';
import uploadHandler from './handlers/uploadHandler';
import evaluateHandler from './handlers/evaluateHandler';
import submitHandler from './handlers/submitHandler';
import healthCheckHandler from './handlers/healthCheckHandler';
import chatHandler from './handlers/chatHandler';

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const routes: Record<string, () => any> = {
      '/create': () => createHandler(event),
      '/create-mcp': () => createMcpHandler(event),
      '/upload': () => uploadHandler(event),
      '/submit': () => submitHandler(event),
      '/evaluate': () => evaluateHandler(event),
      '/chat': () => chatHandler(event),
      '/healthz': () => healthCheckHandler(event),
    };

    return routes[event.path]?.() ?? notFound(event, event.path);
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
