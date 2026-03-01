/**
 * MCP client for the quiz generator.
 *
 * Tool discovery (initialize + tools/list) uses the official
 * @modelcontextprotocol/sdk Client + StreamableHTTPClientTransport.
 * The discovered tools are cached at module level so warm Lambda invocations
 * skip the handshake entirely.
 *
 * Tool calls (tools/call) use plain fetch. This keeps tool-call invocations
 * stateless and avoids holding an open HTTP connection between requests.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// JSON Schema → Zod converter
// Handles the subset of JSON Schema types used by MCP tool input schemas.
// ---------------------------------------------------------------------------

type JsonSchemaPrimitive = {
  type?: string;
  enum?: string[];
  description?: string;
};

type JsonObjectSchema = {
  type: 'object';
  properties?: Record<string, JsonSchemaPrimitive>;
  required?: string[];
};

const primitivePropToZod = (prop: JsonSchemaPrimitive, isRequired: boolean): z.ZodTypeAny => {
  let zodType: z.ZodTypeAny;

  if (prop.type === 'string' && Array.isArray(prop.enum) && prop.enum.length > 0) {
    zodType = z.enum(prop.enum as [string, ...string[]]);
  } else if (prop.type === 'string') {
    zodType = z.string();
  } else if (prop.type === 'number' || prop.type === 'integer') {
    zodType = z.number();
  } else if (prop.type === 'boolean') {
    zodType = z.boolean();
  } else {
    zodType = z.unknown();
  }

  if (prop.description) {
    zodType = zodType.describe(prop.description);
  }

  return isRequired ? zodType : zodType.optional();
};

const jsonSchemaToZod = (schema: JsonObjectSchema): z.ZodObject<z.ZodRawShape> => {
  const properties = schema.properties ?? {};
  const required = schema.required ?? [];
  const shape: z.ZodRawShape = {};

  for (const [key, prop] of Object.entries(properties)) {
    shape[key] = primitivePropToZod(prop, required.includes(key));
  }

  return z.object(shape);
};

// ---------------------------------------------------------------------------
// Plain-fetch tool caller — stateless, one POST per tool invocation
// ---------------------------------------------------------------------------

let requestCounter = 0;

interface JsonRpcErrorBody {
  error: { code: number; message: string };
}

const mcpPost = async (method: string, params: Record<string, unknown>): Promise<unknown> => {
  const id = ++requestCounter;
  const url = process.env.MCP_SERVER_URL!;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });

  if (!res.ok) {
    throw new Error(`MCP server returned HTTP ${res.status} for "${method}"`);
  }

  const json = (await res.json()) as { result?: unknown } & Partial<JsonRpcErrorBody>;

  if (json.error) {
    throw new Error(`MCP error (${json.error.code}): ${json.error.message}`);
  }

  return json.result;
};

export const mcpCallTool = async (toolName: string, args: Record<string, unknown>): Promise<string> => {
  console.log(`[mcpClient] Calling tool "${toolName}"`);

  const result = (await mcpPost('tools/call', { name: toolName, arguments: args })) as {
    content: Array<{ type: string; text: string }>;
  };

  const textBlock = result.content.find((c) => c.type === 'text');
  if (!textBlock) {
    throw new Error(`MCP tool "${toolName}" returned no text content`);
  }

  console.log(`[mcpClient] Tool "${toolName}" returned ${textBlock.text.length} chars`);
  return textBlock.text;
};

// ---------------------------------------------------------------------------
// Tool builder — wraps an MCP Tool descriptor as a LangChain DynamicStructuredTool
// ---------------------------------------------------------------------------

const buildLangChainTool = (mcpTool: {
  name: string;
  description?: string;
  inputSchema: JsonObjectSchema;
}): DynamicStructuredTool => {
  const schema = jsonSchemaToZod(mcpTool.inputSchema) as z.AnyZodObject;

  // `as unknown as DynamicStructuredTool` fully escapes TypeScript's recursive
  // inference through ZodRawShape, which causes "type instantiation is
  // excessively deep and possibly infinite" errors regardless of explicit type args.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tool = new (DynamicStructuredTool as any)({
    name: mcpTool.name,
    description: mcpTool.description ?? '',
    schema,
    func: async (args: Record<string, unknown>) => mcpCallTool(mcpTool.name, args),
  }) as DynamicStructuredTool;

  return tool;
};

// ---------------------------------------------------------------------------
// Session initializer — discovers tools via SDK, caches result for warm starts
// ---------------------------------------------------------------------------

let cachedTools: DynamicStructuredTool[] | null = null;

/**
 * Returns LangChain-compatible tools discovered from the MCP server.
 *
 * On the first (cold) invocation it performs the full MCP handshake:
 * initialize → tools/list → close.
 * On subsequent warm invocations it returns the cached tool list instantly.
 *
 * If the MCP server adds or removes tools between deployments, redeploy
 * (or delete the Lambda) to reset the module-level cache.
 */
export const initializeMcpSession = async (): Promise<DynamicStructuredTool[]> => {
  if (cachedTools) {
    console.log(`[mcpClient] Using ${cachedTools.length} cached tools`);
    return cachedTools;
  }

  const client = new Client({ name: 'quiz-generator', version: '1.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(process.env.MCP_SERVER_URL!)));

  const { tools } = await client.listTools();
  console.log(`[mcpClient] Discovered tools: ${tools.map((t) => t.name).join(', ')}`);

  await client.close();

  cachedTools = tools.map((t) =>
    buildLangChainTool({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema as JsonObjectSchema,
    }),
  );

  return cachedTools;
};
