import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { LambdaTransport } from './transport/lambdaTransport';
import { getBiography } from './tools/biography';
import { getActivities } from './tools/activities';

// ---------------------------------------------------------------------------
// MCP Server — created once at module level, reused across warm invocations.
// The SDK clears its internal transport reference after each close(), so
// server.connect() can be called again on the next invocation.
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: 'vizsla-knowledge',
  version: '1.0.0',
});

server.tool(
  'get_biography',
  'Returns the full biography of a vizsla dog. Use this to ground quiz questions in real facts about the dog.',
  { dog_name: z.string().describe('The name of the vizsla dog — must be "csuszka" or "panir"') },
  async ({ dog_name }) => ({
    content: [{ type: 'text' as const, text: await getBiography(dog_name) }],
  }),
);

server.tool(
  'get_activities',
  "Returns recent activity log entries for a vizsla dog (walks, runs, swims). Use this to generate quiz questions about the dog's physical activity.",
  {
    dog_name: z.string().describe('The name of the vizsla dog — must be "csuszka" or "panir"'),
    limit: z.number().optional().describe('Maximum number of activity records to return (1–20)'),
  },
  async ({ dog_name, limit }) => ({
    content: [{ type: 'text' as const, text: await getActivities(dog_name, limit) }],
  }),
);

// ---------------------------------------------------------------------------
// Lambda handler
// ---------------------------------------------------------------------------

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let body: JSONRPCMessage;
  try {
    body = JSON.parse(event.body ?? '{}') as JSONRPCMessage;
  } catch {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error: invalid JSON' },
      }),
    };
  }

  // Notifications have no id — acknowledge without a JSON-RPC body
  if (typeof body === 'object' && body !== null && !('id' in body)) {
    console.log(`[mcp] Notification: ${(body as { method?: string }).method}`);
    return { statusCode: 202, headers: {}, body: '' };
  }

  const transport = new LambdaTransport(body);

  try {
    // connect() internally calls transport.start(), which feeds the message to the server
    await server.connect(transport);
    const response = await transport.response;

    console.log(`[mcp] Handled: ${(body as { method?: string }).method}`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('[mcp] Error:', err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: (body as { id?: unknown }).id ?? null,
        error: { code: -32603, message },
      }),
    };
  } finally {
    // Closing the transport clears the server's internal _transport reference,
    // allowing server.connect() to be called again on the next warm invocation.
    await transport.close();
  }
};
