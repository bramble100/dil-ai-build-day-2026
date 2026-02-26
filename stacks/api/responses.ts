import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getCorsHeaders } from './cors';

export const ok = (event: APIGatewayProxyEvent, body?: unknown): APIGatewayProxyResult =>
  jsonResponse(event, 200, body);

export const notFound = (event: APIGatewayProxyEvent, path: string): APIGatewayProxyResult =>
  textResponse(event, 404, path);

function jsonResponse(event: APIGatewayProxyEvent, statusCode: number, data: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(event),
    },
    body: JSON.stringify(data),
  };
}

function textResponse(event: APIGatewayProxyEvent, statusCode: number, data: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/plain',
      ...getCorsHeaders(event),
    },
    body: JSON.stringify(data),
  };
}
