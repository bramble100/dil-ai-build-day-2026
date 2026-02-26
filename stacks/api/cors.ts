import { APIGatewayProxyEvent } from 'aws-lambda';

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

/**
 * Returns CORS headers only if the request Origin is in the allowlist.
 * Never uses '*'; echoes the validated origin per CORS spec.
 */
export function getCorsHeaders(event: APIGatewayProxyEvent): Record<string, string> {
  const base: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const origin = event.headers?.Origin ?? event.headers?.origin;

  if (!origin || ALLOWED_ORIGINS.length === 0) {
    return base;
  }

  if (ALLOWED_ORIGINS.includes(origin)) {
    base['Access-Control-Allow-Origin'] = origin;
  }

  return base;
}
