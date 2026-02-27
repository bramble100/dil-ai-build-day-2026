import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { jsonResponse, ok } from '../responses';
import { Difficulty, QuizConfig } from '../types';
import { createCustomTopicQuiz } from '../bedrock/createQuiz';
import saveQuiz from '../dynamodb/saveQuiz';

const DEFAULT_DIFFICULTY: Difficulty = 'beginner';
const DEFAULT_QUESTION_COUNT = 5;

const VALID_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced', 'expert'];

export const createHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Parse request body
  let body: Record<string, unknown> = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON in request body.' });
  }

  // Validate topic
  const topic = body.topic;
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return jsonResponse(400, { error: 'A valid topic must be provided.' });
  }

  // Validate difficulty (optional, falls back to default)
  const rawDifficulty = body.difficulty;
  const difficulty: Difficulty =
    typeof rawDifficulty === 'string' && VALID_DIFFICULTIES.includes(rawDifficulty as Difficulty)
      ? (rawDifficulty as Difficulty)
      : DEFAULT_DIFFICULTY;

  // Validate questionCount (optional, falls back to default)
  const rawCount = body.count;
  const questionCount =
    typeof rawCount === 'number' && rawCount > 0 && rawCount <= 20
      ? rawCount
      : DEFAULT_QUESTION_COUNT;

  const config: QuizConfig = {
    topic: topic.trim(),
    difficulty,
    questionCount,
  };

  console.log('[createHandler] Generating quiz with config:', config);

  const quiz = await createCustomTopicQuiz(config);
  await saveQuiz(quiz);

  console.log(`[createHandler] Quiz created: ${quiz.id} (${quiz.questions.length} questions)`);

  return ok({
    quizId: quiz.id,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    questions: quiz.questions,
  });
};

export default createHandler;
