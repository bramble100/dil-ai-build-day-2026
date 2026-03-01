import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ChatBedrockConverse } from '@langchain/aws';
import { AIMessage, BaseMessage, HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import { jsonResponse, ok } from '../responses';
import { ChatMessage } from '../types';
import { initializeMcpSession } from '../mcp/mcpClient';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Topics that have dedicated MCP tools for factual retrieval.
 * Any other topic uses Claude's general knowledge, scoped by the system prompt.
 */
const MCP_SUPPORTED_TOPICS = ['csuszka', 'panir'] as const;
type McpTopic = (typeof MCP_SUPPORTED_TOPICS)[number];

const isMcpTopic = (topic: string): topic is McpTopic => MCP_SUPPORTED_TOPICS.includes(topic as McpTopic);

/** Cap history to avoid exceeding Claude's context window on long sessions. */
const MAX_HISTORY_MESSAGES = 30;

// ---------------------------------------------------------------------------
// Shared Bedrock model (module-level — reused across warm invocations)
// Higher temperature than the quiz generator for a more natural chat tone.
// ---------------------------------------------------------------------------

const model = new ChatBedrockConverse({
  model: process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-haiku-20240307-v1:0',
  region: process.env.AWS_REGION,
  maxTokens: 1024,
  temperature: 0.5,
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * POST /chat
 *
 * Body:
 *   topic    — required; the topic of the completed quiz. Any non-empty string
 *              is accepted (custom topics). For "csuszka" / "panir" the handler
 *              additionally binds MCP tools so Claude can retrieve factual data.
 *   message  — required; the user's current question
 *   history  — optional; array of { role: "user"|"assistant", content: string }
 *              representing the prior turns of the conversation
 *
 * Response:
 *   { reply: string }
 */
export const chatHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let body: Record<string, unknown> = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON in request body.' });
  }

  // Validate topic — any non-empty string is accepted
  const rawTopic = body.topic;
  if (!rawTopic || typeof rawTopic !== 'string' || rawTopic.trim().length === 0) {
    return jsonResponse(400, { error: 'topic must be a non-empty string.' });
  }
  const topic = rawTopic.trim();

  // Validate message
  const rawMessage = body.message;
  if (!rawMessage || typeof rawMessage !== 'string' || rawMessage.trim().length === 0) {
    return jsonResponse(400, { error: 'message must be a non-empty string.' });
  }
  const message = rawMessage.trim();

  // Parse and sanitise conversation history (optional)
  const rawHistory = body.history;
  const history: ChatMessage[] = Array.isArray(rawHistory)
    ? (rawHistory as ChatMessage[])
        .filter(
          (historyMessage) =>
            historyMessage &&
            (historyMessage.role === 'user' || historyMessage.role === 'assistant') &&
            typeof historyMessage.content === 'string',
        )
        .slice(-MAX_HISTORY_MESSAGES)
    : [];

  const useMcpTools = isMcpTopic(topic);
  console.log(
    `[chatHandler] topic="${topic}" mcpTools=${useMcpTools} historyLength=${history.length} message="${message.slice(
      0,
      80,
    )}"`,
  );

  // Build the system prompt — wording adapts based on whether tools are available
  const systemPrompt = useMcpTools
    ? `You are a helpful assistant that answers questions about a vizsla dog named "${topic}". ` +
      `You have access to tools that can retrieve factual information about ${topic}.\n\n` +
      `RULES:\n` +
      `- Only answer questions directly related to ${topic} or vizsla dogs in general.\n` +
      `- If the user asks about anything unrelated, politely decline and redirect them back to ${topic}.\n` +
      `- Use your tools whenever you need specific facts about ${topic} to give an accurate answer.\n` +
      `- Answer in a friendly, conversational tone.\n` +
      `- Keep answers concise and focused — avoid unnecessary repetition.`
    : `You are a helpful assistant that answers questions about the topic: "${topic}".\n\n` +
      `RULES:\n` +
      `- Only answer questions directly related to "${topic}".\n` +
      `- If the user asks about anything unrelated, politely decline and redirect them back to "${topic}".\n` +
      `- Answer in a friendly, conversational tone.\n` +
      `- Keep answers concise and focused — avoid unnecessary repetition.`;

  // Build message list: system prompt + prior turns + current user message
  const messages: BaseMessage[] = [
    new SystemMessage(systemPrompt),
    ...history.map(
      (historyMessage): BaseMessage =>
        historyMessage.role === 'user'
          ? new HumanMessage(historyMessage.content)
          : new AIMessage(historyMessage.content),
    ),
    new HumanMessage(message),
  ];

  // For custom topics there are no tools — invoke the model directly
  if (!useMcpTools) {
    const response = await model.invoke(messages);
    const reply = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    console.log(`[chatHandler] Reply length: ${reply.length}`);
    return ok({ reply });
  }

  // For MCP-backed topics: agentic loop — Claude may call tools before replying
  const mcpTools = await initializeMcpSession();
  const modelWithTools = model.bindTools(mcpTools);

  let response: BaseMessage = await modelWithTools.invoke(messages);

  while (response instanceof AIMessage && response.tool_calls && response.tool_calls.length > 0) {
    messages.push(response);

    for (const toolCall of response.tool_calls) {
      const matchedTool = mcpTools.find((t) => t.name === toolCall.name);

      if (!matchedTool) {
        console.warn(`[chatHandler] Unknown tool requested by Claude: ${toolCall.name}`);
        messages.push(
          new ToolMessage({
            content: `Error: tool "${toolCall.name}" is not available.`,
            tool_call_id: toolCall.id ?? '',
          }),
        );
        continue;
      }

      try {
        const result = await matchedTool.invoke(toolCall.args as Record<string, unknown>);
        console.log(`[chatHandler] Tool "${toolCall.name}" succeeded`);
        messages.push(new ToolMessage({ content: String(result), tool_call_id: toolCall.id ?? '' }));
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Tool call failed';
        console.error(`[chatHandler] Tool "${toolCall.name}" error:`, err);
        messages.push(new ToolMessage({ content: `Error: ${errMsg}`, tool_call_id: toolCall.id ?? '' }));
      }
    }

    response = await modelWithTools.invoke(messages);
  }

  const reply = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

  console.log(`[chatHandler] Reply length: ${reply.length}`);

  return ok({ reply });
};

export default chatHandler;
