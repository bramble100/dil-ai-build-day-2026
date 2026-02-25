export const ok = (body?: unknown) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  },
  body: body ? JSON.stringify(body) : undefined,
});

export const notFound = (path: string) => ({
  statusCode: 404,
  headers: {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  },
  body: JSON.stringify({ message: path }),
});
