import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ChatBedrockConverse } from '@langchain/aws';
import { AIMessage, BaseMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { v7 as uuidv7 } from 'uuid';
import { jsonResponse, ok } from '../responses';
import { Difficulty, QuizConfig, toClientQuestion } from '../types';
import { parseJson } from '../bedrock/createQuiz';
import saveQuiz from '../dynamodb/saveQuiz';
import { initializeMcpSession } from '../mcp/mcpClient';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_TOPICS = ['csuszka', 'panir'] as const;
type Topic = (typeof VALID_TOPICS)[number];

const VALID_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const DEFAULT_DIFFICULTY: Difficulty = 'beginner';
const DEFAULT_QUESTION_COUNT = 5;

// ---------------------------------------------------------------------------
// Shared Bedrock model (module-level — reused across warm invocations)
// ---------------------------------------------------------------------------

const model = new ChatBedrockConverse({
  model: process.env.BEDROCK_MODEL_ID ?? 'anthropic.claude-3-haiku-20240307-v1:0',
  region: process.env.AWS_REGION,
  maxTokens: 4096,
  temperature: 0.3,
});

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export const createMcpHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let body: Record<string, unknown> = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(event, 400, { error: 'Invalid JSON in request body.' });
  }

  // Validate topic
  const rawTopic = body.topic;
  if (!rawTopic || typeof rawTopic !== 'string' || !VALID_TOPICS.includes(rawTopic as Topic)) {
    return jsonResponse(event, 400, {
      error: `topic must be one of: ${VALID_TOPICS.join(', ')}`,
    });
  }
  const topic = rawTopic as Topic;

  // Validate difficulty (optional)
  const rawDifficulty = body.difficulty;
  const difficulty: Difficulty =
    typeof rawDifficulty === 'string' && VALID_DIFFICULTIES.includes(rawDifficulty as Difficulty)
      ? (rawDifficulty as Difficulty)
      : DEFAULT_DIFFICULTY;

  // Validate questionCount (optional)
  const rawCount = body.count;
  const questionCount =
    typeof rawCount === 'number' && rawCount > 0 && rawCount <= 20 ? rawCount : DEFAULT_QUESTION_COUNT;

  const config: QuizConfig = { topic, difficulty, questionCount };
  console.log('[createMcpHandler] Generating MCP quiz with config:', config);

  // Discover tools from the MCP server (cached after the first cold-start invocation)
  const mcpTools = await initializeMcpSession();

  // Bind MCP tools to the model so Claude can call them
  const modelWithTools = model.bindTools(mcpTools);

  const systemPrompt =
    `You are a quiz generator. You have tools to retrieve factual information about two vizsla dogs named Csuszka and Panir.\n` +
    `Your task:\n` +
    `1. Use the tools to gather information about "${topic}".\n` +
    `2. Generate exactly ${questionCount} multiple-choice questions at ${difficulty} level.\n` +
    `3. Every question MUST be answerable from the information retrieved — do not use outside knowledge.\n\n` +
    `CRITICAL RULES:\n` +
    `- Respond ONLY with a valid JSON object. No markdown, no explanation, no code fences.\n` +
    `- Use ONLY straight ASCII double-quotes ("). Never use smart quotes.\n` +
    `- No trailing commas after the last element in any array or object.\n` +
    `- The correct answer must be distributed randomly across A, B, C, and D.\n\n` +
    `Respond in this EXACT format:\n` +
    `{"questions":[{"id":"Q01","questionText":"...","choices":{"A":"...","B":"...","C":"...","D":"..."},"correctChoice":"A","explanation":"..."}]}\n\n` +
    `Zero-pad the id: Q01, Q02, ... Q${String(questionCount).padStart(2, '0')}.\n` +
    `Now use the tools to gather information, then generate the ${questionCount} questions.`;

  const messages: BaseMessage[] = [new HumanMessage(systemPrompt)];

  // Agentic loop: Claude calls tools until it has enough context to generate the quiz
  let response: BaseMessage = await modelWithTools.invoke(messages);

  while (response instanceof AIMessage && response.tool_calls && response.tool_calls.length > 0) {
    messages.push(response);

    for (const toolCall of response.tool_calls) {
      const matchedTool = mcpTools.find((t) => t.name === toolCall.name);
      if (!matchedTool) {
        console.warn(`[createMcpHandler] Unknown tool requested by Claude: ${toolCall.name}`);
        messages.push(
          new ToolMessage({
            content: `Error: tool "${toolCall.name}" is not available.`,
            tool_call_id: toolCall.id ?? '',
          }),
        );
        continue;
      }

      try {
        const toolResult = await matchedTool.invoke(toolCall.args as Record<string, unknown>);
        messages.push(new ToolMessage({ content: String(toolResult), tool_call_id: toolCall.id ?? '' }));
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Tool call failed';
        console.error(`[createMcpHandler] Tool "${toolCall.name}" error:`, err);
        messages.push(new ToolMessage({ content: `Error: ${errMsg}`, tool_call_id: toolCall.id ?? '' }));
      }
    }

    response = await modelWithTools.invoke(messages);
  }

  const content = response.content as string;
  console.log('[createMcpHandler] Raw Bedrock response length:', content.length);

  const parsed = parseJson(content, 'createMcpHandler');

  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    throw new Error('[createMcpHandler] Unexpected response shape from Bedrock');
  }

  const quiz = {
    id: uuidv7(),
    topic,
    difficulty,
    questions: parsed.questions,
  };

  await saveQuiz(quiz);

  console.log(`[createMcpHandler] Quiz created: ${quiz.id} (${quiz.questions.length} questions)`);

  return ok(event, {
    quizId: quiz.id,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    questions: quiz.questions.map(toClientQuestion),
  });
};

export default createMcpHandler;
