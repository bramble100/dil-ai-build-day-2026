import { APIGatewayProxyResult } from 'aws-lambda';

export const ok = (body?: unknown): APIGatewayProxyResult => jsonResponse(200, body);

export const notFound = (path: string) => textResponse(404, path);

export const jsonResponse = (statusCode: number, data: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  },
  body: JSON.stringify(data),
});

export const textResponse = (statusCode: number, data: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  },
  body: JSON.stringify(data),
});
